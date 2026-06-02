import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type Tab = 'login' | 'register';

export default function AuthScreen() {
  const { login, register } = useAuthStore();
  const [tab, setTab] = useState<Tab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = tab === 'login'
      ? await login(email, password)
      : await register(email, password, name);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Something went wrong.');
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    const demoEmail = 'demo@taskflow.app';
    const demoPass = 'demo1234';
    const loginResult = await login(demoEmail, demoPass);
    if (!loginResult.success) {
      await register(demoEmail, demoPass, 'Demo User');
    }
    setLoading(false);
  };

  const switchTab = (t: Tab) => { setTab(t); setError(''); setName(''); setEmail(''); setPassword(''); };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: '#08080f' }}
    >
      {/* Background blobs */}
      <div className="bg-blob" style={{ width: 600, height: 600, background: '#7c3aed', top: -200, left: -150 }} />
      <div className="bg-blob" style={{ width: 400, height: 400, background: '#4f46e5', bottom: -100, right: -100 }} />
      <div className="bg-blob" style={{ width: 200, height: 200, background: '#06d6a0', top: '40%', right: '30%', opacity: 0.05 }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative w-full max-w-md"
        style={{
          background: 'linear-gradient(145deg, rgba(22,22,42,0.95), rgba(14,14,26,0.97))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 24,
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
            >
              <CheckSquare size={24} color="white" />
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">TaskFlow</div>
              <div className="text-[11px] text-white/30 -mt-0.5">Your ultimate task manager</div>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-8 mb-6">
          <div
            className="flex p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === t ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent',
                  color: tab === t ? 'white' : 'rgba(255,255,255,0.4)',
                  boxShadow: tab === t ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 space-y-3">
          <AnimatePresence mode="wait">
            {tab === 'register' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative mb-3">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    className="input-glass pl-10"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              className="input-glass pl-10"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus={tab === 'login'}
            />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              className="input-glass pl-10 pr-11"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="px-3 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff6b7a' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white gradient-button flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {tab === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={15} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-white/25">or</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Demo */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.55)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
          >
            <Sparkles size={14} />
            Try demo without an account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
