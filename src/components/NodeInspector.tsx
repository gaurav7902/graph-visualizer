import { Circle } from "lucide-react";
import type { GraphNode } from "../graph/types";
import "./NodeInspector.css";

interface NodeInspectorProps {
    node: GraphNode | null;
    onClose: () => void;
    degree?: number;
    incoming?: number;
    outgoing?: number;
}

export function NodeInspector({ node, onClose, degree, incoming, outgoing }: NodeInspectorProps) {
    if (!node) return null;

    return (
        <div className="node-inspector">
            <div className="inspector-header">
                <span className="inspector-tag">NODE</span>
                <button className="inspector-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
            </div>
            <div className="inspector-body">
                <div className="inspector-title-row">
                    <Circle size={16} className="inspector-icon" />
                    <span className="inspector-title">{node.label}</span>
                </div>
                <div className="inspector-meta">
                    <span className="inspector-id">ID: {node.id}</span>
                </div>
                {(degree !== undefined || incoming !== undefined || outgoing !== undefined) && (
                    <div className="inspector-stats">
                        {degree !== undefined && (
                            <div className="stat-item">
                                <span className="stat-label">Degree</span>
                                <span className="stat-value">{degree}</span>
                            </div>
                        )}
                        {incoming !== undefined && (
                            <div className="stat-item">
                                <span className="stat-label">Incoming</span>
                                <span className="stat-value">{incoming}</span>
                            </div>
                        )}
                        {outgoing !== undefined && (
                            <div className="stat-item">
                                <span className="stat-label">Outgoing</span>
                                <span className="stat-value">{outgoing}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
