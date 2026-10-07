import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Habit } from '../types';
import { ProgressBar } from './ProgressBar';
import { AthleticPress } from './AthleticPress';
import { currentStreak } from '../utils/date';
import { colors, fonts, radii } from '../theme';

export function HabitCard({ habit, onPress }: { habit: Habit; onPress: () => void }) {
  const completed = habit.completedDates.length;
  const streak = currentStreak(habit.completedDates);
  const progress = completed / habit.targetDays;

  return (
    <AthleticPress onPress={onPress} style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.mark}>{habit.emoji}</Text>
          <Text style={styles.streak}>
            {streak > 0 ? `${streak} DAY STREAK` : 'START STREAK'}
          </Text>
        </View>
        <Text style={styles.title}>{habit.name}</Text>
        <Text style={styles.subtitle}>
          {completed}/{habit.targetDays} days · 🔥 {streak} day streak
        </Text>
        <ProgressBar progress={progress} />
      </View>
    </AthleticPress>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radii.panel,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
  },
  accent: {
    width: 6,
    backgroundColor: colors.volt,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mark: {
    fontSize: 22,
  },
  streak: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.volt,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 30,
    color: colors.chalk,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.mute,
  },
});
