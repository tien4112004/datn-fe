# Layout System Enhancement Plan

## Executive Summary

This document outlines the plan to extend the mindmap layout system from 2 layouts to 5 layouts, with a focus on **relative position preservation** — ensuring user intent expressed through dragging is respected when auto-layout runs.

---

## Selected Layout Types

### Current Layouts (Category 1: Two Handles)
1. **Horizontal Balanced** — Children extend left and right from parent
2. **Vertical Balanced** — Children extend up and down from parent

### New Layouts

#### Category 1: Two Handles (Adding 1)
3. **Right-Only Tree** — All children extend to the right of parent (classic tree view)

#### Category 2: More Than Two Handles (Adding 2)
4. **Org Chart** — Children positioned below parent, centered horizontally
5. **Radial** — Children positioned in a circle around the parent

---

## Layout Comparison

| Layout | Handles Used | Sibling Arrangement | Order Axis | Difficulty |
|--------|--------------|---------------------|------------|------------|
| Horizontal Balanced | Left, Right | Vertical stack | Y coordinate | ✅ Exists |
| Vertical Balanced | Top, Bottom | Horizontal row | X coordinate | ✅ Exists |
| Right-Only Tree | Right only | Vertical stack | Y coordinate | Easy |
| Org Chart | Bottom (source), Top (target) | Horizontal row | X coordinate | Medium |
| Radial | All 4 directions | Circular | Angle | Medium |

---

## Phase 1: Data Model Foundation

### 1.1 Extend Node Data

Add `siblingOrder` to `BaseNodeData`. This number determines where a node appears among its siblings.

**Location:** `container/src/features/mindmap/types/mindmap.ts`

```
BaseNodeData {
  ...existing fields...
  siblingOrder?: number;  // Lower = earlier in layout order
}
```

**Rules:**
- When creating a node via "Add Child" button: assign `max(sibling orders) + 1`
- When creating via drag-drop: infer from drop position
- When loading legacy data without `siblingOrder`: assign based on array index

### 1.2 Extend Layout Type Constants

Add new layout types to constants.

**Location:** `container/src/features/mindmap/types/constants.ts`

```
LAYOUT_TYPE = {
  HORIZONTAL_BALANCED: 'horizontal-balanced',  // Current HORIZONTAL
  VERTICAL_BALANCED: 'vertical-balanced',      // Current VERTICAL  
  RIGHT_ONLY: 'right-only',                    // New
  ORG_CHART: 'org-chart',                      // New
  RADIAL: 'radial',                            // New
  NONE: '',
}
```

**Migration:** Map existing `DIRECTION.HORIZONTAL` → `LAYOUT_TYPE.HORIZONTAL_BALANCED` and `DIRECTION.VERTICAL` → `LAYOUT_TYPE.VERTICAL_BALANCED`.

---

## Phase 2: Layout Strategy Architecture

### 2.1 Strategy Interface

Each layout type implements a common interface that defines:

1. **Position Calculation** — How to place nodes given the tree structure
2. **Order Inference** — How to determine sibling order from current positions
3. **Handle Configuration** — Which handles are active for this layout
4. **Spacing Rules** — Horizontal and vertical gaps between nodes

### 2.2 Strategy Definitions

#### Horizontal Balanced (Existing)
- **Positioning:** Children on left side stack vertically to the left of parent; right side mirrors
- **Order Inference:** Sort siblings by Y coordinate (top to bottom)
- **Handles:** Left handle for left-side children, Right handle for right-side children
- **Changes Needed:** Extract into strategy pattern, add order inference

#### Vertical Balanced (Existing)
- **Positioning:** Children on top side stack horizontally above parent; bottom side mirrors
- **Order Inference:** Sort siblings by X coordinate (left to right)
- **Handles:** Top handle for top-side children, Bottom handle for bottom-side children
- **Changes Needed:** Extract into strategy pattern, add order inference

#### Right-Only Tree (New)
- **Positioning:** All children stack vertically to the right of parent
- **Order Inference:** Sort siblings by Y coordinate (top to bottom)
- **Handles:** Right handle only (source from parent, target on child)
- **Side Assignment:** All children get `side: 'right'` regardless of where they're created
- **Implementation Notes:** Very similar to horizontal balanced, but ignore left side entirely

#### Org Chart (New)
- **Positioning:** Children positioned in a horizontal row below parent, centered
- **Order Inference:** Sort siblings by X coordinate (left to right)
- **Handles:** Bottom handle on parent (source), Top handle on children (target)
- **Side Assignment:** All children get `side: 'right'` (or introduce `side: 'bottom'`)
- **Special Behavior:** Parent-to-child edges go down, sibling connections (if any) go sideways

#### Radial (New)
- **Positioning:** Children positioned in a circle around parent at equal angular intervals
- **Order Inference:** Calculate angle from parent center, sort clockwise from 12 o'clock (top)
- **Handles:** All 4 handles active; choose handle based on which is closest to the angle
- **Side Assignment:** Determined by angle quadrant (right side: -45° to 45°, etc.)
- **Special Behavior:** Radius increases with tree depth; handles are selected dynamically

---

## Phase 3: Relative Position Preservation

### 3.1 Order Inference Service

Create a service that converts current visual positions into sibling order.

**Input:** 
- Array of sibling nodes with their current positions
- Current layout type

**Output:**
- Map of node ID → new sibling order

**Logic by Layout Type:**

| Layout | Sort By | Direction |
|--------|---------|-----------|
| Horizontal Balanced | node.position.y | Ascending (top first) |
| Vertical Balanced | node.position.x | Ascending (left first) |
| Right-Only Tree | node.position.y | Ascending (top first) |
| Org Chart | node.position.x | Ascending (left first) |
| Radial | angle from parent | Clockwise from top (0° first) |

### 3.2 Drag Event Integration

**When to Infer Order:**
- ✅ User drags and releases a node
- ❌ Auto-layout runs after adding/deleting nodes
- ❌ Layout type changes
- ❌ Initial load
- ❌ Undo/redo operations

**Flow:**
1. User finishes dragging a node (onNodeDragStop event)
2. System identifies the node's siblings
3. Order inference service calculates new order based on positions
4. Store updates `siblingOrder` for affected nodes
5. Auto-layout triggers, using new order
6. Nodes animate to their calculated positions

### 3.3 Tiebreaker Rules

When two nodes have the same position on the sorting axis:
1. Use their previous `siblingOrder` as tiebreaker
2. If still tied (new nodes), use alphabetical order of node ID

---

## Phase 4: Layout Service Refactoring

### 4.1 Hierarchy Building Changes

**Location:** `D3LayoutService.ts` → `buildSubtree` and `createHierarchy`

Before building child arrays, sort children by `siblingOrder`:

```
Current: children appear in arbitrary order
New: children sorted by siblingOrder ascending, with fallback to array order
```

### 4.2 Strategy Pattern Implementation

Refactor `D3LayoutService` into:

```
D3LayoutService (orchestrator)
├── HorizontalBalancedStrategy
├── VerticalBalancedStrategy  
├── RightOnlyStrategy
├── OrgChartStrategy
└── RadialStrategy
```

Each strategy implements:
- `calculatePositions(hierarchy, rootPosition, spacing)` → positioned nodes
- `inferOrderFromPositions(siblings)` → order mapping
- `getHandleConfig()` → which handles to use
- `getSortAxis()` → 'x', 'y', or 'angle'

### 4.3 Handle Selection Logic

For multi-handle layouts (Org Chart, Radial), add logic to select appropriate handles:

**Org Chart:**
- Parent → Child: source = bottom, target = top
- Always consistent, no dynamic selection needed

**Radial:**
- Calculate angle from parent center to child center
- Select handle closest to that angle:
  - 315° to 45° → Right handle
  - 45° to 135° → Bottom handle  
  - 135° to 225° → Left handle
  - 225° to 315° → Top handle

---

## Phase 5: Component Updates

### 5.1 Node Handle Rendering

**Location:** `ChildNodeControls.tsx` → `NodeHandlers` component

Update to render handles based on layout type:

| Layout | Handles Rendered |
|--------|------------------|
| Horizontal Balanced | Left, Right (current behavior) |
| Vertical Balanced | Top, Bottom (current behavior) |
| Right-Only | Right only |
| Org Chart | Bottom (for parents), Top (for children) |
| Radial | All 4 handles |

### 5.2 Add Child Button Positioning

**Location:** `ChildNodeControls.tsx`

Update button positions based on layout type:

| Layout | Add Button Position |
|--------|---------------------|
| Horizontal Balanced | Left side, Right side |
| Vertical Balanced | Top side, Bottom side |
| Right-Only | Right side only |
| Org Chart | Bottom side only |
| Radial | Center (opens radial menu) or single button that adds at next available angle |

### 5.3 Collapse/Expand Controls

Adjust collapse button positions to match the layout's primary direction of expansion.

---

## Phase 6: Edge Routing

### 6.1 Edge Handle Assignment

When creating or updating edges, assign source/target handles based on layout:

**Location:** Edge creation logic in node operations store

| Layout | Source Handle | Target Handle |
|--------|---------------|---------------|
| Horizontal Balanced | left or right (based on child side) | opposite of source |
| Vertical Balanced | top or bottom (based on child side) | opposite of source |
| Right-Only | right | left |
| Org Chart | bottom | top |
| Radial | dynamic (closest to child) | dynamic (closest to parent) |

### 6.2 Path Type Considerations

Different layouts may benefit from different edge path types:
- **Horizontal/Vertical/Right-Only:** Bezier or SmoothStep work well
- **Org Chart:** Straight or SmoothStep (angular corporate look)
- **Radial:** Bezier curves look most natural

---

## Phase 7: Store Updates

### 7.1 Layout Store Changes

Extend layout store to handle new layout types:

**Current:** stores `direction: Direction`
**New:** stores `layoutType: LayoutType`

Add migration logic to convert saved `direction` values to new `layoutType` values.

### 7.2 New Sibling Order Store (Optional)

Could add dedicated actions for order manipulation:
- `reorderFromPositions(parentId)` — infer order from current positions
- `swapSiblings(nodeId1, nodeId2)` — direct swap
- `moveSibling(nodeId, newIndex)` — move to specific position

Alternatively, these could be methods on the existing node operations store.

---

## Phase 8: Migration & Compatibility

### 8.1 Data Migration

When loading mindmaps saved with old format:
1. If `direction` exists but `layoutType` doesn't: map to new layout type
2. If nodes lack `siblingOrder`: assign based on current array order

### 8.2 API Compatibility

If your backend stores mindmap data:
- Add `siblingOrder` to node schema
- Add `layoutType` to mindmap metadata schema
- Keep `direction` temporarily for backwards compatibility

---

## Implementation Order

### Sprint 1: Foundation
1. Add `siblingOrder` to node data type
2. Add `LAYOUT_TYPE` constants
3. Update hierarchy building to sort by `siblingOrder`
4. Migrate existing `direction` to `layoutType` in store

### Sprint 2: Right-Only Layout
1. Implement Right-Only strategy (minimal changes from Horizontal Balanced)
2. Update handle rendering for right-only
3. Update add child button positioning
4. Test drag-to-reorder with order inference

### Sprint 3: Org Chart Layout
1. Implement Org Chart strategy
2. Add bottom-source/top-target handle logic
3. Update controls for bottom-only child creation
4. Center children horizontally under parent

### Sprint 4: Radial Layout
1. Implement Radial strategy with angle-based positioning
2. Add dynamic handle selection based on angle
3. Implement angle-based order inference
4. Create radial add-child interaction (suggested angles or free placement)

### Sprint 5: Polish
1. Add smooth animations for layout transitions
2. Visual feedback during drag (show where node will land)
3. Toolbar UI for layout type selection
4. Keyboard shortcuts for reordering

---

## Success Criteria

### Functional Requirements
- [ ] All 5 layout types position nodes correctly
- [ ] Dragging a node among siblings reorders them as expected
- [ ] Order persists across save/load cycles
- [ ] Switching layout types preserves sibling order
- [ ] Edges connect using appropriate handles per layout

### User Experience Requirements
- [ ] Drag-to-reorder feels intuitive (node ends up where user expects)
- [ ] Layout transitions are smooth, not jarring
- [ ] Adding children places them in logical positions
- [ ] Controls appear in sensible locations per layout type

### Technical Requirements
- [ ] No regression in existing horizontal/vertical layouts
- [ ] Performance acceptable with 100+ nodes
- [ ] Clean separation between strategies (easy to add more layouts later)

---

## Appendix: Visual Reference

### Right-Only Tree
```
┌─────────┐
│  Root   │───┬───────────────────┐
└─────────┘   │                   │
              ▼                   ▼
         ┌─────────┐         ┌─────────┐
         │ Child A │──┐      │ Child B │
         └─────────┘  │      └─────────┘
                      ▼
                 ┌─────────┐
                 │Grandchild│
                 └─────────┘
```

### Org Chart
```
              ┌─────────┐
              │   CEO   │
              └────┬────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │   CTO   │ │   CFO   │ │   COO   │
  └────┬────┘ └─────────┘ └────┬────┘
       │                       │
   ┌───┴───┐               ┌───┴───┐
   ▼       ▼               ▼       ▼
┌─────┐ ┌─────┐         ┌─────┐ ┌─────┐
│Dev A│ │Dev B│         │Ops A│ │Ops B│
└─────┘ └─────┘         └─────┘ └─────┘
```

### Radial
```
                 ○ Child A
                 │
            ○────┼────○
         Child B │ Child C
                 │
            ┌────┴────┐
            │  Root   │
            └────┬────┘
                 │
            ○────┼────○
         Child D │ Child E
                 │
                 ○ Child F
```

---

## Notes for Future Extension

This architecture is designed to easily accommodate additional layouts:

- **Fishbone (Ishikawa):** Similar to horizontal, but alternating top/bottom branches
- **Timeline:** Horizontal spine with alternating top/bottom events
- **Treemap:** Completely different paradigm, would need separate handling
- **Force-Directed:** No fixed layout, nodes repel/attract based on physics

The strategy pattern allows adding these without modifying existing layouts.
