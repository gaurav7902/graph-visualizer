import { useState, useCallback, useEffect, useRef } from "react";
import { TopBar } from "./components/TopBar";
import { SettingsPanel } from "./components/SettingsPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import { NodeInspector } from "./components/NodeInspector";
import { QuickActions } from "./components/QuickActions";
import { EmptyState } from "./components/EmptyState";
import { ShortcutsOverlay } from "./components/ShortcutsOverlay";
import { useGraphState } from "./state/useGraphState";
import { generateGraph, parseCustomGraph } from "./graph/generator";
import type { GraphRenderer, GraphNode, GraphData, GraphRenderOptions } from "./graph/types";
import "./styles/globals.css";

export function App() {
    const {
        graphState,
        viewSettings,
        simulationSettings,
        themeSettings,
        addEdge,
        removeEdge,
        updateGraphState,
        updateViewSettings,
        updateSimulationSettings,
        updateThemeSettings,
        resetViewSettings,
        resetSimulationSettings,
    } = useGraphState();

    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const [settingsTab, setSettingsTab] = useState<"input" | "view" | "simulation">("input");
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const rendererRef = useRef<GraphRenderer | null>(null);

    const renderOptions: Partial<GraphRenderOptions> = {
        labels: viewSettings.showLabels,
        arrows: viewSettings.showArrows,
        orphans: viewSettings.showOrphans,
        search: viewSettings.search,
        nodeSize: viewSettings.nodeRadius,
        linkWidth: viewSettings.edgeThickness,
        centerForce: simulationSettings.centerForce,
        repelForce: simulationSettings.repelForce,
        linkForce: simulationSettings.linkForce,
        linkDistance: simulationSettings.linkDistance,
        velocityDecay: simulationSettings.velocityDecay,
        highlightColor: themeSettings.accentColor,
        themeMode: themeSettings.mode,
        existing: false,
        textFadeThreshold: 0,
    };

    const generateGraphFromState = useCallback(() => {
        if (graphState.inputMode === "custom") {
            const edgeText = graphState.edges.map((e) => `${e.source}, ${e.target}`).join("\n");
            const result = parseCustomGraph(edgeText, graphState.nodes);
            setGraphData(result.graph);
        } else {
            const data = generateGraph(graphState.nodeCount, graphState.edgeCount, graphState.generatorMode);
            setGraphData(data);
        }
    }, [graphState]);

    useEffect(() => {
        generateGraphFromState();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", themeSettings.mode);
    }, [themeSettings.mode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case "f":
                    rendererRef.current?.fitGraph();
                    break;
                case " ":
                    e.preventDefault();
                    rendererRef.current?.restartAnimation();
                    break;
                case "a":
                    rendererRef.current?.restartAnimation();
                    break;
                case "?":
                    setShowShortcuts((prev) => !prev);
                    break;
                case "escape":
                    setSelectedNode(null);
                    break;
                case "n":
                    setIsSettingsOpen(true);
                    setSettingsTab("input");
                    updateGraphState({ inputMode: "custom" });
                    break;
                case "e":
                    setIsSettingsOpen(true);
                    setSettingsTab("input");
                    break;
                case "/":
                    e.preventDefault();
                    setIsSettingsOpen(true);
                    setSettingsTab("view");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [updateGraphState]);

    const handleNodeSelect = useCallback((node: GraphNode | null) => {
        setSelectedNode(node);
    }, []);

    const handleRenderReady = useCallback((renderer: GraphRenderer) => {
        rendererRef.current = renderer;
    }, []);

    const handleThemeToggle = useCallback(() => {
        updateThemeSettings({ mode: themeSettings.mode === "dark" ? "light" : "dark" });
    }, [themeSettings.mode, updateThemeSettings]);

    const handleReset = useCallback(() => {
        resetViewSettings();
        resetSimulationSettings();
    }, [resetViewSettings, resetSimulationSettings]);

    const handleAddNode = useCallback(() => {
        setIsSettingsOpen(true);
        setSettingsTab("input");
        updateGraphState({ inputMode: "custom" });
    }, [updateGraphState]);

    const handleAddEdge = useCallback(() => {
        setIsSettingsOpen(true);
        setSettingsTab("input");
    }, []);

    const handleSearch = useCallback(() => {
        setIsSettingsOpen(true);
        setSettingsTab("view");
    }, []);

    const handleCreateGraph = useCallback(() => {
        setIsSettingsOpen(true);
        setSettingsTab("input");
        updateGraphState({ inputMode: "custom" });
    }, [updateGraphState]);

    const handleGenerate = useCallback(() => {
        setIsSettingsOpen(true);
        setSettingsTab("input");
        updateGraphState({ inputMode: "generator" });
        generateGraphFromState();
    }, [updateGraphState, generateGraphFromState]);

    const nodeCount = graphData?.nodes.length ?? 0;
    const edgeCount = graphData?.links.length ?? 0;

    return (
        <div id="app">
            <GraphCanvas
                data={graphData}
                options={renderOptions}
                onNodeSelect={handleNodeSelect}
                onRenderReady={handleRenderReady}
            />

            <TopBar
                nodeCount={nodeCount}
                edgeCount={edgeCount}
                onFit={() => rendererRef.current?.fitGraph()}
                onAnimate={() => rendererRef.current?.restartAnimation()}
                onThemeToggle={handleThemeToggle}
                onSettingsToggle={() => setIsSettingsOpen((prev) => !prev)}
            />

            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                activeTab={settingsTab}
                onTabChange={setSettingsTab}
                inputMode={graphState.inputMode}
                onInputModeChange={(mode) => updateGraphState({ inputMode: mode })}
                edges={graphState.edges}
                onAddEdge={addEdge}
                onRemoveEdge={removeEdge}
                customNodeCount={graphState.nodes}
                onCustomNodeCountChange={(count) => updateGraphState({ nodes: count })}
                nodeCount={graphState.nodeCount}
                onNodeCountChange={(count) => updateGraphState({ nodeCount: count })}
                edgeCount={graphState.edgeCount}
                onEdgeCountChange={(count) => updateGraphState({ edgeCount: count })}
                generatorMode={graphState.generatorMode}
                onGeneratorModeChange={(mode) => updateGraphState({ generatorMode: mode })}
                showLabels={viewSettings.showLabels}
                onShowLabelsChange={(show) => updateViewSettings({ showLabels: show })}
                showArrows={viewSettings.showArrows}
                onShowArrowsChange={(show) => updateViewSettings({ showArrows: show })}
                showOrphans={viewSettings.showOrphans}
                onShowOrphansChange={(show) => updateViewSettings({ showOrphans: show })}
                search={viewSettings.search}
                onSearchChange={(search) => updateViewSettings({ search })}
                nodeRadius={viewSettings.nodeRadius}
                onNodeRadiusChange={(radius) => updateViewSettings({ nodeRadius: radius })}
                edgeThickness={viewSettings.edgeThickness}
                onEdgeThicknessChange={(thickness) => updateViewSettings({ edgeThickness: thickness })}
                centerForce={simulationSettings.centerForce}
                onCenterForceChange={(force) => updateSimulationSettings({ centerForce: force })}
                repelForce={simulationSettings.repelForce}
                onRepelForceChange={(force) => updateSimulationSettings({ repelForce: force })}
                linkForce={simulationSettings.linkForce}
                onLinkForceChange={(force) => updateSimulationSettings({ linkForce: force })}
                linkDistance={simulationSettings.linkDistance}
                onLinkDistanceChange={(distance) => updateSimulationSettings({ linkDistance: distance })}
                velocityDecay={simulationSettings.velocityDecay}
                onVelocityDecayChange={(decay) => updateSimulationSettings({ velocityDecay: decay })}
                onRender={generateGraphFromState}
                onReset={handleReset}
            />

            {selectedNode && (
                <NodeInspector node={selectedNode} onClose={() => setSelectedNode(null)} />
            )}

            {nodeCount > 0 ? (
                <QuickActions
                    onAddNode={handleAddNode}
                    onAddEdge={handleAddEdge}
                    onSearch={handleSearch}
                />
            ) : (
                <EmptyState onCreateGraph={handleCreateGraph} onGenerate={handleGenerate} />
            )}

            {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
        </div>
    );
}
