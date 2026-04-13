import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Pencil,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  ArrowUp,
  Minus,
  ArrowDown,
  Tag,
} from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { Task, PRIORITY_CONFIG } from '../types';
import { useTodoStore } from '../store/todoStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY_ICONS = {
  urgent: AlertCircle,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
};

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { toggleComplete, toggleStar, deleteTask, openModal, toggleSubtask, categories } = useTodoStore();
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const cfg = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = PRIORITY_ICONS[task.priority];

  const category = categories.find((c) => c.id === task.categoryId);

  const dueDateFormatted = task.dueDate
    ? isToday(parseISO(task.dueDate))
      ? 'Today'
      : format(parseISO(task.dueDate), 'MMM d')
    : null;

  const isOverdue =
    task.dueDate &&
    !task.completed &&
    isPast(parseISO(task.dueDate)) &&
    !isToday(parseISO(task.dueDate));

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress =
    task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(() => deleteTask(task.id), 300);
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -10 : 0, scale: isDeleting ? 0.95 : 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative rounded-2xl cursor-default"
      style={{
        ...style,
        background: task.completed
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(255,255,255,0.045)',
        border: `1px solid rgba(255,255,255,${task.completed ? '0.06' : '0.09'})`,
        borderLeft: `3px solid ${task.completed ? 'rgba(255,255,255,0.1)' : cfg.color}`,
        boxShadow: task.completed ? 'none' : `0 2px 20px rgba(0,0,0,0.3)`,
        transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!task.completed) {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = task.completed
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(255,255,255,0.045)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = task.completed ? 'none' : '0 2px 20px rgba(0,0,0,0.3)';
      }}
    >
      <div className="p-4">
        {/* Row 1: Checkbox + Title + Actions */}
        <div className="flex items-start gap-3">
          {/* Drag handle + Checkbox */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-shrink-0">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-40 hover:!opacity-70 cursor-grab active:cursor-grabbing w-4 h-4 flex items-center justify-center transition-opacity"
              title="Drag to reorder"
            >
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                <circle cx="6" cy="2" r="1.5" fill="currentColor" />
                <circle cx="2" cy="6" r="1.5" fill="currentColor" />
                <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                <circle cx="2" cy="10" r="1.5" fill="currentColor" />
                <circle cx="6" cy="10" r="1.5" fill="currentColor" />
              </svg>
            </div>

            {/* Checkbox */}
            <button
              onClick={() => toggleComplete(task.id)}
              className={`checkbox-custom ${task.completed ? 'checked' : ''}`}
            >
              <AnimatePresence>
                {task.completed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check size={11} color="white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-sm font-semibold leading-snug"
                style={{
                  color: task.completed ? 'rgba(255,255,255,0.35)' : '#e2e8f0',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  textDecorationColor: 'rgba(255,255,255,0.3)',
                }}
              >
                {task.title}
              </h3>

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleStar(task.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: task.starred ? 'rgba(255,211,42,0.12)' : 'transparent',
                    color: task.starred ? '#ffd32a' : 'rgba(255,255,255,0.3)',
                  }}
                  title="Star task"
                >
                  <Star size={13} fill={task.starred ? '#ffd32a' : 'none'} />
                </button>
                <button
                  onClick={() => openModal(task)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/08 transition-colors"
                  title="Edit task"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p
                className="text-xs mt-1 leading-relaxed line-clamp-2"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Meta info */}
        <div className="flex items-center flex-wrap gap-2 mt-3 ml-[52px]">
          {/* Priority badge */}
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              boxShadow: task.completed ? 'none' : cfg.glow,
            }}
          >
            <PriorityIcon size={9} />
            {cfg.label}
          </span>

          {/* Due date */}
          {dueDateFormatted && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              style={{
                background: isOverdue
                  ? 'rgba(255,71,87,0.12)'
                  : dueDateFormatted === 'Today'
                  ? 'rgba(46,213,115,0.12)'
                  : 'rgba(255,255,255,0.06)',
                color: isOverdue
                  ? '#ff4757'
                  : dueDateFormatted === 'Today'
                  ? '#2ed573'
                  : 'rgba(255,255,255,0.45)',
                border: `1px solid ${
                  isOverdue
                    ? 'rgba(255,71,87,0.3)'
                    : dueDateFormatted === 'Today'
                    ? 'rgba(46,213,115,0.3)'
                    : 'rgba(255,255,255,0.1)'
                }`,
              }}
            >
              <Calendar size={9} />
              {isOverdue ? `Overdue · ${dueDateFormatted}` : dueDateFormatted}
            </span>
          )}

          {/* Category */}
          {category && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              style={{
                background: `${category.color}15`,
                color: category.color,
                border: `1px solid ${category.color}30`,
              }}
            >
              <span className="text-[10px]">{category.icon}</span>
              {category.name}
            </span>
          )}

          {/* Tags */}
          {task.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              <Tag size={8} className="mr-0.5" />
              {tag}
            </span>
          ))}

          {/* Star indicator (always visible) */}
          {task.starred && (
            <Star size={11} fill="#ffd32a" color="#ffd32a" className="opacity-80" />
          )}
        </div>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="mt-3 ml-[52px]">
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors mb-2"
            >
              <div className="progress-bar flex-1" style={{ width: 80 }}>
                <div className="progress-bar-fill" style={{ width: `${subtaskProgress}%` }} />
              </div>
              <span className="font-medium">
                {completedSubtasks}/{task.subtasks.length}
              </span>
              {showSubtasks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {showSubtasks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-2 cursor-pointer group/sub"
                      onClick={() => toggleSubtask(task.id, sub.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                          sub.completed
                            ? 'bg-purple-600 border-transparent'
                            : 'border-white/20 group-hover/sub:border-purple-500/50'
                        }`}
                      >
                        {sub.completed && <Check size={9} color="white" strokeWidth={3} />}
                      </div>
                      <span
                        className="text-xs"
                        style={{
                          color: sub.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
                          textDecoration: sub.completed ? 'line-through' : 'none',
                        }}
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
