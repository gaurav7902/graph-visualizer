# Graph Visualizer --- UI Redesign & React Migration Plan

## 1. Current assessment

The current project is already a solid technical base:

-   Vite + TypeScript
-   PixiJS for Canvas rendering
-   D3 Force for graph simulation
-   Custom graph rendering rather than a DOM/SVG graph
-   GitHub Pages-compatible static deployment
-   Separate graph and UI code
-   Existing input, generator, visual settings, force simulation,
    presets, animation, theme, and node information functionality

The current repository has `src/graph`, `src/ui`, `main.ts`, and a
global `style.css`. The UI logic is concentrated in a large
`src/ui/controls.ts`, while the actual graph rendering should remain
independent from the UI layer.

The screenshots show a functional UI, but it currently feels more like a
developer/debug panel than a polished graph-analysis application.

### Main problems to solve

1.  The graph canvas has too much unused empty space.
2.  The settings panel is visually heavy and occupies a large fixed
    area.
3.  Input, generator, and visual configuration are mixed into one
    modal/panel.
4.  The top toolbar has useful actions but weak hierarchy.
5.  The graph itself does not feel like the primary product surface.
6.  Controls use a lot of vertical space for relatively small amounts of
    information.
7.  There is no strong visual distinction between:
    -   editing the graph
    -   generating a graph
    -   inspecting a graph
    -   controlling the simulation
8.  The UI is currently DOM-driven and concentrated in a \~600-line
    controls module, which will become harder to maintain as features
    grow.

------------------------------------------------------------------------

# 2. Recommended visual direction

## Design concept: "Graph Lab"

Do not redesign this as a generic SaaS dashboard.

The application should feel like a specialized **graph-analysis
workspace**.

Think:

-   dark canvas
-   subtle grid
-   graph is the hero
-   compact floating controls
-   glass/solid dark panels
-   purple as the accent
-   restrained animations
-   information-dense but not cramped
-   keyboard-first interactions
-   minimal permanent chrome

The graph should visually dominate the screen.

### Overall hierarchy

``` text
┌──────────────────────────────────────────────────────────────────┐
│ Graph Lab   [6 nodes · 5 edges]       Fit  Play  Theme  Settings│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                         GRAPH CANVAS                             │
│                                                                  │
│               ○──────○                                           │
│              /      / \                                          │
│             ○──────○   ○                                         │
│                                                                  │
│                                                                  │
│                                                ┌───────────────┐ │
│                                                │ Graph         │ │
│                                                │ Controls      │ │
│                                                │               │ │
│                                                │ ...           │ │
│                                                └───────────────┘ │
│                                                                  │
│  [ + Node ] [ + Edge ]     Scroll to zoom · Drag to move        │
└──────────────────────────────────────────────────────────────────┘
```

The graph should feel like a workspace rather than a page containing a
graph.

------------------------------------------------------------------------

# 3. Color system

Keep the current dark/purple identity, but make it more deliberate.

## Background

Use three dark surfaces:

``` text
Canvas       #0b0b0f
Surface      #121217
Elevated     #18181f
Border       rgba(255,255,255,0.09)
```

Do not use pure black everywhere.

## Text

``` text
Primary      #f4f4f5
Secondary    #a1a1aa
Muted        #71717a
```

## Accent

Keep purple as the main brand color.

Suggested:

``` text
Accent       #a855f7
Accent hover #c026ff
Accent soft  rgba(168,85,247,0.14)
```

Use the accent primarily for:

-   active tabs
-   primary buttons
-   selected nodes
-   focus states
-   important indicators

Do not make every control purple.

## Semantic colors

Reserve colors for meaning:

``` text
Success      green
Warning      amber
Error        red
Info         blue
```

For example:

-   `6 nodes · 5 edges` → green status indicator
-   invalid edge input → red
-   simulation running → purple/blue animated indicator

------------------------------------------------------------------------

# 4. Typography

Use a modern UI font.

Recommended:

-   Inter
-   Geist
-   system-ui fallback

Graph labels can remain slightly smaller than UI text.

Suggested hierarchy:

``` text
App title       14–16px / 600
Panel title     14–15px / 600
Section title   11–12px / 600 / uppercase
Body            13–14px
Helper text     11–12px
Graph labels    11–13px
```

Avoid excessive bold text.

------------------------------------------------------------------------

# 5. Layout redesign

## Desktop

Use:

``` text
Canvas: 100%
Topbar: floating
Right panel: floating
Bottom hint/status bar: floating
```

Do NOT make the right settings panel a permanent full-height sidebar.

Instead:

``` text
width: 360px
max-height: calc(100vh - 100px)
border-radius: 16px
```

It should float over the canvas.

The graph should remain visible behind it.

## Mobile

Use a bottom sheet instead of a right panel.

``` text
Canvas
   ↓
Bottom toolbar
   ↓
Expandable settings sheet
```

The graph should never become unusably small because controls consume
the entire screen.

------------------------------------------------------------------------

# 6. Top bar redesign

Current top controls:

``` text
Fit
Animate
Theme
Graph
```

Keep the idea, but improve hierarchy.

Recommended:

``` text
┌──────────────────────────────────────────────────────────────┐
│ ✣ Graph Lab     ● 6 nodes · 5 edges            Fit  ▶  ⚙    │
└──────────────────────────────────────────────────────────────┘
```

### Left

Brand:

``` text
✣ Graph Lab
```

Optional subtitle:

``` text
Interactive Graph Visualizer
```

Do not make the brand huge.

### Center

Graph status:

``` text
● 6 nodes · 5 edges
```

When simulation is running:

``` text
◉ Simulation running
```

### Right

Actions:

-   Fit
-   Animate
-   Theme
-   Settings

Use icons + tooltips rather than large text-heavy buttons.

Suggested icons:

-   Fit → maximize/scan icon
-   Animate → play icon
-   Theme → palette/sun icon
-   Settings → sliders icon

------------------------------------------------------------------------

# 7. Graph canvas

This is the most important part.

## Add a subtle graph-paper grid

Use a very low-opacity grid:

``` text
linear-gradient(...)
```

The grid should be almost invisible.

It gives the canvas a spatial/technical feeling without distracting from
the graph.

## Add a soft radial glow

Place a subtle purple radial gradient behind the graph.

Do not make it look like a neon gaming website.

Something like:

``` text
radial-gradient(
  circle at 50% 45%,
  rgba(168, 85, 247, 0.055),
  transparent 45%
)
```

## Improve nodes

Current nodes are too visually plain.

Recommended node appearance:

``` text
normal:
  fill: #18181f
  border: #71717a
  radius: 7–10px

hover:
  border: accent
  subtle glow

selected:
  border: accent
  outer ring
  subtle glow
```

For larger nodes, use a very subtle radial highlight.

## Improve edges

Normal:

``` text
rgba(255,255,255,0.22)
```

Hover:

``` text
rgba(168,85,247,0.7)
```

Selected:

``` text
accent
```

Directional arrows should be visible only when the user enables them.

------------------------------------------------------------------------

# 8. Graph interactions

Make the graph itself interactive rather than forcing users to do
everything through the settings panel.

Recommended interactions:

### Node

-   click → select
-   double click → edit label
-   drag → reposition
-   right click → context menu

Context menu:

``` text
Edit node
Add edge
Duplicate
Delete
Focus
```

### Edge

-   click → select
-   double click → edit
-   right click → context menu

``` text
Edit edge
Reverse direction
Delete
```

### Canvas

Right click:

``` text
Add node
Paste graph
Reset view
```

------------------------------------------------------------------------

# 9. Floating quick-action toolbar

Add a compact floating toolbar near the bottom-left.

``` text
┌─────────────────────────────┐
│ ＋ Node   ⤢ Edge   ⌕ Search │
└─────────────────────────────┘
```

Possible actions:

-   Add node
-   Add edge
-   Search
-   Fit
-   Reset

This makes the application feel much more interactive.

------------------------------------------------------------------------

# 10. Settings architecture

The current settings panel should be split conceptually into three
modes:

``` text
INPUT
GENERATOR
VIEW
```

Current:

``` text
Input
  Custom Input | Generator

Visual
  Display
  Appearance
  Force Simulation
```

Recommended:

``` text
Graph
  Custom Input
  Generator

View
  Display
  Appearance

Simulation
  Force Simulation
```

This separation will become much cleaner in React.

------------------------------------------------------------------------

# 11. Custom Input redesign

Current edge list is functional but visually dense.

Instead of:

``` text
1 → 2   ✎ ×
2 → 3   ✎ ×
3 → 4   ✎ ×
```

Use a compact table-like structure:

``` text
EDGES

From       To       Actions
────────────────────────────
  1         2       ···
  2         3       ···
  3         4       ···
  4         1       ···

[ From ] → [ To ]   + Add
```

For weighted graphs:

``` text
[ 1 ] → [ 2 ]   [ 5 ]
```

Support keyboard entry:

``` text
1, 2
```

and:

``` text
1 → 2
```

Optionally support:

``` text
1 → 2 : 5
```

------------------------------------------------------------------------

# 12. Generator redesign

The generator should feel like a generator rather than another form.

Recommended:

``` text
GENERATOR

Graph type

[ Random            ▼ ]

Nodes
[──────●──────────] 80

Edges
[──────●──────────] 120

                    [ Generate ]
```

Graph types:

-   Random
-   Cycle
-   Star
-   Mesh
-   Tree
-   Complete
-   Preferential Attachment
-   Custom

Show a tiny preview when useful.

Example:

``` text
      ○
    / | \
   ○  ○  ○
```

This makes presets much easier to understand.

------------------------------------------------------------------------

# 13. Visual settings

Do not show every option immediately.

Use collapsible groups:

``` text
DISPLAY
  Search nodes
  Show labels
  Direction arrows
  Show orphans

APPEARANCE
  Node radius
  Edge thickness
  Node opacity

SIMULATION
  Repulsion
  Link distance
  Center gravity
  Link strength
  Damping
```

Default the simulation section to collapsed.

Most users should not need to touch force parameters.

------------------------------------------------------------------------

# 14. Add a node inspector

The existing node information card is a good foundation.

Expand it into a proper inspector:

``` text
NODE

3

Label
Node 3

Connections
5

Degree
4

Incoming
2

Outgoing
2

[ Focus Node ]
```

For selected edges:

``` text
EDGE

3 → 4

Source
3

Target
4

Weight
5

Directed
Yes
```

The inspector should appear only when something is selected.

------------------------------------------------------------------------

# 15. Search

The current visual filter is useful.

Upgrade it into a global graph search:

``` text
⌕ Search nodes...
```

Keyboard shortcut:

``` text
/
```

Results:

``` text
3 results

Node 1
Node 10
Node 13
```

Selecting a result should:

1.  focus the node
2.  select it
3.  temporarily highlight its neighborhood

------------------------------------------------------------------------

# 16. Keyboard shortcuts

This application is particularly suitable for keyboard controls.

Add:

``` text
Space       Start/stop simulation
F           Fit graph
A           Animate
N           Add node
E           Add edge
/           Search
Delete      Delete selected
Escape      Clear selection
?           Show shortcuts
```

Show a shortcut overlay when `?` is pressed.

------------------------------------------------------------------------

# 17. Animation redesign

The current Animate action should become a polished graph reveal.

Recommended animation:

``` text
Node 1 appears
   ↓
neighboring edges appear
   ↓
Node 2 appears
   ↓
Node 3 appears
   ↓
...
```

Use the graph topology to determine reveal order.

Add controls:

``` text
Animation speed
[ Slow ───●── Fast ]

[ Replay ]
```

Avoid excessive bouncing.

The animation should feel like an algorithm visualization, not a UI
transition.

------------------------------------------------------------------------

# 18. Theme system

Instead of only changing the theme visually, define theme tokens.

``` ts
type Theme =
  | "midnight"
  | "light"
  | "amoled"
  | "purple"
  | "blue";
```

At minimum:

### Midnight

Default dark theme.

### Light

White/gray canvas with dark graph elements.

### AMOLED

Pure black canvas with high-contrast elements.

Keep the graph renderer independent from CSS theme implementation.

The renderer should receive colors from a theme object.

------------------------------------------------------------------------

# 19. Empty state

If there is no graph, don't leave an empty canvas.

Show:

``` text
          ✣

      Build a graph

Create a graph manually or generate
one to start exploring.

[ Create Graph ]   [ Generate ]
```

Under it:

``` text
Tip: Press N to add a node
```

This immediately explains what the application does.

------------------------------------------------------------------------

# 20. Loading / rendering state

When generating a large graph:

``` text
Generating graph...

80 nodes · 120 edges
```

Do not freeze the entire interface visually.

The UI should remain responsive.

------------------------------------------------------------------------

# 21. Large graph mode

The generator currently allows graphs such as:

``` text
80 nodes
120 edges
```

The design should account for this.

For large graphs:

-   reduce label density
-   hide labels automatically above a threshold
-   use lower edge opacity
-   use level-of-detail rendering
-   avoid expensive DOM overlays
-   keep the actual graph in PixiJS

A good rule:

``` text
< 100 nodes   normal labels
100–300       optional labels
300+          labels off by default
```

------------------------------------------------------------------------

# 22. React decision

## Recommendation: Yes, migrate to React.

Not because React will make the graph renderer faster.

It will not.

Your graph is rendered by PixiJS, so React should NOT replace PixiJS.

Use React for the application UI.

The architecture should become:

``` text
React
 │
 ├── TopBar
 ├── SettingsPanel
 │    ├── InputPanel
 │    ├── GeneratorPanel
 │    ├── ViewPanel
 │    └── SimulationPanel
 │
 ├── NodeInspector
 ├── Search
 ├── QuickActions
 └── ShortcutsOverlay
        │
        ▼
   GraphController
        │
        ▼
   PixiJS + D3 Force
```

This is the important distinction:

**React owns the interface.**

**PixiJS owns the graph canvas.**

**D3 owns the force simulation.**

------------------------------------------------------------------------

# 23. Why React makes sense here

Your current `controls.ts` is already around 600 lines.

That is the strongest reason to migrate.

You currently have a lot of UI state:

-   active tabs
-   input mode
-   generator mode
-   node count
-   edge count
-   edge list
-   search
-   labels
-   arrows
-   orphan visibility
-   node radius
-   edge thickness
-   force settings
-   animation state
-   theme
-   selected node
-   selected edge
-   panel visibility

React is particularly good at representing this type of state-driven UI.

Instead of manually doing:

``` ts
element.classList.add(...)
element.classList.remove(...)
element.textContent = ...
element.style...
```

you get declarative rendering:

``` tsx
{showLabels && <Toggle ... />}
```

and:

``` tsx
<Slider
  value={settings.nodeRadius}
  onChange={setNodeRadius}
/>
```

This will make the UI significantly easier to extend.

------------------------------------------------------------------------

# 24. What React should NOT do

Do not turn the graph into hundreds/thousands of React components.

Avoid:

``` text
React
 ├── Node
 ├── Node
 ├── Node
 ├── Node
 ├── Edge
 ├── Edge
 └── ...
```

That defeats the reason you're using PixiJS.

Keep:

``` text
React
  └── <GraphCanvas />

GraphCanvas
  └── existing PixiJS renderer
```

React should simply provide the canvas container and communicate with
the renderer.

------------------------------------------------------------------------

# 25. React migration strategy

Do not rewrite everything at once.

## Phase 1 --- Stabilize current architecture

Before migrating:

-   isolate graph data types
-   isolate renderer state
-   isolate graph operations
-   remove UI-specific logic from graph code
-   make the renderer expose a clean API

Target:

``` ts
renderer.setGraph(graph)
renderer.setTheme(theme)
renderer.fit()
renderer.animate()
renderer.selectNode(id)
renderer.focusNode(id)
```

------------------------------------------------------------------------

## Phase 2 --- Create React app shell

Keep the existing Vite setup.

Install:

``` bash
npm install react react-dom
npm install -D @types/react @types/react-dom
```

Then create:

``` text
src/
├── app/
│   ├── App.tsx
│   └── app.css
│
├── components/
│   ├── TopBar/
│   ├── SettingsPanel/
│   ├── NodeInspector/
│   ├── Search/
│   ├── QuickActions/
│   └── Shortcuts/
│
├── graph/
│   ├── renderer.ts
│   ├── types.ts
│   ├── simulation.ts
│   └── graph-utils.ts
│
├── state/
│   ├── graph-state.ts
│   └── ui-state.ts
│
├── main.tsx
└── styles/
    ├── tokens.css
    ├── globals.css
    └── components.css
```

Do not immediately introduce Redux.

------------------------------------------------------------------------

# 26. State architecture

Start with React state/context.

Suggested model:

``` ts
interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ViewSettings {
  showLabels: boolean;
  showArrows: boolean;
  showOrphans: boolean;
  nodeRadius: number;
  edgeThickness: number;
}

interface SimulationSettings {
  repulsion: number;
  linkDistance: number;
  centerGravity: number;
  linkStrength: number;
  damping: number;
}
```

Then:

``` text
App
 ├── graph state
 ├── UI state
 ├── view settings
 └── simulation settings
```

Only introduce Zustand if this starts becoming cumbersome.

For this application, Redux would probably be unnecessary overhead.

------------------------------------------------------------------------

# 27. Graph renderer bridge

Create a React component:

``` tsx
<GraphCanvas
  graph={graph}
  theme={theme}
  onNodeSelect={setSelectedNode}
/>
```

Inside:

``` text
GraphCanvas
   ↓
useEffect()
   ↓
create Pixi renderer
   ↓
mount into div
   ↓
update renderer when graph/settings change
```

The Pixi renderer should be created once.

Do not recreate it on every React render.

------------------------------------------------------------------------

# 28. Recommended component tree

``` text
<App>

  <AppShell>

    <TopBar />

    <GraphWorkspace>

      <GraphCanvas />

      <QuickActions />

      <NodeInspector />

      <SettingsPanel />

      <GraphStatus />

    </GraphWorkspace>

    <ShortcutOverlay />

  </AppShell>

</App>
```

Settings:

``` text
<SettingsPanel>

  <PanelTabs />

  <GraphSettings>
    <CustomInput />
    <Generator />
  </GraphSettings>

  <ViewSettings>
    <DisplaySettings />
    <AppearanceSettings />
  </ViewSettings>

  <SimulationSettings />

</SettingsPanel>
```

------------------------------------------------------------------------

# 29. Icon library

Use an icon library rather than manually drawing SVG icons.

Recommended:

``` bash
npm install lucide-react
```

Use icons for:

-   settings
-   play
-   pause
-   maximize
-   search
-   plus
-   trash
-   edit
-   eye
-   palette
-   keyboard
-   rotate
-   focus

Keep icon sizes consistent:

``` text
14px → compact controls
16px → standard controls
18px → primary actions
```

------------------------------------------------------------------------

# 30. UI component rules

Create a small internal design system.

Components:

``` text
Button
IconButton
Toggle
Slider
Input
Select
Tabs
Panel
Section
Badge
Tooltip
Dialog
CommandMenu
```

Do not install a giant UI framework unless you actually need it.

The application has a highly specific visual style, so custom CSS
components will likely be cleaner.

------------------------------------------------------------------------

# 31. Animations

Use animations sparingly.

Good:

-   panel open/close
-   button hover
-   selected node glow
-   graph reveal
-   search focus
-   status indicator

Avoid:

-   constant background animations
-   excessive blur
-   bouncing controls
-   animated gradients everywhere

Recommended transition:

``` css
transition:
  background-color 150ms ease,
  border-color 150ms ease,
  opacity 150ms ease,
  transform 150ms ease;
```

------------------------------------------------------------------------

# 32. Responsive behavior

Breakpoints:

``` text
>= 1100px
Desktop workspace

700–1099px
Compact desktop/tablet

< 700px
Mobile bottom sheet
```

At mobile widths:

-   hide secondary labels from toolbar
-   use icon buttons
-   settings become bottom sheet
-   inspector becomes bottom sheet
-   graph remains the largest element

------------------------------------------------------------------------

# 33. Accessibility

Add:

-   keyboard navigation
-   visible focus states
-   aria-labels for icon-only buttons
-   sufficient contrast
-   reduced-motion support
-   tooltips for unfamiliar icons

Support:

``` css
@media (prefers-reduced-motion: reduce) {
  /* disable non-essential animation */
}
```

------------------------------------------------------------------------

# 34. Performance rules

Do not sacrifice the current rendering architecture.

Keep:

``` text
PixiJS → graph rendering
D3 → force simulation
React → UI
```

For large graphs:

-   batch Pixi updates
-   avoid unnecessary React renders
-   don't store renderer objects in React state
-   use refs for imperative objects
-   debounce search/filtering when needed
-   don't recreate D3 simulation unnecessarily

------------------------------------------------------------------------

# 35. Feature roadmap

## V1 --- Visual redesign

-   [ ] New dark Graph Lab theme
-   [ ] Graph-paper canvas
-   [ ] Floating top bar
-   [ ] Floating settings panel
-   [ ] Better node/edge styling
-   [ ] Quick-action toolbar
-   [ ] Better empty state
-   [ ] Better node inspector
-   [ ] Responsive mobile layout

## V2 --- React migration

-   [ ] React + TypeScript setup
-   [ ] App shell
-   [ ] Componentized settings
-   [ ] React state model
-   [ ] PixiJS React bridge
-   [ ] Theme system
-   [ ] Keyboard shortcuts

## V3 --- Graph interaction

-   [ ] Double-click node editing
-   [ ] Context menus
-   [ ] Add node interactively
-   [ ] Add edge interactively
-   [ ] Edge editing
-   [ ] Node inspector
-   [ ] Search/focus
-   [ ] Multi-selection

## V4 --- Algorithm visualization

Add algorithms such as:

-   [ ] BFS
-   [ ] DFS
-   [ ] Dijkstra
-   [ ] Bellman-Ford
-   [ ] Floyd-Warshall
-   [ ] Topological Sort
-   [ ] Cycle Detection
-   [ ] Connected Components
-   [ ] Prim
-   [ ] Kruskal

Each algorithm should expose an animation sequence rather than simply
returning a result.

Example:

``` text
BFS

Step 1
Start: A

Step 2
Visit: B, C

Step 3
Visit: D, E
```

The graph should animate each step.

------------------------------------------------------------------------

# 36. Algorithm mode

Eventually add a dedicated mode:

``` text
Graph
Algorithm
```

Example:

``` text
┌──────────────────────────┐
│ Algorithm                │
│                          │
│ BFS                  ▼   │
│                          │
│ Start Node           A   │
│                          │
│ Speed              ●───  │
│                          │
│ [ Run Algorithm ]        │
└──────────────────────────┘
```

When running:

``` text
BFS
Step 4 / 12

Current
C

Queue
D → E → F
```

This would turn the project from a graph viewer into a real **graph
algorithms learning tool**.

------------------------------------------------------------------------

# 37. Import/export

Add:

``` text
Export
 ├── JSON
 ├── CSV
 └── PNG

Import
 ├── JSON
 └── CSV
```

Example JSON:

``` json
{
  "nodes": [
    { "id": "1", "label": "A" },
    { "id": "2", "label": "B" }
  ],
  "edges": [
    { "source": "1", "target": "2" }
  ]
}
```

This is especially useful for a static GitHub Pages application because
everything can remain client-side.

------------------------------------------------------------------------

# 38. Persistence

Use localStorage for:

-   last graph
-   theme
-   visual settings
-   simulation settings
-   panel state

Optional:

``` text
Autosave
● On
```

Add:

``` text
Reset workspace
```

------------------------------------------------------------------------

# 39. Suggested final UI

The final desktop experience should roughly look like:

``` text
┌──────────────────────────────────────────────────────────────────────┐
│ ✣ Graph Lab     ● 24 nodes · 31 edges            Fit  ▶  ◐  ⚙       │
│                                                                      │
│                                                                      │
│                                                                      │
│                    ○────────○                                       │
│                   / \       │                                       │
│                  ○   ○──────○                                      │
│                   \          \                                      │
│                    ○──────────○                                    │
│                                                                      │
│                                                                      │
│  ┌──────────────────────┐                         ┌───────────────┐ │
│  │ ＋ Node  ⤢ Edge  ⌕   │                         │ Graph         │ │
│  └──────────────────────┘                         │               │ │
│                                                   │ Input View    │ │
│                                                   │               │ │
│                                                   │ Custom Input  │ │
│                                                   │               │ │
│                                                   │ Edges         │ │
│                                                   │ 1 → 2         │ │
│                                                   │ 2 → 3         │ │
│                                                   │ ...           │ │
│                                                   │               │ │
│                                                   │ [ Render ]    │ │
│                                                   └───────────────┘ │
│                                                                      │
│                 Drag nodes · Scroll to zoom · F to fit              │
└──────────────────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 40. Recommended implementation order

Do not start by installing React.

Follow this order:

### Step 1

Refactor graph code so it has a clean public API.

### Step 2

Redesign the CSS and layout while keeping the current TypeScript UI.

This lets you establish the visual direction without introducing two
problems simultaneously.

### Step 3

Introduce React.

### Step 4

Move the top bar into React.

### Step 5

Move the settings panel.

### Step 6

Move the node inspector.

### Step 7

Move search and quick actions.

### Step 8

Remove the old DOM-based UI code.

### Step 9

Add keyboard shortcuts.

### Step 10

Add algorithm visualization.

------------------------------------------------------------------------

# 41. React migration command

From the existing project:

``` bash
npm install react react-dom lucide-react
npm install -D @types/react @types/react-dom
```

Keep:

``` text
Vite
TypeScript
PixiJS
D3
```

Do not replace the existing graph renderer.

------------------------------------------------------------------------

# 42. Things NOT to add

Avoid:

-   Tailwind solely because it is popular
-   Redux from day one
-   a giant component library
-   replacing PixiJS with DOM nodes
-   replacing Canvas with SVG for large graphs
-   backend/API infrastructure
-   authentication
-   unnecessary routing
-   excessive gradients
-   excessive glassmorphism
-   permanent sidebars
-   dozens of visible controls

This is a focused visualization tool, not a dashboard.

------------------------------------------------------------------------

# 43. Final recommendation

## Keep

``` text
Vite
TypeScript
PixiJS
D3 Force
GitHub Pages
```

## Add

``` text
React
react-dom
lucide-react
```

## Architecture

``` text
                 React
                   │
        ┌──────────┼───────────┐
        │          │           │
      UI        State       Commands
        │          │           │
        └──────────┼───────────┘
                   │
             Graph Controller
                   │
          ┌────────┴────────┐
          │                 │
       PixiJS           D3 Force
       Renderer         Simulation
          │                 │
          └────────┬────────┘
                   │
              Graph Canvas
```

The key idea is:

> **React should replace your UI architecture, not your graph rendering
> architecture.**

Your current screenshots already show the beginnings of a good visual
identity. The biggest improvement is not "make it prettier"; it is to
make the **graph the product**, with the controls becoming compact tools
around it.

If this were my project, I would first build the **Graph Lab visual
redesign**, then migrate the UI to React, and finally turn it into a
graph-algorithms visualization/learning tool. That gives the project a
much stronger identity than simply being another force-directed graph
demo.
