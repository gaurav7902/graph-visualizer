import { Maximize2, Play, Palette, Settings } from "lucide-react";
import "./TopBar.css";

interface TopBarProps {
    nodeCount: number;
    edgeCount: number;
    isSimulating?: boolean;
    onFit: () => void;
    onAnimate: () => void;
    onThemeToggle: () => void;
    onSettingsToggle: () => void;
}

export function TopBar({
    nodeCount,
    edgeCount,
    isSimulating,
    onFit,
    onAnimate,
    onThemeToggle,
    onSettingsToggle,
}: TopBarProps) {
    return (
        <header className="top-bar">
            <div className="brand">
                <svg
                    className="brand-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="12" cy="18" r="3" />
                    <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
                    <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
                    <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
                </svg>
                <span>Graph Lab</span>
            </div>

            <div className="status-pill">
                <span className={`status-dot ${isSimulating ? "simulating" : ""}`} />
                <span>
                    {nodeCount} nodes · {edgeCount} edges
                </span>
            </div>

            <div className="actions-group">
                <button className="btn btn-icon" onClick={onFit} title="Fit graph (F)">
                    <Maximize2 size={16} />
                    <span className="btn-icon-label">Fit</span>
                </button>

                <button className="btn btn-icon" onClick={onAnimate} title="Animate (Space)">
                    <Play size={16} />
                    <span className="btn-icon-label">Animate</span>
                </button>

                <button className="btn btn-icon" onClick={onThemeToggle} title="Toggle theme">
                    <Palette size={16} />
                    <span className="btn-icon-label">Theme</span>
                </button>

                <button className="btn btn-primary btn-icon" onClick={onSettingsToggle} title="Settings">
                    <Settings size={16} />
                    <span className="btn-icon-label">Settings</span>
                </button>
            </div>
        </header>
    );
}
