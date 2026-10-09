import { Habit } from '../types';
import { findBestHabitMatch } from './parseLogEntry';

export type AssistantAction =
  | { kind: 'home' }
  | { kind: 'add'; name?: string }
  | { kind: 'log'; name?: string; minutes?: number; note?: string }
  | { kind: 'search'; query?: string }
  | { kind: 'feature'; feature: 'quick_log' | 'add_habit' | 'home' };

export type AppRoute =
  | { screen: 'home'; openAdd?: boolean; addName?: string }
  | { screen: 'detail'; habitId: string }
  | { screen: 'quicklog'; seedText?: string };

const FEATURE_ALIASES: Record<string, 'quick_log' | 'add_habit' | 'home'> = {
  quick_log: 'quick_log',
  quicklog: 'quick_log',
  'quick log': 'quick_log',
  log: 'quick_log',
  'voice log': 'quick_log',
  voice: 'quick_log',
  record: 'quick_log',
  mic: 'quick_log',
  add_habit: 'add_habit',
  addhabit: 'add_habit',
  'add habit': 'add_habit',
  'new habit': 'add_habit',
  'create habit': 'add_habit',
  add: 'add_habit',
  home: 'home',
  habits: 'home',
  'my habits': 'home',
  'home screen': 'home',
};

function firstParam(
  params: URLSearchParams,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = params.get(key);
    if (value && value.trim()) return value.trim();
  }
  return undefined;
}

/**
 * Convert an ISO-8601 duration (PT15M) or a bare minute count into minutes.
 */
export function isoDurationToMinutes(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    return n > 0 ? Math.round(n) : undefined;
  }
  const match = trimmed
    .toUpperCase()
    .match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) return undefined;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  const total = days * 24 * 60 + hours * 60 + minutes + seconds / 60;
  return total > 0 ? Math.round(total) : undefined;
}

export function normalizeFeature(
  value: string | undefined
): 'quick_log' | 'add_habit' | 'home' | null {
  if (!value) return null;
  const key = value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const compact = key.replace(/\s+/g, '');
  return FEATURE_ALIASES[key] ?? FEATURE_ALIASES[compact] ?? null;
}

function pathFromUrl(parsed: URL): string {
  // habittracker://log?name=yoga → hostname "log", pathname "/"
  const host = parsed.hostname.replace(/^\/+|\/+$/g, '');
  const pathName = parsed.pathname.replace(/^\/+|\/+$/g, '');
  const combined = [host, pathName].filter(Boolean).join('/');
  // Expo Go: exp://127.0.0.1:8081/--/log
  const expo = combined.split('/--/').pop() ?? combined;
  return expo.toLowerCase();
}

/**
 * Parse an App Actions / shortcut deep link into a typed assistant action.
 * Returns null for unrelated URLs (cold start without a link, web homepage, etc.).
 */
export function parseAssistantUrl(url: string | null | undefined): AssistantAction | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const path = pathFromUrl(parsed);
  const params = parsed.searchParams;
  const scheme = parsed.protocol.replace(':', '').toLowerCase();
  const isAppScheme = scheme === 'habittracker' || scheme === 'com.sevalabs.habittracker';

  // Ignore unrelated http(s) URLs unless they clearly target an action path.
  if (!isAppScheme && !['log', 'add', 'feature', 'habit', 'search', 'home'].includes(path)) {
    return null;
  }

  if (path === 'feature') {
    const feature = normalizeFeature(firstParam(params, ['feature', 'featureParam']));
    return { kind: 'feature', feature: feature ?? 'home' };
  }
  if (path === 'add') {
    const name = firstParam(params, ['name', 'thing']);
    return name ? { kind: 'add', name } : { kind: 'add' };
  }
  if (path === 'search' || path === 'habit') {
    const query = firstParam(params, ['name', 'q', 'query', 'thing']);
    return query ? { kind: 'search', query } : { kind: 'search' };
  }
  if (path === 'log') {
    const name = firstParam(params, ['name', 'habit', 'exercise']);
    const minutes = isoDurationToMinutes(firstParam(params, ['duration', 'minutes']));
    const note = firstParam(params, ['note', 'description']);
    return {
      kind: 'log',
      ...(name ? { name } : {}),
      ...(minutes ? { minutes } : {}),
      ...(note ? { note } : {}),
    };
  }
  if (path === 'home' || path === '') {
    const feature = normalizeFeature(firstParam(params, ['feature']));
    if (feature) return { kind: 'feature', feature };
    return { kind: 'home' };
  }

  return isAppScheme ? { kind: 'home' } : null;
}

export function buildLogSeed(action: Extract<AssistantAction, { kind: 'log' }>): string | undefined {
  const parts: string[] = [];
  if (action.minutes && action.name) {
    parts.push(`${action.minutes} mins of ${action.name} done`);
  } else if (action.minutes) {
    parts.push(`${action.minutes} mins done`);
  } else if (action.name) {
    parts.push(`${action.name} done`);
  }
  if (action.note) parts.push(action.note);
  const seed = parts.join(', ').trim();
  return seed.length > 0 ? seed : undefined;
}

export function resolveAssistantAction(action: AssistantAction, habits: Habit[]): AppRoute {
  switch (action.kind) {
    case 'home':
      return { screen: 'home' };
    case 'add':
      return { screen: 'home', openAdd: true, addName: action.name };
    case 'log':
      return { screen: 'quicklog', seedText: buildLogSeed(action) };
    case 'search': {
      if (action.query) {
        const match = findBestHabitMatch(action.query, habits);
        if (match) return { screen: 'detail', habitId: match.id };
      }
      return { screen: 'home' };
    }
    case 'feature':
      if (action.feature === 'quick_log') return { screen: 'quicklog' };
      if (action.feature === 'add_habit') return { screen: 'home', openAdd: true };
      return { screen: 'home' };
  }
}
