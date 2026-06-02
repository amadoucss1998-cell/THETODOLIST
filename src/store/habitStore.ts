import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'weekends';
  createdAt: string;
  completions: string[]; // YYYY-MM-DD dates
}

interface HabitStore {
  habits: Habit[];
  addHabit: (userId: string, name: string, emoji: string, color: string, frequency: Habit['frequency']) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: string) => void;
  getUserHabits: (userId: string) => Habit[];
  getStreak: (habit: Habit) => number;
  getCompletionRate: (habit: Habit, days: number) => number;
}

function getDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isScheduledDay(habit: Habit, dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekdays') return dow >= 1 && dow <= 5;
  if (habit.frequency === 'weekends') return dow === 0 || dow === 6;
  return true;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (userId, name, emoji, color, frequency) => {
        const habit: Habit = {
          id: uuidv4(),
          userId,
          name,
          emoji,
          color,
          frequency,
          createdAt: new Date().toISOString(),
          completions: [],
        };
        set((s) => ({ habits: [...s.habits, habit] }));
      },

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      toggleHabit: (id, date) => {
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const has = h.completions.includes(date);
            return {
              ...h,
              completions: has
                ? h.completions.filter((d) => d !== date)
                : [...h.completions, date],
            };
          }),
        }));
      },

      getUserHabits: (userId) => get().habits.filter((h) => h.userId === userId),

      getStreak: (habit) => {
        const today = new Date();
        let streak = 0;
        let date = new Date(today);

        // Check today first
        const todayStr = getDateStr(today);
        const todayScheduled = isScheduledDay(habit, todayStr);
        const todayDone = habit.completions.includes(todayStr);

        // Start from yesterday if today isn't done yet (or today if done)
        if (!todayDone && todayScheduled) {
          // today is scheduled but not done - start checking from yesterday
          date = new Date(today);
          date.setDate(date.getDate() - 1);
        }

        for (let i = 0; i < 365; i++) {
          const ds = getDateStr(date);
          if (!isScheduledDay(habit, ds)) {
            date.setDate(date.getDate() - 1);
            continue;
          }
          if (!habit.completions.includes(ds)) break;
          streak++;
          date.setDate(date.getDate() - 1);
        }

        // If today is done and scheduled, count it too
        if (todayDone && todayScheduled && streak === 0) {
          streak = 1;
        } else if (todayDone && todayScheduled) {
          // already counted in loop if we started from today
        }

        return streak;
      },

      getCompletionRate: (habit, days) => {
        const today = new Date();
        let scheduled = 0;
        let completed = 0;
        for (let i = 0; i < days; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const ds = getDateStr(d);
          if (isScheduledDay(habit, ds)) {
            scheduled++;
            if (habit.completions.includes(ds)) completed++;
          }
        }
        return scheduled === 0 ? 0 : completed / scheduled;
      },
    }),
    { name: 'taskflow-habits', version: 1 }
  )
);
