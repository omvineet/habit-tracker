import { Habit, ParsedLogEntry } from '../types';

const STOPWORDS = new Set(['days', 'day', 'of', 'the', 'a', 'an', '100']);

function habitSearchTerms(habit: Habit): string[] {
  const nameWords = habit.name
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  const keywords = (habit.keywords ?? []).map((k) => k.toLowerCase());
  return [...nameWords, ...keywords];
}

function findBestHabitMatch(text: string, habits: Habit[]): Habit | null {
  const lower = text.toLowerCase();
  let best: { habit: Habit; score: number } | null = null;
  for (const habit of habits) {
    const terms = habitSearchTerms(habit);
    let score = 0;
    for (const term of terms) {
      if (term.length > 0 && lower.includes(term)) {
        score += term.split(' ').length; // multi-word keywords count more
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { habit, score };
    }
  }
  return best?.habit ?? null;
}

const DURATION_RE = /(\d+)\s*(minutes|minute|mins|min)\b/i;
const COUNT_RE = /(\d+)\s*(suryanamaskars?|surya\s*namaskars?|reps?|rounds?|sets?|times?)\b/i;

export function parseLogEntry(rawText: string, habits: Habit[]): ParsedLogEntry {
  const text = rawText.trim();
  const habit = findBestHabitMatch(text, habits);

  let minutes: number | undefined;
  let consumed = text;

  const durationMatch = text.match(DURATION_RE);
  if (durationMatch) {
    minutes = parseInt(durationMatch[1], 10);
    consumed = consumed.replace(durationMatch[0], '');
  }

  const countMatch = text.match(COUNT_RE);
  let countPhrase: string | undefined;
  if (countMatch) {
    countPhrase = `${countMatch[1]} ${countMatch[2]}`;
    consumed = consumed.replace(countMatch[0], '');
  }

  // Strip the words that matched the habit itself, so leftover text is the actual note.
  if (habit) {
    for (const term of habitSearchTerms(habit)) {
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
      consumed = consumed.replace(re, '');
    }
  }

  const fillerWords = /\b(done|completed|finished|log|logged|today|of|did|and)\b/gi;
  consumed = consumed.replace(fillerWords, '');

  const leftoverNote = consumed
    .replace(/[,.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const noteParts = [countPhrase, leftoverNote].filter(Boolean);
  const note = noteParts.length > 0 ? noteParts.join(' — ') : undefined;

  return {
    habitId: habit?.id ?? null,
    matchedHabitName: habit?.name,
    minutes,
    note,
    rawText: text,
  };
}
