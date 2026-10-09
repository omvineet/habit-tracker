export const APP_LINK_SCHEME = 'habittracker';

export type AppLink =
  | { type: 'open'; feature: 'home' | 'quicklog' }
  | { type: 'habit'; query: string }
  | { type: 'log'; text: string };

// Deep links are the contract between Android App Actions (see
// plugins/withAppActions.js) and the app:
//   habittracker://open?feature=quick_log|habits   (OPEN_APP_FEATURE)
//   habittracker://habit?name=<id or words>        (GET_THING)
//   habittracker://log?name=<habit>&description=<details>  (CREATE_THING)
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
    case 'log': {
      const text = [params.name, params.description, params.text]
        .map((part) => (part ?? '').trim())
        .filter(Boolean)
        .join(' ');
      return text ? { type: 'log', text } : { type: 'open', feature: 'quicklog' };
    }
    default:
      return null;
  }
}

// Assistant passes the matched shortcut id; free text arrives as-is when nothing matched.
function featureFromParam(raw: string | undefined): 'home' | 'quicklog' {
  const feature = (raw ?? '').toLowerCase();
  return /log|voice|record|track/.test(feature) ? 'quicklog' : 'home';
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
