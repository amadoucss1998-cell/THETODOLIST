import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useTodoStore } from '../store/todoStore';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

export default function TaskList() {
  const { getFilteredTasks, reorderTasks, activeView, searchQuery, filterPriority } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const tasks = getFilteredTasks();
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      reorderTasks(active.id as string, over.id as string);
    }
  };

  const hasSearch = !!(searchQuery.trim() || filterPriority);
  const isEmpty = tasks.length === 0;

  if (isEmpty) {
    return (
      <div className="flex-1 overflow-y-auto px-6">
        <EmptyState view={activeView} hasSearch={hasSearch} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-24">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Incomplete tasks */}
          {incompleteTasks.length > 0 && (
            <motion.div layout className="space-y-2.5 mb-6">
              <AnimatePresence initial={false}>
                {incompleteTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Completed tasks section */}
          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                  Completed · {completedTasks.length}
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <motion.div layout className="space-y-2 opacity-70">
                <AnimatePresence initial={false}>
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div style={{ transform: 'rotate(2deg)', opacity: 0.9 }}>
              <TaskCard task={tasks.find((t) => t.id === activeId)!} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
