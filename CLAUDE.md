# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tailspin is a mobile-friendly pet boarding photo feed app. Pet boarders upload photos/videos of boarded pets; pet owners access a public, shareable feed on their own terms — no notifications, no accounts required for owners.

**Status**: Pre-implementation. See `docs/PRD.md` and `docs/ARCHITECTURE.md` for full specifications.

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes (`/api/*`)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **Hosting**: Vercel

## Commands

Once implementation begins, standard commands will be:

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint
npm test          # Run tests
```

## Architecture

### Key Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing / boarder login |
| `/dashboard` | Auth required | Boarder's stays list |
| `/dashboard/new` | Auth required | Create a stay |
| `/dashboard/stay/[id]` | Auth required | Upload photos/videos to a stay |
| `/stay/[share_token]` | Public | Owner's read-only feed |

### Data Model

- **boarders**: `id, name, avatar_url, created_at`
- **stays**: `id, boarder_id, pet_name, pet_photo, note, start_date, end_date, status, share_token, created_at`
- **uploads**: `id, stay_id, type (photo|video), file_url, thumbnail, caption, created_at`

### File Upload Flow

1. Boarder selects files from camera roll
2. Client-side compression (photos: max 1920px / 80% JPEG quality; videos: max 30 sec)
3. Client fetches presigned URL from `/api/upload`
4. Client uploads **directly to Supabase Storage** (bypasses the Next.js server)
5. Client calls `/api/upload/confirm` to record metadata in DB

### Security Model

- Owner feeds use an unguessable 8-char alphanumeric `share_token` (~2.8 trillion combinations)
- Boarder dashboard is protected by Supabase Auth sessions
- Supabase Row Level Security (RLS) restricts reads/writes per boarder
- Storage bucket RLS restricts writes to the owning boarder

### Development Phases

- **Phase 1**: Boarder auth, create stay, photo upload, owner feed
- **Phase 2**: Video upload, client-side compression, bulk upload, UI polish
- **Phase 3**: Archives, edit/delete, boarder profiles, PWA support
