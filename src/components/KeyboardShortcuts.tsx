import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['N'], description: 'New task (with details)' },
  { keys: ['?'], description: 'Toggle this panel' },
  { keys: ['/'], description: 'Focus search' },
  { keys: ['Esc'], description: 'Close modal / clear search' },
  { keys: ['⌘', 'Enter'], description: 'Save task (in modal)' },
  { keys: ['Enter'], description: 'Quick-add task (in quick bar)' },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="modal-overlay"
          style={{ zIndex: 60 }}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        >
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, #16162a, #12121f)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}
                >
                  <Keyboard size={16} color="#a78bfa" />
                </div>
                <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/08 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.map(({ keys, description }) => (
                <div
                  key={description}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <span className="text-sm text-white/60">{description}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-1 rounded-md text-[11px] font-bold text-white/70"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          fontFamily: 'system-ui, sans-serif',
                          minWidth: 24,
                          textAlign: 'center',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/25 mt-4">
              Press{' '}
              <kbd className="bg-white/08 px-1.5 py-0.5 rounded text-[9px] border border-white/12">?</kbd>
              {' '}to toggle this panel
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
