# Data Model: Class Management

## Entity: Class

Represents a course or group of students.

### Attributes:

- **Class Name** (string):
  - **Description**: Unique identifier for the class.
  - **Validation**: Required, minimum 3 characters, maximum 100 characters. Alphanumeric characters, spaces, hyphens, and apostrophes allowed.

- **Description** (string, optional):
  - **Description**: Detailed information about the class.
  - **Validation**: Maximum 500 characters. Any printable characters allowed.

- **Teacher** (relationship):
  - **Description**: Link to an existing teacher entity.
  - **Validation**: Required, must link to a valid existing teacher ID.

- **Students** (relationship, optional):
  - **Description**: Links to multiple existing student entities enrolled in the class.
  - **Validation**: Can link to multiple existing student IDs.

- **Schedule** (date/time, optional):
  - **Description**: The scheduled time for the class.
  - **Validation**: If provided, must be a valid date/time format.
