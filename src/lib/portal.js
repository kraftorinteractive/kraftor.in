/**
 * Portal actions for clients and employees — same documents and field names as the old
 * Kraftor portal / Android app, so records stay compatible.
 */
import { getDb } from './firebase'

const fs = () => import('firebase/firestore')
const clean = (v, max = 1000) => String(v ?? '').trim().slice(0, max)
const today = () => new Date().toISOString().split('T')[0]

/* ---------- Client ---------- */

export async function bookMeeting({ clientUid, clientName, clientEmail, date, timeSlot, meetingType, agenda }) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'meetings'), {
    clientUid,
    clientName: clientName || '',
    clientEmail: clientEmail || '',
    date,
    timeSlot,
    meetingType,
    agenda: clean(agenda, 500) || null,
    status: 'Pending',
    adminNote: null,
    createdAt: serverTimestamp(),
  })
}

/* ---------- Employee: attendance ---------- */

export const attendanceId = (uid, date = today()) => `${uid}_${date}`

export async function clockIn(uid, employeeName, workMode = 'In Office', location = null) {
  const [{ doc, getDoc, setDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const date = today()
  const ref = doc(db, 'attendance', attendanceId(uid, date))
  const existing = await getDoc(ref)
  if (existing.exists() && existing.data().clockIn) throw new Error('You have already clocked in today.')
  await setDoc(
    ref,
    { uid, employeeName, date, clockIn: serverTimestamp(), clockOut: null, workMode, location: location || null, status: 'Pending' },
    { merge: true }
  )
}

export async function clockOut(uid, date = today()) {
  const [{ doc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await updateDoc(doc(db, 'attendance', attendanceId(uid, date)), { uid, clockOut: serverTimestamp() })
}

/** Best-effort location label for attendance ("lat, lng"); null if the person declines. */
export function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    )
  })
}

/* ---------- Employee: leave, documents ---------- */

export async function submitLeaveRequest({ uid, employeeName, employeeEmail, type, duration, reason }) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'leave_requests'), {
    uid,
    employeeName,
    employeeEmail,
    type,
    duration: clean(duration, 120),
    reason: clean(reason, 1000),
    status: 'Pending Approval',
    createdAt: serverTimestamp(),
  })
}

export async function submitEmployeeDocument({ uid, employeeName, employeeEmail, fileName, fileType, fileUrl }) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  await addDoc(collection(db, 'employee_documents'), {
    uid,
    employeeName,
    employeeEmail,
    fileName: clean(fileName, 200),
    fileType: clean(fileType, 60),
    fileUrl,
    submittedAt: serverTimestamp(),
  })
}

/* ---------- Employee: joining form (employee_applications) ---------- */

/** Number like KFR26100123 — employees can't write the shared counter, so the tail comes from the clock (as the old portal's fallback did). */
const applicationNumber = () => {
  const d = new Date()
  return `KFR${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(Date.now()).slice(-4)}`
}

const ONBOARD_FIELDS = ['employeeName', 'appliedRole', 'experience', 'dateOfBirth', 'gender', 'phoneNumber', 'whatsappNumber', 'fullAddress', 'cityCountry', 'postcode', 'nationality', 'religion', 'qualification', 'institute', 'passingYear', 'aadhaarNumber', 'passportPhotoUrl', 'passportPhotoName']

export async function submitOnboarding(uid, profile, data) {
  const [{ collection, addDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const clean1 = Object.fromEntries(ONBOARD_FIELDS.map((k) => [k, clean(data[k], 400)]))
  await addDoc(collection(db, 'employee_applications'), {
    ...clean1,
    uid,
    employeeEmail: profile.email,
    applicationNumber: applicationNumber(),
    attachedDocuments: (data.attachedDocuments || []).map((x) => clean(x, 40)),
    declarationAccepted: true,
    status: 'Submitted',
    resumeUrl: '',
    coverLetterUrl: '',
    aadhaarDocUrl: '',
    passbookUrl: '',
    marksheetUrl: '',
    attestedFileUrl: null,
    attestedFileName: null,
    reviewedAt: null,
    submittedAt: serverTimestamp(),
  })
}

/** Employee adds document links to their own form (uid must stay the same — the rules check it). */
export async function updateOnboarding(id, uid, patch) {
  const [{ doc, updateDoc }, db] = await Promise.all([fs(), getDb()])
  await updateDoc(doc(db, 'employee_applications', id), { ...patch, uid })
}

/* ---------- Projects: tasks ---------- */

/** Ticks a task on or off and recalculates progress (same logic as the old portal). */
export async function toggleTask(projectId, phaseId, taskId, done, byEmail) {
  const [{ doc, getDoc, updateDoc, serverTimestamp }, db] = await Promise.all([fs(), getDb()])
  const ref = doc(db, 'projects', projectId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const phases = (snap.data().phases || []).map((ph) =>
    ph.id !== phaseId
      ? ph
      : {
          ...ph,
          tasks: (ph.tasks || []).map((t) =>
            t.id !== taskId
              ? t
              : { ...t, completed: done, completedBy: done ? byEmail : null, completedAt: done ? new Date().toISOString() : null }
          ),
        }
  )
  const all = phases.flatMap((ph) => ph.tasks || [])
  const progress = all.length ? Math.round((all.filter((t) => t.completed).length / all.length) * 100) : 0
  await updateDoc(ref, { phases, progress, updatedAt: serverTimestamp() })
}
