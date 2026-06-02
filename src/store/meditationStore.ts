import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface MeditationSession {
  id: string;
  userId: string;
  meditationId: string;
  duration: number; // seconds actually meditated
  completedAt: string; // ISO
}

interface MeditationStore {
  sessions: MeditationSession[];
  logSession: (userId: string, meditationId: string, duration: number) => void;
  getUserSessions: (userId: string) => MeditationSession[];
  getTotalMinutes: (userId: string) => number;
  getStreak: (userId: string) => number;
}

export const useMeditationStore = create<MeditationStore>()(
  persist(
    (set, get) => ({
      sessions: [],

      logSession: (userId, meditationId, duration) => {
        const session: MeditationSession = {
          id: uuidv4(),
          userId,
          meditationId,
          duration,
          completedAt: new Date().toISOString(),
        };
        set((state) => ({ sessions: [...state.sessions, session] }));
      },

      getUserSessions: (userId) => {
        return get().sessions.filter((s) => s.userId === userId);
      },

      getTotalMinutes: (userId) => {
        const sessions = get().sessions.filter((s) => s.userId === userId);
        const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
        return Math.floor(totalSeconds / 60);
      },

      getStreak: (userId) => {
        const sessions = get().sessions.filter((s) => s.userId === userId);
        if (sessions.length === 0) return 0;

        // Get unique days (YYYY-MM-DD)
        const days = new Set(
          sessions.map((s) => s.completedAt.slice(0, 10))
        );

        let streak = 0;
        const today = new Date();
        let current = new Date(today);

        while (true) {
          const dateStr = current.toISOString().slice(0, 10);
          if (days.has(dateStr)) {
            streak++;
            current.setDate(current.getDate() - 1);
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    { name: 'taskflow-meditation' }
  )
);
