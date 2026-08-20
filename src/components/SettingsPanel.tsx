import { useState } from "react";
import {
    Code,
    Eye,
    Settings,
    Plus,
    Trash2,
    ChevronDown,
} from "lucide-react";
import type { GeneratorMode, Edge } from "../state/types";
import "./SettingsPanel.css";

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: "input" | "view" | "simulation";
    onTabChange: (tab: "input" | "view" | "simulation") => void;
    inputMode: "custom" | "generator";
    onInputModeChange: (mode: "custom" | "generator") => void;
    edges: Edge[];
    onAddEdge: (source: string, target: string) => void;
    onRemoveEdge: (key: string) => void;
    customNodeCount: number;
    onCustomNodeCountChange: (count: number) => void;
    nodeCount: number;
    onNodeCountChange: (count: number) => void;
    edgeCount: number;
    onEdgeCountChange: (count: number) => void;
    generatorMode: GeneratorMode;
    onGeneratorModeChange: (mode: GeneratorMode) => void;
    showLabels: boolean;
    onShowLabelsChange: (show: boolean) => void;
    showArrows: boolean;
    onShowArrowsChange: (show: boolean) => void;
    showOrphans: boolean;
    onShowOrphansChange: (show: boolean) => void;
    search: string;
    onSearchChange: (search: string) => void;
    nodeRadius: number;
    onNodeRadiusChange: (radius: number) => void;
    edgeThickness: number;
    onEdgeThicknessChange: (thickness: number) => void;
    centerForce: number;
    onCenterForceChange: (force: number) => void;
    repelForce: number;
    onRepelForceChange: (force: number) => void;
    linkForce: number;
    onLinkForceChange: (force: number) => void;
    linkDistance: number;
    onLinkDistanceChange: (distance: number) => void;
    velocityDecay: number;
    onVelocityDecayChange: (decay: number) => void;
    onRender: () => void;
    onReset: () => void;
}

const PRESETS = [
    { key: "sample", label: "Sample", edges: "1, 2\n2, 3\n3, 4\n4, 1\n1, 3", nodes: 6 },
    { key: "star", label: "Star", edges: "Center, A\nCenter, B\nCenter, C\nCenter, D\nCenter, E", nodes: 6 },
    { key: "cycle", label: "Cycle", edges: "A, B\nB, C\nC, D\nD, E\nE, A", nodes: 5 },
    { key: "mesh", label: "Mesh", edges: "A, B\nA, C\nA, D\nB, C\nB, D\nC, D", nodes: 4 },
];

export function SettingsPanel({
    isOpen,
    onClose,
    activeTab,
    onTabChange,
    inputMode,
    onInputModeChange,
    edges,
    onAddEdge,
    onRemoveEdge,
    customNodeCount,
    onCustomNodeCountChange,
    nodeCount,
    onNodeCountChange,
    edgeCount,
    onEdgeCountChange,
    generatorMode,
    onGeneratorModeChange,
    showLabels,
    onShowLabelsChange,
    showArrows,
    onShowArrowsChange,
    showOrphans,
    onShowOrphansChange,
    search,
    onSearchChange,
    nodeRadius,
    onNodeRadiusChange,
    edgeThickness,
    onEdgeThicknessChange,
    centerForce,
    onCenterForceChange,
    repelForce,
    onRepelForceChange,
    linkForce,
    onLinkForceChange,
    linkDistance,
    onLinkDistanceChange,
    velocityDecay,
    onVelocityDecayChange,
    onRender,
    onReset,
}: SettingsPanelProps) {
    const [newEdgeInput, setNewEdgeInput] = useState("");

    const handleAddEdge = () => {
        const parts = newEdgeInput.split(/[\s,;->]+/).filter(Boolean);
        if (parts.length >= 2) {
            onAddEdge(parts[0], parts[1]);
            setNewEdgeInput("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddEdge();
        }
    };

    const applyPreset = (preset: typeof PRESETS[0]) => {
        preset.edges.split("\n").forEach((line) => {
            const [src, tgt] = line.split(",").map((s) => s.trim());
            if (src && tgt) onAddEdge(src, tgt);
        });
        onCustomNodeCountChange(preset.nodes);
    };

    const maxEdges = Math.max(0, Math.floor((nodeCount * (nodeCount - 1)) / 2));

    return (
        <aside className={`settings-panel ${isOpen ? "" : "closed"}`}>
            <div className="panel-header">
                <h2 className="panel-title">Settings</h2>
                <button className="panel-close" onClick={onClose} aria-label="Close settings">
                    ×
                </button>
            </div>

            <div className="panel-tabs">
                <button
                    className={`panel-tab ${activeTab === "input" ? "active" : ""}`}
                    onClick={() => onTabChange("input")}
                >
                    <Code size={14} />
                    Graph
                </button>
                <button
                    className={`panel-tab ${activeTab === "view" ? "active" : ""}`}
                    onClick={() => onTabChange("view")}
                >
                    <Eye size={14} />
                    View
                </button>
                <button
                    className={`panel-tab ${activeTab === "simulation" ? "active" : ""}`}
                    onClick={() => onTabChange("simulation")}
                >
                    <Settings size={14} />
                    Simulation
                </button>
            </div>

            <div className="panel-body">
                {activeTab === "input" && (
                    <>
                        <div className="mode-tabs">
                            <button
                                className={`tab-btn ${inputMode === "custom" ? "active" : ""}`}
                                onClick={() => onInputModeChange("custom")}
                            >
                                Custom Input
                            </button>
                            <button
                                className={`tab-btn ${inputMode === "generator" ? "active" : ""}`}
                                onClick={() => onInputModeChange("generator")}
                            >
                                Generator
                            </button>
                        </div>

                        {inputMode === "custom" ? (
                            <>
                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Min Node Count</span>
                                    </div>
                                    <div className="number-stepper">
                                        <button
                                            className="stepper-btn"
                                            onClick={() => onCustomNodeCountChange(Math.max(1, customNodeCount - 1))}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            className="stepper-input"
                                            value={customNodeCount}
                                            min={1}
                                            max={2000}
                                            onChange={(e) => onCustomNodeCountChange(parseInt(e.target.value) || 1)}
                                        />
                                        <button
                                            className="stepper-btn"
                                            onClick={() => onCustomNodeCountChange(customNodeCount + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Edges</span>
                                        <span className="control-value">{edges.length} edges</span>
                                    </div>
                                    <div className="edge-list">
                                        {edges.map((edge) => (
                                            <div key={edge.key} className="edge-chip">
                                                <span className="edge-label">
                                                    {edge.source} → {edge.target}
                                                </span>
                                                <button
                                                    className="edge-btn"
                                                    onClick={() => onRemoveEdge(edge.key)}
                                                    title="Remove"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="add-edge-row">
                                        <input
                                            type="text"
                                            className="add-edge-input"
                                            placeholder="a, b"
                                            value={newEdgeInput}
                                            onChange={(e) => setNewEdgeInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                        <button className="add-edge-btn" onClick={handleAddEdge}>
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="presets-row">
                                    <span className="preset-label">Presets:</span>
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={preset.key}
                                            className="preset-chip"
                                            onClick={() => applyPreset(preset)}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Node Count</span>
                                        <span className="control-value">{nodeCount}</span>
                                    </div>
                                    <div className="number-stepper">
                                        <button
                                            className="stepper-btn"
                                            onClick={() => onNodeCountChange(Math.max(1, nodeCount - 1))}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            className="stepper-input"
                                            value={nodeCount}
                                            min={1}
                                            max={2000}
                                            onChange={(e) => onNodeCountChange(parseInt(e.target.value) || 1)}
                                        />
                                        <button
                                            className="stepper-btn"
                                            onClick={() => onNodeCountChange(nodeCount + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={1}
                                        max={500}
                                        value={nodeCount}
                                        onChange={(e) => onNodeCountChange(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Edge Count</span>
                                        <span className="control-value">{edgeCount} (max {maxEdges})</span>
                                    </div>
                                    <div className="number-stepper">
                                        <button
                                            className="stepper-btn"
                                            onClick={() => onEdgeCountChange(Math.max(0, edgeCount - 1))}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            className="stepper-input"
                                            value={edgeCount}
                                            min={0}
                                            max={maxEdges}
                                            onChange={(e) => onEdgeCountChange(parseInt(e.target.value) || 0)}
                                        />
                                        <button
                                            className="stepper-btn"
                                            onClick={() => onEdgeCountChange(Math.min(maxEdges, edgeCount + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={0}
                                        max={maxEdges}
                                        value={edgeCount}
                                        onChange={(e) => onEdgeCountChange(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Graph Type</span>
                                    </div>
                                    <select
                                        className="select-input"
                                        value={generatorMode}
                                        onChange={(e) => onGeneratorModeChange(e.target.value as GeneratorMode)}
                                    >
                                        <option value="preferential">Preferential Attachment</option>
                                        <option value="random">Random (Erdos-Renyi)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button className="btn btn-primary btn-block" onClick={onRender}>
                            Render Graph
                        </button>
                    </>
                )}

                {activeTab === "view" && (
                    <>
                        <section className="panel-section">
                            <h3 className="section-title">
                                <Eye size={12} className="section-title-icon" />
                                Display
                            </h3>

                            <div className="control-group">
                                <div className="control-label-row">
                                    <span>Search Nodes</span>
                                </div>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Filter by label..."
                                    value={search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                />
                            </div>

                            <label className="toggle-row">
                                <div className="toggle-label-group">
                                    <span className="toggle-title">Show Labels</span>
                                    <span className="toggle-hint">Display node label text</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={showLabels}
                                        onChange={(e) => onShowLabelsChange(e.target.checked)}
                                    />
                                    <span className="toggle-slider" />
                                </div>
                            </label>

                            <label className="toggle-row">
                                <div className="toggle-label-group">
                                    <span className="toggle-title">Directional Arrows</span>
                                    <span className="toggle-hint">Show arrowheads on edges</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={showArrows}
                                        onChange={(e) => onShowArrowsChange(e.target.checked)}
                                    />
                                    <span className="toggle-slider" />
                                </div>
                            </label>

                            <label className="toggle-row">
                                <div className="toggle-label-group">
                                    <span className="toggle-title">Show Orphans</span>
                                    <span className="toggle-hint">Include nodes with no connections</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={showOrphans}
                                        onChange={(e) => onShowOrphansChange(e.target.checked)}
                                    />
                                    <span className="toggle-slider" />
                                </div>
                            </label>
                        </section>

                        <div className="section-divider" />

                        <section className="panel-section">
                            <h3 className="section-title">
                                <Settings size={12} className="section-title-icon" />
                                Appearance
                            </h3>

                            <div className="control-group">
                                <div className="control-label-row">
                                    <span>Node Radius</span>
                                    <span className="control-value">{nodeRadius}px</span>
                                </div>
                                <input
                                    type="range"
                                    className="slider"
                                    min={10}
                                    max={200}
                                    value={nodeRadius}
                                    onChange={(e) => onNodeRadiusChange(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="control-group">
                                <div className="control-label-row">
                                    <span>Edge Thickness</span>
                                    <span className="control-value">{edgeThickness}px</span>
                                </div>
                                <input
                                    type="range"
                                    className="slider"
                                    min={10}
                                    max={200}
                                    value={edgeThickness}
                                    onChange={(e) => onEdgeThicknessChange(parseInt(e.target.value))}
                                />
                            </div>
                        </section>
                    </>
                )}

                {activeTab === "simulation" && (
                    <>
                        <details className="accordion" open>
                            <summary className="accordion-summary">
                                <span className="accordion-title">
                                    <Settings size={12} className="accordion-title-icon" />
                                    Force Parameters
                                </span>
                                <ChevronDown size={14} className="accordion-chevron" />
                            </summary>
                            <div className="accordion-content">
                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Center Gravity</span>
                                        <span className="control-value">{centerForce}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={0}
                                        max={50}
                                        value={centerForce}
                                        onChange={(e) => onCenterForceChange(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Repulsion Strength</span>
                                        <span className="control-value">{repelForce}N</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={0}
                                        max={500}
                                        value={repelForce}
                                        onChange={(e) => onRepelForceChange(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Link Stiffness</span>
                                        <span className="control-value">{linkForce}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={0}
                                        max={100}
                                        value={linkForce}
                                        onChange={(e) => onLinkForceChange(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Ideal Link Distance</span>
                                        <span className="control-value">{linkDistance}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={20}
                                        max={800}
                                        value={linkDistance}
                                        onChange={(e) => onLinkDistanceChange(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="control-group">
                                    <div className="control-label-row">
                                        <span>Velocity Damping</span>
                                        <span className="control-value">{velocityDecay.toFixed(2)}×</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="slider"
                                        min={0.1}
                                        max={0.9}
                                        step={0.05}
                                        value={velocityDecay}
                                        onChange={(e) => onVelocityDecayChange(parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </details>

                        <button className="btn btn-block" onClick={onReset}>
                            Reset to Defaults
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}
