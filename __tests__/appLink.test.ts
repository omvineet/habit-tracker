import { parseAppLink } from '../src/utils/appLink';
import { resolveAppLink } from '../src/navigation';
import { RUN, YOGA } from './helpers';

describe('parseAppLink', () => {
  it.each([
    ['habittracker://open?feature=quick_log', { type: 'open', feature: 'quicklog' }],
    ['habittracker://open?feature=Quick%20Log', { type: 'open', feature: 'quicklog' }],
    ['habittracker://open?feature=habits', { type: 'open', feature: 'home' }],
    ['habittracker://open', { type: 'open', feature: 'home' }],
    ['habittracker://habit?name=yoga', { type: 'habit', query: 'yoga' }],
    ['habittracker://habit?name=morning+run', { type: 'habit', query: 'morning run' }],
    ['habittracker://habit', { type: 'open', feature: 'home' }],
    ['habittracker://log?name=yoga&description=20%20minutes', { type: 'log', text: 'yoga 20 minutes' }],
    ['habittracker://log?name=yoga', { type: 'log', text: 'yoga' }],
    ['habittracker://log', { type: 'open', feature: 'quicklog' }],
    ['HabitTracker://OPEN?feature=quick_log', { type: 'open', feature: 'quicklog' }],
  ])('parses %s', (url, expected) => {
    expect(parseAppLink(url)).toEqual(expected);
  });

  it.each([
    [null],
    [undefined],
    [''],
    ['https://example.com/open?feature=quick_log'],
    ['exp+habit-tracker://expo-development-client/?url=http%3A%2F%2F10.0.0.2%3A8081'],
    ['habittracker://unknown'],
    ['not a url'],
  ])('ignores %s', (url) => {
    expect(parseAppLink(url)).toBeNull();
  });

  it('survives malformed percent-encoding', () => {
    expect(parseAppLink('habittracker://habit?name=100%')).toEqual({ type: 'habit', query: '100%' });
  });
});

describe('resolveAppLink', () => {
  const habits = [YOGA, RUN];

  it('opens quick log or home for open links', () => {
    expect(resolveAppLink({ type: 'open', feature: 'quicklog' }, habits, 3)).toEqual({
      screen: 'quicklog',
      linkId: 3,
    });
    expect(resolveAppLink({ type: 'open', feature: 'home' }, habits, 3)).toEqual({ screen: 'home' });
  });

  it('opens a habit by id, name or keyword, else home', () => {
    expect(resolveAppLink({ type: 'habit', query: 'run' }, habits, 1)).toEqual({
      screen: 'detail',
      habitId: 'run',
    });
    expect(resolveAppLink({ type: 'habit', query: 'surya namaskar' }, habits, 1)).toEqual({
      screen: 'detail',
      habitId: 'yoga',
    });
    expect(resolveAppLink({ type: 'habit', query: 'yoga' }, habits, 1)).toMatchObject({
      habitId: 'yoga',
    });
    expect(resolveAppLink({ type: 'habit', query: 'swimming' }, habits, 1)).toEqual({ screen: 'home' });
  });

  it('passes log text through to quick log', () => {
    expect(resolveAppLink({ type: 'log', text: 'yoga 20 minutes' }, habits, 2)).toEqual({
      screen: 'quicklog',
      initialText: 'yoga 20 minutes',
      linkId: 2,
    });
  });
});
