export type GeneratorMode = "preferential" | "random";

export interface Edge {
    key: string;
    source: string;
    target: string;
}

export interface GraphState {
    nodes: number;
    edges: Edge[];
    nodeCount: number;
    edgeCount: number;
    generatorMode: GeneratorMode;
    inputMode: "custom" | "generator";
}

export interface ViewSettings {
    showLabels: boolean;
    showArrows: boolean;
    showOrphans: boolean;
    search: string;
    nodeRadius: number;
    edgeThickness: number;
}

export interface SimulationSettings {
    centerForce: number;
    repelForce: number;
    linkForce: number;
    linkDistance: number;
    velocityDecay: number;
}

export interface ThemeSettings {
    mode: "dark" | "light";
    accentColor: string;
}
