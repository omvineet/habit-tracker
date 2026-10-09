import { Habit } from './types';
import { AppLink } from './utils/appLink';
import { findBestHabitMatch } from './utils/parseLogEntry';

export type Route =
  | { screen: 'home' }
  | { screen: 'detail'; habitId: string }
  | { screen: 'quicklog'; initialText?: string; linkId?: number };

export function resolveAppLink(link: AppLink, habits: Habit[], linkId: number): Route {
  switch (link.type) {
    case 'open':
      return link.feature === 'quicklog' ? { screen: 'quicklog', linkId } : { screen: 'home' };
    case 'habit': {
      const byId = habits.find((h) => h.id === link.query);
      const habit = byId ?? findBestHabitMatch(link.query, habits);
      return habit ? { screen: 'detail', habitId: habit.id } : { screen: 'home' };
    }
    case 'log':
      return { screen: 'quicklog', initialText: link.text, linkId };
  }
}
