import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
  delay: number;
  extra?: React.ReactNode;
}

function StatCard({ icon: Icon, label, value, color, bg, delay, extra }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="glass-card rounded-2xl p-4 flex items-center gap-3 flex-1 min-w-0"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}
      >
        <Icon size={18} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        {extra}
      </div>
    </motion.div>
  );
}

export default function StatsBar() {
  const { getStats } = useTodoStore();
  const stats = getStats();

  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (stats.completionRate / 100) * circumference;

  return (
    <div className="px-6 pb-4 flex-shrink-0">
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {/* Total Tasks */}
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.15)"
          delay={0}
        />

        {/* Completed */}
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          color="#2ed573"
          bg="rgba(46,213,115,0.15)"
          delay={0.05}
        />

        {/* Urgent */}
        <StatCard
          icon={Zap}
          label="Urgent"
          value={stats.urgent}
          color="#ff4757"
          bg="rgba(255,71,87,0.15)"
          delay={0.1}
        />

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
          className="glass-card rounded-2xl p-4 flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20" cy="20" r="16"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
              />
              <circle
                cx="20" cy="20" r="16"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06d6a0" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
              {stats.completionRate}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider truncate">Done Rate</p>
            <p className="text-2xl font-bold text-white leading-tight">{stats.completionRate}%</p>
            <div className="progress-bar mt-1 w-16">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
