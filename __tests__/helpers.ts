import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../src/types';

export const STORAGE_KEY = 'habit-tracker/habits/v1';

// A fixed "now" (local time, mid-day so timezone shifts can't change the date).
export const NOW = new Date(2026, 2, 15, 12, 0, 0); // 2026-03-15
export const TODAY = '2026-03-15';

export function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Read Books',
    emoji: '📖',
    targetDays: 30,
    createdAt: '2026-03-01',
    completedDates: [],
    ...overrides,
  };
}

export const YOGA = makeHabit({
  id: 'yoga',
  name: '100 Days of Yoga',
  emoji: '🧘',
  keywords: ['yoga', 'suryanamaskar', 'surya namaskar', 'surya namaskars'],
  targetDays: 100,
});

export const RUN = makeHabit({ id: 'run', name: 'Morning Run', emoji: '🏃' });

export async function seedStorage(habits: Habit[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export async function readStorage(): Promise<Habit[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
