/**
 * Schedule Store
 * Centralized state management for schedule & calendar UI
 * Manages: date selection, view mode, date ranges, and event details dialog
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import type { SchedulePeriod } from '../types';

type ViewMode = 'day' | 'week' | 'month';

interface ScheduleState {
  // Date selection
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Date range selection
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  setDateRange: (start: Date, end: Date) => void;
  clearDateRange: () => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Navigation
  goToToday: () => void;
  nextMonth: () => void;
  prevMonth: () => void;

  selectedPeriod: SchedulePeriod | null;
  openPeriodDetails: (period: SchedulePeriod) => void;
  closePeriodDetails: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedDate: new Date(),
  dateRangeStart: null,
  dateRangeEnd: null,
  viewMode: 'day',
  selectedPeriod: null,

  setSelectedDate: (date) =>
    set({
      selectedDate: new Date(date),
    }),

  setDateRange: (start, end) =>
    set({
      dateRangeStart: new Date(start),
      dateRangeEnd: new Date(end),
    }),

  clearDateRange: () =>
    set({
      dateRangeStart: null,
      dateRangeEnd: null,
    }),

  setViewMode: (mode) =>
    set({
      viewMode: mode,
    }),

  goToToday: () =>
    set({
      selectedDate: new Date(),
    }),

  nextMonth: () =>
    set((state) => {
      const date = new Date(state.selectedDate);
      date.setMonth(date.getMonth() + 1);
      return { selectedDate: date };
    }),

  prevMonth: () =>
    set((state) => {
      const date = new Date(state.selectedDate);
      date.setMonth(date.getMonth() - 1);
      return { selectedDate: date };
    }),

  openPeriodDetails: (period) =>
    set({
      selectedPeriod: period,
    }),

  closePeriodDetails: () =>
    set({
      selectedPeriod: null,
    }),
}));

export default useScheduleStore;
