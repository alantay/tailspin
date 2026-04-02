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
  - [ ] Reorder uploads *(skipped — optional)*

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
  - [ ] Deployed to Vercel *(manual step — see docs/deployment.md)*
  - [ ] Custom domain *(optional)*
  - [x] Environment variables documented for production

---

## Changelog

| Date       | What Changed |
| ---------- | ------------ |
| 2026-03-31 | Project started. PRD, ARCHITECTURE, DESIGN docs created. |
| 2026-03-31 | Phase 1 complete. Next.js + Supabase scaffold, auth, stay management, photo upload, owner feed, shadcn UI with warm design system. |
| 2026-03-31 | Phase 2 complete. Video upload, per-file progress, mark-as-complete, auto-complete, pull-to-refresh, fade-in animations. |
| 2026-04-01 | Phase 3 complete. Delete/edit captions, boarder profile, OG meta tags, PWA manifest, offline indicator, deployment docs. |
