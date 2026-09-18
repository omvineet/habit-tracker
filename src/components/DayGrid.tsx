import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { addDays, todayStr } from '../utils/date';

type Props = {
  createdAt: string;
  targetDays: number;
  completedDates: string[];
  onToggle: (dateStr: string) => void;
};

const CELL = 20;
const GAP = 4;

export function DayGrid({ createdAt, targetDays, completedDates, onToggle }: Props) {
  const done = new Set(completedDates);
  const today = todayStr();
  const days = Array.from({ length: targetDays }, (_, i) => addDays(createdAt, i));

  return (
    <View style={styles.wrap}>
      {days.map((dateStr, i) => {
        const isDone = done.has(dateStr);
        const isFuture = dateStr > today;
        return (
          <Pressable
            key={dateStr}
            disabled={isFuture}
            onPress={() => onToggle(dateStr)}
            style={[
              styles.cell,
              isDone && styles.cellDone,
              isFuture && styles.cellFuture,
              dateStr === today && styles.cellToday,
            ]}
          >
            <Text style={styles.cellText}>{i + 1}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 4,
    backgroundColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDone: {
    backgroundColor: '#2E7D32',
  },
  cellFuture: {
    opacity: 0.4,
  },
  cellToday: {
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  cellText: {
    fontSize: 8,
    color: '#666',
  },
});
