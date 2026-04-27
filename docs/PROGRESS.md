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
- [x] **Dashboard Calendar** — month-view showing stays as coloured bars with pet name; tap to open. Different colours for overlapping stays.
- [x] **Owner name field** — required on every stay, shows on dashboard cards and stay detail page
- [x] **Delete stay** — inline confirmation to cancel a boarding if owner cancels
- [x] **Owner phone number** — optional field on stays for future repeat-owner detection
- [x] **Navigation icons** — Dashboard link in navbar with icons on buttons (Edit, Share, Delete, Mark complete)
- [x] **Pinned notes** — private freeform scratchpad per stay (separate DB table with boarder-only RLS), never visible to owner
- [x] **Download button** — one-tap save on each photo/video, full-resolution (blob fetch to bypass CORS)
- [x] **Media lightbox** — tap photo to view full-screen; fullscreen button on videos; Escape/backdrop to close
- [x] **Potty log** — one-tap pee/poop timestamp logging (boarder-only), with "last pee / last poop" summary and timeline grouped by day; helps sitters time the next break
- [x] **Meal schedule + log** — free-text `meal_schedule` reminder on stay (captures times + food mixture), plus boarder-only `meal_logs` table with optional "what they ate" text per entry
- [ ] **Download All** — bulk zip download _(future, not current scope)_

---

## Phase 5: Polish & Growth (Backlog)

Improvements and features identified during Phase 4. Prioritised by impact vs effort.

### Quick wins
- [x] **Upload count on stay cards** — show "8 photos · 2 videos" on each dashboard card
- [x] **Last activity on stay cards** — shows upload count + last activity time on each card
- [ ] **Lightbox photo navigation** — prev/next arrows to browse all photos without closing
- [x] **Reactivate completed stay** — undo accidental "Mark as complete"
- [ ] **Swipe in lightbox** — swipe left/right to navigate photos on mobile

### Medium effort
- [ ] **QR code on share page** — one-tap for owners to scan at drop-off instead of texting a URL
- [x] **Add to Google Calendar** — one-tap button on stay detail page to create a pre-filled calendar event (no API key, URL scheme)
- [ ] **Mobile bottom nav bar** — fixed Dashboard / + New Stay / Profile bar for easier thumb access
- [x] **Toast notifications** — replace inline loading/copied states with brief toasts (less layout shift)
- [ ] **Search/filter stays** — filter by pet name or owner name when stay count grows

### Bigger features
- [ ] **Owner reactions** — let owners heart/react to photos (no account needed, tied to share_token)
- [ ] **Multi-pet stays** — support sibling pets boarding together under one stay
- [ ] **Recurring boarders** — quick-create a new stay from a previous one (prefill pet details)

---

## Parked Ideas

Features considered but deferred. Revisit post-V1 based on real usage.

| Idea | Context | Revisit trigger |
|------|---------|-----------------|
| Meal/status updates | Owners may want to know if pet finished meals. Decided photo + optional caption covers this for now — avoids adding structured care logging friction. | Owners frequently ask "did they eat?" unprompted |
| Repeat owner detection | Phone number now captured. Build UI to surface past stays + private owner notes when same number seen. | After enough stays exist to test lookup |

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
| 2026-04-03 | Dashboard Calendar: month-view with coloured stay bars, smart overlap detection. Owner name field now required. Delete stay with inline confirmation. Navigation icons throughout. |
| 2026-04-03 | Download button on every photo/video card (blob fetch to bypass CORS, available in both owner and boarder views). |
| 2026-04-03 | Media lightbox: tap photo for full-screen overlay, fullscreen button on videos, Escape/backdrop/X to close, download in lightbox. |
| 2026-04-03 | Pinned notes: private scratchpad per stay in separate stay_notes table with boarder-only RLS; click-to-edit with ⌘↵ to save. |
| 2026-04-03 | Toast notifications: replaced inline "Copied!" / "Saving…" states with sonner toasts on share link copy and media download. |
| 2026-04-03 | Add to Google Calendar button on stay detail page — opens pre-filled event via URL scheme, no API key required. |
| 2026-04-22 | Potty log: new `potty_logs` table (boarder-only RLS), one-tap pee/poop buttons on stay detail, "last pee / last poop" summary + day-grouped timeline with delete. |
| 2026-04-23 | Potty log refinements and Google Calendar integration: PottyLogSection fully integrated into stay detail, add-to-calendar button with pre-filled event details. |
| 2026-04-23 | Responsive navbar: icon-only on mobile (< 640px), full text visible on sm+ screens. Fixes crowding on iPhone SE / XR. |
| 2026-04-24 | Meal schedule + log: new `meal_schedule` text field on stays (times + food mixture reminder), new `meal_logs` table (boarder-only RLS) with single "Log meal" button and optional "what they ate" text; timeline grouped by day. |
| 2026-04-24 | Log refinements: editable timestamps on potty + meal logs (click the time → datetime-local input, save on blur/Enter). Dropped "what they ate" field from meal log (kept simple: one-tap). Stay detail header buttons stack on mobile so Share button no longer clips. |
| 2026-04-24 | Stay card redesign: two-row layout (info row + actions row) so text never competes with buttons for horizontal space. Fixes wrapping and clipped Share button on 375px screens. |
| 2026-04-24 | Design system implementation: added `--bar-*` pastel CSS tokens to globals.css. Quick log row (🍽️ Meal / 💧 Pee / 💩 Poop pill buttons) on active stay detail; taps flow into MealLogSection + PottyLogSection via externalLog prop. |
| 2026-04-27 | Calendar dot labels: dots now show the first initial of the pet name (e.g. "R" for Ritchie) in the stay's text color, making each dot identifiable without hovering. |
| 2026-04-27 | Dashboard streaming: moved DB logic into StaysDashboard async Server Component behind Suspense. Header streams instantly (~50ms TTFB); skeleton shown while stays load. Auto-complete mutation is now fire-and-forget (parallel with select). |
