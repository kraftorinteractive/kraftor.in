# Kraftor Interactive – Frontend Development Master Plan

**Version:** 1.0  
**Date:** October 2026  
**Core philosophy:** Mobile-first, clean, minimal, professional, left-aligned, high-performance.

## Product direction

Kraftor Interactive presents multimedia and IT solutions through websites, mobile applications, CGI and motion design. The experience prioritises left-aligned content, large tap targets, purposeful whitespace, lightweight media, and horizontal swipe galleries on phones.

## Stack

- React 18 + Vite
- Tailwind CSS with Kraftor brand tokens
- Framer Motion for the mobile navigation and reveal states
- React Router DOM v6
- React Hook Form + Zod for enquiry validation
- Lucide React icons
- Local data files now; a `useData` boundary later for Firebase migration

## Site structure

- Home: hero, key points, service preview, Kraftor App preview and swipeable featured work.
- Portfolio: category filters and grouped reels, web projects and applications.
- Services: category filters and compact mobile accordions.
- About: company, crew and client tabs.
- Contact: validated enquiry form, responsive location map and FAQ.
- Footer-only pages: client guidelines, employee guidelines, terms and careers.

## Contact behaviour

The first release validates details in the browser and prepares email or WhatsApp handoffs. It does not store visitor data. Firebase form delivery is a future phase.

## Delivery checks

- Mobile sizes are the starting point; tablet and desktop rules enhance the layout.
- Images and videos are lazy loaded; portfolio videos are opened on demand.
- Public routes are rewritten to `index.html` for static hosting.
