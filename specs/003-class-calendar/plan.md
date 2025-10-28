# Implementation Plan: Class Calendar

**Branch**: `003-class-calendar` | **Date**: October 30, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-class-calendar/spec.md`

## Summary

Implement a read-only monthly calendar view for homeroom teachers to visualize class events and activities. Teachers can navigate between months and view event details. The feature integrates with the existing classes module in the container workspace, using React 19, date-fns for date calculations, and react-day-picker for calendar UI. Full i18n support is maintained using the existing i18next infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React 19.1.0  
**Primary Dependencies**: 
- react-day-picker 9.8.0 (calendar UI component)
- date-fns 4.1.0 (date manipulation, already installed)
- i18next 25.3.2 + react-i18next 15.6.0 (internationalization, already installed)
- Zustand 5.0.7 (state management, already installed)
- Axios 1.10.0 (API calls, already installed)
- React Router DOM 7.6.3 (routing, already installed)
- Radix UI components (dialog, popover for event details, already installed)
- Tailwind CSS 4.1.11 (styling, already installed)

**Storage**: Mock API endpoints initially, backend integration via Axios  
**Testing**: Vitest 3.2.4 + React Testing Library 16.3.0 (already installed)  
**Target Platform**: Web (desktop and tablet responsive)  
**Project Type**: Web application (frontend only, container workspace)  
**Performance Goals**: 
- Calendar rendering < 500ms
- Month navigation < 300ms
- Event list retrieval < 2 seconds (per SC-002)

**Constraints**: 
- Must work within existing Module Federation architecture
- Must maintain i18n support for all UI text
- Must follow existing classes feature patterns
- Must be responsive (desktop + tablet per SC-005)

**Scale/Scope**: 
- Display 50+ events per month without performance degradation
- Support 6 months navigation forward/backward (per SC-007)
- Single class view (not multi-class)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Component Modularity ✅
- [x] Calendar components will be self-contained within `features/classes/components/calendar/`
- [x] Reusable date utilities placed in `features/classes/utils/`
- [x] Each component will have focused responsibility (CalendarGrid, CalendarEventCard, EventDetailsDialog)
- [x] Test coverage required for calendar logic and event rendering

### Type Safety & Quality Enforcement ✅
- [x] TypeScript strict mode enabled (already configured)
- [x] All calendar event types explicitly defined
- [x] API response types defined in `features/classes/types/`
- [x] Zero `any` types policy maintained
- [x] `pnpm typecheck` must pass

### Code Maintainability Standards ✅
- [x] Prettier formatting on save (already configured)
- [x] Conventional commits enforced (already configured)
- [x] Descriptive component and function names
- [x] Complex date logic will include explanatory comments
- [x] No dead code or unused imports

### Workspace Isolation & Dependencies ✅
- [x] All new dependencies installed in `container/` workspace only
- [x] react-day-picker uses React 19 peer dependency (matches existing)
- [x] No cross-workspace imports (stays within container)
- [x] No new shared dependencies requiring version alignment

### Code Review & Quality Gates ✅
- [x] Pre-commit hooks will run (already configured)
- [x] `pnpm build`, `pnpm typecheck`, `pnpm lint` must pass
- [x] Test coverage for primary user paths (P1: View Monthly Calendar)
- [x] Peer review required before merge

**Status**: ✅ All constitution checks pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-class-calendar/
├── plan.md              # This file
├── research.md          # Phase 0 output (calendar library evaluation)
├── data-model.md        # Phase 1 output (CalendarEvent entity)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── calendar-events-api.yaml
└── checklists/
    └── requirements.md  # Quality validation (already created)
```

### Source Code (container workspace)

```text
container/src/
├── features/
│   └── classes/
│       ├── components/
│       │   └── calendar/
│       │       ├── CalendarGrid.tsx           # Monthly calendar display
│       │       ├── CalendarEventCard.tsx      # Event item in calendar cell
│       │       ├── CalendarHeader.tsx         # Month/year display + navigation
│       │       ├── EventDetailsDialog.tsx     # Event detail modal
│       │       └── index.ts
│       ├── pages/
│       │   └── ClassCalendarPage.tsx          # Main calendar page
│       ├── hooks/
│       │   ├── useCalendarEvents.ts           # Fetch events for class
│       │   └── useCalendarNavigation.ts       # Month navigation logic
│       ├── stores/
│       │   └── calendarStore.ts               # Zustand store for calendar state
│       ├── api/
│       │   └── calendarApi.ts                 # API service for events
│       ├── types/
│       │   ├── entities/
│       │   │   └── calendarEvent.ts           # CalendarEvent entity
│       │   └── requests/
│       │       └── calendarRequests.ts        # API request/response types
│       └── utils/
│           └── calendarHelpers.ts             # Date formatting, grouping
├── shared/
│   └── i18n/
│       └── locales/
│           ├── en/
│           │   └── calendar.json              # English translations
│           └── vi/
│               └── calendar.json              # Vietnamese translations
└── app/
    └── router.tsx                             # Add calendar route

tests/
├── features/
│   └── classes/
│       ├── CalendarGrid.test.tsx
│       ├── useCalendarEvents.test.ts
│       └── calendarHelpers.test.ts
└── test-utils.tsx
```

**Structure Decision**: Web application structure within existing container workspace. All calendar code lives within the `features/classes/` module following established patterns. Calendar is treated as a subfeature of the classes module, sharing the same types, stores, and API patterns. This maintains modularity while leveraging existing class infrastructure.

## Complexity Tracking

> **No violations** - All constitution checks pass. No additional complexity introduced beyond established patterns.

