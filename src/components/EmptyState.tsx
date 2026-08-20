import { Circle } from "lucide-react";
import "./EmptyState.css";

interface EmptyStateProps {
    onCreateGraph: () => void;
    onGenerate: () => void;
}

export function EmptyState({ onCreateGraph, onGenerate }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <Circle size={48} className="empty-icon" strokeWidth={1.5} />
            <h2 className="empty-title">Build a graph</h2>
            <p className="empty-description">
                Create a graph manually or generate one to start exploring.
            </p>
            <div className="empty-actions">
                <button className="btn btn-primary" onClick={onCreateGraph}>
                    Create Graph
                </button>
                <button className="btn" onClick={onGenerate}>
                    Generate
                </button>
            </div>
            <p className="empty-tip">
                Tip: Press <kbd>N</kbd> to add a node
            </p>
        </div>
    );
}
