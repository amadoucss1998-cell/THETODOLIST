import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Menu, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { Priority, ViewType, SortOrder, PRIORITY_CONFIG } from '../types';

const VIEW_LABELS: Record<ViewType, string> = {
  all: 'All Tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  starred: 'Starred',
  completed: 'Completed',
};

const VIEW_SUBTITLES: Record<ViewType, string> = {
  all: 'Everything on your plate',
  today: "What's on the agenda today",
  upcoming: 'Tasks due in the next 7 days',
  starred: 'Your most important tasks',
  completed: "Tasks you've accomplished",
};

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low'];

const SORT_OPTIONS: { id: SortOrder; label: string }[] = [
  { id: 'smart', label: '✨ Smart (default)' },
  { id: 'dueDate', label: '📅 Due date' },
  { id: 'priority', label: '🔥 Priority' },
  { id: 'alpha', label: '🔤 A → Z' },
  { id: 'created', label: '🕐 Date created' },
];

interface HeaderProps {
  onOpenSearch?: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const {
    activeView,
    activeCategoryId,
    categories,
    searchQuery,
    filterPriority,
    sortOrder,
    setSearchQuery,
    setFilterPriority,
    setSortOrder,
    openModal,
    toggleSidebar,
    getFilteredTasks,
  } = useTodoStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const filteredCount = getFilteredTasks().length;

  const title = activeCategory ? activeCategory.name : VIEW_LABELS[activeView];
  const subtitle = activeCategory
    ? `${filteredCount} task${filteredCount !== 1 ? 's' : ''} in this category`
    : VIEW_SUBTITLES[activeView];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'n' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        openModal();
      }
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openModal]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    if (showSort) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSort]);

  return (
    <header className="px-6 pt-6 pb-4 flex-shrink-0">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Menu size={17} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {activeCategory && (
                <span className="text-xl leading-none">{activeCategory.icon}</span>
              )}
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global search */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              title="Global search (⌘K)"
              className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center transition-all text-white/40 hover:text-white/70"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search size={17} />
            </button>
          )}

          {/* Search toggle */}
          <button
            onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: showSearch || searchQuery ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
              border: showSearch || searchQuery
                ? '1px solid rgba(139,92,246,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              color: showSearch || searchQuery ? '#a78bfa' : 'rgba(255,255,255,0.4)',
            }}
          >
            {showSearch && searchQuery ? <X size={17} /> : <Search size={17} />}
          </button>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
            style={{
              background: filterPriority ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
              border: filterPriority
                ? '1px solid rgba(139,92,246,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              color: filterPriority ? '#a78bfa' : 'rgba(255,255,255,0.4)',
            }}
          >
            <SlidersHorizontal size={17} />
            {filterPriority && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2"
                style={{
                  background: PRIORITY_CONFIG[filterPriority].color,
                  borderColor: '#08080f',
                }}
              />
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSort(!showSort)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: sortOrder !== 'smart' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                border: sortOrder !== 'smart'
                  ? '1px solid rgba(139,92,246,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: sortOrder !== 'smart' ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              }}
              title="Sort tasks"
            >
              <ArrowUpDown size={17} />
            </button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-52 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'linear-gradient(145deg, #16162a, #12121f)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortOrder(opt.id);
                        setShowSort(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-left transition-colors"
                      style={{
                        background: sortOrder === opt.id ? 'rgba(139,92,246,0.18)' : 'transparent',
                        color: sortOrder === opt.id ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                        fontWeight: sortOrder === opt.id ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (sortOrder !== opt.id)
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (sortOrder !== opt.id)
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add task button */}
          <button
            onClick={() => openModal()}
            className="gradient-button flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm relative z-10"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                className="input-glass pl-10 pr-4 py-2.5"
                placeholder="Search tasks, tags, descriptions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priority filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap pb-1">
              <button
                onClick={() => setFilterPriority(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: !filterPriority ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                  border: !filterPriority
                    ? '1px solid rgba(139,92,246,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: !filterPriority ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                }}
              >
                All priorities
              </button>
              {PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = filterPriority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(isActive ? null : p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: isActive ? `${cfg.color}20` : 'rgba(255,255,255,0.06)',
                      border: isActive ? `1px solid ${cfg.color}60` : '1px solid rgba(255,255,255,0.08)',
                      color: isActive ? cfg.color : 'rgba(255,255,255,0.5)',
                      boxShadow: isActive ? cfg.glow : 'none',
                    }}
                  >
                    <span
                      className="priority-dot"
                      style={{ background: cfg.color, width: 6, height: 6 }}
                    />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
