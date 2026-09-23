export type Habit = {
  id: string;
  name: string;
  emoji: string;
  keywords?: string[]; // extra words that should match this habit when voice-logging (e.g. "suryanamaskar")
  targetDays: number;
  createdAt: string; // ISO date string (yyyy-mm-dd)
  completedDates: string[]; // ISO date strings (yyyy-mm-dd), unique
  minutes?: Record<string, number>; // dateStr -> minutes logged that day
  notes?: Record<string, string>; // dateStr -> free-text note for that day
};

export type ParsedLogEntry = {
  habitId: string | null;
  matchedHabitName?: string;
  minutes?: number;
  note?: string;
  rawText: string;
};
