import { useEffect } from "react";
import "./ShortcutsOverlay.css";

interface ShortcutsOverlayProps {
    onClose: () => void;
}

const SHORTCUTS = [
    { label: "Start/stop simulation", keys: ["Space"] },
    { label: "Fit graph", keys: ["F"] },
    { label: "Animate", keys: ["A"] },
    { label: "Add node", keys: ["N"] },
    { label: "Add edge", keys: ["E"] },
    { label: "Search", keys: ["/"] },
    { label: "Delete selected", keys: ["Delete"] },
    { label: "Clear selection", keys: ["Esc"] },
    { label: "Show shortcuts", keys: ["?"] },
];

export function ShortcutsOverlay({ onClose }: ShortcutsOverlayProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" || e.key === "?") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="shortcuts-overlay" onClick={onClose}>
            <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2 className="shortcuts-title">Keyboard Shortcuts</h2>
                    <button className="shortcuts-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="shortcuts-list">
                    {SHORTCUTS.map((shortcut) => (
                        <div key={shortcut.label} className="shortcut-row">
                            <span className="shortcut-label">{shortcut.label}</span>
                            <div className="shortcut-keys">
                                {shortcut.keys.map((key) => (
                                    <kbd key={key} className="shortcut-key">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
