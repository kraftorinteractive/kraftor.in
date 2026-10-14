# Firebase setup — Kraftor website

The site saves the **contact form** and **career form** to Firebase, and the team reads them at **`/admin`**.
Until Firebase is connected, nothing breaks: the contact form opens WhatsApp and the career form opens an email instead.

## What is stored where

| What | Where | Who can read |
|---|---|---|
| Contact enquiries | Firestore → `enquiries` | Admins only |
| Career applications | Firestore → `applications` | Admins only |
| CV files | Storage → `cvs/` | Admins only |
| Admin list | Firestore → `admins/{uid}` | Each admin sees only their own entry |

Visitors can only **add** a new entry. They can't read, change or delete anything. This is enforced by
`firestore.rules` and `storage.rules`, not by the website code.

---

## 1. Create the project

1. Go to <https://console.firebase.google.com> → **Add project** → name it (e.g. `kraftor-web`). Analytics is optional.
2. **Build → Firestore Database → Create database** → choose a location close to your users
   (e.g. `asia-south1` Mumbai) → start in **production mode**.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
4. **CV uploads (optional): Build → Storage → Get started.**
   New projects need the **Blaze (pay-as-you-go)** plan for Storage. Normal use of a small site stays inside the
   free quota, but add a budget alert in Google Cloud billing to be safe.
   *Skip this step if you don't want Blaze* — the career form will then ask for a CV/portfolio **link** instead of a file.

## 2. Connect the website

1. **Project settings (⚙) → General → Your apps → Web (`</>`)** → register an app (no hosting needed here).
2. Copy `.env.example` to **`.env.local`** in the project folder and paste the values from the config shown:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...   # leave empty if you skipped Storage
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   `.env.local` is never committed (it's in `.gitignore`). These web keys are not secret — security comes from the rules.
3. Restart `npm run dev`. When you deploy, add the same variables in your host's settings (or keep `.env.local` on the
   machine that runs `npm run build`).

## 3. Deploy the security rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # pick your project; replaces the placeholder in .firebaserc
firebase deploy --only firestore:rules,storage
```

Skip `storage` in that command if you didn't enable Storage. The first time you deploy `storage.rules`, the CLI asks to
let Storage rules read Firestore (needed to check who is an admin) — answer **yes**.

## 4. Add an admin

1. **Authentication → Users → Add user** → enter the admin's email and a strong password.
2. Copy that user's **User UID**.
3. **Firestore → Start collection** → collection ID `admins` → document ID = **the UID** → add any field,
   e.g. `name` (string) = `Shahnawaj`. Save.
4. Open **`/admin`** on the site and sign in.

If you sign in and see "No admin access", the page shows the UID to add — repeat step 3 with it.
To remove an admin, delete their document in `admins` (and the user in Authentication).

## 5. Using the admin panel

- **Enquiries / Applications** tabs, with a count of new items.
- Search and filter by status: **new → contacted → closed**.
- Open an item to email, call or WhatsApp the person, download the CV, change status or delete it.
- Lists update live — no refresh needed.

## Hosting (optional)

`firebase.json` is ready for Firebase Hosting (serves `dist/`, sends every route to `index.html`):

```bash
npm run build
firebase deploy --only hosting
```

## Later: email alerts

Firebase doesn't send emails on its own. To get an email for every new enquiry, add the
**Trigger Email** extension (or a small Cloud Function) on the `enquiries` and `applications` collections.
Both need the Blaze plan.
