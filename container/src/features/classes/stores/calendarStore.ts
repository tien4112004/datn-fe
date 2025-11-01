/**
 * Calendar Store
 * Manages UI state for the calendar (selected date, event details dialog)
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { addMonths, startOfMonth } from 'date-fns';

interface CalendarState {
  selectedDate: Date;
  selectedEventId: string | null;
  setSelectedDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToToday: () => void;
  openEventDetails: (eventId: string) => void;
  closeEventDetails: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: startOfMonth(new Date()),
  selectedEventId: null,

  setSelectedDate: (date) => {
    set({
      selectedDate: new Date(date),
    });
  },

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
