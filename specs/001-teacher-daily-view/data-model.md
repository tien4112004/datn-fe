# Data Model for Period Detail View

Based on the feature specification, the following data entities are required.

## Period

Represents a single class session.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the period. |
| `time` | `string` | The start and end time of the period (e.g., "09:00 - 10:00"). |
| `className` | `string` | The name of the class. |
| `roomNumber` | `string` | The room number where the class is held. |
| `lessonPlan` | `LessonPlan` | The lesson plan for this period. Can be null if no lesson plan exists. |

## LessonPlan

Represents the plan for a period.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the lesson plan. |
| `topic` | `string` | The topic of the lesson. |
| `objectives` | `string[]` | A list of learning objectives. |
| `activities` | `string[]` | A list of activities to be performed. |
| `materials` | `string[]` | A list of materials required for the lesson. |
| `assessments` | `string[]` | A list of assessment methods. |
| `differentiation` | `string` | Notes on differentiation for the lesson. |