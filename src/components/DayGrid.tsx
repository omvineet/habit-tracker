import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import {
  addMonths,
  buildMonthGrid,
  formatMonthYear,
  startOfMonth,
  todayStr,
} from '../utils/date';

type Props = {
  createdAt: string;
  completedDates: string[];
  notes?: Record<string, string>;
  onSelectDate: (dateStr: string) => void;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DayGrid({ createdAt, completedDates, notes, onSelectDate }: Props) {
  const today = todayStr();
  const earliestMonth = startOfMonth(createdAt);
  const latestMonth = startOfMonth(today);
  const [monthCursor, setMonthCursor] = useState(() => latestMonth);

  const done = useMemo(() => new Set(completedDates), [completedDates]);
  const noted = useMemo(() => new Set(Object.keys(notes ?? {})), [notes]);
  const cells = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const canGoPrev = monthCursor > earliestMonth;
  const canGoNext = monthCursor < latestMonth;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable
          disabled={!canGoPrev}
          onPress={() => setMonthCursor((m) => addMonths(m, -1))}
          style={[styles.navButton, !canGoPrev && styles.navDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthYear(monthCursor)}</Text>
        <Pressable
          disabled={!canGoNext}
          onPress={() => setMonthCursor((m) => addMonths(m, 1))}
          style={[styles.navButton, !canGoNext && styles.navDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (!cell.inMonth) {
            return <View key={cell.dateStr} style={styles.cell} />;
          }

          const isDone = done.has(cell.dateStr);
          const hasNote = noted.has(cell.dateStr);
          const isFuture = cell.dateStr > today;
          const beforeStart = cell.dateStr < createdAt;
          const disabled = isFuture || beforeStart;

          return (
            <Pressable
              key={cell.dateStr}
              disabled={disabled}
              onPress={() => onSelectDate(cell.dateStr)}
              accessibilityRole="button"
              accessibilityLabel={cell.dateStr}
              style={[
                styles.cell,
                isDone && styles.cellDone,
                cell.dateStr === today && styles.cellToday,
                disabled && styles.cellDisabled,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  isDone && styles.cellTextDone,
                  disabled && styles.cellTextDisabled,
                ]}
              >
                {cell.day}
              </Text>
              {hasNote ? <View style={[styles.noteDot, isDone && styles.noteDotDone]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },
  navDisabled: {
    opacity: 0.35,
  },
  navText: {
    fontSize: 22,
    color: '#2E7D32',
    fontWeight: '600',
    lineHeight: 26,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285714%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellDone: {
    backgroundColor: '#2E7D32',
  },
  cellToday: {
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  cellDisabled: {
    opacity: 0.35,
  },
  cellText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  cellTextDone: {
    color: '#fff',
  },
  cellTextDisabled: {
    color: '#999',
  },
  noteDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#1565C0',
  },
  noteDotDone: {
    backgroundColor: '#C8E6C9',
  },
});
