# fe Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-30

## Active Technologies

- Backend API (mock implementation for frontend development) (001-student-roster)

- TypeScript 5.8.3, React 19.1.0 + React Router DOM 7.6.3, React Hook Form 7.61.1, Zod 4.0.10, i18next 25.3.2, Axios 1.10.0, Tanstack Table 8.21.3, Radix UI components, Tailwind CSS 4.1.11 (001-student-roster)

- react-day-picker 9.8.0 for calendar UI, date-fns 4.1.0 for date manipulation, Zustand 5.0.7 + React Query 5.83.0 for state management (003-class-calendar)

- papaparse 5.4.1 for CSV parsing (client-side), @types/papaparse for TypeScript definitions. File validation: MIME type (text/csv), size limit 5MB. Preview limited to 50 rows. (005-csv-student-import)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.8.3, React 19.1.0: Follow standard conventions

## Recent Changes

- 001-student-roster: Added TypeScript 5.8.3, React 19.1.0 + React Router DOM 7.6.3, React Hook Form 7.61.1, Zod 4.0.10, i18next 25.3.2, Axios 1.10.0, Tanstack Table 8.21.3, Radix UI components, Tailwind CSS 4.1.11

- 001-student-roster: Added TypeScript 5.8.3, React 19.1.0 + React Router DOM 7.6.3, React Hook Form 7.61.1, Zod 4.0.10, i18next 25.3.2, Axios 1.10.0, Tanstack Table 8.21.3, Radix UI components, Tailwind CSS 4.1.11

- 003-class-calendar: Added react-day-picker 9.8.0, date-fns 4.1.0, Zustand + React Query pattern for calendar state. All dependencies already installed. Focus on read-only calendar view with i18n support.

- 005-csv-student-import: Added papaparse for CSV parsing. Frontend handles file validation (MIME type, 5MB size limit), client-side parsing, preview (50 rows max), and structural validation. Backend handles business rules, duplicate detection, student ID generation.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
