import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useHabits } from '../HabitsContext';
import { DayGrid } from '../components/DayGrid';
import { ProgressBar } from '../components/ProgressBar';
import { currentStreak, todayStr, formatNiceDate } from '../utils/date';

export function HabitDetailScreen({ habitId, onBack }: { habitId: string; onBack: () => void }) {
  const { habits, toggleDate, deleteHabit } = useHabits();
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Habit not found.</Text>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const completed = habit.completedDates.length;
  const streak = currentStreak(habit.completedDates);
  const today = todayStr();
  const doneToday = habit.completedDates.includes(today);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>‹ Back</Text>
        </Pressable>

        <Text style={styles.emoji}>{habit.emoji}</Text>
        <Text style={styles.title}>{habit.name}</Text>
        <Text style={styles.subtitle}>
          {completed}/{habit.targetDays} days complete · 🔥 {streak} day streak
        </Text>

        <ProgressBar progress={completed / habit.targetDays} />

        <Pressable
          style={[styles.checkButton, doneToday && styles.checkButtonDone]}
          onPress={() => toggleDate(habit.id, today)}
        >
          <Text style={styles.checkButtonText}>
            {doneToday ? '✓ Done today' : 'Mark today done'}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Progress</Text>
        <DayGrid
          createdAt={habit.createdAt}
          targetDays={habit.targetDays}
          completedDates={habit.completedDates}
          onToggle={(d) => toggleDate(habit.id, d)}
        />
        <Text style={styles.hint}>Tap any past day to toggle it.</Text>

        {(habit.notes && Object.keys(habit.notes).length > 0) ||
        (habit.minutes && Object.keys(habit.minutes).length > 0) ? (
          <>
            <Text style={styles.sectionTitle}>Recent logs</Text>
            {[...habit.completedDates]
              .filter((d) => habit.notes?.[d] || habit.minutes?.[d])
              .sort((a, b) => (a < b ? 1 : -1))
              .slice(0, 10)
              .map((d) => (
                <View key={d} style={styles.logRow}>
                  <Text style={styles.logDate}>{formatNiceDate(d)}</Text>
                  <View style={styles.logDetails}>
                    {habit.minutes?.[d] !== undefined && (
                      <Text style={styles.logMinutes}>{habit.minutes[d]} min</Text>
                    )}
                    {habit.notes?.[d] && <Text style={styles.logNote}>{habit.notes[d]}</Text>}
                  </View>
                </View>
              ))}
          </>
        ) : null}

        <Pressable style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteButtonText}>Delete habit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 12,
  },
  link: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  emoji: {
    fontSize: 48,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  checkButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  checkButtonDone: {
    backgroundColor: '#1B5E20',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: '#C62828',
    fontWeight: '600',
  },
  logRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logDate: {
    fontSize: 13,
    color: '#999',
    width: 56,
  },
  logDetails: {
    flex: 1,
  },
  logMinutes: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  logNote: {
    fontSize: 13,
    color: '#444',
  },
});
