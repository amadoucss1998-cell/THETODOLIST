import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/authStore'
import { useHabitStore, Habit } from '../../src/store/habitStore'
import { C } from '../../src/theme'

const EMOJIS = ['🏃', '📚', '💧', '🧘', '💪', '🥗', '😴', '🎯', '✍️', '🎵', '🌿', '☀️', '🧹', '💊', '🐾', '🍎', '🚴', '🧠', '🙏', '❤️']
const COLORS = ['#7c3aed', '#4f8ef7', '#2ed573', '#ff6348', '#ffd32a', '#06d6a0', '#f72585', '#4cc9f0']
const FREQS: Habit['frequency'][] = ['daily', 'weekdays', 'weekends']

function getLast7Days(): string[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function HabitsScreen() {
  const insets = useSafeAreaInsets()
  const { currentUser } = useAuthStore()
  const { getUserHabits, addHabit, deleteHabit, toggleHabit, getStreak } = useHabitStore()

  const [modalVisible, setModalVisible] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🎯')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedFreq, setSelectedFreq] = useState<Habit['frequency']>('daily')

  const today = new Date().toISOString().split('T')[0]
  const last7 = getLast7Days()
  const habits = currentUser ? getUserHabits(currentUser.id) : []

  const handleAdd = () => {
    if (!habitName.trim() || !currentUser) return
    addHabit(currentUser.id, habitName.trim(), selectedEmoji, selectedColor, selectedFreq)
    setHabitName('')
    setSelectedEmoji('🎯')
    setSelectedColor(COLORS[0])
    setSelectedFreq('daily')
    setModalVisible(false)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔥</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>Tap + to start building habits</Text>
          </View>
        ) : (
          habits.map(habit => {
            const streak = getStreak(habit)
            const doneToday = habit.completions.includes(today)
            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitTop}>
                  <View style={[styles.habitEmoji, { backgroundColor: habit.color + '22' }]}>
                    <Text style={styles.emojiText}>{habit.emoji}</Text>
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitStreak}>🔥 {streak} day streak</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.habitCheck, doneToday && { backgroundColor: habit.color }]}
                    onPress={() => toggleHabit(habit.id, today)}
                  >
                    {doneToday ? (
                      <Text style={styles.habitCheckMark}>✓</Text>
                    ) : (
                      <View style={[styles.habitCheckInner, { borderColor: habit.color }]} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.dotsRow}>
                  {last7.map(day => {
                    const done = habit.completions.includes(day)
                    return (
                      <View
                        key={day}
                        style={[
                          styles.dot,
                          done ? { backgroundColor: habit.color } : styles.dotEmpty,
                        ]}
                      />
                    )
                  })}
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteHabit(habit.id)}
                >
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )
          })
        )}
      </ScrollView>

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
          <ScrollView style={styles.modalSheet} keyboardShouldPersistTaps="handled">
            <View style={{ paddingBottom: insets.bottom + 16 }}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>New Habit</Text>

              <TextInput
                style={styles.input}
                placeholder="Habit name"
                placeholderTextColor={C.textMuted}
                value={habitName}
                onChangeText={setHabitName}
              />

              <Text style={styles.fieldLabel}>Choose Emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJIS.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]}
                    onPress={() => setSelectedEmoji(e)}
                  >
                    <Text style={styles.emojiBtnText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Color</Text>
              <View style={styles.colorRow}>
                {COLORS.map(col => (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.colorBtn,
                      { backgroundColor: col },
                      selectedColor === col && styles.colorBtnActive,
                    ]}
                    onPress={() => setSelectedColor(col)}
                  >
                    {selectedColor === col && (
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Frequency</Text>
              <View style={styles.freqRow}>
                {FREQS.map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqBtn, selectedFreq === f && styles.freqBtnActive]}
                    onPress={() => setSelectedFreq(f)}
                  >
                    <Text
                      style={[styles.freqText, selectedFreq === f && styles.freqTextActive]}
                    >
                      {f}
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
                  <Text style={styles.saveText}>Add Habit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  title: { color: C.text, fontSize: 24, fontWeight: '700' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 },
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: C.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  emptyText: { color: C.textMuted, fontSize: 14 },
  habitCard: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  habitTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  habitEmoji: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emojiText: { fontSize: 22 },
  habitInfo: { flex: 1 },
  habitName: { color: C.text, fontSize: 16, fontWeight: '600' },
  habitStreak: { color: C.textSoft, fontSize: 12, marginTop: 2 },
  habitCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckInner: { width: 28, height: 28, borderRadius: 14, borderWidth: 2 },
  habitCheckMark: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  dot: { width: 28, height: 8, borderRadius: 4, flex: 1 },
  dotEmpty: { backgroundColor: C.bgCard2 },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteText: { color: C.textMuted, fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#0f0f1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: C.border,
    maxHeight: '90%',
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
    marginBottom: 16,
  },
  fieldLabel: { color: C.textSoft, fontSize: 13, marginBottom: 8 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: { backgroundColor: C.accentLight, borderWidth: 1, borderColor: C.accent },
  emojiBtnText: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBtnActive: { borderWidth: 2, borderColor: '#fff' },
  freqRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  freqBtnActive: { backgroundColor: C.accentLight, borderColor: C.accent },
  freqText: { color: C.textSoft, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  freqTextActive: { color: C.accentBright },
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
})
