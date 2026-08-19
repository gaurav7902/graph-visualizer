export interface GraphNode {
    id: string;
    label: string;
    missing?: boolean;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface GraphRenderOptions {
    existing: boolean;
    orphans: boolean;
    arrows: boolean;
    labels: boolean;
    textFadeThreshold: number;
    nodeSize: number;
    linkWidth: number;
    centerForce: number;
    repelForce: number;
    linkForce: number;
    linkDistance: number;
    velocityDecay: number;
    highlightColor: string;
    themeMode?: "dark" | "light";
    search: string;
}

export interface GraphRenderer {
    mount(host: HTMLElement): void;
    setData(data: GraphData): void;
    updateOptions(options: Partial<GraphRenderOptions>): void;
    getOptions(): GraphRenderOptions;
    fitGraph(duration?: number): void;
    restartAnimation(): void;
    destroy(): void;
}
