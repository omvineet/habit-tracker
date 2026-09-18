import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Habit } from './types';
import { loadHabits, saveHabits } from './storage';
import { todayStr } from './utils/date';

type HabitsContextValue = {
  habits: Habit[];
  loading: boolean;
  addHabit: (name: string, emoji: string, targetDays: number) => void;
  deleteHabit: (id: string) => void;
  toggleDate: (id: string, dateStr: string) => void;
};

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits().then((h) => {
      setHabits(h);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: Habit[]) => {
    setHabits(next);
    saveHabits(next);
  }, []);

  const addHabit = useCallback(
    (name: string, emoji: string, targetDays: number) => {
      const habit: Habit = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        emoji,
        targetDays,
        createdAt: todayStr(),
        completedDates: [],
      };
      persist([habit, ...habits]);
    },
    [habits, persist]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
    },
    [habits, persist]
  );

  const toggleDate = useCallback(
    (id: string, dateStr: string) => {
      persist(
        habits.map((h) => {
          if (h.id !== id) return h;
          const has = h.completedDates.includes(dateStr);
          return {
            ...h,
            completedDates: has
              ? h.completedDates.filter((d) => d !== dateStr)
              : [...h.completedDates, dateStr].sort(),
          };
        })
      );
    },
    [habits, persist]
  );

  return (
    <HabitsContext.Provider value={{ habits, loading, addHabit, deleteHabit, toggleDate }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
