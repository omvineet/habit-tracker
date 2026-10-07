import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useHabits } from '../HabitsContext';
import { parseLogEntry } from '../utils/parseLogEntry';
import { todayStr } from '../utils/date';
import { ParsedLogEntry } from '../types';
import { AthleticPress } from '../components/AthleticPress';
import { colors, fonts, radii } from '../theme';

const AUTO_CONFIRM_SECONDS = 4;

// expo-speech-recognition needs a native module, so it isn't available in Expo Go
// or on web. Load it lazily and fall back to manual text entry when absent.
let SpeechModule: typeof import('expo-speech-recognition') | null = null;
try {
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SpeechModule = require('expo-speech-recognition');
  }
} catch {
  SpeechModule = null;
}

type Stage = 'listening' | 'review' | 'saved';

export function QuickLogScreen({ onDone }: { onDone: () => void }) {
  const { habits, logEntry } = useHabits();
  const [stage, setStage] = useState<Stage>(SpeechModule ? 'listening' : 'review');
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<ParsedLogEntry | null>(null);
  const [countdown, setCountdown] = useState(AUTO_CONFIRM_SECONDS);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wire up native speech recognition events via direct listeners (avoids
  // conditionally calling the library's hook, which isn't allowed).
  useEffect(() => {
    if (!SpeechModule) return;
    let cancelled = false;

    (async () => {
      const perm = await SpeechModule!.ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (cancelled) return;
      if (!perm.granted) {
        setSpeechError('Microphone permission was not granted. You can type instead.');
        setStage('review');
        return;
      }
      SpeechModule!.ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
      });
    })();

    const sub1 = SpeechModule.ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
      const text = event.results?.[0]?.transcript ?? '';
      setTranscript(text);
    });
    const sub2 = SpeechModule.ExpoSpeechRecognitionModule.addListener('end', () => {
      setTranscript((current) => {
        if (current.trim().length > 0) {
          setParsed(parseLogEntry(current, habits));
          setStage('review');
        } else {
          setSpeechError("Didn't catch that — you can type it instead.");
          setStage('review');
        }
        return current;
      });
    });
    const sub3 = SpeechModule.ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
      setSpeechError(event.message ?? 'Speech recognition error. You can type instead.');
      setStage('review');
    });

    return () => {
      cancelled = true;
      sub1.remove();
      sub2.remove();
      sub3.remove();
      SpeechModule?.ExpoSpeechRecognitionModule.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-confirm countdown once we have a parsed result with a matched habit.
  useEffect(() => {
    if (stage !== 'review' || !parsed || !parsed.habitId) return;
    setCountdown(AUTO_CONFIRM_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          confirmSave(parsed);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, parsed]);

  const cancelAutoConfirm = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleTranscriptSubmit = () => {
    if (!transcript.trim()) return;
    setParsed(parseLogEntry(transcript, habits));
  };

  const confirmSave = (entry: ParsedLogEntry) => {
    if (!entry.habitId) return;
    logEntry(entry.habitId, todayStr(), { minutes: entry.minutes, note: entry.note });
    setStage('saved');
    setTimeout(onDone, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AthleticPress onPress={onDone}>
          <Text style={styles.close}>Close</Text>
        </AthleticPress>

        {stage === 'listening' && (
          <View style={styles.center}>
            <Text style={styles.brand}>LOG IT</Text>
            <Text style={styles.listeningText}>Listening…</Text>
            <Text style={styles.transcriptLive}>
              {transcript || 'Say something like "15 mins of yoga done"'}
            </Text>
          </View>
        )}

        {stage === 'review' && !parsed && (
          <View style={styles.center}>
            {speechError && <Text style={styles.errorText}>{speechError}</Text>}
            <Text style={styles.brand}>QUICK LOG</Text>
            <Text style={styles.label}>What did you do?</Text>
            <TextInput
              style={styles.input}
              placeholder='e.g. "15 mins of yoga done, felt great"'
              placeholderTextColor={colors.mute}
              value={transcript}
              onChangeText={setTranscript}
              autoFocus
              onSubmitEditing={handleTranscriptSubmit}
              returnKeyType="done"
            />
            <AthleticPress style={styles.primaryButton} onPress={handleTranscriptSubmit}>
              <Text style={styles.primaryButtonText}>Parse it</Text>
            </AthleticPress>
          </View>
        )}

        {stage === 'review' && parsed && (
          <View style={styles.center}>
            {parsed.habitId ? (
              <>
                <Text style={styles.reviewHeading}>
                  Log {parsed.minutes ? `${parsed.minutes} min` : ''} {parsed.matchedHabitName}?
                </Text>
                {parsed.note && <Text style={styles.reviewNote}>Note: {parsed.note}</Text>}
                <Text style={styles.countdown}>Auto-saving in {countdown}s…</Text>
                <View style={styles.actionsRow}>
                  <AthleticPress
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => {
                      cancelAutoConfirm();
                      setParsed(null);
                      setTranscript('');
                      setStage('review');
                    }}
                  >
                    <Text style={styles.buttonSecondaryText}>Cancel</Text>
                  </AthleticPress>
                  <AthleticPress
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={() => {
                      cancelAutoConfirm();
                      confirmSave(parsed);
                    }}
                  >
                    <Text style={styles.buttonPrimaryText}>Save now</Text>
                  </AthleticPress>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.errorText}>
                  Couldn't match "{parsed.rawText}" to one of your habits.
                </Text>
                <AthleticPress
                  style={styles.primaryButton}
                  onPress={() => {
                    setParsed(null);
                  }}
                >
                  <Text style={styles.primaryButtonText}>Try again</Text>
                </AthleticPress>
              </>
            )}
          </View>
        )}

        {stage === 'saved' && (
          <View style={styles.center}>
            <Text style={styles.brand}>LOCKED</Text>
            <Text style={styles.listeningText}>Logged!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  close: {
    color: colors.volt,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 64,
    lineHeight: 64,
    color: colors.volt,
    letterSpacing: 1,
  },
  listeningText: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: colors.chalk,
    letterSpacing: 1,
  },
  transcriptLive: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.mute,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.mute,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.tight,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    width: '100%',
    backgroundColor: colors.panel,
    color: colors.chalk,
    fontFamily: fonts.body,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.heat,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  reviewHeading: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
    color: colors.chalk,
    textAlign: 'center',
  },
  reviewNote: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.mute,
    textAlign: 'center',
  },
  countdown: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mute,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.tight,
  },
  buttonSecondary: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonSecondaryText: {
    color: colors.chalk,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.volt,
  },
  buttonPrimaryText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
  },
  primaryButton: {
    backgroundColor: colors.volt,
    borderRadius: radii.tight,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
  },
});
