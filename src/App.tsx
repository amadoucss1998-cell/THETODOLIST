import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: '#08080f' }}>
      {/* Background decorative blobs */}
      <div
        className="bg-blob"
        style={{
          width: 600,
          height: 600,
          background: '#7c3aed',
          top: -200,
          left: -100,
        }}
      />
      <div
        className="bg-blob"
        style={{
          width: 500,
          height: 500,
          background: '#4f46e5',
          bottom: -150,
          right: -100,
        }}
      />
      <div
        className="bg-blob"
        style={{
          width: 300,
          height: 300,
          background: '#06d6a0',
          top: '50%',
          right: '25%',
          opacity: 0.04,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <Header />
        <StatsBar />
        <TaskList />
      </main>

      {/* Task Modal */}
      <TaskModal />
    </div>
  );
}
