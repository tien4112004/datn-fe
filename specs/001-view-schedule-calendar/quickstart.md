# Quickstart for Teacher Schedule View Enhancement

This document provides a quick overview of the new schedule view feature.

## Running the Feature

1.  Start the development server: `pnpm dev`
2.  Navigate to the "Class Detail" page for a class.
3.  Go to the "Schedule" tab.
4.  You should see the new schedule view with a toggle button to switch between the calendar and list views.

## Key Components

*   **`container/src/features/schedule/components/ScheduleView.tsx`**: The main component for the schedule view.
*   **`container/src/features/classes/components/calendar/CalendarGrid.tsx`**: The existing calendar grid component.
*   **`container/src/features/schedule/components/ScheduleList.tsx`**: The new schedule list component.
*   **`container/src/features/schedule/components/ScheduleDialog.tsx`**: The dialog for displaying schedule item details.
