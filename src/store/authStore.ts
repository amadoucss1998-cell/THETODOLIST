import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, AVATAR_COLORS } from '../types';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'taskflow-salt-2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AuthStore {
  currentUser: User | null;
  users: User[];

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateName: (name: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],

      login: async (email, password) => {
        const users = get().users;
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        if (!user) return { success: false, error: 'No account found with that email.' };
        const hash = await hashPassword(password);
        if (hash !== user.passwordHash) return { success: false, error: 'Incorrect password.' };
        set({ currentUser: user });
        return { success: true };
      },

      register: async (email, password, name) => {
        if (!name.trim()) return { success: false, error: 'Please enter your name.' };
        if (!email.includes('@')) return { success: false, error: 'Please enter a valid email.' };
        if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

        const users = get().users;
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const passwordHash = await hashPassword(password);
        const newUser: User = {
          id: uuidv4(),
          email: email.toLowerCase().trim(),
          name: name.trim(),
          passwordHash,
          avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));
        return { success: true };
      },

      logout: () => set({ currentUser: null }),

      updateName: (name) => {
        const user = get().currentUser;
        if (!user) return;
        const updated = { ...user, name };
        set((state) => ({
          currentUser: updated,
          users: state.users.map((u) => (u.id === updated.id ? updated : u)),
        }));
      },
    }),
    { name: 'taskflow-auth', version: 1 }
  )
);
