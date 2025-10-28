# Data Model: Subject Context View

This feature introduces the following data entities:

### Subject

-   **Description**: Represents a course of study (e.g., Math, Science).
-   **Fields**:
    -   `id` (string, required): Unique identifier for the subject.
    -   `name` (string, required): The name of the subject.

### Period

-   **Description**: Represents a single scheduled class session.
-   **Fields**:
    -   `id` (string, required): Unique identifier for the period.
    -   `date` (string, required): The date of the period in `YYYY-MM-DD` format.
    -   `startTime` (string, required): The start time of the period in `HH:mm` format.
    -   `endTime` (string, required): The end time of the period in `HH:mm` format.
    -   `lesson` (Lesson | null): The lesson mapped to this period.

### Lesson

-   **Description**: Represents the curriculum content to be taught.
-   **Fields**:
    -   `id` (string, required): Unique identifier for the lesson.
    -   `name` (string, required): The name of the lesson.
