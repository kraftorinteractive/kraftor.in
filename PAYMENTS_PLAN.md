# Online payments — Razorpay

## Background

The old portal's *Pay now* button used **Cashfree** through a PHP script on `kraftor.in`. That domain no longer
loads, so online payment stopped working. We've switched to **Razorpay**.

Creating a payment *order* needs Razorpay's **secret key**, which must never be in website code. So:

- **Step 1 (live now): payment links** — no server, no secrets in the site.
- **Step 2 (later): automatic payments** with Firebase Cloud Functions.

---

## Step 1 — Payment links (done)

### How to use it

1. Create the invoice as usual (**Admin → Finance → Invoices → New invoice**).
2. Open the invoice. Under **Online payment (Razorpay)** you'll see:
   - a link to **Razorpay → Payment Links**,
   - the exact **amount** and the **reference** (invoice number) with copy buttons.
3. In Razorpay, create a Payment Link with that amount, put the invoice number in *Reference ID*, and add the
   client's email/phone if you want Razorpay to send it too.
4. Paste the link (`https://rzp.io/…`) back into the invoice and press **Save link**.
   (You can also paste it while creating the invoice if you already know the total.)

### What the client sees

- In **My account → Invoices**, unpaid invoices with a link show **Pay ₹… now** (opens Razorpay: UPI, cards,
  net banking, wallets).
- The **printable invoice** shows a *Pay online* box with the link (the link prints as text too).
- Invoices without a link still say "contact us — we'll send you a payment link".

### After the client pays

Razorpay emails you, and the payment shows in the dashboard under the link. Then press **Mark paid** on the
invoice in **Admin → Finance**. (Step 2 will do this automatically.)

### Good to know

- If an invoice total changes, **create a new link** — a Razorpay link is for a fixed amount. Clear the field to
  remove an old link.
- Links can have an expiry date in Razorpay; match it to the invoice due date if you like.
- **Gateway fee line:** invoices can add a "payment gateway" charge of **2.45%** (the old Cashfree rate).
  Razorpay's standard pricing is about **2% + 18% GST on the fee ≈ 2.36%** (higher for some cards/international).
  Tell us if you want the rate changed — it's one number in `src/lib/admin.js` (`GATEWAY_RATE`).
- Only admins can add or change links (Firestore rules: only admins write invoices).

---

## Step 2 — Automatic payments (Cloud Functions)

Two small functions in this same Firebase project:

1. **`createRazorpayOrder`** (callable from the client portal)
   - Checks the signed-in user is the invoice's client and it's unpaid.
   - Creates a Razorpay **Order** for exactly `invoice.total × 100` paise, `receipt` = invoice number.
   - Returns the order ID; the site opens **Razorpay Checkout** on the page (no redirect).
2. **`razorpayWebhook`** (HTTPS endpoint registered in Razorpay → Settings → Webhooks)
   - Listens for `payment.captured` (and `payment_link.paid`, so Step 1 links get marked too).
   - **Verifies the `X-Razorpay-Signature`** with the webhook secret before trusting anything.
   - Sets the invoice `status: "Paid"`, `paidAt`, and stores `razorpayPaymentId` / `razorpayOrderId`.

**Needs:**
- Firebase **Blaze (pay-as-you-go)** plan — normal use stays within the free quota; add a billing alert.
- Razorpay **Key ID + Key Secret** and a **webhook secret**, stored as Firebase secrets by you:
  `firebase functions:secrets:set RAZORPAY_KEY_SECRET` (never in the repo or in chat).
- No changes to `firestore.rules` — functions use the Admin SDK, and clients never write invoices.

**Testing:** run everything with Razorpay **test mode** keys first (test UPI / cards), then switch to live keys.

---

## What we need from you for Step 2

1. Razorpay account **activated** (KYC done) — for Step 1 too, links only take real money once it's live.
2. Switch Firebase to **Blaze**.
3. Create API keys and a webhook in Razorpay, then set the secrets with the CLI command above.
