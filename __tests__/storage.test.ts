import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadHabits, saveHabits } from '../src/storage';
import { makeHabit, NOW, readStorage, STORAGE_KEY, TODAY } from './helpers';

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('loadHabits', () => {
  it('seeds the 100 Days of Yoga habit on first launch and persists it', async () => {
    const habits = await loadHabits();
    expect(habits).toHaveLength(1);
    expect(habits[0]).toMatchObject({
      id: 'seed-100-days-of-yoga',
      name: '100 Days of Yoga',
      targetDays: 100,
      completedDates: [],
    });
    expect(await readStorage()).toEqual(habits);
  });

  it('returns previously saved habits unchanged', async () => {
    const saved = [makeHabit({ completedDates: ['2026-03-10'] })];
    await saveHabits(saved);
    expect(await loadHabits()).toEqual(saved);
  });

  it('keeps an empty list (user deleted everything) without reseeding', async () => {
    await saveHabits([]);
    expect(await loadHabits()).toEqual([]);
  });

  it('reseeds when stored data is corrupt JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{not json');
    const habits = await loadHabits();
    expect(habits[0].id).toBe('seed-100-days-of-yoga');
    expect(await readStorage()).toEqual(habits);
  });

  it('reseeds when stored data is not an array', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ habits: [] }));
    expect((await loadHabits())[0].id).toBe('seed-100-days-of-yoga');
  });
});

describe('saveHabits', () => {
  it('round-trips minutes and notes', async () => {
    const habit = makeHabit({
      completedDates: [TODAY],
      minutes: { [TODAY]: 20 },
      notes: { [TODAY]: 'felt great' },
    });
    await saveHabits([habit]);
    expect(await readStorage()).toEqual([habit]);
  });
});
