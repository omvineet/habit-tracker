import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useHabits } from '../HabitsContext';
import { HabitCard } from '../components/HabitCard';
import { AddHabitModal } from '../components/AddHabitModal';
import { AthleticPress } from '../components/AthleticPress';
import { colors, fonts, radii } from '../theme';

type Props = {
  onOpenHabit: (id: string) => void;
  onQuickLog: () => void;
};

export function HomeScreen({ onOpenHabit, onQuickLog }: Props) {
  const { habits, loading, addHabit } = useHabits();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.atmosphere]}>
        <View style={styles.heroWash} />
        <View style={styles.slash} />
      </View>

      <View style={styles.header}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>TRAIN</Text>
          <Text style={styles.title}>My Habits</Text>
          <Text style={styles.subtitle}>SHOW UP. STACK DAYS.</Text>
        </View>
        <AthleticPress
          style={styles.addButton}
          onPress={() => setShowAdd(true)}
          accessibilityLabel="Add habit"
        >
          <Text style={styles.addButtonText}>+</Text>
        </AthleticPress>
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

      <AthleticPress
        style={styles.quickLogButton}
        onPress={onQuickLog}
        accessibilityLabel="Quick Log"
      >
        <Text style={styles.quickLogText}>LOG</Text>
        <Text style={styles.quickLogIcon}>🎙️</Text>
      </AthleticPress>

      <AddHabitModal visible={showAdd} onClose={() => setShowAdd(false)} onCreate={addHabit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  atmosphere: {
    pointerEvents: 'none',
  },
  heroWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: colors.asphalt,
  },
  slash: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 220,
    height: 420,
    backgroundColor: colors.volt,
    opacity: 0.12,
    transform: [{ rotate: '18deg' }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandBlock: {
    flex: 1,
    paddingRight: 12,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 72,
    lineHeight: 72,
    color: colors.chalk,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.volt,
    letterSpacing: 2,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.mute,
    letterSpacing: 1.4,
    marginTop: 6,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radii.tight,
    backgroundColor: colors.volt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 30,
    fontFamily: fonts.bodyBold,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },
  empty: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emptyText: {
    color: colors.mute,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 16,
  },
  quickLogButton: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    minWidth: 88,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: radii.tight,
    backgroundColor: colors.heat,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  quickLogText: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 1,
  },
  quickLogIcon: {
    fontSize: 16,
  },
});
