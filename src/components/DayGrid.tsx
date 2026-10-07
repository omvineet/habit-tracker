import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import {
  addMonths,
  buildMonthGrid,
  formatMonthYear,
  startOfMonth,
  todayStr,
} from '../utils/date';
import { colors, fonts, radii } from '../theme';

type Props = {
  createdAt: string;
  completedDates: string[];
  notes?: Record<string, string>;
  onSelectDate: (dateStr: string) => void;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
        {WEEKDAYS.map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekday}>
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
    gap: 10,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.panel,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radii.tight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.asphalt,
    borderWidth: 1,
    borderColor: colors.line,
  },
  navDisabled: {
    opacity: 0.35,
  },
  navText: {
    fontSize: 22,
    color: colors.volt,
    fontFamily: fonts.bodyBold,
    lineHeight: 26,
  },
  monthLabel: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.chalk,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: colors.mute,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
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
    borderRadius: radii.sharp,
  },
  cellDone: {
    backgroundColor: colors.volt,
  },
  cellToday: {
    borderWidth: 2,
    borderColor: colors.heat,
  },
  cellDisabled: {
    opacity: 0.28,
  },
  cellText: {
    fontSize: 15,
    color: colors.chalk,
    fontFamily: fonts.bodyBold,
  },
  cellTextDone: {
    color: colors.ink,
  },
  cellTextDisabled: {
    color: colors.mute,
  },
  noteDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: colors.heat,
  },
  noteDotDone: {
    backgroundColor: colors.ink,
  },
});
