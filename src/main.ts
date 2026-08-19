import {createGraphRenderer} from "./graph/renderer";
import {setupUI} from "./ui/controls";
import type {GraphNode} from "./graph/types";

const graphHost = document.querySelector<HTMLElement>("#graph")!;
const infoCard = document.querySelector<HTMLElement>("#nodeInfoCard")!;
const infoTitle = document.querySelector<HTMLElement>("#infoNodeTitle")!;
const infoDetails = document.querySelector<HTMLElement>("#infoNodeDetails")!;
const closeInfoCard =
    document.querySelector<HTMLButtonElement>("#closeInfoCard")!;

const renderer = createGraphRenderer({}, (node: GraphNode | null) => {
    if (node) {
        infoTitle.textContent = node.label;
        infoDetails.textContent = `ID: ${node.id}`;
        infoCard.classList.remove("hidden");
    } else {
        infoCard.classList.add("hidden");
    }
});

closeInfoCard.addEventListener("click", () => {
    infoCard.classList.add("hidden");
});

renderer.mount(graphHost);
setupUI(renderer);
