import { parseLogEntry } from '../src/utils/parseLogEntry';
import { makeHabit, RUN, YOGA } from './helpers';

const HABITS = [YOGA, RUN];

describe('parseLogEntry — habit matching', () => {
  it('matches a habit by a word in its name', () => {
    const r = parseLogEntry('15 mins of yoga done', HABITS);
    expect(r.habitId).toBe('yoga');
    expect(r.matchedHabitName).toBe('100 Days of Yoga');
  });

  it('matches a habit by a keyword', () => {
    expect(parseLogEntry('did my suryanamaskar', HABITS).habitId).toBe('yoga');
  });

  it('is case-insensitive', () => {
    expect(parseLogEntry('MORNING RUN', HABITS).habitId).toBe('run');
  });

  it('picks the habit with the most matching words', () => {
    // "walk" scores 1 for Evening Walk; "morning" + "run" score 2 for Morning Run.
    const walk = makeHabit({ id: 'walk', name: 'Evening Walk' });
    expect(parseLogEntry('walk then my morning run', [walk, RUN]).habitId).toBe('run');
  });

  it('weights multi-word keywords higher', () => {
    expect(parseLogEntry('surya namaskar then a short run', HABITS).habitId).toBe('yoga');
  });

  it('returns null when nothing matches', () => {
    const r = parseLogEntry('went swimming', HABITS);
    expect(r.habitId).toBeNull();
    expect(r.matchedHabitName).toBeUndefined();
    expect(r.note).toBe('went swimming');
  });

  it('returns null with no habits', () => {
    expect(parseLogEntry('yoga', []).habitId).toBeNull();
  });

  it('ignores stopwords and short words in habit names', () => {
    // "100", "days" and "of" must not match the Yoga habit on their own.
    expect(parseLogEntry('100 days of reading', [YOGA]).habitId).toBeNull();
  });

  it('handles regex special characters in keywords', () => {
    const code = makeHabit({ id: 'code', name: 'Code', keywords: ['c++'] });
    const r = parseLogEntry('c++ practice', [code]);
    expect(r.habitId).toBe('code');
    expect(r.note).toBe('practice');
  });
});

describe('parseLogEntry — duration', () => {
  it.each([
    ['15 mins of yoga', 15],
    ['yoga 1 minute', 1],
    ['yoga for 45 minutes', 45],
    ['yoga 20 min', 20],
    ['yoga 5min', 5],
    ['Yoga 30 MINS', 30],
  ])('parses "%s" as %i minutes', (text, minutes) => {
    expect(parseLogEntry(text, HABITS).minutes).toBe(minutes);
  });

  it('leaves minutes undefined when no duration is given', () => {
    expect(parseLogEntry('yoga done', HABITS).minutes).toBeUndefined();
  });
});

describe('parseLogEntry — notes', () => {
  it('produces no note when only filler words remain', () => {
    expect(parseLogEntry('15 mins of yoga done', HABITS).note).toBeUndefined();
  });

  it('keeps free text as the note', () => {
    expect(parseLogEntry('yoga 20 min, felt great', HABITS).note).toBe('felt great');
  });

  it('puts a count phrase at the front of the note', () => {
    expect(parseLogEntry('did 12 surya namaskars, felt great', HABITS).note).toBe(
      '12 surya namaskars — felt great'
    );
  });

  it.each([
    ['30 min yoga and 10 reps', '10 reps'],
    ['yoga 3 rounds', '3 rounds'],
    ['yoga 2 sets', '2 sets'],
    ['yoga 5 times', '5 times'],
  ])('extracts the count from "%s"', (text, note) => {
    expect(parseLogEntry(text, HABITS).note).toBe(note);
  });

  it('trims the raw text', () => {
    expect(parseLogEntry('   yoga done  ', HABITS).rawText).toBe('yoga done');
  });
});
