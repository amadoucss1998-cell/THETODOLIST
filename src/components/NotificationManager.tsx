import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, AlertCircle } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { useAuthStore } from '../store/authStore';

const HOUR_MS = 60 * 60 * 1000;

export default function NotificationManager() {
  const { currentUser } = useAuthStore();
  const { getUserTasks } = useTodoStore();
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [permBanner, setPermBanner] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'denied';

  const fireReminder = () => {
    const tasks = getUserTasks();
    const pending = tasks.filter((t) => !t.completed);
    if (pending.length === 0) return;

    const urgent = pending.filter((t) => t.priority === 'urgent');
    const todayStr = new Date().toISOString().split('T')[0];
    const dueToday = pending.filter((t) => t.dueDate === todayStr);

    const title = '⏰ TaskFlow Reminder';
    const body = urgent.length > 0
      ? `${urgent.length} urgent task${urgent.length > 1 ? 's' : ''} need attention! ${pending.length} total pending.`
      : `You have ${pending.length} pending task${pending.length > 1 ? 's' : ''}${
          dueToday.length > 0 ? `, ${dueToday.length} due today` : ''
        }.`;

    // Use native Electron notifications when available (Windows desktop app)
    const electron = (window as any).electronAPI;
    if (electron?.isElectron) {
      electron.notify(title, body);
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: './favicon.svg', tag: 'taskflow-reminder' });
      } catch (_) {}
    }

    setToast({ title, body });
    setTimeout(() => setToast(null), 9000);
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermBanner(false);
    if (result === 'granted') {
      setToast({ title: '✅ Notifications enabled', body: "You'll be reminded every hour about your pending tasks." });
      setTimeout(() => setToast(null), 5000);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      setPermBanner(true);
    }

    intervalRef.current = setInterval(fireReminder, HOUR_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentUser?.id]);

  return (
    <>
      {/* Permission banner */}
      <AnimatePresence>
        {permBanner && permission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-4 left-1/2 z-50"
            style={{ transform: 'translateX(-50%)', width: 'calc(100% - 48px)', maxWidth: 480 }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.2))',
                border: '1px solid rgba(139,92,246,0.35)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <Bell size={18} color="#a78bfa" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Enable hourly reminders?</p>
                <p className="text-xs text-white/50">Get notified every hour about pending tasks.</p>
              </div>
              <button
                onClick={requestPermission}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                Enable
              </button>
              <button
                onClick={() => setPermBanner(false)}
                className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed bottom-28 left-1/2 z-50"
            style={{ transform: 'translateX(-50%)', width: 'calc(100% - 48px)', maxWidth: 400 }}
          >
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(22,22,42,0.97), rgba(14,14,26,0.97))',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}
            >
              <AlertCircle size={18} color="#a78bfa" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{toast.title}</p>
                <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{toast.body}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function NotificationToggle() {
  const [perm, setPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (typeof Notification === 'undefined') return;
    if (perm === 'granted') return;
    setLoading(true);
    const result = await Notification.requestPermission();
    setPerm(result);
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      title={perm === 'granted' ? 'Notifications enabled' : perm === 'denied' ? 'Notifications blocked by browser' : 'Enable notifications'}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
      style={{
        background: perm === 'granted' ? 'rgba(46,213,115,0.15)' : 'rgba(255,255,255,0.06)',
        border: perm === 'granted' ? '1px solid rgba(46,213,115,0.3)' : '1px solid rgba(255,255,255,0.08)',
        color: perm === 'granted' ? '#2ed573' : perm === 'denied' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)',
        cursor: perm === 'denied' ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {perm === 'granted' ? <Bell size={13} /> : <BellOff size={13} />}
    </button>
  );
}
