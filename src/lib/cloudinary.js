/**
 * File uploads go to Cloudinary (same account and unsigned preset the old Kraftor portal used),
 * so CVs, photos and documents work without Firebase Storage.
 */
const CLOUD_NAME = 'dzoirsvbg'
const UPLOAD_PRESET = 'kraftor_resumes'

export const MAX_UPLOAD_MB = 5

/**
 * Uploads a file and resolves with { url, name, format, bytes }.
 * `folder` keeps things tidy in Cloudinary (e.g. "kraftor/resumes").
 */
export async function uploadFile(file, folder = 'kraftor/uploads') {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`File must be ${MAX_UPLOAD_MB} MB or smaller.`)
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', folder)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || 'Upload failed. Please try again.')
  return { url: data.secure_url, name: file.name, format: data.format || '', bytes: data.bytes || file.size }
}
