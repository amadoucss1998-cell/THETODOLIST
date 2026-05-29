export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type ViewType = 'all' | 'today' | 'upcoming' | 'completed' | 'starred';
export type SortOrder = 'smart' | 'dueDate' | 'priority' | 'alpha' | 'created';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  starred: boolean;
  priority: Priority;
  dueDate: string | null;
  categoryId: string | null;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  urgent: number;
  completionRate: number;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string; glow: string }> = {
  urgent: {
    label: 'Urgent',
    color: '#ff4757',
    bg: 'rgba(255,71,87,0.12)',
    border: 'rgba(255,71,87,0.4)',
    glow: '0 0 12px rgba(255,71,87,0.4)',
  },
  high: {
    label: 'High',
    color: '#ff6348',
    bg: 'rgba(255,99,72,0.12)',
    border: 'rgba(255,99,72,0.4)',
    glow: '0 0 12px rgba(255,99,72,0.3)',
  },
  medium: {
    label: 'Medium',
    color: '#ffd32a',
    bg: 'rgba(255,211,42,0.12)',
    border: 'rgba(255,211,42,0.4)',
    glow: '0 0 12px rgba(255,211,42,0.3)',
  },
  low: {
    label: 'Low',
    color: '#2ed573',
    bg: 'rgba(46,213,115,0.12)',
    border: 'rgba(46,213,115,0.4)',
    glow: '0 0 12px rgba(46,213,115,0.3)',
  },
};
