import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Sun, Calendar, Star, CheckCircle2,
  LayoutDashboard, Plus, Trash2, X, ChevronRight, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useTodoStore } from '../store/todoStore';
import { useAuthStore } from '../store/authStore';
import { ViewType } from '../types';
import { NotificationToggle } from './NotificationManager';

const VIEWS: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Tasks', icon: LayoutDashboard },
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const CATEGORY_COLORS = [
  '#8b5cf6', '#4f8ef7', '#2ed573', '#ffd32a', '#ff6348',
  '#06d6a0', '#ff4757', '#f72585', '#4cc9f0', '#e9c46a',
];

const CATEGORY_ICONS = ['💼', '✨', '💪', '🛍️', '💰', '📚', '🎯', '🏠', '🎨', '🚀'];

export default function Sidebar() {
  const {
    activeView, activeCategoryId, categories, sidebarOpen,
    setActiveView, setActiveCategoryId, addCategory, deleteCategory,
    getViewCount, getCategoryTaskCount, toggleSidebar,
  } = useTodoStore();

  const { currentUser, logout } = useAuthStore();

  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[0]);
  const [catIcon, setCatIcon] = useState(CATEGORY_ICONS[0]);

  const handleAddCategory = () => {
    if (!catName.trim()) return;
    addCategory({ name: catName.trim(), color: catColor, icon: catIcon });
    setCatName(''); setShowCatForm(false);
  };

  const initials = currentUser
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed lg:relative z-40 lg:z-auto h-full flex-shrink-0 flex flex-col"
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'linear-gradient(180deg, #0d0d1f 0%, #0a0a16 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col h-full w-[260px]">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <CheckSquare size={18} color="white" />
              </div>
              <div>
                <span className="text-base font-bold gradient-text">TaskFlow</span>
                <p className="text-[10px] text-white/30 font-medium -mt-0.5">Your daily planner</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/08 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: 'none' }}>
            {/* Navigation */}
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-2 mb-2">Menu</p>
              <nav className="space-y-0.5">
                {VIEWS.map(({ id, label, icon: Icon }) => {
                  const count = getViewCount(id);
                  const isActive = activeView === id && !activeCategoryId;
                  return (
                    <button key={id} className={`nav-item w-full ${isActive ? 'active' : ''}`} onClick={() => setActiveView(id)}>
                      <Icon size={16} />
                      <span className="flex-1 text-left">{label}</span>
                      {count > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: isActive ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)', color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Categories</p>
                <button onClick={() => setShowCatForm(!showCatForm)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/08 transition-colors">
                  <Plus size={13} />
                </button>
              </div>

              <AnimatePresence>
                {showCatForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="glass-card rounded-xl p-3 space-y-2.5">
                      <input className="input-glass text-sm py-2" placeholder="Category name..."
                        value={catName} onChange={(e) => setCatName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} autoFocus />
                      <div>
                        <p className="text-[10px] text-white/30 mb-1.5">Color</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {CATEGORY_COLORS.map((c) => (
                            <button key={c} onClick={() => setCatColor(c)}
                              className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                              style={{ background: c, boxShadow: catColor === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : 'none' }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 mb-1.5">Icon</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {CATEGORY_ICONS.map((ic) => (
                            <button key={ic} onClick={() => setCatIcon(ic)}
                              className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all"
                              style={{ background: catIcon === ic ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)', border: catIcon === ic ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent' }}>
                              {ic}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddCategory} disabled={!catName.trim()}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>Add</button>
                        <button onClick={() => setShowCatForm(false)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-white/80"
                          style={{ background: 'rgba(255,255,255,0.06)' }}>Cancel</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <nav className="space-y-0.5">
                {categories.map((cat) => {
                  const count = getCategoryTaskCount(cat.id);
                  const isActive = activeCategoryId === cat.id;
                  return (
                    <div key={cat.id} className="group flex items-center">
                      <button
                        className={`nav-item flex-1 ${isActive ? 'active' : ''}`}
                        style={isActive ? { background: `${cat.color}18`, color: cat.color, borderColor: `${cat.color}30` } : {}}
                        onClick={() => setActiveCategoryId(cat.id)}
                      >
                        <span className="text-base leading-none">{cat.icon}</span>
                        <span className="flex-1 text-left">{cat.name}</span>
                        {count > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: `${cat.color}20`, color: cat.color }}>{count}</span>
                        )}
                      </button>
                      <button onClick={() => deleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all ml-0.5 flex-shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User section */}
          <div className="px-3 py-4 border-t border-white/05">
            {currentUser ? (
              <div className="flex items-center gap-2.5 px-2">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: currentUser.avatarColor, boxShadow: `0 0 12px ${currentUser.avatarColor}50` }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{currentUser.email}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <NotificationToggle />
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-3 flex items-center gap-3 cursor-default"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)' }}>
                  <ChevronRight size={14} color="#8b5cf6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-400">Pro Tip</p>
                  <p className="text-[10px] text-white/35 leading-tight">Press <kbd className="text-[9px] bg-white/10 px-1 rounded">N</kbd> to add a task fast</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
