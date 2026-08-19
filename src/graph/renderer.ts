import * as PIXI from "pixi.js";
import * as d3 from "d3";
import type {
    GraphData,
    GraphNode,
    GraphRenderOptions,
    GraphRenderer,
} from "./types";

export const DEFAULT_OPTIONS: GraphRenderOptions = {
    existing: false,
    orphans: true,
    arrows: false,
    labels: true,
    textFadeThreshold: 0,
    nodeSize: 50,
    linkWidth: 50,
    centerForce: 8,
    repelForce: 100,
    linkForce: 30,
    linkDistance: 300,
    velocityDecay: 0.4,
    highlightColor: "#a600ff",
    themeMode: "dark",
    search: "",
};

const FORCE_CONTROL_KEYS: (keyof GraphRenderOptions)[] = [
    "centerForce",
    "repelForce",
    "linkForce",
    "linkDistance",
    "velocityDecay",
];

interface ResolvedEdge {
    source: GraphNode;
    target: GraphNode;
}

interface AnimationState {
    revealAt: Map<string, number>;
    startTime: number;
    popDuration: number;
    totalDuration: number;
}

export function createGraphRenderer(
    initialOptions: Partial<GraphRenderOptions> = {},
    onNodeSelect?: (node: GraphNode | null) => void,
): GraphRenderer {
    let options: GraphRenderOptions = {...DEFAULT_OPTIONS, ...initialOptions};
    let host: HTMLElement | null = null;
    let app: PIXI.Application | null = null;
    let container: PIXI.Container | null = null;

    let nodes: GraphNode[] = [];
    let edges: ResolvedEdge[] = [];
    let simulation: d3.Simulation<GraphNode, undefined> | null = null;
    let zoomHandler: d3.ZoomBehavior<HTMLCanvasElement, unknown> | null = null;

    let hoverId: string | undefined = undefined;
    let selectedId: string | undefined = undefined;
    let viewport = {x: 0, y: 0, k: 1};
    let resizeObserver: ResizeObserver | null = null;

    let animationState: AnimationState | null = null;
    let animationFrame: number | undefined = undefined;

    const nodeShapes = new Map<string, PIXI.Graphics>();
    const edgeShapes = new Map<string, PIXI.Graphics>();
    const labels = new Map<string, PIXI.Text>();
    const adjacency = new Map<string, Set<string>>();
    const degrees = new Map<string, number>();

    let pendingData: GraphData | null = null;

    function highlightColor(): number {
        const hex = options.highlightColor.replace("#", "");
        return parseInt(hex, 16) || 0xa600ff;
    }

    function viewportSize() {
        if (!host) return {width: 800, height: 600};
        return {
            width: Math.max(1, host.clientWidth),
            height: Math.max(1, host.clientHeight),
        };
    }

    function nodeVisible(node: GraphNode): boolean {
        if (options.existing && node.missing) return false;
        if (!options.orphans && !((degrees.get(node.id) || 0) > 0))
            return false;
        const query = options.search.trim().toLowerCase();
        return !query || node.label.toLowerCase().includes(query);
    }

    function edgeKey(edge: ResolvedEdge): string {
        return `${edge.source.id}\u0000${edge.target.id}`;
    }

    function shape<T extends PIXI.DisplayObject>(
        map: Map<string, T>,
        id: string,
        make: () => T,
    ): T {
        if (!map.has(id)) {
            const item = make();
            map.set(id, item);
            container?.addChild(item);
        }
        return map.get(id)!;
    }

    function removeStaleShapes<T extends PIXI.DisplayObject>(
        map: Map<string, T>,
        ids: Set<string>,
    ) {
        for (const [id, item] of map) {
            if (ids.has(id)) continue;
            item.removeFromParent();
            item.destroy();
            map.delete(id);
        }
    }

    function rebuildTopology() {
        adjacency.clear();
        degrees.clear();
        for (const node of nodes) {
            adjacency.set(node.id, new Set());
            degrees.set(node.id, 0);
        }
        for (const edge of edges) {
            if (!edge.source || !edge.target) continue;
            adjacency.get(edge.source.id)?.add(edge.target.id);
            adjacency.get(edge.target.id)?.add(edge.source.id);
            degrees.set(edge.source.id, (degrees.get(edge.source.id) || 0) + 1);
            degrees.set(edge.target.id, (degrees.get(edge.target.id) || 0) + 1);
        }
    }

    function activeFocusId(): string | undefined {
        return hoverId || selectedId;
    }

    function relatedNodes(): Set<string> | undefined {
        const focus = activeFocusId();
        if (!focus) return undefined;
        return new Set([focus, ...(adjacency.get(focus) || [])]);
    }

    function nodeRadius(node: GraphNode): number {
        const degree = degrees.get(node.id) || 0;
        return (
            ((5 + Math.min(12, Math.sqrt(degree) * 3)) * options.nodeSize) / 100
        );
    }

    function chargeScale(node: GraphNode): number {
        const degree = degrees.get(node.id) || 0;
        return Math.sqrt(1 + degree * 0.5);
    }

    function textFadeCutoff(): number {
        return Math.max(0.05, 0.45 + options.textFadeThreshold * 0.1);
    }

    function revealFactor(id: string): number {
        if (!animationState) return 1;
        const revealAt = animationState.revealAt.get(id);
        if (revealAt === undefined) return 1;
        const elapsed = performance.now() - animationState.startTime - revealAt;
        if (elapsed <= 0) return 0;
        if (elapsed >= animationState.popDuration) return 1;
        const t = elapsed / animationState.popDuration;
        return 1 - Math.pow(1 - t, 5);
    }

    function computeRevealWaves(order: string[]): string[][] {
        const visibleSet = new Set(order);
        let root = order[0];
        let bestDegree = -1;
        for (const id of order) {
            const degree = degrees.get(id) || 0;
            if (degree > bestDegree) {
                bestDegree = degree;
                root = id;
            }
        }

        const visited = new Set([root]);
        const waves: string[][] = [[root]];
        let frontier = [root];
        while (frontier.length) {
            const next: string[] = [];
            for (const id of frontier) {
                for (const neighbor of adjacency.get(id) || []) {
                    if (!visibleSet.has(neighbor) || visited.has(neighbor))
                        continue;
                    visited.add(neighbor);
                    next.push(neighbor);
                }
            }
            if (next.length) waves.push(next);
            frontier = next;
        }

        const remaining = order.filter((id) => !visited.has(id));
        const chunkSize = Math.max(
            1,
            Math.ceil(remaining.length / Math.max(1, waves.length)),
        );
        for (let i = 0; i < remaining.length; i += chunkSize) {
            waves.push(remaining.slice(i, i + chunkSize));
        }
        return waves;
    }

    function startAnimation() {
        const order = nodes.filter(nodeVisible).map((node) => node.id);
        if (!order.length) return;
        if (animationFrame) cancelAnimationFrame(animationFrame);

        const waves = computeRevealWaves(order);
        const popDuration = 640;
        const waveGap = 320;
        const withinWaveStagger = 90;

        const revealAt = new Map<string, number>();
        let cursor = 0;
        for (const wave of waves) {
            wave.forEach((id, index) =>
                revealAt.set(id, cursor + index * withinWaveStagger),
            );
            cursor += waveGap + (wave.length - 1) * withinWaveStagger;
        }
        const totalDuration = cursor;

        animationState = {
            revealAt,
            startTime: performance.now(),
            popDuration,
            totalDuration,
        };
        const step = () => {
            if (!animationState) return;
            draw();
            const elapsed = performance.now() - animationState.startTime;
            if (
                elapsed <
                animationState.totalDuration + animationState.popDuration
            ) {
                animationFrame = requestAnimationFrame(step);
            } else {
                animationState = null;
                animationFrame = undefined;
                draw();
            }
        };
        animationFrame = requestAnimationFrame(step);
    }

    function safeDraw() {
        try {
            draw();
        } catch (error) {
            console.error("Draw error:", error);
        }
    }

    function draw() {
        if (!app || !container) return;
        const related = relatedNodes();
        const edgeIds = new Set<string>();
        const nodeIds = new Set<string>();

        const isLight = options.themeMode === "light";
        const defaultEdgeColor = isLight ? 0x7c6c54 : 0xffffff;
        const defaultNodeColor = isLight ? 0x241c10 : 0xffffff;
        const labelFillColor = isLight ? 0x241c10 : 0xd0d0d0;

        for (const edge of edges) {
            const id = edgeKey(edge);
            edgeIds.add(id);
            const graphic = shape(edgeShapes, id, () => new PIXI.Graphics());
            const visible =
                nodeVisible(edge.source) && nodeVisible(edge.target);
            const reveal = Math.min(
                revealFactor(edge.source.id),
                revealFactor(edge.target.id),
            );
            graphic.visible = visible && reveal > 0;
            if (!visible || reveal <= 0) continue;
            const active =
                !related ||
                (related.has(edge.source.id) && related.has(edge.target.id));
            const linkAlpha = (active ? 0.6 : 0.1) * reveal;
            const edgeColor =
                related && active ? highlightColor() : defaultEdgeColor;
            graphic.clear();
            graphic.lineStyle(
                Math.min(
                    options.linkWidth + (related && active ? 10 : 0),
                    250,
                ) / 100,
                edgeColor,
                linkAlpha,
            );
            graphic.moveTo(edge.source.x || 0, edge.source.y || 0);
            graphic.lineTo(edge.target.x || 0, edge.target.y || 0);

            if (options.arrows) {
                const sx = edge.source.x || 0,
                    sy = edge.source.y || 0;
                const tx = edge.target.x || 0,
                    ty = edge.target.y || 0;
                const dx = tx - sx,
                    dy = ty - sy;
                const dist = Math.hypot(dx, dy) || 1;
                const ux = dx / dist,
                    uy = dy / dist;
                const gap = nodeRadius(edge.target) + 6;
                const tipX = tx - ux * gap,
                    tipY = ty - uy * gap;
                const size = (4.5 * options.linkWidth) / 100 + 2.5;
                graphic.beginFill(edgeColor, linkAlpha);
                graphic.moveTo(tipX, tipY);
                graphic.lineTo(
                    tipX - ux * size - uy * size * 0.6,
                    tipY - uy * size + ux * size * 0.6,
                );
                graphic.lineTo(
                    tipX - ux * size + uy * size * 0.6,
                    tipY - uy * size - ux * size * 0.6,
                );
                graphic.closePath();
                graphic.endFill();
            }
        }

        const fadeCutoff = textFadeCutoff();
        for (const node of nodes) {
            nodeIds.add(node.id);
            const graphic = shape(
                nodeShapes,
                node.id,
                () => new PIXI.Graphics(),
            );
            const label = shape(
                labels,
                node.id,
                () =>
                    new PIXI.Text(node.label, {
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 11,
                        fill: labelFillColor,
                    }),
            );
            label.style.fill = labelFillColor;
            const visible = nodeVisible(node);
            const reveal = revealFactor(node.id);
            graphic.visible = visible && reveal > 0;
            label.visible = false;
            if (!visible || reveal <= 0) continue;
            const radius = nodeRadius(node);
            const active = !related || related.has(node.id);
            const isSelected = node.id === selectedId;
            const alpha = (related && !active ? 0.12 : 1) * reveal;
            graphic.clear();

            const nodeColor = isSelected
                ? highlightColor()
                : node.missing
                  ? 0x767676
                  : defaultNodeColor;

            graphic.lineStyle(
                isSelected ? 3 : active ? 2 : 1,
                nodeColor,
                alpha,
            );
            graphic.beginFill(nodeColor, isSelected ? alpha : alpha * 0.85);
            graphic.drawCircle(0, 0, radius);
            graphic.endFill();
            graphic.scale.set(reveal);
            graphic.position.set(node.x || 0, node.y || 0);

            label.text = node.label;
            label.visible =
                options.labels && viewport.k > fadeCutoff && reveal >= 1;
            label.alpha = alpha;
            label.position.set((node.x || 0) + radius + 4, (node.y || 0) - 6);
        }

        removeStaleShapes(edgeShapes, edgeIds);
        removeStaleShapes(nodeShapes, nodeIds);
        removeStaleShapes(labels, nodeIds);
    }

    function graphPoint(event: MouseEvent) {
        if (!app || !app.view) return {x: 0, y: 0};
        const canvas = app.view as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left - viewport.x) / viewport.k,
            y: (event.clientY - rect.top - viewport.y) / viewport.k,
        };
    }

    function nodeAt(point: {x: number; y: number}): GraphNode | undefined {
        let closest: GraphNode | undefined;
        let closestDistance = Infinity;
        for (const node of nodes) {
            if (!nodeVisible(node)) continue;
            const radius = nodeRadius(node) + 8;
            const distance = Math.hypot(
                (node.x || 0) - point.x,
                (node.y || 0) - point.y,
            );
            if (distance <= radius && distance < closestDistance) {
                closest = node;
                closestDistance = distance;
            }
        }
        return closest;
    }

    function fitGraph(duration = 300) {
        if (!app || !zoomHandler) return;
        const visibleNodes = nodes.filter(nodeVisible);
        const {width, height} = viewportSize();
        if (!visibleNodes.length) {
            d3.select(app.view as HTMLCanvasElement)
                .transition()
                .duration(duration)
                .call(zoomHandler.transform, d3.zoomIdentity);
            return;
        }
        const padding = 60;
        const xs = visibleNodes.map((node) => node.x || 0);
        const ys = visibleNodes.map((node) => node.y || 0);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const graphWidth = Math.max(maxX - minX, 1);
        const graphHeight = Math.max(maxY - minY, 1);
        const scale = Math.max(
            0.2,
            Math.min(
                4,
                Math.min(
                    (width - padding * 2) / graphWidth,
                    (height - padding * 2) / graphHeight,
                ),
            ),
        );
        const x = width / 2 - ((minX + maxX) / 2) * scale;
        const y = height / 2 - ((minY + maxY) / 2) * scale;
        const transform = d3.zoomIdentity.translate(x, y).scale(scale);
        d3.select(app.view as HTMLCanvasElement)
            .transition()
            .duration(duration)
            .call(zoomHandler.transform, transform);
    }

    function createSimulation() {
        const {width, height} = viewportSize();
        const linkForce = d3
            .forceLink<GraphNode, ResolvedEdge>(edges)
            .id((node) => node.id)
            .distance(options.linkDistance)
            .strength(options.linkForce / 100);

        return d3
            .forceSimulation<GraphNode>(nodes)
            .force("link", linkForce)
            .force(
                "charge",
                d3
                    .forceManyBody<GraphNode>()
                    .strength(
                        (node) => -options.repelForce * chargeScale(node),
                    ),
            )
            .force(
                "x",
                d3.forceX(width / 2).strength(options.centerForce / 100),
            )
            .force(
                "y",
                d3.forceY(height / 2).strength(options.centerForce / 100),
            )
            .force(
                "collide",
                d3
                    .forceCollide<GraphNode>()
                    .radius(
                        (node) =>
                            8 +
                            Math.min(
                                12,
                                Math.sqrt(degrees.get(node.id) || 0) * 3,
                            ) +
                            3,
                    )
                    .strength(0.8),
            )
            .velocityDecay(options.velocityDecay)
            .on("tick", safeDraw);
    }

    function updateSimulationForces(restart = true) {
        if (!simulation) return;
        const {width, height} = viewportSize();
        const linkForce = simulation.force("link") as d3.ForceLink<
            GraphNode,
            ResolvedEdge
        >;
        if (linkForce) {
            linkForce
                .distance(options.linkDistance)
                .strength(options.linkForce / 100);
        }
        const chargeForce = simulation.force(
            "charge",
        ) as d3.ForceManyBody<GraphNode>;
        if (chargeForce) {
            chargeForce.strength(
                (node) => -options.repelForce * chargeScale(node),
            );
        }
        const forceX = simulation.force("x") as d3.ForceX<GraphNode>;
        if (forceX) {
            forceX.x(width / 2).strength(options.centerForce / 100);
        }
        const forceY = simulation.force("y") as d3.ForceY<GraphNode>;
        if (forceY) {
            forceY.y(height / 2).strength(options.centerForce / 100);
        }
        simulation.velocityDecay(options.velocityDecay);
        if (restart) simulation.alpha(0.5).restart();
    }

    function setData(graph: GraphData) {
        if (!app) {
            pendingData = graph;
            return;
        }

        simulation?.stop();
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationState = null;
        hoverId = undefined;
        selectedId = undefined;
        viewport = {x: 0, y: 0, k: 1};

        nodes = (graph.nodes || []).map((node) => ({...node}));
        const byId = new Map(nodes.map((node) => [node.id, node]));

        edges = (graph.links || [])
            .map((link) => {
                const sourceId =
                    typeof link.source === "string"
                        ? link.source
                        : link.source.id;
                const targetId =
                    typeof link.target === "string"
                        ? link.target
                        : link.target.id;
                const sourceNode = byId.get(sourceId);
                const targetNode = byId.get(targetId);
                if (!sourceNode || !targetNode) return null;
                return {source: sourceNode, target: targetNode};
            })
            .filter((e): e is ResolvedEdge => e !== null);

        rebuildTopology();
        simulation = createSimulation();

        zoomHandler = d3
            .zoom<HTMLCanvasElement, unknown>()
            .scaleExtent([0.2, 4])
            .on("zoom", (event) => {
                viewport = event.transform;
                if (container) {
                    container.position.set(viewport.x, viewport.y);
                    container.scale.set(viewport.k);
                }
                safeDraw();
            });

        const selection = d3.select(app.view as HTMLCanvasElement);

        selection.on(".drag", null).call(
            d3
                .drag<HTMLCanvasElement, unknown>()
                .container(app.view as HTMLCanvasElement)
                .subject((event) =>
                    nodeAt({
                        x: (event.x - viewport.x) / viewport.k,
                        y: (event.y - viewport.y) / viewport.k,
                    }),
                )
                .on("start", (event) => {
                    if (!event.subject) return;
                    simulation?.alphaTarget(0.25).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                })
                .on("drag", (event) => {
                    if (!event.subject) return;
                    event.subject.fx = (event.x - viewport.x) / viewport.k;
                    event.subject.fy = (event.y - viewport.y) / viewport.k;
                })
                .on("end", (event) => {
                    if (!event.subject) return;
                    simulation?.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                }),
        );

        selection.on(".zoom", null).call(zoomHandler);

        draw();
        startAnimation();
    }

    function mount(targetHost: HTMLElement) {
        host = targetHost;
        app = new PIXI.Application({
            resizeTo: host,
            backgroundAlpha: 0,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        host.replaceChildren(app.view as HTMLCanvasElement);
        container = new PIXI.Container();
        app.stage.addChild(container);

        resizeObserver = new ResizeObserver(() => {
            if (!simulation) return;
            updateSimulationForces(false);
            simulation.alpha(0.15).restart();
            draw();
        });
        resizeObserver.observe(host);

        let pointerDown: {x: number; y: number} | null = null;
        const canvas = app.view as HTMLCanvasElement;

        canvas.addEventListener("pointerdown", (event) => {
            pointerDown = {x: event.clientX, y: event.clientY};
        });

        canvas.addEventListener("pointerup", (event) => {
            if (!pointerDown) return;
            const moved = Math.hypot(
                event.clientX - pointerDown.x,
                event.clientY - pointerDown.y,
            );
            pointerDown = null;
            if (moved <= 5) {
                const point = graphPoint(event);
                const node = nodeAt(point);
                selectedId = node ? node.id : undefined;
                if (onNodeSelect) onNodeSelect(node || null);
                draw();
            }
        });

        canvas.addEventListener("pointermove", (event) => {
            const node = nodeAt(graphPoint(event));
            if (node?.id !== hoverId) {
                hoverId = node?.id;
                draw();
            }
        });

        canvas.addEventListener("pointerleave", () => {
            pointerDown = null;
            if (hoverId !== undefined) {
                hoverId = undefined;
                draw();
            }
        });

        if (pendingData) {
            const data = pendingData;
            pendingData = null;
            setData(data);
        }
    }

    function updateOptions(newOptions: Partial<GraphRenderOptions>) {
        const forceUpdateNeeded = FORCE_CONTROL_KEYS.some(
            (key) =>
                newOptions[key] !== undefined &&
                newOptions[key] !== options[key],
        );
        options = {...options, ...newOptions};
        if (forceUpdateNeeded) {
            updateSimulationForces(true);
        }
        draw();
    }

    function getOptions(): GraphRenderOptions {
        return {...options};
    }

    function destroy() {
        simulation?.stop();
        if (animationFrame) cancelAnimationFrame(animationFrame);
        resizeObserver?.disconnect();
        app?.destroy(true);
        app = null;
        container = null;
    }

    return {
        mount,
        setData,
        updateOptions,
        getOptions,
        fitGraph,
        restartAnimation: startAnimation,
        destroy,
    };
}
