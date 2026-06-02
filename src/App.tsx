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
import PomodoroTimer from './components/PomodoroTimer';
import { useAuthStore } from './store/authStore';
import { useTodoStore } from './store/todoStore';

export default function App() {
  const { currentUser } = useAuthStore();
  const { setCurrentUserId } = useTodoStore();
  const [activeSection, setActiveSection] = useState<'tasks' | 'journal' | 'analytics' | 'meditation'>('tasks');

  useEffect(() => {
    setCurrentUserId(currentUser?.id ?? null);
  }, [currentUser?.id]);

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: '#08080f' }}>
      <div className="bg-blob" style={{ width: 600, height: 600, background: '#7c3aed', top: -200, left: -100 }} />
      <div className="bg-blob" style={{ width: 500, height: 500, background: '#4f46e5', bottom: -150, right: -100 }} />
      <div className="bg-blob" style={{ width: 300, height: 300, background: '#06d6a0', top: '50%', right: '25%', opacity: 0.04 }} />

      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        {activeSection === 'tasks' ? (
          <>
            <Header />
            <StatsBar />
            <TaskList />
            <QuickAddBar />
          </>
        ) : activeSection === 'journal' ? (
          <JournalPage />
        ) : activeSection === 'analytics' ? (
          <AnalyticsPage />
        ) : (
          <MeditationPage />
        )}
      </main>

      <TaskModal />
      <KeyboardShortcuts />
      <NotificationManager />
      <PomodoroTimer />
    </div>
  );
}
