# Firebase — how the Kraftor website is connected

The website uses the **existing Firebase project `kraftor-interactive`**. That project is **shared** with:

- the **Kraftor Android app**, and
- the **old portal** at kraftor.vercel.app (same data, same logins).

So the website reuses the same collections, field names and security rules. **Anything you change in
`firestore.rules` affects the Android app too** — keep that in mind before deploying.

---

## 1. Connect a computer to the project

```bash
npm install -g firebase-tools
firebase login                      # sign in as kraftorinteractive@gmail.com
firebase use kraftor-interactive    # already set in .firebaserc
```

### Website keys (`.env.local`)

The site reads its Firebase web config from `.env.local` (never committed — it's in `.gitignore`).
Generate it from the CLI instead of copying by hand:

```bash
firebase apps:sdkconfig WEB 1:470080570937:web:960db8aba5ccc9ed09efe8
```

Put the values into `.env.local` using the names in `.env.example`
(`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, …). These web keys are not secret; the security rules
protect the data. Restart `npm run dev` after changing them, and add the same variables wherever the site is built.

`VITE_FIREBASE_STORAGE_BUCKET` can stay empty — **files go to Cloudinary**, not Firebase Storage (see §5).

---

## 2. Who can do what (roles)

Every person has a profile in **`users/{uid}`** with a `role`:

| Role | Where they sign in | What they get |
|---|---|---|
| `admin` | Tap the **footer logo 3 times** → `/admin` | Everything: leads, users, projects, finance, team, careers, meetings, files, settings |
| `client` | Navbar profile icon → `/login` → *Client* | Projects + chat, invoices, quotations, files, meetings |
| `employee` | Navbar profile icon → `/login` → *Employee* | Clock in/out, tasks + chat, attendance, leave, payslips, documents, joining form |

`status: "inactive"` turns an account off without deleting it.

### Making someone an admin

Admin rights come from `role: "admin"` on their `users` profile (the rules check this). An admin can change
anyone's role in **Admin → Users**. For the very first admin, edit the profile in the Firebase console
(Firestore → `users` → their UID → `role` = `admin`).

### New accounts

- **Clients** register themselves on `/login` → *Register here*. They create their own password, and their details
  land in **Admin → Sign-ups** (`pending_registrations`). *Approve as client* creates their profile.
  (The old portal stored passwords in that collection; the website never does.)
- **Employees and clients created by the office**: **Admin → Users → Add user**. The person gets an email to set
  their own password.

---

## 3. Collections used by the website

| Collection | Written by | Notes |
|---|---|---|
| `users` | admin (owners can edit their own) | profile + role |
| `pending_registrations` | anyone (sign-up form) | admin approves |
| `contact_messages` | anyone (contact form) | `status: unread / read` |
| `job_applications` | anyone (careers form) | CV on Cloudinary, `status: pending / shortlisted / hired / rejected` |
| `custom_package_leads`, `chatbot_leads` | old site / chatbot | shown in Admin → Leads |
| `projects` (+ `messages`, `presence` sub-collections) | admin; assignees tick tasks; participants chat | same chat format as the Android app |
| `invoices`, `quotations`, `salary_slips` | admin | numbered `KFR2610IN001`, `…QT…`, `…SL…` |
| `settings/invoiceConfig` | admin | company info, GST, terms, bank details, number counters |
| `meetings` | client books, admin confirms | |
| `attendance`, `leave_requests`, `employee_documents`, `employee_applications` | employee | admin reviews |
| `shared_documents` | admin | files shared with a client or employee |
| `special_offers` | old portal / Android app | **not used by the website** (offers were removed); data and rules left as they are |
| `crew` | admin | **public** copy of name / title / photo for the About page — see below |

### Public crew list (`crew`)

Visitors can't read `users` (it holds emails and phone numbers). So the About page reads a small public
**`crew`** collection instead. In **Admin → Users**, *Show on crew page* adds or removes a person, and
*Refresh crew page* re-copies everyone's latest name, title and photo.

---

## 4. Security rules

`firestore.rules` in this repo **is the live ruleset** — the Android app's rules plus one addition (`crew`).

```bash
firebase deploy --only firestore:rules
```

The CLI checks the file before uploading. Previous versions stay in the console
(Firestore → Rules → history) if you ever need to roll back.

> In October 2026 the rules were briefly replaced by website-only rules and then restored from the
> 1 Aug 2026 version. If anything in the Android app misbehaved around then, that was the cause.

---

## 5. Files (Cloudinary)

CVs, photos, chat attachments, shared files and employee documents are uploaded to
**Cloudinary** (cloud `dzoirsvbg`, unsigned preset `kraftor_resumes`) — the same account the old portal used.
Only the file's link is stored in Firestore. Manage or delete files in the Cloudinary dashboard.

---

## 6. Hosting (optional)

`firebase.json` is ready for Firebase Hosting (serves `dist/`, sends every route to `index.html`, keeps `/admin` out of search):

```bash
npm run build
firebase deploy --only hosting
```

Any other static host works too, as long as it sends unknown paths to `index.html`.

---

## 7. Not set up yet

- **Automatic online payments** — Razorpay payment links work today (paste a link on an invoice; see
  `PAYMENTS_PLAN.md`). Marking invoices paid automatically needs Cloud Functions (Step 2 in that file).
- **Email alerts** for new leads / sign-ups need the Trigger Email extension or a Cloud Function (Blaze plan).
