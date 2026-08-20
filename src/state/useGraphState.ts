import {useState, useCallback} from "react";
import type {
    GraphState,
    ViewSettings,
    SimulationSettings,
    ThemeSettings,
} from "./types";

export function edgeKey(a: string, b: string): string {
    return a < b ? `${a}---${b}` : `${b}---${a}`;
}

const DEFAULT_GRAPH_STATE: GraphState = {
    nodes: 6,
    edges: [
        {key: "1---2", source: "1", target: "2"},
        {key: "2---3", source: "2", target: "3"},
        {key: "3---4", source: "3", target: "4"},
        {key: "1---4", source: "1", target: "4"},
        {key: "1---3", source: "1", target: "3"},
    ],
    nodeCount: 80,
    edgeCount: 120,
    generatorMode: "preferential",
    inputMode: "custom",
};

const DEFAULT_VIEW_SETTINGS: ViewSettings = {
    showLabels: true,
    showArrows: false,
    showOrphans: true,
    search: "",
    nodeRadius: 50,
    edgeThickness: 50,
};

const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
    centerForce: 8,
    repelForce: 100,
    linkForce: 30,
    linkDistance: 300,
    velocityDecay: 0.4,
};

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    mode: "dark",
    accentColor: "#a855f7",
};

export function useGraphState() {
    const [graphState, setGraphState] =
        useState<GraphState>(DEFAULT_GRAPH_STATE);
    const [viewSettings, setViewSettings] = useState<ViewSettings>(
        DEFAULT_VIEW_SETTINGS,
    );
    const [simulationSettings, setSimulationSettings] =
        useState<SimulationSettings>(DEFAULT_SIMULATION_SETTINGS);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(
        DEFAULT_THEME_SETTINGS,
    );

    const addEdge = useCallback((source: string, target: string) => {
        const key = edgeKey(source, target);
        setGraphState((prev) => {
            if (prev.edges.some((e) => e.key === key)) return prev;
            return {
                ...prev,
                edges: [...prev.edges, {key, source, target}],
            };
        });
    }, []);

    const removeEdge = useCallback((key: string) => {
        setGraphState((prev) => ({
            ...prev,
            edges: prev.edges.filter((e) => e.key !== key),
        }));
    }, []);

    const clearEdges = useCallback(() => {
        setGraphState((prev) => ({...prev, edges: []}));
    }, []);

    const updateGraphState = useCallback((updates: Partial<GraphState>) => {
        setGraphState((prev) => ({...prev, ...updates}));
    }, []);

    const updateViewSettings = useCallback((updates: Partial<ViewSettings>) => {
        setViewSettings((prev) => ({...prev, ...updates}));
    }, []);

    const updateSimulationSettings = useCallback(
        (updates: Partial<SimulationSettings>) => {
            setSimulationSettings((prev) => ({...prev, ...updates}));
        },
        [],
    );

    const updateThemeSettings = useCallback(
        (updates: Partial<ThemeSettings>) => {
            setThemeSettings((prev) => ({...prev, ...updates}));
        },
        [],
    );

    const resetViewSettings = useCallback(() => {
        setViewSettings(DEFAULT_VIEW_SETTINGS);
    }, []);

    const resetSimulationSettings = useCallback(() => {
        setSimulationSettings(DEFAULT_SIMULATION_SETTINGS);
    }, []);

    return {
        graphState,
        viewSettings,
        simulationSettings,
        themeSettings,
        addEdge,
        removeEdge,
        clearEdges,
        updateGraphState,
        updateViewSettings,
        updateSimulationSettings,
        updateThemeSettings,
        resetViewSettings,
        resetSimulationSettings,
    };
}
