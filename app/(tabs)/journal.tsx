import { useState, useEffect } from 'react'
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
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/authStore'
import { useJournalStore, Mood, Note } from '../../src/store/journalStore'
import { C } from '../../src/theme'

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'amazing', emoji: '😄', label: 'Amazing' },
  { key: 'good', emoji: '😊', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'bad', emoji: '😔', label: 'Bad' },
  { key: 'awful', emoji: '😢', label: 'Awful' },
]

export default function JournalScreen() {
  const insets = useSafeAreaInsets()
  const { currentUser } = useAuthStore()
  const { getEntry, saveEntry, getUserNotes, addNote, updateNote, deleteNote } = useJournalStore()

  const [activeTab, setActiveTab] = useState<'journal' | 'notes'>('journal')
  const today = new Date().toISOString().split('T')[0]
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const entry = currentUser ? getEntry(currentUser.id, today) : undefined
  const [mood, setMood] = useState<Mood | undefined>(entry?.mood)
  const [content, setContent] = useState(entry?.content || '')

  const notes = currentUser ? getUserNotes(currentUser.id) : []

  const [noteModal, setNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  useEffect(() => {
    if (entry) {
      setMood(entry.mood)
      setContent(entry.content)
    }
  }, [currentUser?.id])

  const handleSave = () => {
    if (!currentUser) return
    saveEntry(currentUser.id, today, content, mood)
  }

  const openNote = (note?: Note) => {
    if (note) {
      setEditingNote(note)
      setNoteTitle(note.title)
      setNoteContent(note.content)
    } else {
      setEditingNote(null)
      setNoteTitle('')
      setNoteContent('')
    }
    setNoteModal(true)
  }

  const handleSaveNote = () => {
    if (!currentUser || !noteTitle.trim()) return
    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim())
    } else {
      addNote(currentUser.id, noteTitle.trim(), noteContent.trim())
    }
    setNoteModal(false)
  }

  const handleDeleteNote = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(id) },
    ])
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        {activeTab === 'notes' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => openNote()}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        {(['journal', 'notes'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'journal' ? 'Journal' : 'Notes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'journal' ? (
        <ScrollView contentContainerStyle={styles.journalContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.dateText}>{todayDisplay}</Text>

          <Text style={styles.fieldLabel}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.moodBtn, mood === m.key && styles.moodBtnActive]}
                onPress={() => setMood(m.key)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.key && styles.moodLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Today's entry</Text>
          <TextInput
            style={styles.journalInput}
            placeholder="Write about your day..."
            placeholderTextColor={C.textMuted}
            value={content}
            onChangeText={setContent}
            onBlur={handleSave}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Entry</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.notesContent}>
          {notes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📓</Text>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptyText}>Tap + to create a note</Text>
            </View>
          ) : (
            notes.map(note => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => openNote(note)}
                onLongPress={() => handleDeleteNote(note.id)}
              >
                <View style={styles.noteCardTop}>
                  <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                  <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                    <Text style={{ color: C.textMuted, fontSize: 14 }}>✕</Text>
                  </TouchableOpacity>
                </View>
                {note.content ? (
                  <Text style={styles.notePreview} numberOfLines={2}>{note.content}</Text>
                ) : null}
                <Text style={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={noteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setNoteModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'New Note'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={C.textMuted}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Content..."
              placeholderTextColor={C.textMuted}
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setNoteModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn2} onPress={handleSaveNote}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.bgCard2,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: C.accent },
  tabText: { color: C.textSoft, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  journalContent: { padding: 16, paddingBottom: 60 },
  dateText: { color: C.textSoft, fontSize: 14, marginBottom: 20, textAlign: 'center' },
  fieldLabel: { color: C.textSoft, fontSize: 13, marginBottom: 8 },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
  },
  moodBtnActive: { backgroundColor: C.accentLight, borderColor: C.accent },
  moodEmoji: { fontSize: 22, marginBottom: 4 },
  moodLabel: { color: C.textMuted, fontSize: 10 },
  moodLabelActive: { color: C.accentBright },
  journalInput: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    color: C.text,
    fontSize: 15,
    minHeight: 200,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  notesContent: { padding: 16, gap: 12, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: C.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  emptyText: { color: C.textMuted, fontSize: 14 },
  noteCard: {
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  noteCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  noteTitle: { color: C.text, fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  notePreview: { color: C.textSoft, fontSize: 13, marginBottom: 8 },
  noteDate: { color: C.textMuted, fontSize: 11 },
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
  inputMulti: { minHeight: 120, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
  },
  cancelText: { color: C.textSoft, fontWeight: '600' },
  saveBtn2: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
