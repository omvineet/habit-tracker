import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useHabits } from '../HabitsContext';
import { DayGrid } from '../components/DayGrid';
import { DayDetailModal } from '../components/DayDetailModal';
import { ProgressBar } from '../components/ProgressBar';
import { AthleticPress } from '../components/AthleticPress';
import { currentStreak, todayStr, formatNiceDate } from '../utils/date';
import { colors, fonts, motion, radii } from '../theme';

export function HabitDetailScreen({ habitId, onBack }: { habitId: string; onBack: () => void }) {
  const { habits, toggleDate, deleteHabit, updateDay } = useHabits();
  const habit = habits.find((h) => h.id === habitId);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const flash = useRef(new Animated.Value(0)).current;

  const today = todayStr();
  const doneToday = habit?.completedDates.includes(today) ?? false;

  useEffect(() => {
    if (!doneToday) return;
    flash.setValue(1);
    Animated.timing(flash, {
      toValue: 0,
      duration: motion.flashMs * 4,
      useNativeDriver: true,
    }).start();
  }, [doneToday, flash]);

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missing}>Habit not found.</Text>
        <AthleticPress onPress={onBack}>
          <Text style={styles.link}>Go back</Text>
        </AthleticPress>
      </SafeAreaView>
    );
  }

  const completed = habit.completedDates.length;
  const streak = currentStreak(habit.completedDates);

  const confirmDelete = () => {
    const doDelete = () => {
      deleteHabit(habit.id);
      onBack();
    };
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) doDelete();
    } else {
      Alert.alert('Delete habit', `Delete "${habit.name}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const logDates = [
    ...new Set([...Object.keys(habit.notes ?? {}), ...Object.keys(habit.minutes ?? {})]),
  ]
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flash,
          {
            opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <AthleticPress onPress={onBack}>
          <Text style={styles.link}>‹ Back</Text>
        </AthleticPress>

        <Text style={styles.kicker}>{habit.emoji} CHALLENGE</Text>
        <Text style={styles.title}>{habit.name}</Text>
        <Text style={styles.subtitle}>
          {completed}/{habit.targetDays} days complete · 🔥 {streak} day streak
        </Text>

        <ProgressBar progress={completed / habit.targetDays} />

        <AthleticPress
          style={[styles.checkButton, doneToday && styles.checkButtonDone]}
          onPress={() => toggleDate(habit.id, today)}
        >
          <Text style={[styles.checkButtonText, doneToday && styles.checkButtonTextDone]}>
            {doneToday ? '✓ Done today' : 'Mark today done'}
          </Text>
        </AthleticPress>

        <Text style={styles.sectionTitle}>Calendar</Text>
        <DayGrid
          createdAt={habit.createdAt}
          completedDates={habit.completedDates}
          notes={habit.notes}
          onSelectDate={setSelectedDate}
        />
        <Text style={styles.hint}>Tap a date to mark it done and add a note.</Text>

        {logDates.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Recent logs</Text>
            {logDates.map((d) => (
              <AthleticPress key={d} style={styles.logRow} onPress={() => setSelectedDate(d)}>
                <Text style={styles.logDate}>{formatNiceDate(d)}</Text>
                <View style={styles.logDetails}>
                  {habit.minutes?.[d] !== undefined && (
                    <Text style={styles.logMinutes}>{habit.minutes[d]} min</Text>
                  )}
                  {habit.notes?.[d] ? (
                    <Text style={styles.logNote}>{habit.notes[d]}</Text>
                  ) : (
                    <Text style={styles.logNoteEmpty}>No note</Text>
                  )}
                </View>
              </AthleticPress>
            ))}
          </>
        ) : null}

        <AthleticPress style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteButtonText}>Delete habit</Text>
        </AthleticPress>
      </ScrollView>

      <DayDetailModal
        visible={selectedDate != null}
        dateStr={selectedDate}
        completed={selectedDate ? habit.completedDates.includes(selectedDate) : false}
        note={selectedDate ? (habit.notes?.[selectedDate] ?? '') : ''}
        onClose={() => setSelectedDate(null)}
        onSave={(details) => {
          if (selectedDate) updateDay(habit.id, selectedDate, details);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.volt,
    zIndex: 2,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 12,
  },
  missing: {
    color: colors.chalk,
    fontFamily: fonts.body,
    padding: 20,
  },
  link: {
    color: colors.volt,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.volt,
    marginTop: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 44,
    color: colors.chalk,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.mute,
  },
  checkButton: {
    backgroundColor: colors.volt,
    borderRadius: radii.tight,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  checkButtonDone: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.volt,
  },
  checkButtonText: {
    color: colors.ink,
    fontSize: 18,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.2,
  },
  checkButtonTextDone: {
    color: colors.volt,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.chalk,
    marginTop: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mute,
  },
  deleteButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: colors.heat,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
  },
  logRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  logDate: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.volt,
    width: 64,
  },
  logDetails: {
    flex: 1,
  },
  logMinutes: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.chalk,
    letterSpacing: 1,
  },
  logNote: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.chalk,
  },
  logNoteEmpty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mute,
  },
});
