import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Sun, Star, Calendar, Inbox } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { ViewType } from '../types';

const EMPTY_STATES: Record<string, { icon: React.ElementType; title: string; subtitle: string }> = {
  all: {
    icon: Inbox,
    title: 'All clear!',
    subtitle: 'No tasks yet. Add your first task to get started.',
  },
  today: {
    icon: Sun,
    title: "You're all set for today",
    subtitle: 'No tasks due today. Enjoy your free time or plan ahead.',
  },
  upcoming: {
    icon: Calendar,
    title: 'Nothing coming up',
    subtitle: 'No tasks in the next 7 days. Time to plan ahead!',
  },
  completed: {
    icon: CheckCircle2,
    title: "Nothing completed yet",
    subtitle: 'Complete some tasks and they\'ll show up here.',
  },
  starred: {
    icon: Star,
    title: 'No starred tasks',
    subtitle: 'Star your most important tasks to find them quickly.',
  },
  search: {
    icon: Inbox,
    title: 'No results found',
    subtitle: 'Try adjusting your search or filters.',
  },
};

interface EmptyStateProps {
  view: ViewType;
  hasSearch: boolean;
}

export default function EmptyState({ view, hasSearch }: EmptyStateProps) {
  const { openModal } = useTodoStore();
  const config = hasSearch ? EMPTY_STATES.search : (EMPTY_STATES[view] || EMPTY_STATES.all);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative"
        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
        />
        <Icon size={32} color="rgba(139,92,246,0.7)" />
      </div>

      <h3 className="text-xl font-bold text-white/70 mb-2">{config.title}</h3>
      <p className="text-sm text-white/35 max-w-xs leading-relaxed mb-8">{config.subtitle}</p>

      {!hasSearch && view !== 'completed' && (
        <button
          onClick={() => openModal()}
          className="gradient-button flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm relative"
        >
          <Plus size={16} />
          <span className="relative z-10">Add your first task</span>
        </button>
      )}
    </motion.div>
  );
}
