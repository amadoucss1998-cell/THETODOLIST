import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, X, Trash2 } from 'lucide-react';
import { useHabitStore, Habit } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';

const EMOJI_OPTIONS = ['💪', '🏃', '💧', '📚', '🧘', '🥗', '😴', '🚿', '🎯', '✍️', '🎨', '🎵', '🌿', '🧹', '💊', '🏋️', '🤸', '🧠', '❤️', '🌅'];
const COLOR_OPTIONS = ['#7c3aed', '#2563eb', '#059669', '#db2777', '#ea580c', '#dc2626', '#0891b2', '#ca8a04'];
const FREQ_OPTIONS: { id: Habit['frequency']; label: string }[] = [
  { id: 'daily', label: 'Every day' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
];

function getDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getLast7Days(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return getDateStr(d);
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HabitPage() {
  const { currentUser } = useAuthStore();
  const { getUserHabits, addHabit, deleteHabit, toggleHabit, getStreak, getCompletionRate } = useHabitStore();

  const userId = currentUser?.id ?? '';
  const habits = getUserHabits(userId);
  const today = getDateStr(new Date());
  const last7 = getLast7Days();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit(userId, name.trim(), emoji, color, frequency);
    setName('');
    setEmoji(EMOJI_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0]);
    setFrequency('daily');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Habits</h1>
          <p className="text-sm text-white/40 mt-0.5">{formatDate(new Date())}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gradient-button flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm"
        >
          <Plus size={16} />
          New Habit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
        {/* New Habit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">New Habit</h3>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  className="input-glass"
                  placeholder="Habit name (e.g. Drink 8 glasses of water)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  autoFocus
                />
                <div>
                  <p className="text-xs text-white/40 mb-2">Emoji</p>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        onClick={() => setEmoji(em)}
                        className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                        style={{
                          background: emoji === em ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                          border: emoji === em ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-2">Color</p>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                        style={{
                          background: c,
                          boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-2">Frequency</p>
                  <div className="flex gap-2">
                    {FREQ_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFrequency(f.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: frequency === f.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                          border: frequency === f.id ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          color: frequency === f.id ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!name.trim()}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    Add Habit
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white/50 hover:text-white/80"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Habits */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Today's Habits</h2>
          {habits.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-white/70 mb-2">No habits yet</h3>
              <p className="text-sm text-white/35 max-w-xs mx-auto">
                Start small. Pick one habit you want to build and track it daily. Small wins compound into big results.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 gradient-button px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const isDoneToday = habit.completions.includes(today);
                const streak = getStreak(habit);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="rounded-2xl p-4 group"
                    style={{
                      background: isDoneToday ? `${habit.color}12` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isDoneToday ? habit.color + '30' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Check button */}
                      <button
                        onClick={() => toggleHabit(habit.id, today)}
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-2xl transition-all"
                        style={{
                          background: isDoneToday ? habit.color : 'transparent',
                          border: `3px solid ${isDoneToday ? habit.color : 'rgba(255,255,255,0.2)'}`,
                          boxShadow: isDoneToday ? `0 0 20px ${habit.color}60` : 'none',
                        }}
                      >
                        {isDoneToday ? '✓' : habit.emoji}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!isDoneToday && <span className="text-base">{habit.emoji}</span>}
                          <span className="font-semibold text-white text-sm">{habit.name}</span>
                          {streak > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#fb923c' }}>
                              🔥 {streak}
                            </span>
                          )}
                        </div>
                        {/* 7-day strip */}
                        <div className="flex gap-1.5 mt-2">
                          {last7.map((ds) => {
                            const done = habit.completions.includes(ds);
                            const isToday = ds === today;
                            return (
                              <div
                                key={ds}
                                className="flex flex-col items-center gap-1"
                              >
                                <div
                                  className="w-4 h-4 rounded-full transition-all"
                                  style={{
                                    background: done ? habit.color : 'rgba(255,255,255,0.1)',
                                    border: isToday ? `2px solid ${habit.color}` : '2px solid transparent',
                                    boxShadow: done ? `0 0 6px ${habit.color}60` : 'none',
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Time Stats */}
        {habits.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">30-Day Stats</h2>
            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {habits.map((habit) => {
                const rate = getCompletionRate(habit, 30);
                const pct = Math.round(rate * 100);
                return (
                  <div key={habit.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white/70 flex items-center gap-1.5">
                        <span>{habit.emoji}</span>
                        {habit.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: habit.color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: habit.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
