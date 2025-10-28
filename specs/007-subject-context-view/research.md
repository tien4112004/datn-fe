# Research: Subject Context View

## Data Requirements

### 1. List of Subjects

-   **Requirement**: Fetch the list of all "manageable subjects" for the current class.
-   **Decision**: A new API endpoint will be required to provide this data.
-   **Endpoint**: `GET /api/classes/{classId}/subjects`
-   **Response**:
    ```json
    [
      { "id": "subj-1", "name": "Mathematics" },
      { "id": "subj-2", "name": "Science" }
    ]
    ```

### 2. All Periods for One Subject

-   **Requirement**: Fetch all scheduled periods (past, present, and future) for a single `subjectId`.
-   **Decision**: A new API endpoint will be required.
-   **Endpoint**: `GET /api/classes/{classId}/subjects/{subjectId}/periods`
-   **Response**:
    ```json
    [
      {
        "id": "period-1",
        "date": "2025-11-10",
        "startTime": "09:00",
        "endTime": "10:00",
        "lesson": { "id": "lesson-1", "name": "Introduction to Algebra" }
      },
      {
        "id": "period-2",
        "date": "2025-11-12",
        "startTime": "09:00",
        "endTime": "10:00",
        "lesson": null
      }
    ]
    ```
