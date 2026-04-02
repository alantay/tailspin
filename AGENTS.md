# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tailspin is a mobile-friendly pet boarding photo feed app. Pet boarders upload photos/videos of boarded pets; pet owners access a public, shareable feed on their own terms — no notifications, no accounts required for owners.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI Components**: shadcn/ui (using `@base-ui/react` — no `asChild` prop on Button)
- **Backend**: Next.js API routes (`/api/*`)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **Package manager**: pnpm
- **Hosting**: Vercel

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # ESLint
```

## UI & Design

Design guidelines are in `docs/DESIGN.md`. Key principles:

- **Font**: Nunito (variable: `--font-nunito`)
- **Palette**: Warm Coral primary, Soft Cream background, Warm Charcoal text — all in `app/globals.css` as oklch CSS variables
- **Radius**: Generous (`--radius: 0.875rem` base)
- **Tone**: Warm, playful, pet-pun-friendly — see `docs/DESIGN.md` for microcopy examples
- **shadcn note**: The installed Button uses `@base-ui/react` which has no `asChild`. For link-styled buttons use `buttonVariants()` with a plain `<a>` tag and `cn()`

## Architecture

### Key Routes

| Route                  | Access        | Purpose                                      |
| ---------------------- | ------------- | -------------------------------------------- |
| `/`                    | Public        | Landing / boarder login                      |
| `/dashboard`           | Auth required | Boarder's stays list                         |
| `/dashboard/new`       | Auth required | Create a stay                                |
| `/dashboard/stay/[id]` | Auth required | Upload photos/videos to a stay               |
| `/stay/[share_token]`  | Public        | Owner's read-only feed (ISR, revalidate 60s) |
| `/auth/sign-up`        | Public        | Sign-up form                                 |
| `/auth/callback`       | Public        | Supabase email confirmation handler          |
| `/api/upload`          | Auth required | GET: generate presigned Supabase Storage URL |
| `/api/upload/confirm`  | Auth required | POST: write upload record to DB              |

### Data Model

- **boarders**: `id, name, avatar_url, created_at`
- **stays**: `id, boarder_id, pet_name, pet_photo, note, start_date, end_date, status, share_token, created_at`
- **uploads**: `id, stay_id, type (photo|video), file_url, thumbnail, caption, created_at`

### Supabase Clients

Three separate clients — always use the right one:

- `lib/supabase/client.ts` — browser (Client Components)
- `lib/supabase/server.ts` — server (Server Components, Route Handlers, Server Actions) — uses `cookies()` from `next/headers`
- `lib/supabase/middleware.ts` — middleware session refresh only

Always call `supabase.auth.getUser()` (not `getSession()`) for server-side auth checks.

### File Upload Flow

1. User picks photos → `resizeImageToJpeg()` in `lib/utils.ts` (max 1920px, 80% JPEG)
2. `GET /api/upload?stay_id=X&filename=Y` → returns `{ path, signedUrl }`
3. Client `PUT` directly to Supabase Storage via `signedUrl` (bypasses Next.js server)
4. `POST /api/upload/confirm { stay_id, path, caption }` → writes DB record

### Security Model

- Owner feeds accessed via unguessable 8-char alphanumeric `share_token`
- `middleware.ts` redirects unauthenticated requests away from `/dashboard`
- `dashboard/layout.tsx` re-validates session server-side as belt-and-suspenders
- Supabase RLS on all tables; Storage RLS restricts writes to the owning boarder

### Development Phases

- **Phase 1** ✅: Boarder auth, create stay, photo upload, owner feed
- **Phase 2**: Video upload, client-side compression, bulk upload, UI polish
- **Phase 3**: Archives, edit/delete, boarder profiles, PWA support

## Project Documentation

- Product requirements: `docs/PRD.md`
- Technical architecture: `docs/ARCHITECTURE.md`
- Design guidelines: `docs/DESIGN.md`
- Project progress/changelog: `docs/PROGRESS.md`
- Supabase SQL setup: `docs/supabase-setup.sql`

## Workflow

- After completing any task, update docs/PROGRESS.md to check off finished items and add a changelog entry.
