import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';

type Phase = 'focus' | 'short' | 'long';

const DURATIONS: Record<Phase, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const PHASE_LABELS: Record<Phase, string> = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };
const PHASE_COLORS: Record<Phase, string> = { focus: '#8b5cf6', short: '#2ed573', long: '#4f8ef7' };

const LS_KEY = 'taskflow-pomodoro-sessions';

function playTone() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (_) {}
}

export default function PomodoroTimer() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(LS_KEY) || '0', 10); } catch { return 0; }
  });
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const [toast, setToast] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tasks = useTodoStore((s) => s.getUserTasks());
  const pendingTasks = tasks.filter((t) => !t.completed);

  const total = DURATIONS[phase];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const dashOffset = circumference * (1 - progress);

  const advancePhase = useCallback((currentPhase: Phase, currentSessions: number) => {
    let nextPhase: Phase;
    let newSessions = currentSessions;
    if (currentPhase === 'focus') {
      newSessions = currentSessions + 1;
      setSessions(newSessions);
      try { localStorage.setItem(LS_KEY, String(newSessions)); } catch {}
      nextPhase = newSessions % 4 === 0 ? 'long' : 'short';
    } else {
      nextPhase = 'focus';
    }
    setPhase(nextPhase);
    setTimeLeft(DURATIONS[nextPhase]);
    setRunning(false);
    playTone();
    setToast(`${PHASE_LABELS[currentPhase]} complete! Starting ${PHASE_LABELS[nextPhase]}.`);
    setTimeout(() => setToast(''), 3500);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            advancePhase(phase, sessions);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, sessions, advancePhase]);

  const setPhaseAndReset = (p: Phase) => {
    setPhase(p);
    setTimeLeft(DURATIONS[p]);
    setRunning(false);
  };

  const reset = () => { setTimeLeft(DURATIONS[phase]); setRunning(false); };
  const skip = () => { setRunning(false); advancePhase(phase, sessions); };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const color = PHASE_COLORS[phase];
  const linkedTask = pendingTasks.find((t) => t.id === linkedTaskId);

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: 'rgba(30,20,50,0.95)', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: running ? `linear-gradient(135deg, ${color}cc, ${color}88)` : 'linear-gradient(135deg, #2a1a4a, #1a1a3a)',
          border: `1px solid ${running ? color + '60' : 'rgba(139,92,246,0.3)'}`,
          boxShadow: running ? `0 0 24px ${color}50` : '0 8px 32px rgba(0,0,0,0.5)',
        }}
        title="Pomodoro Timer"
      >
        {running ? <Timer size={22} color="white" /> : '🍅'}
      </button>

      {/* Timer panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(20,15,40,0.98), rgba(12,12,28,0.98))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Pomodoro</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                  {sessions} sessions
                </span>
                <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Phase tabs */}
            <div className="flex gap-1 px-4 pb-3">
              {(['focus', 'short', 'long'] as Phase[]).map((p) => (
                <button key={p} onClick={() => setPhaseAndReset(p)}
                  className="flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all"
                  style={{
                    background: phase === p ? `${PHASE_COLORS[p]}22` : 'rgba(255,255,255,0.04)',
                    color: phase === p ? PHASE_COLORS[p] : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${phase === p ? PHASE_COLORS[p] + '40' : 'transparent'}`,
                  }}>
                  {PHASE_LABELS[p]}
                </button>
              ))}
            </div>

            {/* Timer ring */}
            <div className="flex flex-col items-center pb-4">
              <div className="relative" style={{ width: 140, height: 140 }}>
                <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={70} cy={70} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                  <circle cx={70} cy={70} r={radius} fill="none" stroke={color} strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white tabular-nums">{mm}:{ss}</span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color }}>{PHASE_LABELS[phase]}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-3">
                <button onClick={reset}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <RotateCcw size={15} />
                </button>
                <button onClick={() => setRunning(!running)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, boxShadow: `0 0 20px ${color}40` }}>
                  {running ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
                </button>
                <button onClick={skip}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <SkipForward size={15} />
                </button>
              </div>
            </div>

            {/* Linked task */}
            <div className="px-4 pb-4">
              <p className="text-[10px] text-white/30 mb-1.5 font-semibold uppercase tracking-wider">Linked task</p>
              <select
                className="w-full text-xs rounded-xl px-3 py-2 text-white/70 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
              >
                <option value="">— None —</option>
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              {linkedTask && (
                <p className="text-[10px] text-white/35 mt-1.5 truncate">
                  Focusing on: <span style={{ color }}>{linkedTask.title}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
