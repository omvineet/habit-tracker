import { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useHabits } from './HabitsContext';
import { Route, resolveAppLink } from './navigation';
import { AppLink, parseAppLink } from './utils/appLink';

// Turns incoming deep links (Assistant / App Actions / launcher shortcuts) into
// navigation. Waits for habits to load so cold starts can resolve habit names.
export function AppLinkHandler({ onRoute }: { onRoute: (route: Route) => void }) {
  const { habits, loading } = useHabits();
  const [pending, setPending] = useState<AppLink | null>(null);
  const linkCount = useRef(0);

  useEffect(() => {
    let active = true;
    Linking.getInitialURL()
      .then((url) => {
        const link = parseAppLink(url);
        if (active && link) setPending(link);
      })
      .catch(() => {});
    const sub = Linking.addEventListener('url', ({ url }) => {
      const link = parseAppLink(url);
      if (link) setPending(link);
    });
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!pending || loading) return;
    linkCount.current += 1;
    onRoute(resolveAppLink(pending, habits, linkCount.current));
    setPending(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, loading]);

  return null;
}
