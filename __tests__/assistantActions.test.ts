import {
  buildLogSeed,
  isoDurationToMinutes,
  normalizeFeature,
  parseAssistantUrl,
  resolveAssistantAction,
} from '../src/utils/assistantActions';
import { RUN, YOGA } from './helpers';

describe('isoDurationToMinutes', () => {
  it('parses ISO-8601 durations from RECORD_EXERCISE', () => {
    expect(isoDurationToMinutes('PT15M')).toBe(15);
    expect(isoDurationToMinutes('PT1H')).toBe(60);
    expect(isoDurationToMinutes('PT1H30M')).toBe(90);
    expect(isoDurationToMinutes('PT90S')).toBe(2);
  });

  it('parses a bare minute count from custom intents', () => {
    expect(isoDurationToMinutes('20')).toBe(20);
  });

  it('returns undefined for empty or invalid values', () => {
    expect(isoDurationToMinutes(undefined)).toBeUndefined();
    expect(isoDurationToMinutes('')).toBeUndefined();
    expect(isoDurationToMinutes('yesterday')).toBeUndefined();
    expect(isoDurationToMinutes('0')).toBeUndefined();
  });
});

describe('normalizeFeature', () => {
  it('maps OPEN_APP_FEATURE shortcut ids and synonyms', () => {
    expect(normalizeFeature('quick_log')).toBe('quick_log');
    expect(normalizeFeature('Quick Log')).toBe('quick_log');
    expect(normalizeFeature('voice log')).toBe('quick_log');
    expect(normalizeFeature('add_habit')).toBe('add_habit');
    expect(normalizeFeature('new habit')).toBe('add_habit');
    expect(normalizeFeature('home')).toBe('home');
    expect(normalizeFeature('my habits')).toBe('home');
  });

  it('returns null for unknown features', () => {
    expect(normalizeFeature('settings')).toBeNull();
    expect(normalizeFeature(undefined)).toBeNull();
  });
});

describe('parseAssistantUrl', () => {
  it('ignores unrelated launch URLs', () => {
    expect(parseAssistantUrl(null)).toBeNull();
    expect(parseAssistantUrl('http://localhost:8081/')).toBeNull();
    expect(parseAssistantUrl('exp://127.0.0.1:8081')).toBeNull();
  });

  it('parses OPEN_APP_FEATURE fulfillment URLs', () => {
    expect(parseAssistantUrl('habittracker://feature?feature=quick_log')).toEqual({
      kind: 'feature',
      feature: 'quick_log',
    });
    expect(parseAssistantUrl('habittracker://feature?feature=add_habit')).toEqual({
      kind: 'feature',
      feature: 'add_habit',
    });
    expect(parseAssistantUrl('habittracker://home')).toEqual({ kind: 'home' });
  });

  it('parses CREATE_THING fulfillment URLs', () => {
    expect(parseAssistantUrl('habittracker://add?name=Meditation')).toEqual({
      kind: 'add',
      name: 'Meditation',
    });
    expect(parseAssistantUrl('habittracker://add')).toEqual({ kind: 'add' });
  });

  it('parses GET_THING fulfillment URLs', () => {
    expect(parseAssistantUrl('habittracker://search?name=yoga')).toEqual({
      kind: 'search',
      query: 'yoga',
    });
  });

  it('parses RECORD_EXERCISE and custom LOG_HABIT URLs', () => {
    expect(parseAssistantUrl('habittracker://log?name=yoga&duration=PT20M')).toEqual({
      kind: 'log',
      name: 'yoga',
      minutes: 20,
    });
    expect(parseAssistantUrl('habittracker://log?habit=morning%20run&minutes=30')).toEqual({
      kind: 'log',
      name: 'morning run',
      minutes: 30,
    });
    expect(parseAssistantUrl('habittracker://log')).toEqual({ kind: 'log' });
  });
});

describe('buildLogSeed', () => {
  it('turns assistant params into Quick Log text', () => {
    expect(buildLogSeed({ kind: 'log', name: 'yoga', minutes: 20 })).toBe('20 mins of yoga done');
    expect(buildLogSeed({ kind: 'log', name: 'yoga' })).toBe('yoga done');
    expect(buildLogSeed({ kind: 'log' })).toBeUndefined();
  });
});

describe('resolveAssistantAction', () => {
  const habits = [YOGA, RUN];

  it('opens Quick Log, optionally prefilled', () => {
    expect(resolveAssistantAction({ kind: 'feature', feature: 'quick_log' }, habits)).toEqual({
      screen: 'quicklog',
    });
    expect(
      resolveAssistantAction({ kind: 'log', name: 'yoga', minutes: 15 }, habits)
    ).toEqual({
      screen: 'quicklog',
      seedText: '15 mins of yoga done',
    });
  });

  it('opens the add-habit sheet, optionally named', () => {
    expect(resolveAssistantAction({ kind: 'feature', feature: 'add_habit' }, habits)).toEqual({
      screen: 'home',
      openAdd: true,
    });
    expect(resolveAssistantAction({ kind: 'add', name: 'Meditation' }, habits)).toEqual({
      screen: 'home',
      openAdd: true,
      addName: 'Meditation',
    });
  });

  it('opens a matching habit for GET_THING, otherwise home', () => {
    expect(resolveAssistantAction({ kind: 'search', query: 'yoga' }, habits)).toEqual({
      screen: 'detail',
      habitId: 'yoga',
    });
    expect(resolveAssistantAction({ kind: 'search', query: 'swimming' }, habits)).toEqual({
      screen: 'home',
    });
  });
});
