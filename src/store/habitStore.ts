import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'

export interface Habit {
  id: string
  userId: string
  name: string
  emoji: string
  color: string
  frequency: 'daily' | 'weekdays' | 'weekends'
  createdAt: string
  completions: string[]
}

interface HabitStore {
  habits: Habit[]
  addHabit: (
    userId: string,
    name: string,
    emoji: string,
    color: string,
    frequency: Habit['frequency']
  ) => void
  deleteHabit: (id: string) => void
  toggleHabit: (id: string, date: string) => void
  getUserHabits: (userId: string) => Habit[]
  getStreak: (habit: Habit) => number
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (userId, name, emoji, color, frequency) =>
        set(s => ({
          habits: [
            ...s.habits,
            {
              id: uuidv4(),
              userId,
              name,
              emoji,
              color,
              frequency,
              createdAt: new Date().toISOString(),
              completions: [],
            },
          ],
        })),
      deleteHabit: (id) => set(s => ({ habits: s.habits.filter(h => h.id !== id) })),
      toggleHabit: (id, date) =>
        set(s => ({
          habits: s.habits.map(h =>
            h.id === id
              ? {
                  ...h,
                  completions: h.completions.includes(date)
                    ? h.completions.filter(d => d !== date)
                    : [...h.completions, date],
                }
              : h
          ),
        })),
      getUserHabits: (userId) => get().habits.filter(h => h.userId === userId),
      getStreak: (habit) => {
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const ds = d.toISOString().split('T')[0]
          if (habit.completions.includes(ds)) streak++
          else if (i > 0) break
        }
        return streak
      },
    }),
    { name: 'taskflow-habits', storage: createJSONStorage(() => AsyncStorage) }
  )
)
