# Data Model: Classroom Seating Chart

This document outlines the data structures used in the Classroom Seating Chart feature.

## Entities

### Classroom

Represents a class and contains the overall information for the seating chart.

-   `id`: `string` (Unique identifier for the class)
-   `name`: `string` (Name of the class)
-   `students`: `Student[]` (List of students in the class)
-   `layout`: `Layout` (The seating arrangement for the class)

### Student

Represents a student in the classroom.

-   `id`: `string` (Unique identifier for the student)
-   `fullName`: `string` (Full name of the student)
-   `studentCode`: `string` (Student's ID code)

### Seat

Represents a single seat in the classroom layout.

-   `id`: `string` (Unique identifier for the seat, e.g., `row-1-col-1`)
-   `studentId`: `string | null` (The ID of the student occupying the seat, or `null` if empty)

### Layout

Represents the grid structure of the classroom.

-   `rows`: `number` (Number of rows in the grid)
-   `columns`: `number` (Number of columns in the grid)
-   `seats`: `Seat[]` (A list of all the seats in the layout)
