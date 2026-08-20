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
    const edgeListEl = document.querySelector<HTMLElement>("#edgeList")!;
    const addEdgeInput =
        document.querySelector<HTMLInputElement>("#addEdgeInput")!;
    const addEdgeBtn =
        document.querySelector<HTMLButtonElement>("#addEdgeBtn")!;

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

    const websiteSettingsToggleBtn = document.querySelector<HTMLButtonElement>(
        "#websiteSettingsToggle",
    )!;
    const websiteSettingsPanel = document.querySelector<HTMLElement>(
        "#websiteSettingsPanel",
    )!;
    const closeWebsiteSettingsBtn = document.querySelector<HTMLButtonElement>(
        "#closeWebsiteSettings",
    )!;

    const sidebarTabInput =
        document.querySelector<HTMLButtonElement>("#sidebarTabInput")!;
    const sidebarTabVisual =
        document.querySelector<HTMLButtonElement>("#sidebarTabVisual")!;
    const paneInput = document.querySelector<HTMLElement>("#paneInput")!;
    const paneVisual = document.querySelector<HTMLElement>("#paneVisual")!;

    // ── Sidebar Tab Navigation ──

    function switchSidebarTab(tab: "input" | "visual") {
        if (tab === "input") {
            sidebarTabInput.classList.add("active");
            sidebarTabVisual.classList.remove("active");
            paneInput.classList.remove("hidden");
            paneVisual.classList.add("hidden");
        } else {
            sidebarTabVisual.classList.add("active");
            sidebarTabInput.classList.remove("active");
            paneVisual.classList.remove("hidden");
            paneInput.classList.add("hidden");
        }
    }

    sidebarTabInput.addEventListener("click", () => switchSidebarTab("input"));
    sidebarTabVisual.addEventListener("click", () =>
        switchSidebarTab("visual"),
    );

    // ── Number Stepper Buttons ──

    document
        .querySelectorAll<HTMLButtonElement>(".stepper-btn")
        .forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetId = btn.getAttribute("data-target");
                const action = btn.getAttribute("data-action");
                if (!targetId || !action) return;

                const input = document.getElementById(
                    targetId,
                ) as HTMLInputElement | null;
                if (!input) return;

                const step = parseFloat(input.step) || 1;
                const min = parseFloat(input.min) || 0;
                const max = parseFloat(input.max) || Infinity;
                let value = parseFloat(input.value) || 0;

                if (action === "inc") {
                    value = Math.min(max, value + step);
                } else if (action === "dec") {
                    value = Math.max(min, value - step);
                }

                input.value = String(value);
                input.dispatchEvent(new Event("input", {bubbles: true}));
            });
        });

    // ── Website Settings (Theme & Accent) ──

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

    function toggleWebsiteSettings(open?: boolean) {
        const isOpen =
            open ?? websiteSettingsPanel.classList.contains("closed");
        websiteSettingsPanel.classList.toggle("closed", !isOpen);
        websiteSettingsToggleBtn.setAttribute("aria-expanded", String(isOpen));
    }

    websiteSettingsToggleBtn.addEventListener("click", () =>
        toggleWebsiteSettings(),
    );
    closeWebsiteSettingsBtn.addEventListener("click", () =>
        toggleWebsiteSettings(false),
    );

    // ── Graph Settings ──

    let activeTab: "custom" | "preset" = "custom";
    let currentNodes = parseInt(nodeCountInput.value, 10) || 80;
    let currentEdges = parseInt(edgeCountInput.value, 10) || 120;
    let currentMode: GeneratorMode =
        (modeSelect.value as GeneratorMode) || "preferential";

    const PRESETS: Record<string, {text: string; nodes: number}> = {
        sample: {
            text: "1, 2\n2, 3\n3, 4\n4, 1\n1, 3",
            nodes: 6,
        },
        star: {
            text: "Center, A\nCenter, B\nCenter, C\nCenter, D\nCenter, E\nCenter, F",
            nodes: 7,
        },
        cycle: {
            text: "A, B\nB, C\nC, D\nD, E\nE, A",
            nodes: 5,
        },
        mesh: {
            text: "A, B\nA, C\nA, D\nB, C\nB, D\nC, D",
            nodes: 4,
        },
    };

    type Edge = {key: string; source: string; target: string};
    let edgeList: Edge[] = [];

    function edgeKey(a: string, b: string): string {
        return a < b ? `${a}---${b}` : `${b}---${a}`;
    }

    function addEdgeToList(source: string, target: string) {
        source = source.trim();
        target = target.trim();
        if (!source || !target || source === target) return;
        const key = edgeKey(source, target);
        if (edgeList.some((e) => e.key === key)) return;
        edgeList.push({key, source, target});
        syncTextareaFromEdgeList();
        renderEdgeList();
        triggerRegeneration();
    }

    function removeEdgeFromList(key: string) {
        edgeList = edgeList.filter((e) => e.key !== key);
        syncTextareaFromEdgeList();
        renderEdgeList();
        triggerRegeneration();
    }

    function editEdgeFromList(key: string) {
        const edge = edgeList.find((e) => e.key === key);
        if (!edge) return;
        const chip = edgeListEl.querySelector(
            `.edge-chip[data-edge-key="${key}"]`,
        );
        if (!chip) return;
        chip.classList.add("editing");
        chip.innerHTML = `
            <input type="text" class="edge-edit-input" value="${edge.source}" data-role="source" spellcheck="false" />
            <span class="edge-sep">\u2192</span>
            <input type="text" class="edge-edit-input" value="${edge.target}" data-role="target" spellcheck="false" />
        `;
        const sourceInput = chip.querySelector(
            'input[data-role="source"]',
        ) as HTMLInputElement;
        const targetInput = chip.querySelector(
            'input[data-role="target"]',
        ) as HTMLInputElement;
        sourceInput.focus();
        sourceInput.select();

        function save() {
            if (!edge) return;
            const newSource = sourceInput.value.trim();
            const newTarget = targetInput.value.trim();
            if (newSource && newTarget && newSource !== newTarget) {
                const newKey = edgeKey(newSource, newTarget);
                if (newKey !== key && edgeList.some((e) => e.key === newKey)) {
                    renderEdgeList();
                    return;
                }
                edge.source = newSource;
                edge.target = newTarget;
                edge.key = newKey;
            }
            syncTextareaFromEdgeList();
            renderEdgeList();
            triggerRegeneration();
        }

        sourceInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
                renderEdgeList();
            }
            if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                targetInput.focus();
                targetInput.select();
            }
        });
        targetInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
                renderEdgeList();
            }
            if (e.key === "Shift" && e.shiftKey) {
                e.preventDefault();
                sourceInput.focus();
                sourceInput.select();
            }
        });
        sourceInput.addEventListener("blur", save);
        targetInput.addEventListener("blur", save);
    }

    function renderEdgeList() {
        edgeListEl.innerHTML = "";
        for (const edge of edgeList) {
            const chip = document.createElement("div");
            chip.className = "edge-chip";
            chip.setAttribute("data-edge-key", edge.key);
            chip.innerHTML = `
                <span class="edge-label">${edge.source} \u2192 ${edge.target}</span>
                <button class="edge-edit-btn" title="Edit" data-action="edit">\u270E</button>
                <button class="edge-delete-btn" title="Delete" data-action="delete">\u00D7</button>
            `;
            edgeListEl.appendChild(chip);
        }
    }

    function syncTextareaFromEdgeList() {
        customEdgesTextarea.value = edgeList
            .map((e) => `${e.source}, ${e.target}`)
            .join("\n");
        updateParseBadge();
    }

    function syncEdgeListFromTextarea() {
        const res = parseCustomGraph(customEdgesTextarea.value, 0);
        edgeList = res.graph.links.map((link) => {
            const source = String(link.source);
            const target = String(link.target);
            return {key: edgeKey(source, target), source, target};
        });
        renderEdgeList();
    }

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
                    syncEdgeListFromTextarea();
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

    edgeListEl.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const chip = target.closest(".edge-chip") as HTMLElement | null;
        if (!chip) return;
        const key = chip.getAttribute("data-edge-key")!;
        if (target.closest('[data-action="delete"]')) {
            removeEdgeFromList(key);
        } else if (target.closest('[data-action="edit"]')) {
            editEdgeFromList(key);
        }
    });

    function handleAddEdge() {
        const raw = addEdgeInput.value.trim();
        if (!raw) return;
        const parts = raw.split(/\s*[\,;\->]\s*|\s+/).filter(Boolean);
        if (parts.length >= 2) {
            addEdgeToList(parts[0], parts[1]);
            addEdgeInput.value = "";
            addEdgeInput.focus();
        }
    }

    addEdgeBtn.addEventListener("click", handleAddEdge);
    addEdgeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddEdge();
        }
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

    // ── Graph option sync ──

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

    // Reset only graph settings (not theme/accent)
    resetBtn.addEventListener("click", () => {
        labelsToggle.checked = true;
        arrowsToggle.checked = false;
        orphansToggle.checked = true;
        nodeSizeSlider.value = "50";
        linkWidthSlider.value = "50";
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
    syncEdgeListFromTextarea();
    updateParseBadge();
    triggerRegeneration(true);
}
