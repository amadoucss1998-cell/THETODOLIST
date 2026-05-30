import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, Category, Priority, ViewType, SortOrder, Stats } from '../types';
import { isToday, isFuture, addDays, startOfDay, parseISO } from 'date-fns';

type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>;

interface TodoStore {
  tasks: Task[];
  categories: Category[];
  activeView: ViewType;
  activeCategoryId: string | null;
  searchQuery: string;
  filterPriority: Priority | null;
  sortOrder: SortOrder;
  isModalOpen: boolean;
  editingTask: Task | null;
  sidebarOpen: boolean;
  currentUserId: string | null;

  addTask: (data: TaskInput) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleStar: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  clearCompleted: () => void;

  addCategory: (data: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  setActiveView: (view: ViewType) => void;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: Priority | null) => void;
  setSortOrder: (order: SortOrder) => void;
  setCurrentUserId: (id: string | null) => void;
  openModal: (task?: Task | null) => void;
  closeModal: () => void;
  toggleSidebar: () => void;

  getFilteredTasks: () => Task[];
  getStats: () => Stats;
  getCategoryTaskCount: (categoryId: string) => number;
  getViewCount: (view: ViewType) => number;
  getUserTasks: () => Task[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#4f8ef7', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#8b5cf6', icon: '✨' },
  { id: 'health', name: 'Health', color: '#2ed573', icon: '💪' },
  { id: 'shopping', name: 'Shopping', color: '#ffd32a', icon: '🛍️' },
  { id: 'finance', name: 'Finance', color: '#ff6348', icon: '💰' },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
const in3Days = addDays(new Date(), 3).toISOString().split('T')[0];

const DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Review Q2 product roadmap',
    description: 'Go through all the feature requests and prioritize based on user impact and effort.',
    completed: false, starred: true, priority: 'urgent',
    dueDate: today, categoryId: 'work', tags: ['strategy', 'planning'],
    subtasks: [
      { id: 'd1a', title: 'Review user feedback', completed: true },
      { id: 'd1b', title: 'Align with engineering team', completed: false },
      { id: 'd1c', title: 'Prepare presentation', completed: false },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: 0,
  },
  {
    id: 'demo-2',
    title: 'Morning workout — chest & back',
    description: 'Bench press 4x8, pull-ups 4x10, cable rows 3x12.',
    completed: true, starred: false, priority: 'high',
    dueDate: today, categoryId: 'health', tags: ['fitness'],
    subtasks: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: 1,
  },
  {
    id: 'demo-3',
    title: 'Design new landing page mockups',
    description: 'Create high-fidelity mockups for the new marketing landing page.',
    completed: false, starred: false, priority: 'high',
    dueDate: tomorrow, categoryId: 'work', tags: ['design', 'ui'],
    subtasks: [
      { id: 'd3a', title: 'Sketch wireframes', completed: true },
      { id: 'd3b', title: 'Build in Figma', completed: false },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: 2,
  },
  {
    id: 'demo-4',
    title: 'Grocery shopping',
    description: 'Vegetables, fruits, protein sources, and snacks for the week.',
    completed: false, starred: false, priority: 'medium',
    dueDate: tomorrow, categoryId: 'shopping', tags: ['weekly'],
    subtasks: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: 3,
  },
  {
    id: 'demo-5',
    title: 'Fix authentication bug in API',
    description: 'JWT tokens expiring too early — investigate middleware logic.',
    completed: false, starred: false, priority: 'urgent',
    dueDate: today, categoryId: 'work', tags: ['bug', 'backend'],
    subtasks: [
      { id: 'd5a', title: 'Reproduce the issue', completed: true },
      { id: 'd5b', title: 'Review JWT middleware', completed: false },
      { id: 'd5c', title: 'Write test coverage', completed: false },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: 4,
  },
  {
    id: 'demo-6',
    title: 'Read “Atomic Habits” — Chapter 12',
    description: 'Take notes on habit stacking and environment design.',
    completed: false, starred: true, priority: 'low',
    dueDate: in3Days, categoryId: 'personal', tags: ['reading', 'growth'],
    subtasks: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), order: 5,
  },
];

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      tasks: DEMO_TASKS,
      categories: DEFAULT_CATEGORIES,
      activeView: 'all',
      activeCategoryId: null,
      searchQuery: '',
      filterPriority: null,
      sortOrder: 'smart',
      isModalOpen: false,
      editingTask: null,
      sidebarOpen: true,
      currentUserId: null,

      addTask: (data) => {
        const tasks = get().tasks;
        const userId = get().currentUserId;
        const newTask: Task = {
          ...data,
          userId: userId ?? undefined,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: tasks.length,
        };
        set({ tasks: [newTask, ...tasks.map((t) => ({ ...t, order: t.order + 1 }))] });
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      toggleStar: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, starred: !t.starred, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      addSubtask: (taskId, title) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, { id: uuidv4(), title, completed: false }], updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s), updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId), updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      reorderTasks: (activeId, overId) => {
        set((state) => {
          const tasks = [...state.tasks];
          const activeIndex = tasks.findIndex((t) => t.id === activeId);
          const overIndex = tasks.findIndex((t) => t.id === overId);
          if (activeIndex === -1 || overIndex === -1) return state;
          const [removed] = tasks.splice(activeIndex, 1);
          tasks.splice(overIndex, 0, removed);
          return { tasks: tasks.map((t, i) => ({ ...t, order: i })) };
        });
      },

      clearCompleted: () => {
        const userId = get().currentUserId;
        set((state) => ({
          tasks: state.tasks.filter((t) => {
            if (userId ? t.userId === userId : !t.userId) {
              return !t.completed;
            }
            return true;
          }),
        }));
      },

      addCategory: (data) => {
        set((state) => ({ categories: [...state.categories, { ...data, id: uuidv4() }] }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          tasks: state.tasks.map((t) => t.categoryId === id ? { ...t, categoryId: null } : t),
          activeCategoryId: state.activeCategoryId === id ? null : state.activeCategoryId,
        }));
      },

      setActiveView: (view) => set({ activeView: view, activeCategoryId: null, filterPriority: null }),
      setActiveCategoryId: (id) => set({ activeCategoryId: id, activeView: 'all', filterPriority: null }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setCurrentUserId: (id) => set({ currentUserId: id }),
      openModal: (task = null) => set({ isModalOpen: true, editingTask: task }),
      closeModal: () => set({ isModalOpen: false, editingTask: null }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      getUserTasks: () => {
        const { tasks, currentUserId } = get();
        if (currentUserId) return tasks.filter((t) => t.userId === currentUserId);
        return tasks.filter((t) => !t.userId);
      },

      getFilteredTasks: () => {
        const { activeView, activeCategoryId, searchQuery, filterPriority, sortOrder } = get();
        let filtered = get().getUserTasks();

        if (activeCategoryId) {
          filtered = filtered.filter((t) => t.categoryId === activeCategoryId);
        } else {
          switch (activeView) {
            case 'today':
              filtered = filtered.filter((t) => t.dueDate && isToday(parseISO(t.dueDate)));
              break;
            case 'upcoming':
              filtered = filtered.filter((t) => {
                if (!t.dueDate) return false;
                const d = parseISO(t.dueDate);
                return isFuture(d) && !isToday(d) && d <= addDays(startOfDay(new Date()), 7);
              });
              break;
            case 'completed':
              filtered = filtered.filter((t) => t.completed);
              break;
            case 'starred':
              filtered = filtered.filter((t) => t.starred);
              break;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))
          );
        }

        if (filterPriority) filtered = filtered.filter((t) => t.priority === filterPriority);

        const pw: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return filtered.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          switch (sortOrder) {
            case 'dueDate':
              if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
              return a.dueDate ? -1 : b.dueDate ? 1 : a.order - b.order;
            case 'priority': return pw[a.priority] - pw[b.priority];
            case 'alpha': return a.title.localeCompare(b.title);
            case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default: {
              const p = pw[a.priority] - pw[b.priority];
              if (p !== 0) return p;
              if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
              return a.dueDate ? -1 : b.dueDate ? 1 : a.order - b.order;
            }
          }
        });
      },

      getStats: () => {
        const tasks = get().getUserTasks();
        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        const inProgress = total - completed;
        const urgent = tasks.filter((t) => t.priority === 'urgent' && !t.completed).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, inProgress, urgent, completionRate };
      },

      getCategoryTaskCount: (categoryId) =>
        get().getUserTasks().filter((t) => t.categoryId === categoryId && !t.completed).length,

      getViewCount: (view) => {
        const tasks = get().getUserTasks();
        switch (view) {
          case 'all': return tasks.filter((t) => !t.completed).length;
          case 'today': return tasks.filter((t) => t.dueDate && isToday(parseISO(t.dueDate)) && !t.completed).length;
          case 'upcoming':
            return tasks.filter((t) => {
              if (!t.dueDate || t.completed) return false;
              const d = parseISO(t.dueDate);
              return isFuture(d) && !isToday(d) && d <= addDays(startOfDay(new Date()), 7);
            }).length;
          case 'completed': return tasks.filter((t) => t.completed).length;
          case 'starred': return tasks.filter((t) => t.starred && !t.completed).length;
          default: return 0;
        }
      },
    }),
    { name: 'taskflow-storage', version: 2 }
  )
);
