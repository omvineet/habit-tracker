import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useHabits } from '../HabitsContext';
import { HabitCard } from '../components/HabitCard';
import { AddHabitModal } from '../components/AddHabitModal';

export function HomeScreen({ onOpenHabit }: { onOpenHabit: (id: string) => void }) {
  const { habits, loading, addHabit } = useHabits();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Habits</Text>
          <Text style={styles.subtitle}>Small daily wins add up.</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => setShowAdd(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {!loading && habits.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No habits yet. Tap + to add one.</Text>
        </View>
      )}

      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HabitCard habit={item} onPress={() => onOpenHabit(item.id)} />}
      />

      <AddHabitModal visible={showAdd} onClose={() => setShowAdd(false)} onCreate={addHabit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  empty: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
});
