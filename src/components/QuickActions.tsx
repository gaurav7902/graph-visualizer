import { Plus, GitBranch, Search } from "lucide-react";
import "./QuickActions.css";

interface QuickActionsProps {
    onAddNode: () => void;
    onAddEdge: () => void;
    onSearch: () => void;
}

export function QuickActions({ onAddNode, onAddEdge, onSearch }: QuickActionsProps) {
    return (
        <>
            <div className="quick-actions">
                <button className="quick-action-btn primary" onClick={onAddNode} title="Add node (N)">
                    <Plus size={14} />
                    <span>Node</span>
                </button>
                <button className="quick-action-btn" onClick={onAddEdge} title="Add edge (E)">
                    <GitBranch size={14} />
                    <span>Edge</span>
                </button>
                <button className="quick-action-btn" onClick={onSearch} title="Search (/)">
                    <Search size={14} />
                    <span>Search</span>
                </button>
            </div>
            <div className="hint-text">
                Drag nodes · Scroll to zoom · F to fit
            </div>
        </>
    );
}
