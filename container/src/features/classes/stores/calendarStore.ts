/**
 * Calendar Store
 * Manages UI state for the calendar (selected date, event details dialog)
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { addMonths, startOfMonth } from 'date-fns';

interface CalendarState {
  /** Currently selected date for calendar display */
  selectedDate: Date;

  /** ID of event to show in details dialog (null = dialog closed) */
  selectedEventId: string | null;

  /** Set the selected date (for programmatic navigation) */
  setSelectedDate: (date: Date) => void;

  /** Navigate to next month */
  nextMonth: () => void;

  /** Navigate to previous month */
  prevMonth: () => void;

  /** Navigate to current month */
  goToToday: () => void;

  /** Open event details dialog */
  openEventDetails: (eventId: string) => void;

  /** Close event details dialog */
  closeEventDetails: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: startOfMonth(new Date()),
  selectedEventId: null,

  setSelectedDate: (date) =>
    set({
      selectedDate: startOfMonth(date),
    }),

  nextMonth: () =>
    set((state) => ({
      selectedDate: addMonths(state.selectedDate, 1),
    })),

  prevMonth: () =>
    set((state) => ({
      selectedDate: addMonths(state.selectedDate, -1),
    })),

  goToToday: () =>
    set({
      selectedDate: startOfMonth(new Date()),
    }),

  openEventDetails: (eventId) =>
    set({
      selectedEventId: eventId,
    }),

  closeEventDetails: () =>
    set({
      selectedEventId: null,
    }),
}));
