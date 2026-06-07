import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'

export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type ViewType = 'all' | 'today' | 'upcoming' | 'starred' | 'completed'

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  priority: Priority
  completed: boolean
  starred: boolean
  dueDate?: string
  categoryId?: string
  createdAt: string
  completedAt?: string
  recurrence?: 'daily' | 'weekly' | 'monthly' | null
  subtasks?: { id: string; title: string; completed: boolean }[]
}

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  icon: string
}

interface TodoStore {
  tasks: Task[]
  categories: Category[]
  activeView: ViewType
  activeCategoryId: string | null
  currentUserId: string | null
  setActiveView: (v: ViewType) => void
  setActiveCategoryId: (id: string | null) => void
  setCurrentUserId: (id: string | null) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string) => void
  toggleStar: (id: string) => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  deleteCategory: (id: string) => void
  getUserTasks: () => Task[]
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      activeView: 'all',
      activeCategoryId: null,
      currentUserId: null,
      setActiveView: (v) => set({ activeView: v, activeCategoryId: null }),
      setActiveCategoryId: (id) => set({ activeCategoryId: id, activeView: 'all' }),
      setCurrentUserId: (id) => set({ currentUserId: id }),
      addTask: (task) =>
        set(s => ({
          tasks: [...s.tasks, { ...task, id: uuidv4(), createdAt: new Date().toISOString() }],
        })),
      updateTask: (id, patch) =>
        set(s => ({ tasks: s.tasks.map(t => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      toggleComplete: (id) =>
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          ),
        })),
      toggleStar: (id) =>
        set(s => ({ tasks: s.tasks.map(t => (t.id === id ? { ...t, starred: !t.starred } : t)) })),
      addCategory: (cat) =>
        set(s => ({ categories: [...s.categories, { ...cat, id: uuidv4() }] })),
      deleteCategory: (id) =>
        set(s => ({ categories: s.categories.filter(c => c.id !== id) })),
      getUserTasks: () => {
        const { tasks, currentUserId, activeView, activeCategoryId } = get()
        const filtered = tasks.filter(t => t.userId === currentUserId)
        if (activeCategoryId) return filtered.filter(t => t.categoryId === activeCategoryId)
        const today = new Date().toISOString().split('T')[0]
        switch (activeView) {
          case 'today':
            return filtered.filter(t => !t.completed && t.dueDate === today)
          case 'upcoming':
            return filtered.filter(t => !t.completed && t.dueDate && t.dueDate > today)
          case 'starred':
            return filtered.filter(t => t.starred && !t.completed)
          case 'completed':
            return filtered.filter(t => t.completed)
          default:
            return filtered.filter(t => !t.completed)
        }
      },
    }),
    { name: 'taskflow-todos-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
)
