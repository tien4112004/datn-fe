# Data Model for Create Class Periods

This document outlines the data models for the entities involved in creating class periods. The models are based on the feature specification and the existing `SchedulePeriod` type in the codebase.

## Entity: Period Template

This entity represents a reusable template for creating class periods. These templates would be managed by administrators in a separate part of the application.

**Fields**:

| Field Name | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the template. |
| `name` | `string` | The name of the period (e.g., "Period 1", "Morning Assembly"). |
| `startTime` | `string` | The default start time of the period (e.g., "09:00"). |
| `endTime` | `string` | The default end time of the period (e.g., "10:00"). |

**Validation Rules**:

- `name`, `startTime`, and `endTime` are required.
- `startTime` must be before `endTime`.

## Entity: Class Period

This entity represents a specific instance of a class period on a given date. It is based on the existing `SchedulePeriod` type.

**Fields**:

| Field Name | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the class period instance. |
| `classId` | `string` | The ID of the class this period belongs to. |
| `name` | `string` | The name of the period, inherited from the Period Template. |
| `subject` | `string` | The subject being taught. |
| `subjectCode` | `string` | The code for the subject. |
| `date` | `string` | The specific date of the period (YYYY-MM-DD). |
| `startTime` | `string` | The start time, inherited from the Period Template. |
| `endTime` | `string` | The end time, inherited from the Period Template. |
| `category` | `PeriodCategory` | The category of the period (e.g., "Academic", "Break"). |
| `location` | `string` (optional) | The room number or location of the class. |
| `description` | `string` (optional) | Any additional notes for the period. |
| `isActive` | `boolean` | Whether the period is active. |
| `lessonPlanId` | `string` (optional) | A link to an associated lesson plan. |

**State Transitions**:

- A `Class Period` is created in an `active` state.
- It can be updated to change its details (e.g., location, description).
- It can be linked or unlinked from a `LessonPlan`.
- It can be deleted (or marked as inactive).
