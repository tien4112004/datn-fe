# Research for Create Class Periods

## Summary of Findings

The feature will be implemented within the `container` workspace, which is a React application written in TypeScript. The entry point for the user interaction will be the `ScheduleView` component, which already has a placeholder for adding new periods.

## Existing Code Analysis

### `ScheduleView` Component

- **Location**: `container/src/features/classes/components/schedule/schedule-view/ScheduleView.tsx`
- **Framework**: React with TypeScript.
- **UI Library**: ShadCN UI (`@/components/ui/...`).
- **Functionality**: It displays a daily and monthly schedule for a given class. It has a button with a `Plus` icon that is intended to add a new period. The button's `onClick` handler calls the `onAddPeriod` function passed in as a prop.

### `onAddPeriod` Prop

- **Definition**: `onAddPeriod?: (date: string) => void;` in `ScheduleView.tsx`.
- **Usage**: When the "Add Period" button is clicked, it is called with the currently selected date (`selectedDateString`).
- **Implication**: The parent component of `ScheduleView` is responsible for handling the logic of adding a period. Looking at the file `container/src/features/classes/components/schedule/ScheduleTab.tsx`, the `onAddPeriod` prop is passed down. This means I will need to implement the logic in `ScheduleTab.tsx` or a component higher up the chain.

### `SchedulePeriod` Type

- **Definition**: `container/src/features/classes/types/entities/schedule.ts`
- **Fields**:
  - `id: string`
  - `classId: string`
  - `name: string`
  - `subject: string`
  - `subjectCode: string`
  - `date: string`
  - `startTime: string | null`
  - `endTime: string | null`
  - `category: PeriodCategory`
  - `location?: string | null`
  - `description?: string | null`
  - `isActive: boolean`
  - `lessonPlanId?: string | null`
  - `createdAt: string`
  - `updatedAt: string`
- **Implication**: This is the data structure that the API expects for a class period. My new creation form will need to produce an object that conforms to this type (or a subset of it for creation).

## Decisions

1.  **Entry Point**: The user flow will start from the `onAddPeriod` prop of the `ScheduleView` component. I will implement a dialog or a new view that is triggered by this function.
2.  **Component Location**: The new components for creating a class period will be located in `container/src/features/classes/components/schedule/add-period/`.
3.  **Data Flow**: The new component will use the `useClassSchedules` hook's invalidation or a similar mechanism to refresh the schedule view after a new period is created. It will likely call a mutation defined in `useApi.ts` which in turn calls `classApiService.addSchedulePeriod`.
