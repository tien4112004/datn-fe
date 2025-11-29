// Seating layout metadata table
export interface SeatingSeat {
  id: string;
  layoutId: string;
  seatId: string; // e.g., '1-1', '1-2', etc.
  studentId: string | null; // FK to students table, null if empty seat
  row: number;
  column: number;
}

export interface SeatingLayout {
  id: string;
  classId: string;
  rows: number;
  columns: number;
  seats: SeatingSeat[];
  createdAt: string;
  updatedAt: string;
}

export const seatingLayoutsTable: SeatingLayout[] = [
  {
    id: 'layout-1',
    classId: '1', // Class 1A
    rows: 4,
    columns: 4,
    seats: [
      { id: 'seat-1-1', layoutId: 'layout-1', seatId: '1-1', studentId: '1', row: 1, column: 1 },
      { id: 'seat-1-2', layoutId: 'layout-1', seatId: '1-2', studentId: '2', row: 1, column: 2 },
      { id: 'seat-1-3', layoutId: 'layout-1', seatId: '1-3', studentId: '3', row: 1, column: 3 },
      { id: 'seat-1-4', layoutId: 'layout-1', seatId: '1-4', studentId: '4', row: 1, column: 4 },
      { id: 'seat-2-1', layoutId: 'layout-1', seatId: '2-1', studentId: '5', row: 2, column: 1 },
      { id: 'seat-2-2', layoutId: 'layout-1', seatId: '2-2', studentId: '6', row: 2, column: 2 },
      { id: 'seat-2-3', layoutId: 'layout-1', seatId: '2-3', studentId: '7', row: 2, column: 3 },
      { id: 'seat-2-4', layoutId: 'layout-1', seatId: '2-4', studentId: '8', row: 2, column: 4 },
      { id: 'seat-3-1', layoutId: 'layout-1', seatId: '3-1', studentId: '9', row: 3, column: 1 },
      { id: 'seat-3-2', layoutId: 'layout-1', seatId: '3-2', studentId: '10', row: 3, column: 2 },
      { id: 'seat-3-3', layoutId: 'layout-1', seatId: '3-3', studentId: '11', row: 3, column: 3 },
      { id: 'seat-3-4', layoutId: 'layout-1', seatId: '3-4', studentId: '12', row: 3, column: 4 },
      { id: 'seat-4-1', layoutId: 'layout-1', seatId: '4-1', studentId: '13', row: 4, column: 1 },
      { id: 'seat-4-2', layoutId: 'layout-1', seatId: '4-2', studentId: '14', row: 4, column: 2 },
      { id: 'seat-4-3', layoutId: 'layout-1', seatId: '4-3', studentId: '15', row: 4, column: 3 },
      { id: 'seat-4-4', layoutId: 'layout-1', seatId: '4-4', studentId: null, row: 4, column: 4 },
    ],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-23T00:00:00Z',
  },
  {
    id: 'layout-2',
    classId: '2', // Class 3B
    rows: 4,
    columns: 4,
    seats: [
      { id: 'seat-2-1-1', layoutId: 'layout-2', seatId: '1-1', studentId: '16', row: 1, column: 1 },
      { id: 'seat-2-1-2', layoutId: 'layout-2', seatId: '1-2', studentId: '17', row: 1, column: 2 },
      { id: 'seat-2-1-3', layoutId: 'layout-2', seatId: '1-3', studentId: '18', row: 1, column: 3 },
      { id: 'seat-2-1-4', layoutId: 'layout-2', seatId: '1-4', studentId: '19', row: 1, column: 4 },
      { id: 'seat-2-2-1', layoutId: 'layout-2', seatId: '2-1', studentId: '20', row: 2, column: 1 },
      { id: 'seat-2-2-2', layoutId: 'layout-2', seatId: '2-2', studentId: '21', row: 2, column: 2 },
      { id: 'seat-2-2-3', layoutId: 'layout-2', seatId: '2-3', studentId: '22', row: 2, column: 3 },
      { id: 'seat-2-2-4', layoutId: 'layout-2', seatId: '2-4', studentId: '23', row: 2, column: 4 },
      { id: 'seat-2-3-1', layoutId: 'layout-2', seatId: '3-1', studentId: '24', row: 3, column: 1 },
      { id: 'seat-2-3-2', layoutId: 'layout-2', seatId: '3-2', studentId: '25', row: 3, column: 2 },
      { id: 'seat-2-3-3', layoutId: 'layout-2', seatId: '3-3', studentId: '26', row: 3, column: 3 },
      { id: 'seat-2-3-4', layoutId: 'layout-2', seatId: '3-4', studentId: '27', row: 3, column: 4 },
      { id: 'seat-2-4-1', layoutId: 'layout-2', seatId: '4-1', studentId: '28', row: 4, column: 1 },
      { id: 'seat-2-4-2', layoutId: 'layout-2', seatId: '4-2', studentId: '29', row: 4, column: 2 },
      { id: 'seat-2-4-3', layoutId: 'layout-2', seatId: '4-3', studentId: '30', row: 4, column: 3 },
      { id: 'seat-2-4-4', layoutId: 'layout-2', seatId: '4-4', studentId: null, row: 4, column: 4 },
    ],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-23T00:00:00Z',
  },
  {
    id: 'layout-3',
    classId: '3', // Class 5C
    rows: 4,
    columns: 4,
    seats: [
      { id: 'seat-3-1-1', layoutId: 'layout-3', seatId: '1-1', studentId: '31', row: 1, column: 1 },
      { id: 'seat-3-1-2', layoutId: 'layout-3', seatId: '1-2', studentId: '32', row: 1, column: 2 },
      { id: 'seat-3-1-3', layoutId: 'layout-3', seatId: '1-3', studentId: '33', row: 1, column: 3 },
      { id: 'seat-3-1-4', layoutId: 'layout-3', seatId: '1-4', studentId: '34', row: 1, column: 4 },
      { id: 'seat-3-2-1', layoutId: 'layout-3', seatId: '2-1', studentId: '35', row: 2, column: 1 },
      { id: 'seat-3-2-2', layoutId: 'layout-3', seatId: '2-2', studentId: '36', row: 2, column: 2 },
      { id: 'seat-3-2-3', layoutId: 'layout-3', seatId: '2-3', studentId: '37', row: 2, column: 3 },
      { id: 'seat-3-2-4', layoutId: 'layout-3', seatId: '2-4', studentId: '38', row: 2, column: 4 },
      { id: 'seat-3-3-1', layoutId: 'layout-3', seatId: '3-1', studentId: '39', row: 3, column: 1 },
      { id: 'seat-3-3-2', layoutId: 'layout-3', seatId: '3-2', studentId: '40', row: 3, column: 2 },
      { id: 'seat-3-3-3', layoutId: 'layout-3', seatId: '3-3', studentId: '41', row: 3, column: 3 },
      { id: 'seat-3-3-4', layoutId: 'layout-3', seatId: '3-4', studentId: '42', row: 3, column: 4 },
      { id: 'seat-3-4-1', layoutId: 'layout-3', seatId: '4-1', studentId: '43', row: 4, column: 1 },
      { id: 'seat-3-4-2', layoutId: 'layout-3', seatId: '4-2', studentId: '44', row: 4, column: 2 },
      { id: 'seat-3-4-3', layoutId: 'layout-3', seatId: '4-3', studentId: '45', row: 4, column: 3 },
      { id: 'seat-3-4-4', layoutId: 'layout-3', seatId: '4-4', studentId: null, row: 4, column: 4 },
    ],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-23T00:00:00Z',
  },
];
