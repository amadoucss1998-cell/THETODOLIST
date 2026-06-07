import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'

export type Mood = 'amazing' | 'good' | 'okay' | 'bad' | 'awful'

export interface JournalEntry {
  id: string
  userId: string
  date: string
  mood?: Mood
  content: string
  updatedAt: string
}

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface JournalStore {
  entries: JournalEntry[]
  notes: Note[]
  getEntry: (userId: string, date: string) => JournalEntry | undefined
  saveEntry: (userId: string, date: string, content: string, mood?: Mood) => void
  getUserNotes: (userId: string) => Note[]
  addNote: (userId: string, title: string, content: string) => void
  updateNote: (id: string, title: string, content: string) => void
  deleteNote: (id: string) => void
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      notes: [],
      getEntry: (userId, date) =>
        get().entries.find(e => e.userId === userId && e.date === date),
      saveEntry: (userId, date, content, mood) => {
        const existing = get().entries.find(e => e.userId === userId && e.date === date)
        if (existing) {
          set(s => ({
            entries: s.entries.map(e =>
              e.id === existing.id
                ? { ...e, content, mood, updatedAt: new Date().toISOString() }
                : e
            ),
          }))
        } else {
          set(s => ({
            entries: [
              ...s.entries,
              {
                id: uuidv4(),
                userId,
                date,
                mood,
                content,
                updatedAt: new Date().toISOString(),
              },
            ],
          }))
        }
      },
      getUserNotes: (userId) =>
        get()
          .notes.filter(n => n.userId === userId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      addNote: (userId, title, content) =>
        set(s => ({
          notes: [
            ...s.notes,
            {
              id: uuidv4(),
              userId,
              title,
              content,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateNote: (id, title, content) =>
        set(s => ({
          notes: s.notes.map(n =>
            n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteNote: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),
    }),
    { name: 'taskflow-journal', storage: createJSONStorage(() => AsyncStorage) }
  )
)
