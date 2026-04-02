# Progress & Milestones

## Phase 1: Core (Complete ✅)

- [x] Boarder auth (sign up, log in, log out, protected routes)
- [x] Database setup (tables, RLS policies)
- [x] Stay management (create, share token, share link, dashboard)
- [x] Photo upload (presigned URL flow, appears in feed)
- [x] Owner feed (/stay/[share_token], newest-first, mobile-responsive)
- [x] Basic styling (shadcn, warm palette, mobile-first)

---

## Phase 2: Video & Polish (Complete ✅)

- [x] Video upload (MP4/MOV, duration validation ≤35s, 50MB limit)
- [x] Per-file upload progress bar (XHR with onprogress)
- [x] Bulk upload (multiple files at once)
- [x] Client-side photo compression (Canvas API, max 1920px / 80% JPEG)
- [x] Lazy loading on owner feed
- [x] Friendly timestamps ("2 hours ago")
- [x] Pull to refresh (Check for new photos button on owner feed)
- [x] Fun empty states and microcopy
- [x] Fade-in animation on new uploads
- [x] Mark stay as completed
- [x] Auto-complete stays by end date (checked on dashboard load)
- [x] Past stays archive on dashboard

---

## Phase 3: Quality of Life (Complete ✅)

- [x] **Upload Management**
  - [x] Edit captions after posting (inline click-to-edit)
  - [x] Delete uploads (removes from DB + storage)
  - [ ] Reorder uploads _(skipped — optional)_

- [x] **Boarder Profile**
  - [x] Name and photo displayed on owner feeds
  - [x] Edit profile from dashboard (/dashboard/profile)

- [x] **Sharing**
  - [x] Native share sheet integration (navigator.share with clipboard fallback)
  - [x] Share link preview (Open Graph + Twitter card meta tags on owner feed)

- [x] **PWA Support**
  - [x] "Add to home screen" (manifest.webmanifest via app/manifest.ts)
  - [x] Offline indicator (fixed toast when navigator.onLine = false)

- [x] **Deployment**
  - [ ] Deployed to Vercel _(manual step — see docs/deployment.md)_
  - [ ] Custom domain _(optional)_
  - [x] Environment variables documented for production

---

## Phase 4: Improvements (In Progress)

New features and refinements based on real usage.

- [x] **Stay editing** — edit pet name, dates, and boarding notes after creation
- [x] **UX fixes** — boarding notes repurposed as "what to bring", per-photo captions (removed shared bulk caption), change pet avatar from stay detail
- [x] **Bug fixes** — owner feed visible in incognito (boarders public read RLS), card top spacing, navbar logo
- [x] **Dashboard & boarding UX** — bigger pet photo on stay cards (56px), photo preview when creating new boarding
- [ ] **Dashboard Calendar** — month-view showing stays as coloured bars with pet name; tap to open. Different colours for overlapping stays.
- [ ] **Pinned notes** — private freeform scratchpad per stay for care instructions, never visible to owner
- [ ] **Download button** — one-tap save on each photo/video in the owner feed, full-resolution
- [ ] **Download All** — bulk zip download _(future, not current scope)_

---

## Changelog

| Date       | What Changed                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-31 | Project started. PRD, ARCHITECTURE, DESIGN docs created.                                                                           |
| 2026-03-31 | Phase 1 complete. Next.js + Supabase scaffold, auth, stay management, photo upload, owner feed, shadcn UI with warm design system. |
| 2026-03-31 | Phase 2 complete. Video upload, per-file progress, mark-as-complete, auto-complete, pull-to-refresh, fade-in animations.           |
| 2026-04-01 | Phase 3 complete. Delete/edit captions, boarder profile, OG meta tags, PWA manifest, offline indicator, deployment docs.           |
| 2026-04-02 | Phase 4 started. Stay editing, UX overhaul (boarding notes, per-photo captions), bug fixes (incognito feed, card spacing, navbar logo). |
| 2026-04-02 | Dashboard & boarding UX improvements: bigger pet photo on stay cards (56px for better visibility), photo preview in new boarding form. |
