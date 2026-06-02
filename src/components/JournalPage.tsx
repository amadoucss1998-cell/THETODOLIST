import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Pin, Trash2, BookOpen,
  Smile, Meh, Frown, X, StickyNote,
} from 'lucide-react';
import { useJournalStore, Mood, Note } from '../store/journalStore';
import { useAuthStore } from '../store/authStore';
import { format, addDays, subDays, parseISO, isToday } from 'date-fns';

// ─── Mood config ─────────────────────────────────────────────────────────────
const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing', color: '#ffd32a' },
  { value: 'good',    emoji: '😊', label: 'Good',    color: '#2ed573' },
  { value: 'okay',    emoji: '😐', label: 'Okay',    color: '#4f8ef7' },
  { value: 'bad',     emoji: '😔', label: 'Bad',     color: '#ff6348' },
  { value: 'awful',   emoji: '😭', label: 'Awful',   color: '#ff4757' },
];

// ─── Note card ────────────────────────────────────────────────────────────────
function NoteCard({ note, onUpdate, onDelete }: {
  note: Note;
  onUpdate: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const save = useCallback(() => {
    onUpdate(note.id, { title, content });
  }, [note.id, title, content, onUpdate]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col rounded-2xl p-4 transition-shadow"
      style={{
        background: note.color,
        border: '1px solid rgba(255,255,255,0.07)',
        minHeight: 180,
      }}
    >
      {/* Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
          title={note.pinned ? 'Unpin' : 'Pin'}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: note.pinned ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)',
            color: note.pinned ? '#a78bfa' : 'rgba(255,255,255,0.4)',
          }}
        >
          <Pin size={11} />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {note.pinned && (
        <div className="absolute top-3 left-3">
          <Pin size={10} color="#a78bfa" />
        </div>
      )}

      <input
        className="w-full bg-transparent text-sm font-semibold text-white/90 placeholder-white/25 outline-none mb-2 pr-14"
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        style={{ paddingLeft: note.pinned ? '18px' : '0' }}
      />
      <textarea
        className="flex-1 bg-transparent text-xs text-white/65 placeholder-white/20 outline-none resize-none leading-relaxed"
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={save}
        rows={5}
      />
      <p className="text-[9px] text-white/20 mt-3">
        {format(parseISO(note.updatedAt), 'MMM d, h:mm a')}
      </p>
    </motion.div>
  );
}

// ─── Mini calendar strip ──────────────────────────────────────────────────────
function DateStrip({ selected, onSelect, userId }: {
  selected: string;
  onSelect: (d: string) => void;
  userId: string;
}) {
  const { entries } = useJournalStore();
  const entryDates = new Set(entries.filter((e) => e.userId === userId).map((e) => e.date));
  const base = parseISO(selected);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(base, i - 3);
    return {
      date: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE'),
      num: format(d, 'd'),
      today: isToday(d),
    };
  });

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSelect(format(subDays(base, 1), 'yyyy-MM-dd'))}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/08 transition-colors"
      >
        <ChevronLeft size={15} />
      </button>
      <div className="flex gap-1">
        {days.map((d) => {
          const isSelected = d.date === selected;
          const hasEntry = entryDates.has(d.date);
          return (
            <button
              key={d.date}
              onClick={() => onSelect(d.date)}
              className="flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-xl transition-all"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                  : d.today
                  ? 'rgba(139,92,246,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? 'none'
                  : d.today
                  ? '1px solid rgba(139,92,246,0.3)'
                  : '1px solid transparent',
              }}
            >
              <span className="text-[9px] font-semibold" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                {d.label}
              </span>
              <span className="text-sm font-bold" style={{ color: isSelected ? '#fff' : d.today ? '#a78bfa' : 'rgba(255,255,255,0.65)' }}>
                {d.num}
              </span>
              {hasEntry && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-purple-400" />
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onSelect(format(addDays(base, 1), 'yyyy-MM-dd'))}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/08 transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function JournalPage() {
  const { currentUser } = useAuthStore();
  const {
    activeJournalDate, setActiveJournalDate,
    getEntry, upsertEntry, deleteEntry,
    getUserNotes, addNote, updateNote, deleteNote,
  } = useJournalStore();

  const userId = currentUser!.id;
  const entry = getEntry(activeJournalDate, userId);
  const notes = getUserNotes(userId);

  const [draftContent, setDraftContent] = useState(entry?.content ?? '');
  const [draftMood, setDraftMood] = useState<Mood | null>(entry?.mood ?? null);
  const [activeTab, setActiveTab] = useState<'journal' | 'notes'>('journal');
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync draft when date changes
  useEffect(() => {
    const e = getEntry(activeJournalDate, userId);
    setDraftContent(e?.content ?? '');
    setDraftMood(e?.mood ?? null);
    setSaved(false);
  }, [activeJournalDate, userId]);

  const autosave = (content: string, mood: Mood | null) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (content.trim() || mood) {
        upsertEntry(activeJournalDate, userId, content, mood);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 800);
  };

  const handleContentChange = (v: string) => {
    setDraftContent(v);
    autosave(v, draftMood);
  };

  const handleMoodChange = (m: Mood) => {
    const next = draftMood === m ? null : m;
    setDraftMood(next);
    autosave(draftContent, next);
  };

  const handleDeleteEntry = () => {
    if (entry) deleteEntry(entry.id);
    setDraftContent('');
    setDraftMood(null);
  };

  const handleAddNote = () => {
    addNote(userId);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const displayDate = activeJournalDate === todayStr
    ? "Today's Journal"
    : format(parseISO(activeJournalDate), 'MMMM d, yyyy');

  const wordCount = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold gradient-text">{displayDate}</h1>
            <p className="text-xs text-white/30 mt-0.5">{format(parseISO(activeJournalDate), 'EEEE, MMMM d')}</p>
          </div>
          {activeJournalDate !== todayStr && (
            <button
              onClick={() => setActiveJournalDate(todayStr)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-purple-400 transition-colors"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Date strip */}
        <DateStrip selected={activeJournalDate} onSelect={setActiveJournalDate} userId={userId} />

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {[
            { id: 'journal' as const, label: 'Journal', icon: BookOpen },
            { id: 'notes' as const, label: `Notes (${notes.length})`, icon: StickyNote },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === id ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.05)',
                color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' ? (
            <motion.div
              key="journal"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="space-y-5 max-w-2xl"
            >
              {/* Mood picker */}
              <div>
                <p className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">How are you feeling?</p>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleMoodChange(m.value)}
                      title={m.label}
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                      style={{
                        background: draftMood === m.value ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                        border: draftMood === m.value ? `1.5px solid ${m.color}60` : '1.5px solid transparent',
                        transform: draftMood === m.value ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <span className="text-2xl leading-none">{m.emoji}</span>
                      <span className="text-[9px] font-semibold" style={{ color: draftMood === m.value ? m.color : 'rgba(255,255,255,0.3)' }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Writing area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">Journal Entry</p>
                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {saved && (
                        <motion.span
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-[10px] text-green-400 font-semibold"
                        >
                          Saved ✓
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <span className="text-[10px] text-white/20">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                    {entry && (
                      <button onClick={handleDeleteEntry} className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  className="w-full rounded-2xl px-5 py-4 text-sm text-white/80 placeholder-white/20 outline-none resize-none leading-relaxed transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minHeight: 280,
                  }}
                  placeholder={`What's on your mind today? Write freely — this is your private space.\n\nYou might reflect on:\n• What went well today?\n• What challenged you?\n• What are you grateful for?\n• What do you want to do differently?`}
                  value={draftContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.35)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                />
              </div>

              {/* Past entries hint */}
              {!draftContent && !draftMood && (
                <div
                  className="rounded-2xl px-5 py-4 flex items-start gap-3"
                  style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}
                >
                  <Smile size={16} color="#8b5cf6" className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-purple-300">Start your entry</p>
                    <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                      Pick a mood and write — entries auto-save as you type. Use the calendar above to revisit past days.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.18 }}
            >
              {/* Add note button */}
              <button
                onClick={handleAddNote}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <Plus size={15} />
                New Note
              </button>

              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <StickyNote size={24} color="#8b5cf6" />
                  </div>
                  <p className="text-sm font-semibold text-white/50">No notes yet</p>
                  <p className="text-xs text-white/25 mt-1">Create a note to jot down ideas, links, or anything you want to remember.</p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
                >
                  <AnimatePresence>
                    {notes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onUpdate={updateNote}
                        onDelete={deleteNote}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
