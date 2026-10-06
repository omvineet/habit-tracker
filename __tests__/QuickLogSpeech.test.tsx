import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';
import { NOW, readStorage, RUN, seedStorage, TODAY, YOGA } from './helpers';

// A controllable fake of the native speech module: tests emit recognition events.
jest.mock('expo-speech-recognition', () => {
  const listeners: Record<string, (event: any) => void> = {};
  return {
    __listeners: listeners,
    ExpoSpeechRecognitionModule: {
      requestPermissionsAsync: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      addListener: jest.fn((event: string, cb: (e: any) => void) => {
        listeners[event] = cb;
        return { remove: () => delete listeners[event] };
      }),
    },
  };
});

const speech = jest.requireMock('expo-speech-recognition');
const speechModule = speech.ExpoSpeechRecognitionModule;

async function emit(event: string, payload: any = {}) {
  await act(async () => speech.__listeners[event](payload));
}

async function openQuickLog() {
  await render(<App />);
  await screen.findByText('100 Days of Yoga');
  await fireEvent.press(screen.getByText('🎙️'));
}

beforeEach(async () => {
  jest.useFakeTimers({ now: NOW });
  jest.clearAllMocks();
  speechModule.requestPermissionsAsync.mockResolvedValue({ granted: true });
  await seedStorage([YOGA, RUN]);
});

afterEach(() => {
  jest.useRealTimers();
});

it('listens, shows the live transcript, then parses and auto-saves', async () => {
  await openQuickLog();

  expect(await screen.findByText('Listening…')).toBeOnTheScreen();
  expect(speechModule.requestPermissionsAsync).toHaveBeenCalled();
  expect(speechModule.start).toHaveBeenCalledWith(
    expect.objectContaining({ lang: 'en-US', interimResults: true })
  );

  await emit('result', { results: [{ transcript: '25 mins of yoga' }] });
  expect(screen.getByText('25 mins of yoga')).toBeOnTheScreen();

  await emit('end');
  expect(screen.getByText('Log 25 min 100 Days of Yoga?')).toBeOnTheScreen();

  await act(async () => {
    jest.advanceTimersByTime(4000);
  });
  expect(screen.getByText('Logged!')).toBeOnTheScreen();
  expect((await readStorage())!.find((h) => h.id === 'yoga')!.minutes).toEqual({ [TODAY]: 25 });

  await act(async () => {
    jest.advanceTimersByTime(1200);
  });
  expect(screen.getByText('My Habits')).toBeOnTheScreen();
  expect(speechModule.stop).toHaveBeenCalled();
});

it('falls back to typing when microphone permission is denied', async () => {
  speechModule.requestPermissionsAsync.mockResolvedValue({ granted: false });
  await openQuickLog();

  expect(
    await screen.findByText('Microphone permission was not granted. You can type instead.')
  ).toBeOnTheScreen();
  expect(screen.getByText('What did you do?')).toBeOnTheScreen();
  expect(speechModule.start).not.toHaveBeenCalled();
});

it('asks you to type when nothing was heard', async () => {
  await openQuickLog();
  await screen.findByText('Listening…');

  await emit('end');
  expect(screen.getByText("Didn't catch that — you can type it instead.")).toBeOnTheScreen();
  expect(screen.getByText('What did you do?')).toBeOnTheScreen();
});

it('shows recognition errors and falls back to typing', async () => {
  await openQuickLog();
  await screen.findByText('Listening…');

  await emit('error', { message: 'Network unavailable' });
  expect(screen.getByText('Network unavailable')).toBeOnTheScreen();
  expect(screen.getByText('What did you do?')).toBeOnTheScreen();
});

it('stops listening when closed', async () => {
  await openQuickLog();
  await screen.findByText('Listening…');

  await fireEvent.press(screen.getByText('Close'));
  expect(await screen.findByText('My Habits')).toBeOnTheScreen();
  expect(speechModule.stop).toHaveBeenCalled();
  expect(speech.__listeners).toEqual({});
});
