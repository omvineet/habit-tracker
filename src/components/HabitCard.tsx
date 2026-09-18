import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Habit } from '../types';
import { ProgressBar } from './ProgressBar';
import { currentStreak } from '../utils/date';

export function HabitCard({ habit, onPress }: { habit: Habit; onPress: () => void }) {
  const completed = habit.completedDates.length;
  const streak = currentStreak(habit.completedDates);
  const progress = completed / habit.targetDays;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>{habit.name}</Text>
          <Text style={styles.subtitle}>
            {completed}/{habit.targetDays} days · 🔥 {streak} day streak
          </Text>
        </View>
      </View>
      <ProgressBar progress={progress} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
