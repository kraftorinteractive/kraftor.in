/**
 * Public reads for visitors (no sign-in): the crew list.
 * The crew collection is world-readable in firestore.rules; nothing private lives in it.
 */
import { getDb, isFirebaseReady } from './firebase'

const fs = () => import('firebase/firestore')

/** Crew members published by an admin, in display order. */
export async function getCrew() {
  if (!isFirebaseReady) return []
  const [{ collection, getDocs }, db] = await Promise.all([fs(), getDb()])
  const snap = await getDocs(collection(db, 'crew'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.name).localeCompare(String(b.name)))
}

/* ---------------- Admin: keep the public crew list in step with users ---------------- */

const crewEntry = (u, order) => ({
  name: String(u.name || '').slice(0, 120),
  title: String(u.title || '').slice(0, 120),
  avatar: u.avatar || '',
  order,
})

/** Show / hide one person on the website crew list (admin only). */
export async function setOnCrew(user, show) {
  const [{ doc, updateDoc, setDoc, deleteDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await updateDoc(doc(db, 'users', user.id), { showOnCrew: show, updatedAt: serverTimestamp() })
  if (show) await setDoc(doc(db, 'crew', user.id), { ...crewEntry(user, 999), updatedAt: serverTimestamp() })
  else await deleteDoc(doc(db, 'crew', user.id))
}

/**
 * Rebuilds the public crew list from users with showOnCrew = true (active employees only):
 * refreshes names, titles and photos and removes anyone no longer shown.
 */
export async function publishCrew(users) {
  const [{ collection, doc, getDocs, writeBatch, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const shown = users
    .filter((u) => u.showOnCrew && u.role === 'employee' && u.status !== 'inactive')
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
  const keep = new Set(shown.map((u) => u.id))
  const existing = await getDocs(collection(db, 'crew'))
  const batch = writeBatch(db)
  existing.docs.forEach((d) => !keep.has(d.id) && batch.delete(d.ref))
  shown.forEach((u, i) => batch.set(doc(db, 'crew', u.id), { ...crewEntry(u, i), updatedAt: serverTimestamp() }))
  await batch.commit()
  return shown.length
}
