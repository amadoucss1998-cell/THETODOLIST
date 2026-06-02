import { useMemo } from 'react';
import { useTodoStore } from '../store/todoStore';
import { useJournalStore } from '../store/journalStore';
import { useAuthStore } from '../store/authStore';
import { subDays, format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';

const MOOD_EMOJI: Record<string, string> = {
  amazing: '😄', good: '🙂', okay: '😐', bad: '😔', awful: '😢',
};

export default function AnalyticsPage() {
  const tasks = useTodoStore((s) => s.getUserTasks());
  const categories = useTodoStore((s) => s.categories);
  const { entries } = useJournalStore();
  const { currentUser } = useAuthStore();

  const today = new Date();

  const stats = useMemo(() => {
    const total = tasks.length;
    const now = new Date();
    const weekStart = subDays(now, 7);
    const completedThisWeek = tasks.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt) >= weekStart
    ).length;

    // Streak: consecutive days with at least 1 completion
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(now, i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const hasCompletion = tasks.some(
        (t) => t.completedAt && isWithinInterval(new Date(t.completedAt), { start: dayStart, end: dayEnd })
      );
      if (hasCompletion) streak++;
      else if (i > 0) break;
    }

    // Avg tasks/day over last 14 days
    const days14 = 14;
    const totalCompleted14 = tasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= subDays(now, days14)
    ).length;
    const avgPerDay = (totalCompleted14 / days14).toFixed(1);

    return { total, completedThisWeek, streak, avgPerDay };
  }, [tasks]);

  // Last 14 days bar chart data
  const barData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(today, 13 - i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const count = tasks.filter(
        (t) => t.completedAt && isWithinInterval(new Date(t.completedAt), { start: dayStart, end: dayEnd })
      ).length;
      return { label: format(day, 'MMM d'), shortLabel: format(day, 'd'), count };
    });
  }, [tasks]);

  const maxBar = Math.max(...barData.map((d) => d.count), 1);

  // Mood trend last 14 days
  const moodData = useMemo(() => {
    const userId = currentUser?.id ?? '';
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(today, 13 - i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = entries.find((e) => e.date === dateStr && e.userId === userId);
      return { dateStr, shortLabel: format(day, 'd'), mood: entry?.mood ?? null };
    });
  }, [entries, currentUser]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id);
      const done = catTasks.filter((t) => t.completed).length;
      const pct = catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0;
      return { ...cat, total: catTasks.length, done, pct };
    }).filter((c) => c.total > 0);
  }, [tasks, categories]);

  // Priority breakdown (pending only)
  const priorityBreakdown = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    return [
      { label: 'Urgent', color: '#ff4757', count: pending.filter((t) => t.priority === 'urgent').length },
      { label: 'High', color: '#ff6348', count: pending.filter((t) => t.priority === 'high').length },
      { label: 'Medium', color: '#ffd32a', count: pending.filter((t) => t.priority === 'medium').length },
      { label: 'Low', color: '#2ed573', count: pending.filter((t) => t.priority === 'low').length },
    ];
  }, [tasks]);

  const maxPriority = Math.max(...priorityBreakdown.map((p) => p.count), 1);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent' }}>
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-text">Analytics</h1>
          <p className="text-sm text-white/35 mt-0.5">Your productivity overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tasks', value: stats.total, color: '#8b5cf6' },
            { label: 'Completed This Week', value: stats.completedThisWeek, color: '#2ed573' },
            { label: 'Current Streak', value: `${stats.streak}d`, color: '#ffd32a' },
            { label: 'Avg Tasks / Day', value: stats.avgPerDay, color: '#4f8ef7' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">{label}</p>
              <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tasks per day bar chart */}
        <div className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold text-white/70 mb-4">Tasks Completed — Last 14 Days</h2>
          <div className="flex items-end gap-1.5 h-28">
            {barData.map(({ shortLabel, count }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-white/40 font-semibold">{count > 0 ? count : ''}</span>
                <div className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max((count / maxBar) * 80, count > 0 ? 4 : 2)}px`,
                    background: count > 0
                      ? 'linear-gradient(180deg, #8b5cf6, #6d28d9)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
                <span className="text-[9px] text-white/30">{shortLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mood trend */}
        <div className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-bold text-white/70 mb-4">Mood Trend — Last 14 Days</h2>
          <div className="flex items-center gap-1.5">
            {moodData.map(({ shortLabel, mood }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-lg leading-none">
                  {mood ? MOOD_EMOJI[mood] : <span className="text-[10px] text-white/15">·</span>}
                </span>
                <span className="text-[9px] text-white/30">{shortLabel}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category breakdown */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold text-white/70 mb-4">Category Breakdown</h2>
            {categoryBreakdown.length === 0 && (
              <p className="text-xs text-white/30">No tasks yet.</p>
            )}
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <span>{cat.icon}</span>{cat.name}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: cat.color }}>
                      {cat.done}/{cat.total} · {cat.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${cat.pct}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-bold text-white/70 mb-4">Pending by Priority</h2>
            <div className="space-y-3">
              {priorityBreakdown.map(({ label, color, count }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{label}</span>
                    <span className="text-xs font-semibold" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(count / maxPriority) * 100}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
