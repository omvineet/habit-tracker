import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { HabitsProvider, useHabits } from '../src/HabitsContext';
import { makeHabit, NOW, readStorage, RUN, seedStorage, TODAY, YOGA } from './helpers';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HabitsProvider>{children}</HabitsProvider>
);

async function renderHabits() {
  const hook = await renderHook(() => useHabits(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('HabitsProvider', () => {
  it('seeds the default habit on first launch', async () => {
    const { result } = await renderHabits();
    expect(result.current.habits.map((h) => h.name)).toEqual(['100 Days of Yoga']);
  });

  it('loads saved habits', async () => {
    await seedStorage([YOGA, RUN]);
    const { result } = await renderHabits();
    expect(result.current.habits.map((h) => h.id)).toEqual(['yoga', 'run']);
  });

  it('addHabit prepends a new habit starting today and persists it', async () => {
    await seedStorage([YOGA]);
    const { result } = await renderHabits();

    await act(async () => result.current.addHabit('Drink water', '💧', 21));

    const [added, existing] = result.current.habits;
    expect(existing.id).toBe('yoga');
    expect(added).toMatchObject({
      name: 'Drink water',
      emoji: '💧',
      targetDays: 21,
      createdAt: TODAY,
      completedDates: [],
    });
    expect(added.id).toEqual(expect.any(String));
    expect(await readStorage()).toEqual(result.current.habits);
  });

  it('addHabit gives each habit a unique id', async () => {
    await seedStorage([]);
    const { result } = await renderHabits();
    await act(async () => result.current.addHabit('A', '🎯', 10));
    await act(async () => result.current.addHabit('B', '🎯', 10));
    const ids = result.current.habits.map((h) => h.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('deleteHabit removes only that habit and persists', async () => {
    await seedStorage([YOGA, RUN]);
    const { result } = await renderHabits();

    await act(async () => result.current.deleteHabit('yoga'));

    expect(result.current.habits.map((h) => h.id)).toEqual(['run']);
    expect((await readStorage())?.map((h) => h.id)).toEqual(['run']);
  });

  it('toggleDate marks a day done (kept sorted) and un-marks it', async () => {
    await seedStorage([makeHabit({ completedDates: ['2026-03-14'] })]);
    const { result } = await renderHabits();

    await act(async () => result.current.toggleDate('h1', '2026-03-10'));
    expect(result.current.habits[0].completedDates).toEqual(['2026-03-10', '2026-03-14']);

    await act(async () => result.current.toggleDate('h1', '2026-03-14'));
    expect(result.current.habits[0].completedDates).toEqual(['2026-03-10']);

    expect((await readStorage())?.[0].completedDates).toEqual(['2026-03-10']);
  });

  it('toggleDate does not touch other habits', async () => {
    await seedStorage([YOGA, RUN]);
    const { result } = await renderHabits();
    await act(async () => result.current.toggleDate('yoga', TODAY));
    expect(result.current.habits.find((h) => h.id === 'run')).toEqual(RUN);
  });

  it('logEntry marks the day done and records minutes and note', async () => {
    await seedStorage([YOGA]);
    const { result } = await renderHabits();

    await act(async () =>
      result.current.logEntry('yoga', TODAY, { minutes: 20, note: 'felt great' })
    );

    expect(result.current.habits[0]).toMatchObject({
      completedDates: [TODAY],
      minutes: { [TODAY]: 20 },
      notes: { [TODAY]: 'felt great' },
    });
    expect((await readStorage())?.[0].minutes).toEqual({ [TODAY]: 20 });
  });

  it('logEntry on an already-done day does not duplicate it and keeps earlier logs', async () => {
    await seedStorage([
      makeHabit({
        completedDates: ['2026-03-14', TODAY],
        minutes: { '2026-03-14': 10 },
        notes: { '2026-03-14': 'easy' },
      }),
    ]);
    const { result } = await renderHabits();

    await act(async () => result.current.logEntry('h1', TODAY, { minutes: 0 }));

    expect(result.current.habits[0]).toMatchObject({
      completedDates: ['2026-03-14', TODAY],
      minutes: { '2026-03-14': 10, [TODAY]: 0 },
      notes: { '2026-03-14': 'easy' },
    });
  });

  it('logEntry with no details just marks the day done', async () => {
    await seedStorage([makeHabit()]);
    const { result } = await renderHabits();
    await act(async () => result.current.logEntry('h1', TODAY, {}));
    expect(result.current.habits[0].completedDates).toEqual([TODAY]);
    expect(result.current.habits[0].minutes).toEqual({});
    expect(result.current.habits[0].notes).toEqual({});
  });

  it('logEntry for an unknown habit changes nothing', async () => {
    await seedStorage([YOGA]);
    const { result } = await renderHabits();
    await act(async () => result.current.logEntry('missing', TODAY, { minutes: 5 }));
    expect(result.current.habits).toEqual([YOGA]);
  });

  it('updateDay sets completed + note, and clearing the note removes it', async () => {
    await seedStorage([makeHabit()]);
    const { result } = await renderHabits();

    await act(async () =>
      result.current.updateDay('h1', '2026-03-10', { completed: true, note: 'chapter 2' })
    );
    expect(result.current.habits[0]).toMatchObject({
      completedDates: ['2026-03-10'],
      notes: { '2026-03-10': 'chapter 2' },
    });

    await act(async () =>
      result.current.updateDay('h1', '2026-03-10', { completed: false, note: '' })
    );
    expect(result.current.habits[0].completedDates).toEqual([]);
    expect(result.current.habits[0].notes).toEqual({});
    expect((await readStorage())?.[0].notes).toEqual({});
  });

  it('updateDay can keep a note while un-marking the day', async () => {
    await seedStorage([
      makeHabit({
        completedDates: ['2026-03-10'],
        notes: { '2026-03-10': 'keep me' },
      }),
    ]);
    const { result } = await renderHabits();

    await act(async () =>
      result.current.updateDay('h1', '2026-03-10', { completed: false, note: 'keep me' })
    );
    expect(result.current.habits[0]).toMatchObject({
      completedDates: [],
      notes: { '2026-03-10': 'keep me' },
    });
  });
});

describe('useHabits', () => {
  it('throws outside of HabitsProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useHabits())).rejects.toThrow(
      'useHabits must be used within HabitsProvider'
    );
  });
});
