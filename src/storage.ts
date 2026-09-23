import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from './types';
import { todayStr } from './utils/date';

const STORAGE_KEY = 'habit-tracker/habits/v1';

const SEED_HABITS: Habit[] = [
  {
    id: 'seed-100-days-of-yoga',
    name: '100 Days of Yoga',
    emoji: '🧘',
    keywords: ['yoga', 'suryanamaskar', 'surya namaskar', 'surya namaskars'],
    targetDays: 100,
    createdAt: todayStr(),
    completedDates: [],
  },
];

export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await saveHabits(SEED_HABITS);
    return SEED_HABITS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to reseed on corrupt data
  }
  await saveHabits(SEED_HABITS);
  return SEED_HABITS;
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
