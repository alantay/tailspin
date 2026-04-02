# PRD: Pet Boarding Photo Feed

## Problem

Pet boarders take many photos and videos during a stay but are reluctant to share them all with the owner via WhatsApp because it feels like spamming. Meanwhile, owners would love to see these updates — but on their own terms, not via push notifications they didn't ask for.

The result: boarders self-censor, owners miss out, and both sides feel awkward about communication frequency.

There's a secondary problem: owners who are anxious or demanding will repeatedly text the boarder asking for updates. This puts pressure on the boarder and makes the experience feel like a chore. A feed the owner can check anytime removes their reason to pester the boarder.

## Solution

A simple web app where boarders upload photos and videos freely without guilt, and owners check a clean feed whenever they want — like refreshing an Apple keynote live page or following a football match on a webpage.

No notifications. No chat. No pressure on either side.

The boarder shares a link at the start of a stay and says "I'll be posting photos and updates here — check anytime!" This sets the expectation that updates come through the app, not through WhatsApp. It's a polite boundary.

## Users

### Pet Boarder (Primary User)

- Has an account
- Creates stays, uploads photos/videos, manages multiple pets
- The person who invites the owner by sharing a link

### Pet Owner (Secondary User)

- No account required
- Accesses the feed via a shareable link
- Checks in whenever they want

## Core Features (V1)

### Boarder: Account & Dashboard

- Sign up / log in (email-based)
- Dashboard showing active stays and past stays
- Simple profile: name and photo (appears on owner-facing feeds)

### Boarder: Dashboard Calendar

- Month-view calendar showing all stays as coloured horizontal bars spanning their date range
- Each bar shows the pet name so boarders can see at a glance who is staying when
- Different colours assigned per stay, chosen to avoid clashes when stays overlap
- Tapping a bar opens the stay detail page
- Helps boarders plan availability and spot scheduling conflicts at a glance

### Boarder: Stay Management

- Create a stay: pet name, optional pet photo, optional note, start/end dates
- Auto-generates a unique shareable link per stay
- Share the link via any channel (WhatsApp, SMS, email — using the phone's native share sheet)
- Mark a stay as completed (or auto-complete based on end date)
- Past stays are archived and remain accessible

### Boarder: Pinned Notes

- A private text box at the top of each stay, visible only to the boarder
- Used to paste or type the owner's care instructions — feeding times, medication, quirks, house rules, anything the boarder needs to reference during the stay
- Not structured, not a form, not a checklist — just a freeform scratchpad
- Saves the boarder from scrolling back through WhatsApp to find "what time is breakfast again?"
- Editable at any time during the stay
- Never visible to the owner

### Boarder: Photo & Video Upload

- Bulk upload from camera roll — select multiple photos/videos in one action
- Optional short text caption per upload
- Uploading should feel faster and easier than sharing on WhatsApp
- Progress indicator for uploads (especially video)
- Photos and videos appear in the feed immediately after upload

### Boarder: Video Constraints

- Maximum video duration: 30 seconds
- Client-side compression before upload to reduce file size and upload time
- Supported formats: whatever the phone's camera produces (MP4, MOV)

### Owner: Photo Feed

- Accessed via shareable link — no app download, no account, no sign-up
- Mobile-first, clean, newest-first feed
- Pull to refresh (or manual reload) to see new uploads
- Photos displayed prominently with timestamps
- Videos play inline
- Boarder's name and photo shown at the top for a personal touch
- Pet name and stay dates displayed
- No notification badges, no unread counts, no "seen" indicators

### Owner: Download

- Each photo and video has a visible download button so owners can save to their phone with one tap
- No long-pressing or browser-specific gestures required — just a clear download icon
- Downloads the full-resolution file, not a compressed version

## Design Principles

### For Boarders — Zero Guilt Sharing

- The app should make it feel completely fine to upload 20 photos in one go
- No friction: open app, tap upload, select from camera roll, done
- No prompts like "are you sure you want to share this many?"
- No read receipts — the boarder doesn't know when/if the owner checked

### For Owners — Calm Curiosity

- The feed should feel like a private photo album, not a notification inbox
- Warm and personal — not clinical, not like a file manager
- Satisfying to refresh — the small thrill of seeing new photos
- Works perfectly in a mobile browser without any setup
- Easy to save favourite photos to their phone

### General

- Mobile-first design for both sides
- Minimal UI — every screen has one obvious thing to do
- Fast loading — especially the owner's feed (they might check on mobile data)

## What This Is NOT

- Not a booking platform (Pawshake etc. handle that)
- Not a messaging or chat app
- Not a care checklist, activity log, or task tracker
- Not a social media platform
- Not a boarder discovery or review platform

## Out of Scope (V1) — Future Exploration

- Boarder "Welcome Page" (what to bring, house rules, daily routine)
- Structured pet care info form for owners to fill in
- Care checklist / medication tracking during stays
- Portable pet profile across different boarders
- End-of-stay summary report
- Owner emoji reactions on photos
- Owner accounts and cross-boarder stay history
- Multi-boarder support / team accounts
- Push notifications of any kind
- "Download All" button for saving all photos from a stay at once

## Success Criteria

This is initially a personal tool. Success for V1 means:

- I (the boarder) use it on my next boarding instead of WhatsApp for photo sharing
- Uploading feels faster and less awkward than WhatsApp
- The owner I share it with checks the feed and finds it easy to use
- After using it for 2–3 stays, I still prefer it over WhatsApp
