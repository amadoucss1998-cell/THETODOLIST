import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/store/authStore'
import { useTodoStore } from '../../src/store/todoStore'
import { useHabitStore } from '../../src/store/habitStore'
import { useJournalStore } from '../../src/store/journalStore'
import { C } from '../../src/theme'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { currentUser, logout } = useAuthStore()
  const { tasks } = useTodoStore()
  const { habits, getStreak } = useHabitStore()
  const { entries } = useJournalStore()

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const completedTasks = tasks.filter(
    t => t.userId === currentUser.id && t.completed
  ).length

  const userHabits = habits.filter(h => h.userId === currentUser.id)
  const maxStreak = userHabits.reduce((max, h) => Math.max(max, getStreak(h)), 0)

  const journalCount = entries.filter(e => e.userId === currentUser.id).length

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout()
          router.replace('/auth')
        },
      },
    ])
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: currentUser.avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userEmail}>{currentUser.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <StatBox value={completedTasks} label="Tasks Done" color={C.green} />
          <StatBox value={maxStreak} label="Best Streak" color={C.yellow} />
          <StatBox value={journalCount} label="Journal Days" color={C.accentBright} />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        <InfoRow label="Name" value={currentUser.name} />
        <InfoRow label="Email" value={currentUser.email} />
        <InfoRow label="Member since" value={new Date().getFullYear().toString()} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>TaskFlow v1.0.0</Text>
    </ScrollView>
  )
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 16, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  userName: { color: C.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userEmail: { color: C.textSoft, fontSize: 14 },
  statsCard: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: { color: C.textSoft, fontSize: 13, fontWeight: '600', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: C.bgCard2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: C.textSoft, fontSize: 11, textAlign: 'center' },
  infoCard: {
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: { color: C.textSoft, fontSize: 14 },
  infoValue: { color: C.text, fontSize: 14, fontWeight: '500' },
  logoutBtn: {
    backgroundColor: 'rgba(255,99,72,0.15)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,99,72,0.3)',
    marginBottom: 20,
  },
  logoutText: { color: C.red, fontSize: 16, fontWeight: '700' },
  version: { color: C.textMuted, fontSize: 12, textAlign: 'center' },
})
