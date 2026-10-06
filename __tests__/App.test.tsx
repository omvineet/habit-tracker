import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';
import { makeHabit, NOW, readStorage, RUN, seedStorage, TODAY, YOGA } from './helpers';

// Simulate a build without the native speech module (Expo Go / web), so Quick Log
// falls back to typed entry. The speech path is covered in QuickLogSpeech.test.tsx.
jest.mock('expo-speech-recognition', () => {
  throw new Error('native module unavailable');
});

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

async function renderApp() {
  await render(<App />);
  await screen.findByText('My Habits');
}

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('Home screen', () => {
  it('shows the seeded 100 Days of Yoga habit on first launch', async () => {
    await renderApp();
    expect(await screen.findByText('100 Days of Yoga')).toBeOnTheScreen();
    expect(screen.getByText('0/100 days · 🔥 0 day streak')).toBeOnTheScreen();
  });

  it('shows progress and streak for each habit', async () => {
    await seedStorage([makeHabit({ completedDates: ['2026-03-13', '2026-03-14', TODAY] })]);
    await renderApp();
    expect(await screen.findByText('3/30 days · 🔥 3 day streak')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no habits', async () => {
    await seedStorage([]);
    await renderApp();
    expect(await screen.findByText('No habits yet. Tap + to add one.')).toBeOnTheScreen();
  });
});

describe('Adding a habit', () => {
  beforeEach(async () => {
    await seedStorage([YOGA]);
  });

  it('creates a habit with the chosen name, icon and target', async () => {
    await renderApp();
    await fireEvent.press(screen.getByText('+'));
    expect(screen.getByText('New habit')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByPlaceholderText('e.g. Drink 2L water'), '  Drink water  ');
    await fireEvent.press(screen.getByText('💧'));
    await fireEvent.changeText(screen.getByDisplayValue('30'), '21');
    await fireEvent.press(screen.getByText('Create'));

    expect(await screen.findByText('Drink water')).toBeOnTheScreen();
    expect(screen.getByText('0/21 days · 🔥 0 day streak')).toBeOnTheScreen();
    expect(screen.queryByText('New habit')).not.toBeOnTheScreen();

    const [added] = (await readStorage())!;
    expect(added).toMatchObject({ name: 'Drink water', emoji: '💧', targetDays: 21 });
  });

  it.each([
    ['an empty name', '   ', '30'],
    ['a zero target', 'Stretch', '0'],
    ['a non-numeric target', 'Stretch', 'abc'],
  ])('does not create a habit with %s', async (_label, name, target) => {
    await renderApp();
    await fireEvent.press(screen.getByText('+'));
    await fireEvent.changeText(screen.getByPlaceholderText('e.g. Drink 2L water'), name);
    await fireEvent.changeText(screen.getByDisplayValue('30'), target);
    await fireEvent.press(screen.getByText('Create'));

    expect(screen.getByText('New habit')).toBeOnTheScreen();
    expect((await readStorage())!.map((h) => h.id)).toEqual(['yoga']);
  });

  it('cancel closes the form and discards input', async () => {
    await renderApp();
    await fireEvent.press(screen.getByText('+'));
    await fireEvent.changeText(screen.getByPlaceholderText('e.g. Drink 2L water'), 'Stretch');
    await fireEvent.press(screen.getByText('Cancel'));

    expect(screen.queryByText('New habit')).not.toBeOnTheScreen();
    expect(screen.queryByText('Stretch')).not.toBeOnTheScreen();
  });
});

describe('Habit detail screen', () => {
  let alert: jest.SpiedFunction<typeof Alert.alert>;

  beforeEach(async () => {
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    // Started 2026-03-01, so day 15 is today and day 16 onward is in the future.
    await seedStorage([makeHabit(), RUN]);
  });

  afterEach(() => {
    alert.mockRestore();
  });

  async function openReadBooks() {
    await renderApp();
    await fireEvent.press(await screen.findByText('Read Books'));
    await screen.findByText('Mark today done');
  }

  it('marks today done and undoes it', async () => {
    await openReadBooks();

    await fireEvent.press(screen.getByText('Mark today done'));
    expect(screen.getByText('✓ Done today')).toBeOnTheScreen();
    expect(screen.getByText('1/30 days complete · 🔥 1 day streak')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('✓ Done today'));
    expect(screen.getByText('Mark today done')).toBeOnTheScreen();
    expect(screen.getByText('0/30 days complete · 🔥 0 day streak')).toBeOnTheScreen();
  });

  it('toggles a past day from the grid and persists it', async () => {
    await openReadBooks();

    await fireEvent.press(screen.getByText('10')); // 2026-03-10
    expect(screen.getByText('1/30 days complete · 🔥 0 day streak')).toBeOnTheScreen();
    expect((await readStorage())![0].completedDates).toEqual(['2026-03-10']);
  });

  it('does not allow marking future days', async () => {
    await openReadBooks();
    await fireEvent.press(screen.getByText('16')); // 2026-03-16 (tomorrow)
    expect(screen.getByText('0/30 days complete · 🔥 0 day streak')).toBeOnTheScreen();
  });

  it('shows recent logs with minutes and notes, newest first', async () => {
    await seedStorage([
      makeHabit({
        completedDates: ['2026-03-12', '2026-03-14'],
        minutes: { '2026-03-12': 10, '2026-03-14': 25 },
        notes: { '2026-03-14': 'great chapter' },
      }),
    ]);
    await openReadBooks();

    expect(screen.getByText('Recent logs')).toBeOnTheScreen();
    const minutes = screen.getAllByText(/^\d+ min$/).map((n) => n.props.children.join(''));
    expect(minutes).toEqual(['25 min', '10 min']);
    expect(screen.getByText('great chapter')).toBeOnTheScreen();
  });

  it('goes back to the home screen', async () => {
    await openReadBooks();
    await fireEvent.press(screen.getByText('‹ Back'));
    expect(await screen.findByText('My Habits')).toBeOnTheScreen();
  });

  it('deletes the habit after confirmation', async () => {
    await openReadBooks();
    await fireEvent.press(screen.getByText('Delete habit'));

    expect(alert).toHaveBeenCalledWith(
      'Delete habit',
      expect.stringContaining('Read Books'),
      expect.any(Array)
    );
    const buttons = alert.mock.calls[0][2]!;
    await act(async () => buttons.find((b) => b.text === 'Delete')!.onPress!());

    expect(await screen.findByText('My Habits')).toBeOnTheScreen();
    expect(screen.queryByText('Read Books')).not.toBeOnTheScreen();
    expect(screen.getByText('Morning Run')).toBeOnTheScreen();
    expect((await readStorage())!.map((h) => h.id)).toEqual(['run']);
  });

  it('keeps the habit when deletion is cancelled', async () => {
    await openReadBooks();
    await fireEvent.press(screen.getByText('Delete habit'));

    const buttons = alert.mock.calls[0][2]!;
    expect(buttons.find((b) => b.text === 'Cancel')!.onPress).toBeUndefined();
    expect(screen.getByText('Read Books')).toBeOnTheScreen();
    expect((await readStorage())!).toHaveLength(2);
  });
});

describe('Quick Log (typed entry)', () => {
  beforeEach(async () => {
    await seedStorage([YOGA, RUN]);
  });

  async function openQuickLog() {
    await renderApp();
    await screen.findByText('100 Days of Yoga');
    await fireEvent.press(screen.getByText('🎙️'));
    await screen.findByText('What did you do?');
  }

  async function enter(text: string) {
    await fireEvent.changeText(
      screen.getByPlaceholderText('e.g. "15 mins of yoga done, felt great"'),
      text
    );
    await fireEvent.press(screen.getByText('Parse it'));
  }

  it('parses an entry and auto-saves it after the countdown', async () => {
    await openQuickLog();
    await enter('20 mins of yoga, felt great');

    expect(screen.getByText('Log 20 min 100 Days of Yoga?')).toBeOnTheScreen();
    expect(screen.getByText('Note: felt great')).toBeOnTheScreen();
    expect(screen.getByText('Auto-saving in 4s…')).toBeOnTheScreen();

    await advance(1000);
    expect(screen.getByText('Auto-saving in 3s…')).toBeOnTheScreen();

    await advance(3000);
    expect(screen.getByText('Logged!')).toBeOnTheScreen();

    await advance(1200);
    expect(screen.getByText('My Habits')).toBeOnTheScreen();
    expect(screen.getByText('1/100 days · 🔥 1 day streak')).toBeOnTheScreen();

    const yoga = (await readStorage())!.find((h) => h.id === 'yoga')!;
    expect(yoga).toMatchObject({
      completedDates: [TODAY],
      minutes: { [TODAY]: 20 },
      notes: { [TODAY]: 'felt great' },
    });
  });

  it('saves immediately with "Save now"', async () => {
    await openQuickLog();
    await enter('morning run 30 min');
    expect(screen.getByText('Log 30 min Morning Run?')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Save now'));
    expect(screen.getByText('Logged!')).toBeOnTheScreen();

    const run = (await readStorage())!.find((h) => h.id === 'run')!;
    expect(run.minutes).toEqual({ [TODAY]: 30 });
  });

  it('cancel stops the auto-save and returns to the input', async () => {
    await openQuickLog();
    await enter('yoga 15 min');
    await fireEvent.press(screen.getByText('Cancel'));

    await advance(10000);
    expect(screen.getByText('What did you do?')).toBeOnTheScreen();
    expect(screen.queryByText('Logged!')).not.toBeOnTheScreen();
    expect((await readStorage())!.find((h) => h.id === 'yoga')!.completedDates).toEqual([]);
  });

  it('reports entries that do not match any habit, and lets you retry', async () => {
    await openQuickLog();
    await enter('went swimming');

    expect(
      screen.getByText('Couldn\'t match "went swimming" to one of your habits.')
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Auto-saving/)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Try again'));
    expect(screen.getByText('What did you do?')).toBeOnTheScreen();
  });

  it('ignores an empty submission', async () => {
    await openQuickLog();
    await enter('   ');
    expect(screen.getByText('What did you do?')).toBeOnTheScreen();
  });

  it('closes back to the home screen without saving', async () => {
    await openQuickLog();
    await fireEvent.press(screen.getByText('Close'));
    expect(await screen.findByText('My Habits')).toBeOnTheScreen();
    expect((await readStorage())!.every((h) => h.completedDates.length === 0)).toBe(true);
  });
});
