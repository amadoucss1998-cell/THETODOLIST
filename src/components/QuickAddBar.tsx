import { useState, useRef } from 'react';
import { Plus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodoStore } from '../store/todoStore';

export default function QuickAddBar() {
  const { addTask, activeCategoryId, openModal } = useTodoStore();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const title = value.trim();
    if (!title) return;
    addTask({
      title,
      description: '',
      priority: 'medium',
      dueDate: null,
      categoryId: activeCategoryId,
      tags: [],
      subtasks: [],
      completed: false,
      starred: false,
    });
    setValue('');
  };

  return (
    <div className="px-6 pb-5 flex-shrink-0">
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 2px rgba(139,92,246,0.35), 0 12px 40px rgba(0,0,0,0.5)'
            : '0 4px 24px rgba(0,0,0,0.35)',
        }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(22,22,42,0.97), rgba(18,18,31,0.97))',
          border: focused
            ? '1px solid rgba(139,92,246,0.4)'
            : '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <Zap size={14} color="white" />
        </div>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-sm text-white/90 placeholder-white/25 font-medium"
          placeholder="Quick add a task… Enter to save"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === 'Escape') {
              setValue('');
              inputRef.current?.blur();
            }
          }}
        />
        <AnimatePresence mode="wait">
          {value.trim() ? (
            <motion.button
              key="submit"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={handleSubmit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 gradient-button"
              title="Add task (Enter)"
            >
              <Plus size={15} />
            </motion.button>
          ) : (
            <motion.button
              key="open"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={() => openModal()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white/80 transition-colors flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="New task with details"
            >
              <Plus size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
