# Force Graph Visualizer

A standalone, interactive force-directed graph visualizer built with **Vite**, **TypeScript**, **PixiJS (Canvas 2D)**, and **D3 Force**.

## Features

- **High Performance Canvas Rendering**: Fast node & link rendering powered by PixiJS Canvas 2D.
- **Organic Graph Generators**:
    - **Preferential Attachment (Barabási–Albert)**: Generates realistic hub-and-cluster network topology.
    - **Random (Erdős–Rényi)**: Generates random node network graphs.
- **Interactive Controls**:
    - Node count & Edge count sliders (auto-clamped to valid simple graph ranges).
    - Search filter to highlight matching nodes.
    - Toggles for node labels, directional arrows, and orphan node visibility.
    - Full force simulation sliders: Repulsion, Link distance, Center gravity, Link strength, and Damping.
- **Pan, Zoom & Drag**: Smooth D3 zoom and interactive node dragging.
- **Reveal Animation**: Organic breadth-first wave reveal animation.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/graph-visualizer/graph-visualizer.github.io.git
cd graph-visualizer.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
```

Outputs static files into `dist/` ready for hosting on GitHub Pages, Vercel, Netlify, or Cloudflare Pages.

## Deployment

Automated via GitHub Actions workflow (`.github/workflows/deploy.yml`) on push to `master`.

## License

[MIT](LICENSE) © Gaurav Patidar
