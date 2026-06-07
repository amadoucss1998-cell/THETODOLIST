import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/authStore'
import { useTodoStore, Priority, ViewType, Task } from '../../src/store/todoStore'
import { C, priorityColor } from '../../src/theme'

const VIEWS: { key: ViewType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'starred', label: 'Starred' },
  { key: 'completed', label: 'Completed' },
]

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low']

export default function TasksScreen() {
  const insets = useSafeAreaInsets()
  const { currentUser } = useAuthStore()
  const {
    activeView, setActiveView, getUserTasks, addTask, toggleComplete, toggleStar,
    deleteTask, currentUserId, setCurrentUserId,
  } = useTodoStore()

  const [modalVisible, setModalVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (currentUser && currentUser.id !== currentUserId) {
      setCurrentUserId(currentUser.id)
    }
  }, [currentUser])

  const tasks = getUserTasks()

  const handleAdd = () => {
    if (!title.trim() || !currentUser) return
    addTask({
      userId: currentUser.id,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      completed: false,
      starred: false,
      dueDate: dueDate.trim() || undefined,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setModalVisible(false)
  }

  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>TaskFlow</Text>
          <Text style={styles.greeting}>Hello, {currentUser?.name.split(' ')[0]}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: currentUser?.avatarColor || C.accent }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {VIEWS.map(v => (
          <TouchableOpacity
            key={v.key}
            style={[styles.chip, activeView === v.key && styles.chipActive]}
            onPress={() => setActiveView(v.key)}
          >
            <Text style={[styles.chipText, activeView === v.key && styles.chipTextActive]}>
              {v.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      {tasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>No tasks here</Text>
          <Text style={styles.emptyText}>Tap + to add your first task</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={t => t.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggle={() => toggleComplete(item.id)}
              onStar={() => toggleStar(item.id)}
              onDelete={() => deleteTask(item.id)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor={C.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Description (optional)"
              placeholderTextColor={C.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={C.textMuted}
              value={dueDate}
              onChangeText={setDueDate}
            />

            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    { borderColor: priorityColor[p] },
                    priority === p && { backgroundColor: priorityColor[p] },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priorityText, priority === p && { color: '#000' }]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

function TaskCard({
  task,
  onToggle,
  onStar,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onStar: () => void
  onDelete: () => void
}) {
  return (
    <View style={styles.taskCard}>
      <View style={[styles.taskStripe, { backgroundColor: priorityColor[task.priority] }]} />
      <TouchableOpacity style={styles.taskCheck} onPress={onToggle}>
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.taskBody}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
          {task.title}
        </Text>
        {task.dueDate ? (
          <Text style={styles.taskDue}>Due: {task.dueDate}</Text>
        ) : null}
        {task.description ? (
          <Text style={styles.taskDesc} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={onStar} style={styles.taskAction}>
          <Text style={{ color: task.starred ? C.yellow : C.textMuted, fontSize: 18 }}>★</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.taskAction}>
          <Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  appTitle: { color: C.accentBright, fontSize: 22, fontWeight: '700' },
  greeting: { color: C.textSoft, fontSize: 13, marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  filtersScroll: { maxHeight: 52 },
  filtersContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.accentLight, borderColor: C.accent },
  chipText: { color: C.textSoft, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: C.accentBright },
  listContent: { padding: 16, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: C.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  emptyText: { color: C.textMuted, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: C.bgCard2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
    marginBottom: 12,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  fieldLabel: { color: C.textSoft, fontSize: 13, marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  priorityText: { color: C.textSoft, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
  },
  cancelText: { color: C.textSoft, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  taskStripe: { width: 4, alignSelf: 'stretch' },
  taskCheck: { padding: 14 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: C.green, borderColor: C.green },
  checkMark: { color: '#000', fontSize: 12, fontWeight: '700' },
  taskBody: { flex: 1, paddingVertical: 14, paddingRight: 4 },
  taskTitle: { color: C.text, fontSize: 15, fontWeight: '500' },
  taskTitleDone: { color: C.textMuted, textDecorationLine: 'line-through' },
  taskDue: { color: C.textMuted, fontSize: 12, marginTop: 3 },
  taskDesc: { color: C.textSoft, fontSize: 12, marginTop: 2 },
  taskActions: { flexDirection: 'row', paddingRight: 8 },
  taskAction: { padding: 8 },
})
