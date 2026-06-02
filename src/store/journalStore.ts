import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Mood = 'amazing' | 'good' | 'okay' | 'bad' | 'awful';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  userId: string;
  content: string;
  mood: Mood | null;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const NOTE_COLORS = ['#1e1e35', '#1a2535', '#1a2820', '#2a1a1a', '#251a2a'];

interface JournalStore {
  entries: JournalEntry[];
  notes: Note[];
  activeJournalDate: string;

  setActiveJournalDate: (date: string) => void;

  // Journal
  getEntry: (date: string, userId: string) => JournalEntry | undefined;
  upsertEntry: (date: string, userId: string, content: string, mood: Mood | null) => void;
  deleteEntry: (id: string) => void;

  // Notes
  getUserNotes: (userId: string) => Note[];
  addNote: (userId: string) => Note;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>) => void;
  deleteNote: (id: string) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      notes: [],
      activeJournalDate: new Date().toISOString().split('T')[0],

      setActiveJournalDate: (date) => set({ activeJournalDate: date }),

      getEntry: (date, userId) =>
        get().entries.find((e) => e.date === date && e.userId === userId),

      upsertEntry: (date, userId, content, mood) => {
        const existing = get().getEntry(date, userId);
        const now = new Date().toISOString();
        if (existing) {
          set((s) => ({
            entries: s.entries.map((e) =>
              e.id === existing.id ? { ...e, content, mood, updatedAt: now } : e
            ),
          }));
        } else {
          const entry: JournalEntry = { id: uuidv4(), date, userId, content, mood, updatedAt: now };
          set((s) => ({ entries: [...s.entries, entry] }));
        }
      },

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      getUserNotes: (userId) => {
        const notes = get().notes.filter((n) => n.userId === userId);
        return [...notes].sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },

      addNote: (userId) => {
        const note: Note = {
          id: uuidv4(),
          userId,
          title: '',
          content: '',
          color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: 'taskflow-journal', version: 1 }
  )
);
