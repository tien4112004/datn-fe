# Data Model for Teacher Schedule View

This document outlines the data models for the schedule feature, based on the `ScheduleEvent` and `DailySchedule` entities.

## Entities

### ScheduleEvent

Represents a single scheduled event or class period on a specific date.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the event. |
| `classId` | `string` | ID of the class this event belongs to. |
| `name` | `string` | Name of the event. |
| `subject` | `string` | Subject of the class period. |
| `subjectCode` | `string` | Code for the subject. |
| `date` | `string` | Date of the event (YYYY-MM-DD). |
| `startTime` | `string | null` | Start time of the event (HH:mm). |
| `endTime` | `string | null` | End time of the event (HH:mm). |
| `category` | `EventCategory` | Category of the event (e.g., 'class', 'meeting'). |
| `location` | `string | null` | Location of the event. |
| `description` | `string | null` | Description of the event. |
| `isActive` | `boolean` | Whether the event is active. |
| `lessonPlanId` | `string | null` | ID of the associated lesson plan. |
| `createdAt` | `string` | Timestamp of when the event was created. |
| `updatedAt` | `string` | Timestamp of when the event was last updated. |

### DailySchedule

A collection of all `ScheduleEvent`s for a specific class on a given day.

| Field | Type | Description |
|---|---|---|
| `date` | `string` | The date for this schedule (YYYY-MM-DD). |
| `classId` | `string` | The ID of the class this schedule belongs to. |
| `events` | `ScheduleEvent[]` | An array of schedule events for the day. |
