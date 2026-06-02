import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import QuickAddBar from './components/QuickAddBar';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import AuthScreen from './components/AuthScreen';
import NotificationManager from './components/NotificationManager';
import JournalPage from './components/JournalPage';
import AnalyticsPage from './components/AnalyticsPage';
import MeditationPage from './components/MeditationPage';
import HabitPage from './components/HabitPage';
import GlobalSearch from './components/GlobalSearch';
import DailyQuote from './components/DailyQuote';
import PomodoroTimer from './components/PomodoroTimer';
import { useAuthStore } from './store/authStore';
import { useTodoStore } from './store/todoStore';
import { useThemeStore } from './store/themeStore';
import { useJournalStore } from './store/journalStore';

export type ActiveSection = 'tasks' | 'journal' | 'analytics' | 'meditation' | 'habits';

export default function App() {
  const { currentUser } = useAuthStore();
  const { setCurrentUserId } = useTodoStore();
  const { mode, accent } = useThemeStore();
  const { setActiveJournalDate } = useJournalStore();
  const [activeSection, setActiveSection] = useState<ActiveSection>('tasks');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setCurrentUserId(currentUser?.id ?? null);
  }, [currentUser?.id]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-light', accent + '20');
  }, [mode, accent]);

  // Global Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleOpenSection = (section: 'tasks' | 'journal', date?: string) => {
    setActiveSection(section);
    if (section === 'journal' && date) {
      setActiveJournalDate(date);
    }
  };

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ background: mode === 'light' ? 'var(--bg-primary)' : '#08080f' }}
    >
      {mode === 'dark' && (
        <>
          <div className="bg-blob" style={{ width: 600, height: 600, background: '#7c3aed', top: -200, left: -100 }} />
          <div className="bg-blob" style={{ width: 500, height: 500, background: '#4f46e5', bottom: -150, right: -100 }} />
          <div className="bg-blob" style={{ width: 300, height: 300, background: '#06d6a0', top: '50%', right: '25%', opacity: 0.04 }} />
        </>
      )}

      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} onOpenSearch={() => setSearchOpen(true)} />

      <main className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        {activeSection === 'tasks' ? (
          <>
            <Header onOpenSearch={() => setSearchOpen(true)} />
            <StatsBar />
            <DailyQuote />
            <TaskList />
            <QuickAddBar />
          </>
        ) : activeSection === 'journal' ? (
          <JournalPage />
        ) : activeSection === 'analytics' ? (
          <AnalyticsPage />
        ) : activeSection === 'meditation' ? (
          <MeditationPage />
        ) : (
          <HabitPage />
        )}
      </main>

      <TaskModal />
      <KeyboardShortcuts />
      <NotificationManager />
      <PomodoroTimer />

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenSection={handleOpenSection}
      />
    </div>
  );
}
