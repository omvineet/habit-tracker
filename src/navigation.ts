import { Habit } from './types';
import { AppLink } from './utils/appLink';
import { findBestHabitMatch } from './utils/parseLogEntry';

export type Route =
  | { screen: 'home'; openAdd?: boolean; addName?: string; linkId?: number }
  | { screen: 'detail'; habitId: string }
  | { screen: 'quicklog'; initialText?: string; linkId?: number };

export function resolveAppLink(link: AppLink, habits: Habit[], linkId: number): Route {
  switch (link.type) {
    case 'open':
      if (link.feature === 'quicklog') return { screen: 'quicklog', linkId };
      if (link.feature === 'add') return { screen: 'home', openAdd: true, linkId };
      return { screen: 'home' };
    case 'add':
      return { screen: 'home', openAdd: true, addName: link.name, linkId };
    case 'habit': {
      const byId = habits.find((h) => h.id === link.query);
      const habit = byId ?? findBestHabitMatch(link.query, habits);
      return habit ? { screen: 'detail', habitId: habit.id } : { screen: 'home' };
    }
    case 'log':
      return { screen: 'quicklog', initialText: link.text, linkId };
  }
}
