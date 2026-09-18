export type Habit = {
  id: string;
  name: string;
  emoji: string;
  targetDays: number;
  createdAt: string; // ISO date string (yyyy-mm-dd)
  completedDates: string[]; // ISO date strings (yyyy-mm-dd), unique
};
