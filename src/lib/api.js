/**
 * Everything the site saves to / reads from Firebase.
 *
 * Collections
 *   enquiries     — contact form submissions (anyone can create; only admins can read)
 *   applications  — career form submissions, CV stored in Storage under cvs/
 *   users/{uid}   — client & employee accounts (employees start "pending" until an admin approves)
 *   admins/{uid}  — who may open the admin panel (add documents by hand in the console)
 */
import { getDb, getStore, getAuthClient } from './firebase'

const MAX_CV_BYTES = 5 * 1024 * 1024
export const CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const clean = (v, max = 2000) => String(v ?? '').trim().slice(0, max)

/* ---------------- Public: forms ---------------- */

export async function submitEnquiry(form) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const db = await getDb()
  // Signed-in clients get the enquiry linked to their account, so it shows under "My enquiries"
  const uid = await currentUid()
  await addDoc(collection(db, 'enquiries'), {
    ...(uid ? { uid } : {}),
    name: clean(form.name, 120),
    company: clean(form.company, 120),
    phone: clean(form.phone, 30),
    email: clean(form.email, 160),
    whatsapp: clean(form.sameAsPhone ? form.phone : form.whatsapp, 30),
    country: clean(form.country, 60),
    projectType: clean(form.projectType, 60),
    projectName: clean(form.projectName, 160),
    projectInfo: clean(form.projectInfo, 2000),
    budget: clean(form.budget, 60),
    status: 'new',
    createdAt: serverTimestamp(),
  })
}

export async function submitApplication(form, file) {
  if (file) {
    if (file.size > MAX_CV_BYTES) throw new Error('CV must be 5 MB or smaller.')
    if (!CV_TYPES.includes(file.type)) throw new Error('CV must be a PDF or Word file.')
  }
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([import('firebase/firestore'), getDb()])

  let cvPath = ''
  let cvName = ''
  if (file) {
    const [{ ref, uploadBytes }, storage] = await Promise.all([import('firebase/storage'), getStore()])
    const safe = file.name.replace(/[^\w.-]+/g, '_').slice(-80)
    cvPath = `cvs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`
    cvName = file.name.slice(0, 120)
    await uploadBytes(ref(storage, cvPath), file, { contentType: file.type })
  }

  await addDoc(collection(db, 'applications'), {
    name: clean(form.name, 120),
    email: clean(form.email, 160),
    phone: clean(form.phone, 30),
    role: clean(form.role, 80),
    experience: clean(form.experience, 40),
    portfolio: clean(form.portfolio, 300),
    message: clean(form.message, 2000),
    cvPath,
    cvName,
    status: 'new',
    createdAt: serverTimestamp(),
  })
}

/* ---------------- Accounts: clients & employees ---------------- */

export const USER_TYPES = ['client', 'employee']

/** UID of whoever is signed in, or null. Doesn't load Auth unless a session might exist. */
async function currentUid() {
  try {
    const auth = await getAuthClient()
    await auth.authStateReady()
    return auth.currentUser?.uid || null
  } catch {
    return null
  }
}

/** Create a login + profile. Clients are active straight away; employees wait for admin approval. */
export async function userSignUp({ name, email, phone, password, type }) {
  if (!USER_TYPES.includes(type)) throw new Error('Choose client or employee')
  const [{ createUserWithEmailAndPassword, updateProfile }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
  await updateProfile(cred.user, { displayName: clean(name, 120) })
  await createProfile(cred.user, { name, phone, type })
  return cred.user
}

/** Writes users/{uid}. Also used when someone signed in has no profile yet. */
export async function createProfile(user, { name, phone, type }) {
  const [{ doc, setDoc, serverTimestamp }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  await setDoc(doc(db, 'users', user.uid), {
    name: clean(name, 120),
    email: user.email,
    phone: clean(phone, 30),
    type,
    status: type === 'client' ? 'active' : 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function userSignIn(email, password) {
  const [{ signInWithEmailAndPassword }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function userSignOut() {
  const [{ signOut }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  return signOut(auth)
}

export async function resetPassword(email) {
  const [{ sendPasswordResetEmail }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  return sendPasswordResetEmail(auth, email.trim())
}

/** Live profile (users/{uid}); calls back with null if there isn't one. Returns an unsubscribe function. */
export async function watchProfile(uid, cb, onError) {
  const [{ doc, onSnapshot }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  return onSnapshot(doc(db, 'users', uid), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError)
}

/** A client's own enquiries, newest first. */
export async function watchMyEnquiries(uid, cb, onError) {
  const [{ collection, query, where, onSnapshot }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  return onSnapshot(
    query(collection(db, 'enquiries'), where('uid', '==', uid)),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sorted here, so Firestore doesn't need a composite index
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      cb(list)
    },
    onError
  )
}

/* ---------------- Admin ---------------- */

export async function adminSignIn(email, password) {
  const [{ signInWithEmailAndPassword }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  return signInWithEmailAndPassword(auth, email, password)
}

export async function adminSignOut() {
  const [{ signOut }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  return signOut(auth)
}

/** Calls back with the signed-in user (or null). Returns an unsubscribe function. */
export async function watchAuth(cb) {
  const [{ onAuthStateChanged }, auth] = await Promise.all([import('firebase/auth'), getAuthClient()])
  return onAuthStateChanged(auth, cb)
}

export async function isAdmin(uid) {
  const [{ doc, getDoc }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  try {
    return (await getDoc(doc(db, 'admins', uid))).exists()
  } catch {
    return false
  }
}

/** Owner accounts listed in firestore.rules can add their own admins/{uid} entry. Others are refused. */
export async function claimAdmin(user) {
  const [{ doc, setDoc, serverTimestamp }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  try {
    await setDoc(doc(db, 'admins', user.uid), { email: user.email, createdAt: serverTimestamp() })
    return true
  } catch {
    return false
  }
}

/** Live list of a collection, newest first. Returns an unsubscribe function. */
export async function watchList(name, cb, onError) {
  const [{ collection, query, orderBy, onSnapshot }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  return onSnapshot(
    query(collection(db, name), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  )
}

export async function setStatus(name, id, status) {
  const [{ doc, updateDoc }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  return updateDoc(doc(db, name, id), { status })
}

export async function removeItem(name, id) {
  const [{ doc, deleteDoc }, db] = await Promise.all([import('firebase/firestore'), getDb()])
  return deleteDoc(doc(db, name, id))
}

export async function cvUrl(path) {
  const [{ ref, getDownloadURL }, storage] = await Promise.all([import('firebase/storage'), getStore()])
  return getDownloadURL(ref(storage, path))
}
