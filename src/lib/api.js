/**
 * Everything the website reads from / writes to Firebase.
 *
 * The project is shared with the old Kraftor portal and the Kraftor Android app, so this file
 * uses their collections and field names exactly (see firestore.rules):
 *
 *   users/{uid}            profile with role: admin | client | employee, status: active | inactive
 *   pending_registrations  client sign-ups waiting for an admin (public create)
 *   contact_messages       contact form (public create)
 *   job_applications       careers form (public create), CV on Cloudinary
 *   custom_package_leads, chatbot_leads   other website leads
 *   projects, invoices, quotations, meetings, shared_documents       client side
 *   attendance, leave_requests, salary_slips, employee_documents,
 *   employee_applications                                             employee side
 */
import { getDb, getAuthClient, config } from './firebase'

const clean = (v, max = 2000) => String(v ?? '').trim().slice(0, max)
const fs = () => import('firebase/firestore')
const authMod = () => import('firebase/auth')

/* ================= Public forms ================= */

/** Contact form → contact_messages (old fields kept: name, email, phone, service, message). */
export async function submitEnquiry(form) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'contact_messages'), {
    name: clean(form.name, 120),
    email: clean(form.email, 160),
    phone: clean(form.phone, 30),
    service: clean(form.projectType, 60),
    message: clean(form.projectInfo, 2000),
    // Extra details from the new form
    company: clean(form.company, 120),
    whatsapp: clean(form.sameAsPhone ? form.phone : form.whatsapp, 30),
    country: clean(form.country, 60),
    projectName: clean(form.projectName, 160),
    budget: clean(form.budget, 60),
    source: 'website',
    status: 'unread',
    createdAt: serverTimestamp(),
  })
}

/** Careers form → job_applications (same shape the old site and admin used). */
export async function submitJobApplication(f) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'job_applications'), {
    applicantName: clean(f.name, 120),
    email: clean(f.email, 160),
    phone: clean(f.phone, 20),
    city: clean(f.city, 80),
    applyAs: clean(f.applyAs, 40),
    department: clean(f.department, 80),
    qualification: clean(f.qualification, 120),
    experience: clean(f.experience, 40),
    availability: clean(f.availability, 60),
    portfolio: clean(f.portfolio, 300) || null,
    coverLetter: clean(f.coverLetter, 3000) || null,
    resumeUrl: f.resumeUrl || null,
    heardAboutUs: clean(f.heardAboutUs, 60) || null,
    reference: clean(f.reference, 120) || null,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

/* ================= Accounts ================= */

export const ROLES = ['client', 'employee', 'admin']

export async function signIn(email, password) {
  const [{ signInWithEmailAndPassword }, auth] = await Promise.all([authMod(), getAuthClient()])
  // Old portal padded short legacy passwords; keep that so existing clients can still sign in
  const pw = password.length > 0 && password.length < 6 ? password + 'KFR26' : password
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pw)
}

/**
 * Sign in with Google. Uses a popup; if the browser blocks popups it falls back to a full-page redirect
 * (then this resolves with null and the page reloads signed in).
 * Needs Google enabled in Firebase → Authentication → Sign-in method.
 */
export async function signInWithGoogle() {
  const [a, auth] = await Promise.all([authMod(), getAuthClient()])
  const provider = new a.GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    const cred = await a.signInWithPopup(auth, provider)
    return cred.user
  } catch (err) {
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      await a.signInWithRedirect(auth, provider)
      return null
    }
    throw err
  }
}

/** One-time read of users/{uid} (null if there is no profile). */
export async function getProfile(uid) {
  const [{ doc, getDoc }, db] = await Promise.all([fs(), getDb()])
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function signOutUser() {
  const [{ signOut }, auth] = await Promise.all([authMod(), getAuthClient()])
  return signOut(auth)
}

export async function resetPassword(email) {
  const [{ sendPasswordResetEmail }, auth] = await Promise.all([authMod(), getAuthClient()])
  return sendPasswordResetEmail(auth, email.trim())
}

/** Calls back with the signed-in Firebase user (or null). Returns an unsubscribe function. */
export async function watchAuth(cb) {
  const [{ onAuthStateChanged }, auth] = await Promise.all([authMod(), getAuthClient()])
  return onAuthStateChanged(auth, cb)
}

/** Live users/{uid}; null when there's no profile (e.g. a sign-up waiting for approval). */
export async function watchProfile(uid, cb, onError) {
  const [{ doc, onSnapshot }, db] = await Promise.all([fs(), getDb()])
  return onSnapshot(doc(db, 'users', uid), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null), onError)
}

/**
 * Client sign-up. The person creates their own login (password never stored in the database),
 * then their details go to pending_registrations for an admin to approve.
 */
export async function registerClient({ name, orgName, orgType, email, phone, address, password, logoUrl }) {
  const [{ createUserWithEmailAndPassword, updateProfile }, auth] = await Promise.all([authMod(), getAuthClient()])
  const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
  await updateProfile(cred.user, { displayName: clean(name, 120) })
  await submitRegistration(cred.user, { name, orgName, orgType, phone, address, logoUrl })
  return cred.user
}

/** Also used when someone signed in has no profile and no pending request yet. */
export async function submitRegistration(user, { name, orgName, orgType, phone, address, logoUrl }) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'pending_registrations'), {
    uid: user.uid,
    name: clean(name, 120),
    orgName: clean(orgName, 120),
    orgType: clean(orgType, 60),
    email: user.email,
    phone: clean(phone, 30),
    address: clean(address, 300),
    logoUrl: logoUrl || '',
    source: 'website',
    submittedAt: serverTimestamp(),
  })
}

/** Lets a person edit their own name / phone / address (allowed for owners by the rules). */
export async function updateMyProfile(uid, data) {
  const [{ doc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const patch = {}
  for (const k of ['name', 'phone', 'address', 'title', 'company']) if (k in data) patch[k] = clean(data[k], 300)
  await updateDoc(doc(db, 'users', uid), { ...patch, updatedAt: serverTimestamp() })
}

/* ================= Generic live queries ================= */

const toMillis = (v) => v?.toMillis?.() ?? (v?.seconds ? v.seconds * 1000 : typeof v === 'string' ? Date.parse(v) || 0 : 0)

/**
 * Live list of a collection.
 *   where: [field, op, value]   (needed for client/employee lists — the rules only allow their own docs)
 *   sortBy: field used to sort newest first (done here, so Firestore needs no composite index)
 */
export async function watchCollection(name, { where: w, sortBy = 'createdAt' } = {}, cb, onError) {
  const [{ collection, query, where, onSnapshot }, db] = await Promise.all([fs(), getDb()])
  const ref = w ? query(collection(db, name), where(...w)) : collection(db, name)
  return onSnapshot(
    ref,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => toMillis(b[sortBy]) - toMillis(a[sortBy]))
      cb(list)
    },
    onError
  )
}

export async function updateItem(name, id, data, { stamp = true } = {}) {
  const [{ doc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  return updateDoc(doc(db, name, id), stamp ? { ...data, updatedAt: serverTimestamp() } : data)
}

export async function removeItem(name, id) {
  const [{ doc, deleteDoc }, db] = await Promise.all([fs(), getDb()])
  return deleteDoc(doc(db, name, id))
}

/* ================= Admin ================= */

/** Approve a pending client sign-up: creates users/{uid} with role client, then clears the request. */
export async function approveRegistration(r) {
  if (!r.uid) throw new Error('This request is from the old site (no login yet). Ask the client to register again on the new site.')
  const [{ doc, setDoc, deleteDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await setDoc(doc(db, 'users', r.uid), {
    uid: r.uid,
    name: r.name || r.orgName || '',
    email: r.email,
    role: 'client',
    company: r.orgName || '',
    phone: r.phone || '',
    address: r.address || '',
    avatar: r.dpUrl || '',
    logoUrl: r.logoUrl || '',
    status: 'active',
    createdAt: serverTimestamp(),
  })
  await deleteDoc(doc(db, 'pending_registrations', r.id))
}

/**
 * Admin creates a portal user (client or employee), like the old "Register New Portal User".
 * Uses a second, in-memory Firebase app so the admin stays signed in; the new user gets a
 * password-reset email to set their own password.
 */
export async function adminCreateUser({ email, name, role, company, title, phone, address }) {
  const [{ initializeApp, getApps }, a, { doc, setDoc, serverTimestamp }, db] = await Promise.all([import('firebase/app'), authMod(), fs(), getDb()])
  const second = getApps().find((x) => x.name === 'AdminCreate') || initializeApp(config, 'AdminCreate')
  const auth2 = a.getAuth(second)
  await a.setPersistence(auth2, a.inMemoryPersistence)
  // Random temporary password — never shown or stored; the user sets their own via the reset email
  const temp = Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(36)).join('').slice(0, 24) + 'Aa1!'
  const cred = await a.createUserWithEmailAndPassword(auth2, email.trim().toLowerCase(), temp)
  await a.updateProfile(cred.user, { displayName: clean(name, 120) })
  const profile = {
    uid: cred.user.uid,
    email: cred.user.email,
    name: clean(name, 120),
    role,
    company: clean(company, 120) || null,
    title: clean(title, 120) || null,
    phone: clean(phone, 30) || null,
    address: clean(address, 300) || null,
    avatar: null,
    status: 'active',
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'users', cred.user.uid), profile)
  await a.sendPasswordResetEmail(auth2, cred.user.email)
  await a.signOut(auth2)
  return profile
}
