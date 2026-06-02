import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckSquare, BookOpen, FileText } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { useJournalStore } from '../store/journalStore';
import { useAuthStore } from '../store/authStore';

interface SearchResult {
  id: string;
  type: 'task' | 'note' | 'journal';
  title: string;
  subtitle?: string;
  date?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onOpenSection: (section: 'tasks' | 'journal', date?: string) => void;
}

export default function GlobalSearch({ open, onClose, onOpenSection }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuthStore();
  const { getUserTasks, setActiveView } = useTodoStore();
  const { entries, notes } = useJournalStore();
  const userId = currentUser?.id ?? '';

  const results: { section: string; icon: React.ElementType; items: SearchResult[] }[] = [];

  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    // Tasks
    const tasks = getUserTasks()
      .filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t): SearchResult => ({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: t.description || undefined,
      }));
    if (tasks.length > 0) results.push({ section: 'Tasks', icon: CheckSquare, items: tasks });

    // Notes
    const userNotes = notes
      .filter((n) => n.userId === userId && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((n): SearchResult => ({
        id: n.id,
        type: 'note',
        title: n.title || 'Untitled Note',
        subtitle: n.content.slice(0, 80) || undefined,
      }));
    if (userNotes.length > 0) results.push({ section: 'Notes', icon: FileText, items: userNotes });

    // Journal entries
    const journalEntries = entries
      .filter((e) => e.userId === userId && e.content.toLowerCase().includes(q))
      .slice(0, 5)
      .map((e): SearchResult => ({
        id: e.id,
        type: 'journal',
        title: `Journal — ${e.date}`,
        subtitle: e.content.slice(0, 80),
        date: e.date,
      }));
    if (journalEntries.length > 0) results.push({ section: 'Journal', icon: BookOpen, items: journalEntries });
  }

  const allItems = results.flatMap((r) => r.items);

  const handleSelect = useCallback((item: SearchResult) => {
    if (item.type === 'task') {
      setActiveView('all');
      onOpenSection('tasks');
    } else if (item.type === 'note') {
      onOpenSection('journal');
    } else if (item.type === 'journal') {
      onOpenSection('journal', item.date);
    }
    onClose();
  }, [setActiveView, onOpenSection, onClose]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, allItems, selectedIndex, handleSelect, onClose]);

  let globalIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl mx-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #16162a, #12121f)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/08">
              <Search size={18} className="text-white/40 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, notes, journal…"
                className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-sm"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60">
                  <X size={16} />
                </button>
              )}
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md text-white/30" style={{ background: 'rgba(255,255,255,0.08)' }}>
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.trim() === '' ? (
                <div className="px-4 py-8 text-center text-sm text-white/30">
                  Type to search across all your content
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-white/30">
                  No results for "<span className="text-white/50">{query}</span>"
                </div>
              ) : (
                results.map(({ section, icon: Icon, items }) => (
                  <div key={section}>
                    <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                      <Icon size={12} className="text-white/30" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{section}</span>
                    </div>
                    {items.map((item) => {
                      const idx = globalIdx++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className="w-full px-4 py-2.5 text-left flex flex-col gap-0.5 transition-colors"
                          style={{
                            background: isSelected ? 'rgba(139,92,246,0.15)' : 'transparent',
                            borderLeft: isSelected ? '2px solid #8b5cf6' : '2px solid transparent',
                          }}
                        >
                          <span className="text-sm text-white/85 font-medium truncate">{item.title}</span>
                          {item.subtitle && (
                            <span className="text-xs text-white/35 truncate">{item.subtitle}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-white/06 flex items-center gap-3 text-[10px] text-white/25">
              <span><kbd className="bg-white/08 px-1 rounded">↑↓</kbd> navigate</span>
              <span><kbd className="bg-white/08 px-1 rounded">↵</kbd> open</span>
              <span><kbd className="bg-white/08 px-1 rounded">Esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
