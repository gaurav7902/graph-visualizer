import { useEffect, useRef } from "react";
import { createGraphRenderer } from "../graph/renderer";
import type { GraphRenderer, GraphData, GraphNode, GraphRenderOptions } from "../graph/types";
import "./GraphCanvas.css";

interface GraphCanvasProps {
    data: GraphData | null;
    options: Partial<GraphRenderOptions>;
    onNodeSelect?: (node: GraphNode | null) => void;
    onRenderReady?: (renderer: GraphRenderer) => void;
}

export function GraphCanvas({ data, options, onNodeSelect, onRenderReady }: GraphCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<GraphRenderer | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = createGraphRenderer({}, onNodeSelect);
        renderer.mount(containerRef.current);
        rendererRef.current = renderer;
        
        if (onRenderReady) {
            onRenderReady(renderer);
        }

        return () => {
            renderer.destroy();
            rendererRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (rendererRef.current && data) {
            rendererRef.current.setData(data);
        }
    }, [data]);

    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.updateOptions(options);
        }
    }, [options]);

    return (
        <div ref={containerRef} className="canvas-container">
            <div className="canvas-grid" />
            <div className="canvas-glow" />
        </div>
    );
}
