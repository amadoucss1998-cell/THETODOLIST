import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, Pause, Square, Wind, Volume2, VolumeX, Timer, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMeditationStore } from '../store/meditationStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MeditationStep {
  duration: number;
  instruction: string;
}

interface Meditation {
  id: string;
  title: string;
  duration: number;
  category: string;
  description: string;
  gradient: string;
  steps: MeditationStep[];
}

// ─── Meditation data ─────────────────────────────────────────────────────────

const MEDITATIONS: Meditation[] = [
  {
    id: 'morning',
    title: 'Morning Calm',
    duration: 300,
    category: 'Morning',
    description: 'Start your day with clarity and intention',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    steps: [
      { duration: 30, instruction: 'Close your eyes and take a deep breath in through your nose… hold gently… and exhale slowly through your mouth.' },
      { duration: 60, instruction: 'Feel your body settle into stillness. Notice the weight of your limbs, the gentle rise and fall of your chest.' },
      { duration: 60, instruction: 'Set a gentle intention for today. No pressure — just a quiet wish for how you want to show up in the world.' },
      { duration: 90, instruction: 'Breathe naturally. With each breath, imagine soft morning light filling you — warmth, clarity, possibility.' },
      { duration: 60, instruction: 'Take a moment to appreciate this stillness. When you are ready, gently open your eyes and carry this calm into your day.' },
    ],
  },
  {
    id: 'focus',
    title: 'Deep Focus',
    duration: 600,
    category: 'Focus',
    description: 'Sharpen your mind for deep work',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    steps: [
      { duration: 30, instruction: 'Sit tall and close your eyes. Take three slow, deliberate breaths to arrive fully in this moment.' },
      { duration: 90, instruction: 'Bring your attention to the tip of your nose. Notice the cool air entering… the warm air leaving. Stay here.' },
      { duration: 120, instruction: 'If a thought arises, simply label it "thinking" and return to your breath. No judgment — just gentle return.' },
      { duration: 120, instruction: 'Imagine your mind as a still mountain lake. Thoughts are ripples that come and go, but the depths remain undisturbed.' },
      { duration: 120, instruction: 'Now see the task ahead. Picture yourself fully absorbed, clear, and capable. Every distraction falls away.' },
      { duration: 120, instruction: 'Rest in this focused stillness. When you open your eyes, carry this single-pointed clarity into your work.' },
    ],
  },
  {
    id: 'stress',
    title: 'Stress Relief',
    duration: 480,
    category: 'Stress',
    description: 'Release tension and find peace',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    steps: [
      { duration: 30, instruction: 'Close your eyes. Take a long, slow breath in… and sigh it out audibly. Let something go.' },
      { duration: 60, instruction: 'Scan your body from head to toe. Where do you feel tension? Acknowledge it without trying to fix it.' },
      { duration: 90, instruction: 'With each exhale, consciously release that tension. Breathe out stress, breathe in ease. You are safe right now.' },
      { duration: 90, instruction: 'Relax your jaw. Soften your shoulders away from your ears. Unclench your hands. Let your belly be soft.' },
      { duration: 120, instruction: 'Picture a peaceful place — a forest, a beach, a quiet room. Feel yourself truly there. Let this place hold you.' },
      { duration: 90, instruction: 'You have handled everything so far. This moment is already passing. Breathe slowly. All is well.' },
    ],
  },
  {
    id: 'sleep',
    title: 'Sleep Well',
    duration: 720,
    category: 'Sleep',
    description: 'Drift into restful sleep',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    steps: [
      { duration: 60, instruction: 'Lie down comfortably. Close your eyes. Take a long, slow breath in… and an even slower breath out.' },
      { duration: 120, instruction: 'Let your body grow heavy. Feel the mattress cradling every part of you. You have nowhere to go and nothing to do.' },
      { duration: 120, instruction: 'Starting at your feet, let go completely. Toes… heels… calves… knees… all soft, all heavy, all at rest.' },
      { duration: 120, instruction: 'Continue up — thighs, hips, belly, chest. Each breath out melts more tension away. You are sinking gently.' },
      { duration: 120, instruction: 'Shoulders, arms, hands — dissolving into warmth. Your neck is long and soft. Your face is completely relaxed.' },
      { duration: 180, instruction: 'Imagine a warm, gentle darkness. No thoughts needed now. Just drift… float… let sleep come to you.' },
    ],
  },
  {
    id: 'anxiety',
    title: 'Calm Anxiety',
    duration: 420,
    category: 'Anxiety',
    description: 'Ease worry and find stillness',
    gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
    steps: [
      { duration: 30, instruction: 'Close your eyes. Place one hand on your chest, one on your belly. Feel your breath move beneath your hands.' },
      { duration: 60, instruction: 'Breathe in slowly for 4 counts… hold for 1… out for 6. The long exhale activates your calming response.' },
      { duration: 90, instruction: 'Name five things you can feel right now — the fabric under you, the temperature of the air. Stay in your body.' },
      { duration: 90, instruction: 'Your anxiety is trying to protect you. Thank it gently, then let it know: you are safe. Right here, right now, you are okay.' },
      { duration: 90, instruction: 'Picture worry as clouds passing through a wide sky. You are the sky — vast, still, unchanged. The clouds are not you.' },
      { duration: 60, instruction: 'Take three slow breaths. With each one, feel your nervous system settle. Peace is available to you, always.' },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    duration: 300,
    category: 'Mindfulness',
    description: 'Cultivate thankfulness',
    gradient: 'linear-gradient(135deg, #ffd89b, #19547b)',
    steps: [
      { duration: 30, instruction: 'Settle in, close your eyes, and take a few natural breaths. Arrive fully in this moment.' },
      { duration: 60, instruction: 'Bring to mind one small thing you are grateful for today — something simple, like warmth, or the fact that you are breathing.' },
      { duration: 60, instruction: 'Let the feeling of gratitude grow in your chest. Notice how it changes the quality of your breath, your body.' },
      { duration: 60, instruction: 'Think of a person who has helped you. Silently wish them well. Send them warmth and appreciation.' },
      { duration: 90, instruction: 'Rest in appreciation for your own life — its complexity, its gifts, even its challenges. You are here. That is everything.' },
    ],
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    duration: 600,
    category: 'Relaxation',
    description: 'Release tension from head to toe',
    gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
    steps: [
      { duration: 30, instruction: 'Lie or sit comfortably. Close your eyes. Take three deep breaths and arrive in your body.' },
      { duration: 90, instruction: 'Bring awareness to the top of your head. Scalp, forehead, eyes — soften each area. There is no right or wrong here.' },
      { duration: 90, instruction: 'Move down — jaw, throat, shoulders. Notice without judgment. Breathe into any area of tightness and let it soften.' },
      { duration: 90, instruction: 'Chest and belly — with each breath, feel the gentle expansion. Heart, lungs, stomach — all doing their quiet work.' },
      { duration: 120, instruction: 'Lower back, hips, thighs, knees, calves, ankles, feet, toes. Send warm attention to every part. Everything relaxes.' },
      { duration: 120, instruction: 'Feel your whole body at once now — a living, breathing whole. Rest in this full awareness. You are complete.' },
    ],
  },
  {
    id: 'quick',
    title: 'Quick Reset',
    duration: 180,
    category: 'Quick',
    description: '3 minutes to reset your mind',
    gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
    steps: [
      { duration: 30, instruction: 'Stop. Close your eyes. Take the deepest breath you have taken all day. Hold it… and let it go completely.' },
      { duration: 60, instruction: 'Three more slow breaths. With each inhale, breathe in calm. With each exhale, release whatever you were holding.' },
      { duration: 60, instruction: 'Notice you are here, alive, present. This moment is enough. You are enough. A fresh start is always available.' },
      { duration: 30, instruction: 'Open your eyes slowly. You are reset. Carry this pause with you.' },
    ],
  },
];

// ─── Breathing patterns ───────────────────────────────────────────────────────

interface BreathPhase {
  label: string;
  duration: number;
  color: string;
  scale: number;
}

interface BreathPattern {
  id: string;
  name: string;
  description: string;
  phases: BreathPhase[];
}

const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: '4-4-4-4 — balance & calm',
    phases: [
      { label: 'Inhale', duration: 4, color: '#8b5cf6', scale: 1.4 },
      { label: 'Hold', duration: 4, color: '#06d6a0', scale: 1.4 },
      { label: 'Exhale', duration: 4, color: '#4f46e5', scale: 0.7 },
      { label: 'Hold', duration: 4, color: '#06d6a0', scale: 0.7 },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: '4-7-8 — deep relaxation',
    phases: [
      { label: 'Inhale', duration: 4, color: '#8b5cf6', scale: 1.4 },
      { label: 'Hold', duration: 7, color: '#06d6a0', scale: 1.4 },
      { label: 'Exhale', duration: 8, color: '#4f46e5', scale: 0.7 },
    ],
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: '5-5 — simple & soothing',
    phases: [
      { label: 'Inhale', duration: 5, color: '#8b5cf6', scale: 1.4 },
      { label: 'Exhale', duration: 5, color: '#4f46e5', scale: 0.7 },
    ],
  },
];

// ─── Ambient sounds ───────────────────────────────────────────────────────────

interface AmbientSound {
  id: string;
  name: string;
  emoji: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'forest', name: 'Forest', emoji: '🌿' },
  { id: 'white', name: 'White Noise', emoji: '⬜' },
  { id: 'brown', name: 'Brown Noise', emoji: '🟤' },
  { id: 'binaural', name: 'Binaural Focus', emoji: '🧠' },
];

const TIMER_OPTIONS = [5, 10, 15, 30, 60];

// ─── Audio engine ─────────────────────────────────────────────────────────────

function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function buildRainNode(ctx: AudioContext, gainValue: number): { gain: GainNode; nodes: AudioNode[] } {
  const bufferSize = 4096;
  const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
  processor.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
  };
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;
  const gain = ctx.createGain();
  gain.gain.value = gainValue;
  processor.connect(filter);
  filter.connect(gain);
  return { gain, nodes: [processor, filter] };
}

function buildOceanNode(ctx: AudioContext, gainValue: number): { gain: GainNode; nodes: AudioNode[] } {
  const bufferSize = 4096;
  const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
  processor.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
  };
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.3;
  lfo.type = 'sine';
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.4;
  lfo.connect(lfoGain);
  const masterGain = ctx.createGain();
  masterGain.gain.value = gainValue * 0.6;
  lfoGain.connect(masterGain.gain);
  lfo.start();
  processor.connect(filter);
  filter.connect(masterGain);
  return { gain: masterGain, nodes: [processor, filter, lfo, lfoGain] };
}

function buildForestNode(ctx: AudioContext, gainValue: number): { gain: GainNode; nodes: AudioNode[] } {
  const bufferSize = 4096;
  const gainFactors = [1, 0.5, 0.25, 0.125, 0.0625];
  const processors = gainFactors.map((g) => {
    const proc = ctx.createScriptProcessor(bufferSize, 1, 1);
    const ng = ctx.createGain();
    ng.gain.value = g;
    proc.onaudioprocess = (e) => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
    };
    proc.connect(ng);
    return ng;
  });
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  const masterGain = ctx.createGain();
  masterGain.gain.value = gainValue * 0.3;
  processors.forEach((p) => p.connect(filter));
  filter.connect(masterGain);
  return { gain: masterGain, nodes: [...processors, filter] };
}

function buildWhiteNoiseNode(ctx: AudioContext, gainValue: number): { gain: GainNode; nodes: AudioNode[] } {
  const bufferSize = 4096;
  const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
  processor.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
  };
  const gain = ctx.createGain();
  gain.gain.value = gainValue * 0.3;
  processor.connect(gain);
  return { gain, nodes: [processor] };
}

function buildBrownNoiseNode(ctx: AudioContext, gainValue: number): { gain: GainNode; nodes: AudioNode[] } {
  const bufferSize = 4096;
  let lastOut = 0;
  const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
  processor.onaudioprocess = (e) => {
    const out = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      lastOut = (lastOut + 0.02 * Math.random()) / 1.02;
      out[i] = lastOut * 3.5;
    }
  };
  const gain = ctx.createGain();
  gain.gain.value = gainValue;
  processor.connect(gain);
  return { gain, nodes: [processor] };
}

function buildBinauralNode(ctx: AudioContext, gainValue: number): { gain: GainNode; nodes: AudioNode[] } {
  const merger = ctx.createChannelMerger(2);
  const leftOsc = ctx.createOscillator();
  leftOsc.frequency.value = 200;
  leftOsc.type = 'sine';
  const rightOsc = ctx.createOscillator();
  rightOsc.frequency.value = 210;
  rightOsc.type = 'sine';
  const leftGain = ctx.createGain();
  leftGain.gain.value = 0.5;
  const rightGain = ctx.createGain();
  rightGain.gain.value = 0.5;
  leftOsc.connect(leftGain);
  rightOsc.connect(rightGain);
  leftGain.connect(merger, 0, 0);
  rightGain.connect(merger, 0, 1);
  leftOsc.start();
  rightOsc.start();
  const masterGain = ctx.createGain();
  masterGain.gain.value = gainValue * 0.4;
  merger.connect(masterGain);
  return { gain: masterGain, nodes: [leftOsc, rightOsc, leftGain, rightGain, merger] };
}

function buildSoundNode(
  ctx: AudioContext,
  soundId: string,
  gainValue: number
): { gain: GainNode; nodes: AudioNode[] } {
  switch (soundId) {
    case 'rain': return buildRainNode(ctx, gainValue);
    case 'ocean': return buildOceanNode(ctx, gainValue);
    case 'forest': return buildForestNode(ctx, gainValue);
    case 'white': return buildWhiteNoiseNode(ctx, gainValue);
    case 'brown': return buildBrownNoiseNode(ctx, gainValue);
    case 'binaural': return buildBinauralNode(ctx, gainValue);
    default: return buildWhiteNoiseNode(ctx, gainValue);
  }
}

// ─── Circular progress SVG ────────────────────────────────────────────────────

function CircleProgress({ progress, size = 200 }: { progress: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - progress);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(139,92,246,0.8)" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

// ─── Meditation Player overlay ─────────────────────────────────────────────────

interface PlayerProps {
  meditation: Meditation;
  onClose: () => void;
}

function MeditationPlayer({ meditation, onClose }: PlayerProps) {
  const { currentUser } = useAuthStore();
  const { logSession } = useMeditationStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [breathScale, setBreathScale] = useState(1);

  const totalDuration = meditation.steps.reduce((a, s) => a + s.duration, 0);
  const currentStep = meditation.steps[stepIndex] ?? meditation.steps[meditation.steps.length - 1];
  const timeLeft = totalDuration - totalElapsed;
  const progress = totalElapsed / totalDuration;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Breathing circle pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathScale((s) => (s > 1 ? 0.85 : 1.15));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    if (paused || done) return;
    const interval = setInterval(() => {
      setStepElapsed((se) => {
        const next = se + 1;
        if (next >= currentStep.duration) {
          // Advance to next step
          setStepIndex((si) => {
            const nextSi = si + 1;
            if (nextSi >= meditation.steps.length) {
              setDone(true);
              if (currentUser) {
                logSession(currentUser.id, meditation.id, totalElapsed + 1);
              }
            }
            return nextSi < meditation.steps.length ? nextSi : si;
          });
          return 0;
        }
        return next;
      });
      setTotalElapsed((te) => te + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, done, currentStep, meditation.steps.length, meditation.id, totalElapsed, currentUser, logSession]);

  const handleStop = () => {
    if (totalElapsed >= 30 && currentUser) {
      logSession(currentUser.id, meditation.id, totalElapsed);
    }
    onClose();
  };

  const completedMinutes = Math.ceil(totalElapsed / 60);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#08080f' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Glow blob */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl"
        style={{
          background: meditation.gradient,
          borderRadius: '50%',
          transform: 'scale(1.5)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg w-full">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Check size={40} color="white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Well done!</h2>
              <p className="text-white/60 text-lg">
                You meditated for {completedMinutes} minute{completedMinutes !== 1 ? 's' : ''}
              </p>
              <p className="text-white/40 text-sm mt-1">{meditation.title} — complete</p>
            </div>
            <button
              onClick={onClose}
              className="gradient-button px-8 py-3 rounded-xl text-white font-semibold text-base"
            >
              Continue
            </button>
          </motion.div>
        ) : (
          <>
            {/* Title */}
            <div>
              <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">{meditation.category}</span>
              <h2 className="text-2xl font-bold text-white mt-1">{meditation.title}</h2>
            </div>

            {/* Breathing circle + progress ring */}
            <div className="relative flex items-center justify-center">
              <CircleProgress progress={progress} size={220} />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: breathScale }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="w-28 h-28 rounded-full"
                  style={{ background: meditation.gradient, opacity: 0.7, filter: 'blur(2px)' }}
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white tabular-nums">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-white/40 text-xs mt-0.5">remaining</span>
              </div>
            </div>

            {/* Step instruction */}
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/80 text-lg leading-relaxed font-light max-w-md"
            >
              {currentStep.instruction}
            </motion.p>

            {/* Step indicator */}
            <div className="flex gap-2">
              {meditation.steps.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === stepIndex ? 24 : 8,
                    background: i <= stepIndex ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPaused((p) => !p)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)' }}
              >
                {paused ? <Play size={22} color="white" fill="white" /> : <Pause size={22} color="white" />}
              </button>
              <button
                onClick={handleStop}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Square size={18} color="rgba(255,255,255,0.6)" fill="rgba(255,255,255,0.6)" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────

function SessionsTab() {
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MEDITATIONS.map((med) => (
          <motion.div
            key={med.id}
            whileHover={{ scale: 1.02 }}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Gradient header */}
            <div
              className="h-24 flex items-end p-3 relative"
              style={{ background: med.gradient }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.9)' }}
              >
                {med.category}
              </span>
              <span
                className="ml-auto text-[10px] font-semibold"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {Math.floor(med.duration / 60)} min
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm mb-1">{med.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-4">{med.description}</p>
              <button
                onClick={() => setActiveMeditation(med)}
                className="gradient-button w-full py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Play size={12} fill="white" />
                Begin
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeMeditation && (
          <MeditationPlayer
            meditation={activeMeditation}
            onClose={() => setActiveMeditation(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Breathe Tab ─────────────────────────────────────────────────────────────

function BreatheTab() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [totalCycles, setTotalCycles] = useState(5);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0-100

  const timerRef = useRef<number | null>(null);
  const tickRef = useRef(0);

  const currentPhase = selectedPattern.phases[phaseIndex];

  const stopExercise = useCallback(() => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhaseIndex(0);
    setCycleCount(0);
    setPhaseProgress(0);
    tickRef.current = 0;
  }, []);

  useEffect(() => {
    if (!running) return;

    timerRef.current = window.setInterval(() => {
      tickRef.current += 1;
      const phase = selectedPattern.phases[phaseIndex];
      const ticks = phase.duration * 10; // 100ms intervals
      const progress = Math.min((tickRef.current / ticks) * 100, 100);
      setPhaseProgress(progress);

      if (tickRef.current >= ticks) {
        tickRef.current = 0;
        setPhaseIndex((pi) => {
          const next = pi + 1;
          if (next >= selectedPattern.phases.length) {
            setCycleCount((c) => {
              const newC = c + 1;
              if (newC >= totalCycles) {
                stopExercise();
              }
              return newC;
            });
            return 0;
          }
          return next;
        });
        setPhaseProgress(0);
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, phaseIndex, selectedPattern, totalCycles, stopExercise]);

  const startExercise = () => {
    setPhaseIndex(0);
    setCycleCount(0);
    setPhaseProgress(0);
    tickRef.current = 0;
    setRunning(true);
  };

  const circleColor = running ? currentPhase.color : '#4f46e5';
  const circleScale = running ? currentPhase.scale : 1;

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Pattern selection */}
      {!running && (
        <div className="flex flex-wrap gap-3 justify-center">
          {BREATH_PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPattern(p)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: selectedPattern.id === p.id ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${selectedPattern.id === p.id ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: selectedPattern.id === p.id ? '#a78bfa' : 'rgba(255,255,255,0.6)',
              }}
            >
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs opacity-60">{p.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* Cycles selector */}
      {!running && (
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm">Cycles:</span>
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setTotalCycles(n)}
              className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
              style={{
                background: totalCycles === n ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${totalCycles === n ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: totalCycles === n ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Animated circle */}
      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: running ? currentPhase.duration : 0.5, ease: 'easeInOut' }}
          className="w-48 h-48 rounded-full absolute"
          style={{ background: circleColor, opacity: 0.25, filter: 'blur(8px)' }}
        />
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: running ? currentPhase.duration : 0.5, ease: 'easeInOut' }}
          className="w-40 h-40 rounded-full flex flex-col items-center justify-center"
          style={{ background: `${circleColor}30`, border: `2px solid ${circleColor}60` }}
        >
          <span className="text-white font-semibold text-lg">{running ? currentPhase.label : 'Ready'}</span>
          {running && (
            <span className="text-white/40 text-sm mt-0.5">{currentPhase.duration}s</span>
          )}
        </motion.div>
      </div>

      {/* Cycle counter */}
      {running && (
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Cycle <span className="text-white font-semibold">{cycleCount + 1}</span> of{' '}
            <span className="text-white font-semibold">{totalCycles}</span>
          </p>
          {/* Phase progress bar */}
          <div className="mt-2 w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-none"
              style={{ width: `${phaseProgress}%`, background: currentPhase.color }}
            />
          </div>
        </div>
      )}

      {/* Start/Stop */}
      <button
        onClick={running ? stopExercise : startExercise}
        className="gradient-button px-10 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
      >
        <Wind size={18} />
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

// ─── Sounds Tab ───────────────────────────────────────────────────────────────

interface SoundState {
  active: boolean;
  volume: number; // 0-100
}

function SoundsTab() {
  const [soundStates, setSoundStates] = useState<Record<string, SoundState>>(
    Object.fromEntries(AMBIENT_SOUNDS.map((s) => [s.id, { active: false, volume: 60 }]))
  );
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<Record<string, { gain: GainNode; nodes: AudioNode[] }>>({});

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = createAudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopSound = useCallback((id: string) => {
    const entry = soundNodesRef.current[id];
    if (!entry) return;
    try {
      entry.gain.disconnect();
      entry.nodes.forEach((n) => {
        try { n.disconnect(); } catch {}
        if (n instanceof OscillatorNode || n instanceof AudioBufferSourceNode) {
          try { (n as OscillatorNode).stop(); } catch {}
        }
      });
    } catch {}
    delete soundNodesRef.current[id];
  }, []);

  const startSound = useCallback((id: string, volume: number) => {
    const ctx = getCtx();
    const gainValue = volume / 100;
    const entry = buildSoundNode(ctx, id, gainValue);
    entry.gain.connect(ctx.destination);
    soundNodesRef.current[id] = entry;
  }, [getCtx]);

  const toggleSound = useCallback((id: string) => {
    setSoundStates((prev) => {
      const current = prev[id];
      const newActive = !current.active;
      if (newActive) {
        startSound(id, current.volume);
      } else {
        stopSound(id);
      }
      return { ...prev, [id]: { ...current, active: newActive } };
    });
  }, [startSound, stopSound]);

  const setVolume = useCallback((id: string, volume: number) => {
    setSoundStates((prev) => {
      const current = prev[id];
      if (current.active) {
        const entry = soundNodesRef.current[id];
        if (entry) {
          entry.gain.gain.value = volume / 100;
        }
      }
      return { ...prev, [id]: { ...current, volume } };
    });
  }, []);

  // Timer
  useEffect(() => {
    if (timerRemaining === null) return;
    if (timerRemaining <= 0) {
      // Stop all sounds
      AMBIENT_SOUNDS.forEach((s) => stopSound(s.id));
      setSoundStates(
        Object.fromEntries(AMBIENT_SOUNDS.map((s) => [s.id, { active: false, volume: soundStates[s.id]?.volume ?? 60 }]))
      );
      setTimerRemaining(null);
      return;
    }
    const t = window.setTimeout(() => setTimerRemaining((r) => (r !== null ? r - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [timerRemaining, stopSound, soundStates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      AMBIENT_SOUNDS.forEach((s) => stopSound(s.id));
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, [stopSound]);

  const startTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    setTimerRemaining(minutes * 60);
  };

  const stopTimer = () => {
    setTimerMinutes(null);
    setTimerRemaining(null);
  };

  const timerMins = timerRemaining !== null ? Math.floor(timerRemaining / 60) : null;
  const timerSecs = timerRemaining !== null ? timerRemaining % 60 : null;
  const anyActive = Object.values(soundStates).some((s) => s.active);

  return (
    <div className="space-y-6">
      {/* Sound cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {AMBIENT_SOUNDS.map((sound) => {
          const state = soundStates[sound.id];
          return (
            <div
              key={sound.id}
              className="glass-card rounded-2xl p-4 space-y-3"
              style={{
                border: `1px solid ${state.active ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.07)'}`,
                background: state.active ? 'rgba(139,92,246,0.08)' : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sound.emoji}</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{sound.name}</p>
                    {state.active && (
                      <p className="text-purple-400 text-[10px] font-medium">Now Playing</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleSound(sound.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: state.active ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${state.active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {state.active ? (
                    <Volume2 size={16} color="#a78bfa" />
                  ) : (
                    <VolumeX size={16} color="rgba(255,255,255,0.4)" />
                  )}
                </button>
              </div>
              {/* Volume slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/30 text-[10px]">Volume</span>
                  <span className="text-white/40 text-[10px]">{state.volume}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={state.volume}
                  onChange={(e) => setVolume(sound.id, Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: '#8b5cf6' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Timer */}
      <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Timer size={16} color="#a78bfa" />
          <h3 className="text-white font-semibold text-sm">Auto-Stop Timer</h3>
          {timerRemaining !== null && timerMins !== null && timerSecs !== null && (
            <span className="ml-auto text-purple-300 font-mono text-sm font-bold">
              {timerMins}:{timerSecs.toString().padStart(2, '0')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TIMER_OPTIONS.map((min) => (
            <button
              key={min}
              onClick={() => (timerMinutes === min && timerRemaining !== null ? stopTimer() : startTimer(min))}
              disabled={!anyActive && timerMinutes !== min}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
              style={{
                background: timerMinutes === min && timerRemaining !== null
                  ? 'rgba(139,92,246,0.3)'
                  : 'rgba(255,255,255,0.07)',
                border: `1px solid ${timerMinutes === min && timerRemaining !== null ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: timerMinutes === min && timerRemaining !== null ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              }}
            >
              {min} min
            </button>
          ))}
          {timerRemaining !== null && (
            <button
              onClick={stopTimer}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              Cancel
            </button>
          )}
        </div>
        {!anyActive && timerRemaining === null && (
          <p className="text-white/25 text-xs mt-3">Start a sound above to enable the timer</p>
        )}
      </div>
    </div>
  );
}

// ─── Main MeditationPage ──────────────────────────────────────────────────────

type MedTab = 'sessions' | 'breathe' | 'sounds';

export default function MeditationPage() {
  const { currentUser } = useAuthStore();
  const { getUserSessions, getTotalMinutes, getStreak } = useMeditationStore();
  const [activeTab, setActiveTab] = useState<MedTab>('sessions');

  const userId = currentUser?.id ?? '';
  const sessions = getUserSessions(userId);
  const totalMinutes = getTotalMinutes(userId);
  const streak = getStreak(userId);

  const tabs: { id: MedTab; label: string; icon: React.ElementType }[] = [
    { id: 'sessions', label: 'Sessions', icon: Brain },
    { id: 'breathe', label: 'Breathe', icon: Wind },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
  ];

  return (
    <div className="flex-1 overflow-y-auto relative z-10 px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Brain size={18} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Meditate</h1>
            <p className="text-white/35 text-sm">Find your calm</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Sessions', value: sessions.length },
          { label: 'Minutes', value: totalMinutes },
          { label: 'Day Streak', value: `${streak} 🔥` },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 text-center"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === id ? 'rgba(139,92,246,0.25)' : 'transparent',
              border: `1px solid ${activeTab === id ? 'rgba(139,92,246,0.4)' : 'transparent'}`,
              color: activeTab === id ? '#a78bfa' : 'rgba(255,255,255,0.45)',
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'breathe' && <BreatheTab />}
          {activeTab === 'sounds' && <SoundsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
