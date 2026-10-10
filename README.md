# Kraftor

A responsive React + Vite website using Kraftor's yellow–orange and blue branding.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

```sh
pnpm test
pnpm build
pnpm preview
```

## Pages and content

- Main navigation: Home, Portfolio, Services, About, Contact, and a quote CTA.
- Footer only: Client Guidelines, Employee Guidelines, Terms & Conditions, and Careers.
- Portfolio includes 9 websites, 4 apps and 22 videos imported from the provided old website. Videos load on their detail page, never as autoplaying homepage downloads.
- Project and service content: `src/data.js`. Video content: `src/videos.json`.
- Policy text: `src/policies.json`, retained from the supplied HTML, not rewritten.
- Styling and responsive breakpoints: `src/styles.css`.
- Old `.html` page URLs redirect to the equivalent new page. Old careers contact URLs redirect to `/careers`.

## Enquiries and careers

Forms validate and prepare a message for the visitor to send using email or WhatsApp. They do **not** submit to a backend, store data, or claim a message has been received. Careers use email with a portfolio/CV link. To receive submissions directly on the site, connect a server endpoint and mail service before replacing this handoff. Contact details were retained from the old site.

## Deployment

`pnpm build` generates `dist/`. Deploy that directory to a static host. SPA rewrite configurations for Vercel and Netlify are included; other hosts must rewrite application routes to `index.html` while serving assets normally. This project has not been published.

Fonts load from Google Fonts with local system fallbacks. All project imagery and videos are served locally. Media processing scripts in the ignored `work/` directory are development-only; source media in the old website folder is unchanged.
