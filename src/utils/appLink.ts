export const APP_LINK_SCHEME = 'habittracker';

export type AppLink =
  | { type: 'open'; feature: 'home' | 'quicklog' | 'add' }
  | { type: 'habit'; query: string }
  | { type: 'log'; text: string }
  | { type: 'add'; name?: string };

// Deep links are the contract between Android App Actions (see
// plugins/withAppActions.js) and the app:
//   habittracker://open?feature=quick_log|habits|add_habit   (OPEN_APP_FEATURE)
//   habittracker://habit?name=<id or words>                 (GET_THING)
//   habittracker://log?name=<habit>&description=<details>   (CREATE_THING)
//   habittracker://log?name=<habit>&duration=PT20M          (RECORD_EXERCISE)
//   habittracker://log?habit=<habit>&minutes=20             (custom LOG_HABIT)
//   habittracker://add?name=<habit>                         (add-habit shortcut)
export function parseAppLink(url: string | null | undefined): AppLink | null {
  if (!url) return null;
  const match = url.match(/^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)[^?#]*(?:\?([^#]*))?/i);
  if (!match || match[1].toLowerCase() !== APP_LINK_SCHEME) return null;

  const params = parseQuery(match[3] ?? '');
  switch (match[2].toLowerCase()) {
    case 'open':
      return { type: 'open', feature: featureFromParam(params.feature) };
    case 'habit': {
      const query = (params.name ?? '').trim();
      return query ? { type: 'habit', query } : { type: 'open', feature: 'home' };
    }
    case 'add': {
      const name = (params.name ?? '').trim();
      return name ? { type: 'add', name } : { type: 'open', feature: 'add' };
    }
    case 'log': {
      const minutes =
        isoDurationToMinutes(params.duration) ?? isoDurationToMinutes(params.minutes);
      const durationPhrase = minutes ? `${minutes} minutes` : '';
      const text = [params.name ?? params.habit, durationPhrase, params.description, params.text]
        .map((part) => (part ?? '').trim())
        .filter(Boolean)
        .join(' ');
      return text ? { type: 'log', text } : { type: 'open', feature: 'quicklog' };
    }
    default:
      return null;
  }
}

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

// Assistant passes the matched shortcut id; free text arrives as-is when nothing matched.
function featureFromParam(raw: string | undefined): 'home' | 'quicklog' | 'add' {
  const feature = (raw ?? '').toLowerCase();
  if (/add|new habit|create habit/.test(feature)) return 'add';
  if (/log|voice|record|track/.test(feature)) return 'quicklog';
  return 'home';
}

function parseQuery(query: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    if (key && !(key in out)) out[key] = eq === -1 ? '' : decode(pair.slice(eq + 1));
  }
  return out;
}

function decode(value: string): string {
  const spaced = value.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(spaced);
  } catch {
    return spaced;
  }
}
