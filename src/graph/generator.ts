import type {GraphData, GraphNode, GraphLink} from "./types";

export type GeneratorMode = "preferential" | "random" | "custom";

export interface CustomGraphParseResult {
    graph: GraphData;
    nodeCount: number;
    edgeCount: number;
    error?: string;
}

export function parseCustomGraph(
    rawText: string,
    minNodeCount: number = 0,
): CustomGraphParseResult {
    const trimmed = rawText.trim();
    const nodeMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];
    const edgeSet = new Set<string>();

    function getOrCreateNode(name: string): string {
        const id = name.trim();
        if (!nodeMap.has(id)) {
            nodeMap.set(id, {id, label: id});
        }
        return id;
    }

    function addEdge(sourceRaw: string | number, targetRaw: string | number) {
        const source = String(sourceRaw).trim();
        const target = String(targetRaw).trim();
        if (!source || !target || source === target) return;
        const u = getOrCreateNode(source);
        const v = getOrCreateNode(target);
        const key = u < v ? `${u}---${v}` : `${v}---${u}`;
        if (!edgeSet.has(key)) {
            edgeSet.add(key);
            links.push({source: u, target: v});
        }
    }

    let parsedJson = false;
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
            const data = JSON.parse(trimmed);
            if (Array.isArray(data)) {
                for (const item of data) {
                    if (Array.isArray(item) && item.length >= 2) {
                        addEdge(item[0], item[1]);
                    } else if (typeof item === "object" && item !== null) {
                        const u = item.u ?? item.source ?? item.from;
                        const v = item.v ?? item.target ?? item.to;
                        if (u !== undefined && v !== undefined) {
                            addEdge(u, v);
                        }
                    }
                }
                parsedJson = true;
            }
        } catch {
            // Fallback to line parsing
        }
    }

    if (!parsedJson && trimmed.length > 0) {
        const lines = trimmed.split("\n");
        for (const line of lines) {
            const cleanLine = line.trim();
            if (
                !cleanLine ||
                cleanLine.startsWith("//") ||
                cleanLine.startsWith("#")
            )
                continue;

            const unbracketed = cleanLine.replace(
                /^[\{\(\[\s]+|[\}\)\]\s]+$/g,
                "",
            );
            const parts = unbracketed
                .split(/\s*[\,\;]\s*|(?:\s*\-\>\s*)|\s*\-\s*|\s+/)
                .filter(Boolean);
            if (parts.length >= 2) {
                for (let i = 0; i < parts.length - 1; i += 2) {
                    addEdge(parts[i], parts[i + 1]);
                }
            }
        }
    }

    const currentNodeCount = nodeMap.size;
    if (minNodeCount > currentNodeCount) {
        const addCount = minNodeCount - currentNodeCount;
        for (let i = 1; i <= addCount; i++) {
            let id = `Node ${currentNodeCount + i}`;
            let counter = currentNodeCount + i;
            while (nodeMap.has(id)) {
                counter++;
                id = `Node ${counter}`;
            }
            nodeMap.set(id, {id, label: id});
        }
    }

    const nodes = Array.from(nodeMap.values());
    return {
        graph: {nodes, links},
        nodeCount: nodes.length,
        edgeCount: links.length,
    };
}

export function generateGraph(
    nodeCount: number,
    edgeCount: number,
    mode: GeneratorMode = "preferential",
): GraphData {
    const safeNodeCount = Math.max(1, Math.floor(nodeCount));
    const maxEdges = (safeNodeCount * (safeNodeCount - 1)) / 2;
    const safeEdgeCount = Math.min(
        Math.max(0, Math.floor(edgeCount)),
        maxEdges,
    );

    const nodes: GraphNode[] = Array.from({length: safeNodeCount}, (_, i) => {
        const id = `node-${i + 1}`;
        return {
            id,
            label: `Node ${i + 1}`,
        };
    });

    if (safeNodeCount < 2 || safeEdgeCount === 0) {
        return {nodes, links: []};
    }

    const links: GraphLink[] = [];
    const edgeSet = new Set<string>();

    function addLink(u: number, v: number): boolean {
        if (u === v) return false;
        const min = Math.min(u, v);
        const max = Math.max(u, v);
        const key = `${min}-${max}`;
        if (edgeSet.has(key)) return false;

        edgeSet.add(key);
        links.push({
            source: nodes[u].id,
            target: nodes[v].id,
        });
        return true;
    }

    if (mode === "random") {
        let attempts = 0;
        const maxAttempts = safeEdgeCount * 20;

        while (links.length < safeEdgeCount && attempts < maxAttempts) {
            attempts++;
            const u = Math.floor(Math.random() * safeNodeCount);
            const v = Math.floor(Math.random() * safeNodeCount);
            addLink(u, v);
        }
    } else {
        // Barabási–Albert Preferential Attachment
        const nodeDegrees: number[] = new Array(safeNodeCount).fill(0);
        const degreeSumPool: number[] = [];

        addLink(0, 1);
        nodeDegrees[0] = 1;
        nodeDegrees[1] = 1;
        degreeSumPool.push(0, 1);

        let edgesToAddPerNode = Math.max(
            1,
            Math.round(safeEdgeCount / safeNodeCount),
        );

        for (
            let i = 2;
            i < safeNodeCount && links.length < safeEdgeCount;
            i++
        ) {
            const targetsForThisNode = new Set<number>();
            let attempts = 0;
            const targetCount = Math.min(
                edgesToAddPerNode,
                i,
                safeEdgeCount - links.length,
            );

            while (
                targetsForThisNode.size < targetCount &&
                attempts < targetCount * 10
            ) {
                attempts++;
                let target: number;
                if (degreeSumPool.length > 0 && Math.random() < 0.85) {
                    const idx = Math.floor(
                        Math.random() * degreeSumPool.length,
                    );
                    target = degreeSumPool[idx];
                } else {
                    target = Math.floor(Math.random() * i);
                }

                if (target !== i && !targetsForThisNode.has(target)) {
                    targetsForThisNode.add(target);
                }
            }

            for (const target of targetsForThisNode) {
                if (addLink(i, target)) {
                    nodeDegrees[i]++;
                    nodeDegrees[target]++;
                    degreeSumPool.push(i, target);
                }
            }
        }

        let attempts = 0;
        while (links.length < safeEdgeCount && attempts < safeEdgeCount * 10) {
            attempts++;
            const u = Math.floor(Math.random() * safeNodeCount);
            const v =
                degreeSumPool.length > 0 && Math.random() < 0.7
                    ? degreeSumPool[
                          Math.floor(Math.random() * degreeSumPool.length)
                      ]
                    : Math.floor(Math.random() * safeNodeCount);
            addLink(u, v);
        }
    }

    return {nodes, links};
}
