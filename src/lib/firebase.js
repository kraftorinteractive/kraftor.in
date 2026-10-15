/**
 * Firebase setup. Values come from `.env.local` (see `.env.example` and FIREBASE_SETUP.md).
 * If they're missing, `isFirebaseReady` is false and the site still works:
 * forms fall back to WhatsApp / email instead of saving.
 *
 * Firebase is loaded lazily, so visitors who never submit a form don't download it.
 */

export const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseReady = Boolean(config.apiKey && config.projectId && config.appId)

let appPromise = null

/** The Firebase app (created once, on first use). */
export function getApp() {
  if (!isFirebaseReady) return Promise.reject(new Error('Firebase is not configured'))
  if (!appPromise) appPromise = import('firebase/app').then(({ initializeApp }) => initializeApp(config))
  return appPromise
}

export async function getDb() {
  const [{ getFirestore }, app] = await Promise.all([import('firebase/firestore'), getApp()])
  return getFirestore(app)
}

export async function getAuthClient() {
  const [{ getAuth }, app] = await Promise.all([import('firebase/auth'), getApp()])
  return getAuth(app)
}
