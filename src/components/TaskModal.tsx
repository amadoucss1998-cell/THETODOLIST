import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Tag,
  Plus,
  Trash2,
  AlertCircle,
  ArrowUp,
  Minus,
  ArrowDown,
  Check,
  Folder,
} from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { Priority, PRIORITY_CONFIG } from '../types';

const PRIORITIES: { id: Priority; icon: React.ElementType; label: string }[] = [
  { id: 'urgent', icon: AlertCircle, label: 'Urgent' },
  { id: 'high', icon: ArrowUp, label: 'High' },
  { id: 'medium', icon: Minus, label: 'Medium' },
  { id: 'low', icon: ArrowDown, label: 'Low' },
];

export default function TaskModal() {
  const { isModalOpen, editingTask, closeModal, addTask, updateTask, categories } = useTodoStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setPriority(editingTask.priority);
        setDueDate(editingTask.dueDate || '');
        setCategoryId(editingTask.categoryId);
        setTags([...editingTask.tags]);
        setSubtasks([...editingTask.subtasks]);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setCategoryId(null);
        setTags([]);
        setSubtasks([]);
      }
      setTagInput('');
      setSubtaskInput('');
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isModalOpen, editingTask]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
      categoryId,
      tags,
      subtasks,
      completed: editingTask?.completed ?? false,
      starred: editingTask?.starred ?? false,
    };

    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    closeModal();
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const addSubtask = () => {
    const t = subtaskInput.trim();
    if (t) {
      setSubtasks([...subtasks, { id: Math.random().toString(36).slice(2), title: t, completed: false }]);
    }
    setSubtaskInput('');
  };

  const removeSubtask = (id: string) => setSubtasks(subtasks.filter((s) => s.id !== id));

  const toggleSubtask = (id: string) =>
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="modal-overlay" onKeyDown={handleKeyDown}>
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={closeModal} />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, #16162a, #12121f)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/06">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <p className="text-xs text-white/35 mt-0.5">
                  {editingTask ? 'Update your task details' : 'Add a new task to your list'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/08 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <input
                  ref={titleRef}
                  className="input-glass text-base font-semibold py-3"
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  className="input-glass resize-none"
                  placeholder="Add description (optional)..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ lineHeight: '1.6' }}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map(({ id, icon: Icon, label }) => {
                    const cfg = PRIORITY_CONFIG[id];
                    const isSelected = priority === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setPriority(id)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all text-xs font-semibold"
                        style={{
                          background: isSelected ? cfg.bg : 'rgba(255,255,255,0.04)',
                          border: isSelected ? `1px solid ${cfg.border}` : '1px solid rgba(255,255,255,0.08)',
                          color: isSelected ? cfg.color : 'rgba(255,255,255,0.4)',
                          boxShadow: isSelected ? cfg.glow : 'none',
                        }}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due date + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">
                    <Calendar size={10} className="inline mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="input-glass"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{
                      colorScheme: 'dark',
                      WebkitAppearance: 'none',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">
                    <Folder size={10} className="inline mr-1" />
                    Category
                  </label>
                  <select
                    className="input-glass appearance-none"
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(e.target.value || null)}
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">
                  <Tag size={10} className="inline mr-1" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-pill flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 hover:text-red-400 transition-colors"
                      >
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-glass flex-1 py-2"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="px-3 py-2 rounded-xl text-white/60 hover:text-white transition-colors disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">
                  Subtasks
                </label>
                {subtasks.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 p-2.5 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <button
                          onClick={() => toggleSubtask(sub.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                            sub.completed ? 'bg-purple-600 border-transparent' : 'border-white/20'
                          }`}
                        >
                          {sub.completed && <Check size={9} color="white" strokeWidth={3} />}
                        </button>
                        <span
                          className="flex-1 text-sm"
                          style={{
                            color: sub.completed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)',
                            textDecoration: sub.completed ? 'line-through' : 'none',
                          }}
                        >
                          {sub.title}
                        </span>
                        <button
                          onClick={() => removeSubtask(sub.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className="input-glass flex-1 py-2"
                    placeholder="Add subtask..."
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                  />
                  <button
                    onClick={addSubtask}
                    disabled={!subtaskInput.trim()}
                    className="px-3 py-2 rounded-xl text-white/60 hover:text-white transition-colors disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-3 flex gap-3 border-t border-white/05">
              <button
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white gradient-button disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </span>
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-[10px] text-white/20 pb-3">
              <kbd className="bg-white/08 px-1.5 py-0.5 rounded text-[9px]">⌘ Enter</kbd> to save quickly
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
