import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'

const AVATAR_COLORS = [
  '#8b5cf6', '#4f8ef7', '#2ed573', '#ff6348',
  '#ffd32a', '#06d6a0', '#f72585', '#4cc9f0',
]

interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  avatarColor: string
}

async function hashPassword(password: string): Promise<string> {
  let hash = 0
  const str = password + 'taskflow-salt-2024'
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

interface AuthStore {
  users: User[]
  currentUser: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      login: async (email, password) => {
        const hash = await hashPassword(password)
        const user = get().users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash
        )
        if (user) {
          set({ currentUser: user })
          return true
        }
        return false
      },
      register: async (email, password, name) => {
        if (get().users.find(u => u.email.toLowerCase() === email.toLowerCase())) return false
        const hash = await hashPassword(password)
        const user: User = {
          id: uuidv4(),
          email,
          name,
          passwordHash: hash,
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        }
        set(s => ({ users: [...s.users, user], currentUser: user }))
        return true
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: 'taskflow-auth', storage: createJSONStorage(() => AsyncStorage) }
  )
)
