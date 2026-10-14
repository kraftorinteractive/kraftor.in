# Kraftor Interactive — website

React + Vite, mobile-first.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production files in /dist
```

## Where to change things

| What | File |
| --- | --- |
| Colors, fonts, spacing | `src/styles/theme.css` |
| Phone, email, socials, map, company profile PDF | `src/data/site.js` |
| Services list | `src/data/services.js` |
| Reels, websites, apps | `src/data/portfolio.js` |
| Company text, crew, clients, testimonials | `src/data/about.js` |
| Form dropdowns, budgets, FAQ | `src/data/contact.js` |
| Logo images | `src/assets/logo-symbol.png`, `src/assets/logo-wordmark.png` |

Media goes in `/public` (e.g. `/public/reels/3d-1.mp4` → `video: '/reels/3d-1.mp4'`).
Any empty `video` / `image` / `photo` / `logo` field shows a branded placeholder.

The contact form is UI only for now — wire up sending in `onSubmit` in `src/pages/Contact.jsx`.
