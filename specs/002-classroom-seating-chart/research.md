# Research: Classroom Seating Chart

## 1. Drag-and-Drop with `dnd-kit`

**Decision**: Use `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` for the drag-and-drop functionality.

**Rationale**: `dnd-kit` is a modern, lightweight, and accessible drag-and-drop library for React. It provides the necessary tools to create both a sortable list and a grid-based seating chart.

**Alternatives considered**: `react-dnd`. `dnd-kit` was chosen for its modern API, better performance, and first-class support for sensors (e.g., pointer, keyboard), which is crucial for accessibility.

### Implementation Notes:

-   **Seating Chart (Grid)**: Use the `useSortable` hook for each student in the grid. The grid itself will be a `SortableContext` with a `grid` strategy.
-   **Unassigned Students (List)**: Use a separate `SortableContext` for the list of unassigned students.
-   **State Management**: The positions of students in the seating chart and the list of unassigned students will be managed using React state (`useState`). When a drag operation is completed, the state will be updated accordingly.

## 2. View Switching

**Decision**: Use a state variable to toggle between the "List View" and the "Seating Chart View".

**Rationale**: A simple boolean state is sufficient to control which view is rendered. This is a common pattern in React for conditional rendering.

**Alternatives considered**: Using a router for view switching. This was rejected as it adds unnecessary complexity for a simple view toggle within the same component.

## 3. Localization

**Decision**: Continue using `react-i18next` for localization.

**Rationale**: The project already uses `react-i18next`, so it's best to stick with the existing convention. New translation keys will be added to the `classes` namespace.

**Alternatives considered**: None, as using the existing localization library is the only sensible option.
