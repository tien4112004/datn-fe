# Quickstart: Classroom Seating Chart

This document provides a quick overview of how to use the updated `ClassStudentList` component.

## Usage

The `ClassStudentList` component now includes a "Seating Chart" view. To use it, simply pass the `classData` prop to the component as before. The component will handle the view switching and drag-and-drop functionality internally.

```tsx
import ClassStudentList from '../components/detail/ClassStudentList';
import type { Class } from '../types';

interface MyComponentProps {
  classData: Class;
}

const MyComponent = ({ classData }: MyComponentProps) => {
  return <ClassStudentList classData={classData} />;
};
```

## Props

-   `classData`: `Class` (The class data, including the list of students and the seating chart layout)

## Views

-   **List View**: The default view, which displays a simple list of students.
-   **Seating Chart View**: A grid-based view that shows the seating arrangement of the students. Users can switch to this view using a toggle button.

## Drag-and-Drop

In the "Seating Chart View", teachers can rearrange students by dragging and dropping them to different seats. The changes can be saved by clicking the "Save Layout" button.
