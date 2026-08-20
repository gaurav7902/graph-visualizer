# Graph Lab

An interactive force-directed graph visualizer built with **Vite**, **TypeScript**, **PixiJS**, and **D3 Force**.

**Live Demo**: [thegorav.xyz/graph-visualizer](https://thegorav.xyz/graph-visualizer)

---

## Features

### Rendering

- High-performance Canvas 2D rendering via PixiJS
- Smooth pan, zoom, and node dragging with D3
- Organic breadth-first wave reveal animation

### Graph Generation

- **Preferential Attachment (Barabási–Albert)** — realistic hub-and-cluster networks
- **Random (Erdős–Rényi)** — uniform random graphs
- **Custom Input** — define your own edge list

### Controls

| Category         | Options                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| Display          | Labels, directional arrows, orphan nodes, node radius, edge thickness      |
| Force Simulation | Center gravity, repulsion, link stiffness, link distance, velocity damping |
| Theme            | Dark/light mode, customizable node and edge colors                         |

### Keyboard Shortcuts

| Key      | Action                 |
| -------- | ---------------------- |
| `F`      | Fit graph to view      |
| `Space`  | Re-run animation       |
| `A`      | Animate                |
| `/`      | Focus search           |
| `?`      | Show shortcuts overlay |
| `Escape` | Deselect node          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/gaurav7902/graph-visualizer.git
cd graph-visualizer
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173/graph-visualizer/`

### Production Build

```bash
npm run build
```

Outputs to `dist/` — ready for GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

---

## Project Structure

```
src/
├── components/     # React UI components (TopBar, SettingsPanel, etc.)
├── graph/          # PixiJS renderer + D3 force simulation
├── state/          # React state management hooks
├── styles/         # CSS tokens and globals
└── main.tsx        # App entry point
```

---

## Design System

Graph Lab uses a **two-accent color system** derived from the graph metaphor itself:

| Token    | Color              | Use                                    |
| -------- | ------------------ | -------------------------------------- |
| `--node` | `#12E0C4` (teal)   | Nodes, primary actions, highlights     |
| `--edge` | `#7C5CFC` (violet) | Edges, connections, secondary elements |

This makes the UI legible — teal = things you create, violet = relationships between them.

---

## Deployment

Automated via GitHub Actions on push to `master`. Workflow: `.github/workflows/deploy.yml`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[MIT](LICENSE) © Gaurav Patidar
