import type {GraphRenderer} from "../graph/types";
import {
    generateGraph,
    parseCustomGraph,
    type GeneratorMode,
} from "../graph/generator";

export function setupUI(renderer: GraphRenderer) {
    const tabCustom = document.querySelector<HTMLButtonElement>("#tabCustom")!;
    const tabPreset = document.querySelector<HTMLButtonElement>("#tabPreset")!;
    const customInputGroup =
        document.querySelector<HTMLElement>("#customInputGroup")!;
    const presetInputGroup =
        document.querySelector<HTMLElement>("#presetInputGroup")!;

    const customNodeCountInput =
        document.querySelector<HTMLInputElement>("#customNodeCount")!;
    const customEdgesTextarea =
        document.querySelector<HTMLTextAreaElement>("#customEdges")!;
    const customParseBadge =
        document.querySelector<HTMLElement>("#customParseBadge")!;

    const nodeCountInput =
        document.querySelector<HTMLInputElement>("#nodeCount")!;
    const nodeCountSlider =
        document.querySelector<HTMLInputElement>("#nodeCountRange")!;
    const edgeCountInput =
        document.querySelector<HTMLInputElement>("#edgeCount")!;
    const edgeCountSlider =
        document.querySelector<HTMLInputElement>("#edgeCountRange")!;
    const modeSelect =
        document.querySelector<HTMLSelectElement>("#generatorMode")!;
    const maxEdgesHint = document.querySelector<HTMLElement>("#maxEdgesHint")!;
    const regenerateBtn =
        document.querySelector<HTMLButtonElement>("#regenerateBtn")!;

    const searchInput = document.querySelector<HTMLInputElement>("#search")!;
    const labelsToggle = document.querySelector<HTMLInputElement>("#labels")!;
    const arrowsToggle = document.querySelector<HTMLInputElement>("#arrows")!;
    const orphansToggle = document.querySelector<HTMLInputElement>("#orphans")!;
    const nodeSizeSlider =
        document.querySelector<HTMLInputElement>("#nodeSize")!;
    const linkWidthSlider =
        document.querySelector<HTMLInputElement>("#linkWidth")!;
    const themeSelect =
        document.querySelector<HTMLSelectElement>("#themeSelect")!;
    const highlightColorPicker =
        document.querySelector<HTMLInputElement>("#highlightColor")!;

    function applyAccentColor(hexColor: string) {
        const root = document.documentElement;
        root.style.setProperty("--accent-purple", hexColor);
        root.style.setProperty("--accent-purple-hover", hexColor);
        root.style.setProperty("--accent-purple-glow", `${hexColor}55`);
        root.style.setProperty("--border-active", `${hexColor}88`);
    }

    themeSelect.addEventListener("change", () => {
        const theme = themeSelect.value as "dark" | "light";
        document.documentElement.setAttribute("data-theme", theme);
        renderer.updateOptions({themeMode: theme});
    });

    document
        .querySelectorAll<HTMLButtonElement>(".btn-color-chip")
        .forEach((chip) => {
            chip.addEventListener("click", () => {
                const color = chip.getAttribute("data-color");
                if (color) {
                    highlightColorPicker.value = color;
                    applyAccentColor(color);
                    updateRenderer();
                }
            });
        });

    highlightColorPicker.addEventListener("input", () => {
        applyAccentColor(highlightColorPicker.value);
    });

    const centerForceSlider =
        document.querySelector<HTMLInputElement>("#centerForce")!;
    const repelForceSlider =
        document.querySelector<HTMLInputElement>("#repelForce")!;
    const linkForceSlider =
        document.querySelector<HTMLInputElement>("#linkForce")!;
    const linkDistanceSlider =
        document.querySelector<HTMLInputElement>("#linkDistance")!;
    const velocityDecaySlider =
        document.querySelector<HTMLInputElement>("#velocityDecay")!;

    const fitBtn = document.querySelector<HTMLButtonElement>("#fitBtn")!;
    const animateBtn =
        document.querySelector<HTMLButtonElement>("#animateBtn")!;
    const resetBtn = document.querySelector<HTMLButtonElement>("#resetBtn")!;
    const settingsToggleBtn =
        document.querySelector<HTMLButtonElement>("#settingsToggle")!;
    const settingsPanel =
        document.querySelector<HTMLElement>("#settingsPanel")!;
    const closeSettingsBtn =
        document.querySelector<HTMLButtonElement>("#closeSettings")!;
    const statusText = document.querySelector<HTMLElement>("#statusText")!;

    let activeTab: "custom" | "preset" = "custom";
    let currentNodes = parseInt(nodeCountInput.value, 10) || 80;
    let currentEdges = parseInt(edgeCountInput.value, 10) || 120;
    let currentMode: GeneratorMode =
        (modeSelect.value as GeneratorMode) || "preferential";

    const PRESETS: Record<string, {text: string; nodes: number}> = {
        sample: {
            text: "{1, 2}\n{2, 3}\n{3, 4}\n{4, 1}\n{1, 3}",
            nodes: 6,
        },
        star: {
            text: "{Center, A}\n{Center, B}\n{Center, C}\n{Center, D}\n{Center, E}\n{Center, F}",
            nodes: 7,
        },
        cycle: {
            text: "{A, B}\n{B, C}\n{C, D}\n{D, E}\n{E, A}",
            nodes: 5,
        },
        mesh: {
            text: "{A, B}\n{A, C}\n{A, D}\n{B, C}\n{B, D}\n{C, D}",
            nodes: 4,
        },
    };

    function updateParseBadge() {
        const minNodes = parseInt(customNodeCountInput.value, 10) || 0;
        const res = parseCustomGraph(customEdgesTextarea.value, minNodes);
        customParseBadge.textContent = `${res.edgeCount} edges · ${res.nodeCount} nodes`;
    }

    function switchTab(tab: "custom" | "preset") {
        activeTab = tab;
        if (tab === "custom") {
            tabCustom.classList.add("active");
            tabPreset.classList.remove("active");
            customInputGroup.classList.remove("hidden");
            presetInputGroup.classList.add("hidden");
        } else {
            tabPreset.classList.add("active");
            tabCustom.classList.remove("active");
            presetInputGroup.classList.remove("hidden");
            customInputGroup.classList.add("hidden");
        }
        triggerRegeneration(true);
    }

    tabCustom.addEventListener("click", () => switchTab("custom"));
    tabPreset.addEventListener("click", () => switchTab("preset"));

    document
        .querySelectorAll<HTMLButtonElement>(".btn-chip")
        .forEach((chip) => {
            chip.addEventListener("click", () => {
                const key = chip.getAttribute("data-preset");
                if (key && PRESETS[key]) {
                    customEdgesTextarea.value = PRESETS[key].text;
                    customNodeCountInput.value = String(PRESETS[key].nodes);
                    updateParseBadge();
                    triggerRegeneration(true);
                }
            });
        });

    function updateMaxEdgeBounds() {
        const max = Math.max(0, (currentNodes * (currentNodes - 1)) / 2);
        edgeCountInput.max = String(max);
        edgeCountSlider.max = String(max);
        maxEdgesHint.textContent = `(max ${max})`;

        if (currentEdges > max) {
            currentEdges = max;
            edgeCountInput.value = String(max);
            edgeCountSlider.value = String(max);
        }
    }

    function syncValueDisplays() {
        document
            .querySelectorAll<HTMLOutputElement>(".range-value")
            .forEach((output) => {
                const forId = output.getAttribute("for");
                if (forId) {
                    const input = document.getElementById(
                        forId,
                    ) as HTMLInputElement;
                    if (input) {
                        output.textContent = input.value;
                    }
                }
            });
    }

    let debounceTimer: number | undefined;
    function triggerRegeneration(immediate = false) {
        if (debounceTimer) clearTimeout(debounceTimer);
        const doGen = () => {
            if (activeTab === "custom") {
                const minNodes = parseInt(customNodeCountInput.value, 10) || 0;
                const parsed = parseCustomGraph(
                    customEdgesTextarea.value,
                    minNodes,
                );
                renderer.setData(parsed.graph);
                statusText.textContent = `${parsed.nodeCount} nodes · ${parsed.edgeCount} edges (Custom)`;
                updateParseBadge();
            } else {
                const data = generateGraph(
                    currentNodes,
                    currentEdges,
                    currentMode,
                );
                renderer.setData(data);
                statusText.textContent = `${data.nodes.length} nodes · ${data.links.length} edges (${currentMode})`;
            }
        };

        if (immediate) {
            doGen();
        } else {
            debounceTimer = window.setTimeout(doGen, 150);
        }
    }

    customEdgesTextarea.addEventListener("input", () => {
        updateParseBadge();
        triggerRegeneration();
    });

    customNodeCountInput.addEventListener("input", () => {
        updateParseBadge();
        triggerRegeneration();
    });

    nodeCountInput.addEventListener("input", () => {
        currentNodes = Math.max(1, parseInt(nodeCountInput.value, 10) || 1);
        nodeCountSlider.value = String(currentNodes);
        updateMaxEdgeBounds();
        triggerRegeneration();
    });

    nodeCountSlider.addEventListener("input", () => {
        currentNodes = parseInt(nodeCountSlider.value, 10);
        nodeCountInput.value = String(currentNodes);
        updateMaxEdgeBounds();
        triggerRegeneration();
    });

    edgeCountInput.addEventListener("input", () => {
        const max = (currentNodes * (currentNodes - 1)) / 2;
        currentEdges = Math.min(
            max,
            Math.max(0, parseInt(edgeCountInput.value, 10) || 0),
        );
        edgeCountSlider.value = String(currentEdges);
        triggerRegeneration();
    });

    edgeCountSlider.addEventListener("input", () => {
        currentEdges = parseInt(edgeCountSlider.value, 10);
        edgeCountInput.value = String(currentEdges);
        triggerRegeneration();
    });

    modeSelect.addEventListener("change", () => {
        currentMode = modeSelect.value as GeneratorMode;
        triggerRegeneration(true);
    });

    regenerateBtn.addEventListener("click", () => {
        triggerRegeneration(true);
    });

    const updateRenderer = () => {
        syncValueDisplays();
        renderer.updateOptions({
            search: searchInput.value,
            labels: labelsToggle.checked,
            arrows: arrowsToggle.checked,
            orphans: orphansToggle.checked,
            nodeSize: Number(nodeSizeSlider.value),
            linkWidth: Number(linkWidthSlider.value),
            highlightColor: highlightColorPicker.value,
            themeMode: themeSelect.value as any,
            centerForce: Number(centerForceSlider.value),
            repelForce: Number(repelForceSlider.value),
            linkForce: Number(linkForceSlider.value),
            linkDistance: Number(linkDistanceSlider.value),
            velocityDecay: Number(velocityDecaySlider.value),
        });
    };

    [
        searchInput,
        labelsToggle,
        arrowsToggle,
        orphansToggle,
        nodeSizeSlider,
        linkWidthSlider,
        highlightColorPicker,
        centerForceSlider,
        repelForceSlider,
        linkForceSlider,
        linkDistanceSlider,
        velocityDecaySlider,
    ].forEach((element) => {
        element.addEventListener("input", updateRenderer);
    });

    fitBtn.addEventListener("click", () => renderer.fitGraph());
    animateBtn.addEventListener("click", () => renderer.restartAnimation());

    resetBtn.addEventListener("click", () => {
        labelsToggle.checked = true;
        arrowsToggle.checked = false;
        orphansToggle.checked = true;
        nodeSizeSlider.value = "50";
        linkWidthSlider.value = "50";
        highlightColorPicker.value = "#a600ff";
        centerForceSlider.value = "8";
        repelForceSlider.value = "100";
        linkForceSlider.value = "30";
        linkDistanceSlider.value = "300";
        velocityDecaySlider.value = "0.4";
        searchInput.value = "";
        updateRenderer();
    });

    function toggleSettings(open?: boolean) {
        const isOpen = open ?? settingsPanel.classList.contains("closed");
        settingsPanel.classList.toggle("closed", !isOpen);
        settingsToggleBtn.setAttribute("aria-expanded", String(isOpen));
    }

    settingsToggleBtn.addEventListener("click", () => toggleSettings());
    closeSettingsBtn.addEventListener("click", () => toggleSettings(false));

    updateMaxEdgeBounds();
    syncValueDisplays();
    updateParseBadge();
    triggerRegeneration(true);
}
