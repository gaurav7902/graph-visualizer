# Graph Visualizer — Design & Architecture Plan

Repo: gaurav7902/graph-visualizer · Live: thegorav.xyz/graph-visualizer
Stack today: Vite + TypeScript (vanilla) + PixiJS (Canvas 2D) + D3 Force, deployed to GitHub Pages via Actions.

---

## 0. TL;DR decisions

- **Keep the canvas engine vanilla TS.** Pixi + D3 force is imperative, performance-sensitive code. React buys nothing here and adds render-loop friction.
- **Introduce React (or Preact) as an isolated "island" for the Settings Panel only.** That panel (Input/Visual tabs, dynamic edge list, sliders, presets, force-simulation controls) is exactly the kind of nested, stateful UI that's painful to hand-wire in vanilla DOM and where React's data-binding earns its bundle cost.
- **Redesign the visual language around the graph metaphor itself**, not just re-skin the panel with nicer colors. Nodes/edges become a UI device, not only a canvas artifact.

---

## 1. Design direction (tokens)

### Why change the palette
Near-black background + one saturated accent (your current violet) is one of the two or three palettes every AI-assisted design converges to by default. It reads generic specifically *because* it isn't derived from your subject. Graph theory gives you a better source: two first-class visual entities (nodes, edges) with an inherent relationship. Use that duality as the actual design system, not just canvas colors.

### Color
| Token | Hex | Use |
|---|---|---|
| `--bg-void` | `#0A0B0F` | App background (slightly blue-black, not pure black) |
| `--surface` | `#14161C` | Panels, cards |
| `--surface-raised` | `#1C1F28` | Inputs, dropdowns, hover states |
| `--edge` | `#7C5CFC` | "Edge" accent — links, connecting lines, secondary actions |
| `--node` | `#12E0C4` | "Node" accent — primary actions, active states, highlights |
| `--ink-hi` | `#F4F5F7` | Primary text |
| `--ink-lo` | `#8A8F9C` | Secondary text / labels |
| `--danger` | `#FF6B6B` | Destructive (remove edge, reset) |

The node/edge two-accent system is the actual signature: **anything the user *creates* (a node, an add action, a primary CTA) uses the node teal; anything that *connects* (an edge row, a link between settings, a divider) uses the edge violet.** This makes the color choice legible rather than decorative — someone using the app long enough will absorb "teal = thing, violet = relationship" without being told.

### Type
- **UI / data (headers, counts, node/edge numbers, coordinates):** a monospace face — `JetBrains Mono` or `Fragment Mono`. Graphs are data structures; showing counts and IDs in mono signals "this is structured data," not just a label.
- **Body / interface copy (labels, descriptions, buttons):** `Inter` or `IBM Plex Sans` — quiet, functional, gets out of the way.
- Set a real type scale (e.g. 11 / 13 / 15 / 20 / 28px) instead of ad hoc sizes per component.

### Layout
- Canvas stays full-bleed, edge-to-edge — that's already correct, don't add a marketing hero above it. The graph *is* the hero.
- Settings panel: keep the floating top-right glass panel, but:
  - Section dividers rendered as a thin horizontal line with a small dot at each end (literally a 1-edge, 2-node graph) instead of a plain `<hr>`.
  - Tab indicator (Input/Visual) animates as a short line sliding between tabs — an "edge" connecting the two states.
  - Toggle switches recolored: on = node teal, off = neutral gray (not violet — reserve violet for structural/edge elements).

### Signature element
A single distinguishing detail, used once, not scattered: the **panel's own border is a faint animated pulse that travels the perimeter like a signal traversing an edge** — slow (6–8s loop), low opacity, pauses on `prefers-reduced-motion`. It's the one place you spend your "boldness budget." Don't also add particle backgrounds, gradient blobs, or glow-everything — pick this one moment and keep the rest disciplined.

---

## 2. Concrete UI changes

- [ ] Replace flat `#a855f7`-style single accent with the node/edge two-token system above.
- [ ] Swap panel headers/counts to the mono face; keep labels in the sans face.
- [ ] Restyle dividers as node-dot-terminated lines (see signature element).
- [ ] Recolor toggles: teal = on, not violet.
- [ ] Add the perimeter-pulse to the settings panel border (CSS `@property` + conic-gradient mask, or a lightweight SVG rect with `stroke-dashoffset` animation). Respect `prefers-reduced-motion: reduce`.
- [ ] Empty/edge-case states: if a user sets Min Node Count with no edges, don't just show a blank canvas — show a one-line prompt in the canvas voice ("No edges yet — add one below or try a preset") rather than nothing.
- [ ] Favicon + OG image: generate from an actual rendered mini-graph (3–4 nodes, teal/violet), not a generic icon — this becomes your GitHub social preview and browser tab identity.
- [ ] Add visible keyboard focus rings using `--node` color on all interactive elements (currently likely relying on browser default or none — check).
- [ ] Verify contrast: `--ink-lo` (#8A8F9C) on `--surface` (#14161C) — should clear WCAG AA for normal text; test if using anything smaller than 13px.

---

## 3. Should you adopt React? — Decision matrix

| Factor | Vanilla TS (current) | React/Preact island |
|---|---|---|
| Canvas/Pixi rendering | ✅ Correct fit — imperative, per-frame | ❌ Wrong fit, don't touch this layer |
| Settings panel (tabs, dynamic edge list, sliders, presets) | ⚠️ Works but state↔DOM sync is manual and grows brittle as you add features | ✅ This is React's actual sweet spot |
| Bundle size sensitivity | N/A | Preact ~3–4kb gzip vs React ~40kb — for a dev tool on GitHub Pages, either is fine; Preact if you care |
| Team/future maintenance | Fine solo, harder to onboard others into ad hoc DOM code | Easier for others to extend a typed component tree |

**Recommendation: adopt it, scoped, not a rewrite.**

1. Add `@preact/preset-vite` (or `@vitejs/plugin-react` if you'd rather stay React-proper for ecosystem/tooling reasons) alongside your existing Vite config — it doesn't touch the rest of the build.
2. Extract the Settings Panel markup into a mounted component tree: `<GraphSettings />` with children `<InputTab />`, `<VisualTab />`, `<EdgeList />`, `<ForceSimulationControls />`, `<Presets />`.
3. Define a tiny typed contract between the panel and the engine — don't let React reach into Pixi/D3 directly:
   ```ts
   // engine/bus.ts
   type GraphEvent =
     | { type: 'edges:set'; edges: [number, number][] }
     | { type: 'nodeCount:set'; count: number }
     | { type: 'display:toggle'; key: 'labels' | 'arrows' | 'orphans'; value: boolean }
     | { type: 'force:update'; params: Partial<ForceParams> }
     | { type: 'preset:load'; name: 'sample' | 'star' | 'cycle' | 'mesh' };

   export const graphBus = new EventTarget(); // or a minimal pub-sub
   ```
   The engine subscribes and mutates its own state; React only ever dispatches events and renders whatever state you feed back to it (edge count, node count, validation errors). Neither side imports the other's internals.
4. Mount point: a single `<div id="settings-root">` in `index.html`, `createRoot(...).render(<GraphSettings />)` in a new `src/ui/main.tsx`, imported once from your existing `main.ts`.
5. Keep the canvas/engine module (`src/engine/*` or wherever your Pixi + D3 code lives) completely untouched — no framework import there, ever.

If you'd rather not add a framework at all: the same event-bus pattern works with vanilla TS too, and is worth doing regardless — it's really the state-management pattern, not React, that fixes the brittleness. Reach for React/Preact only once the panel grows past what a single `bindPanel(state)` function comfortably handles (dynamic edge list + presets + force sliders is arguably already past that line).

---

## 4. Suggested phase order

1. **Design tokens pass (CSS only, no framework change).** Swap the palette/type variables, restyle dividers/toggles, add the perimeter pulse. Ship this first — it's low-risk and immediately visible.
2. **Extract Settings Panel to Preact/React island**, wired through the event bus described above. Leave the canvas engine alone.
3. **Polish pass:** favicon/OG image, empty states, focus rings, reduced-motion checks, mobile layout (panel likely needs to become a bottom sheet or full-screen overlay below ~640px — check current behavior, screenshots suggest desktop-only right now).
4. **README/meta:** update screenshots to match new look, add a GitHub social preview image, confirm `deploy.yml` still builds cleanly with the added Preact/React dependency.

---

## 5. What to explicitly *not* do

- Don't add a marketing-style hero section above the canvas — this is a tool, not a landing page; the canvas is the hero.
- Don't rewrite the Pixi/D3 rendering layer in React — no `react-pixi` wrapper, no per-frame reconciliation.
- Don't stack multiple animated effects (glow + particles + gradient shift + pulse) — the perimeter pulse is the one signature moment; everything else stays still.
- Don't reach for the numbered-badge (01/02/03) treatment for settings sections unless there's a genuine sequence — Input → Visual isn't a sequence, it's a mode switch, so keep it as tabs, not numbered steps.
