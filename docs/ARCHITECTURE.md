# Architecture: Pet Boarding Photo Feed

## Tech Stack

| Layer        | Technology           | Why                                                                                                                                                                                        |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework    | Next.js (App Router) | Handles both boarder dashboard (authenticated) and owner feed (public) in one codebase. Server-side rendering for fast feed loading. API routes eliminate the need for a separate backend. |
| Database     | Supabase (Postgres)  | Managed Postgres with built-in auth and file storage. Generous free tier. Single service for DB + auth + media storage.                                                                    |
| Auth         | Supabase Auth        | Email/password for V1. Social login can be added later. Only boarders need accounts.                                                                                                       |
| File Storage | Supabase Storage     | Stores photos and videos. Serves via CDN. Supports direct uploads from the client (presigned URLs) to avoid routing large files through the server.                                        |
| Styling      | Tailwind CSS         | Utility-first CSS. Fast to build mobile-first layouts. Included with Next.js by default.                                                                                                   |
| Hosting      | Vercel               | Zero-config deployment for Next.js. Free tier covers personal use. Automatic HTTPS and global CDN.                                                                                         |

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                   Vercel                     │
│  ┌───────────────────────────────────────┐   │
│  │            Next.js App                │   │
│  │                                       │   │
│  │  /dashboard  (boarder, authenticated) │   │
│  │  /stay/[id]  (owner, public)          │   │
│  │  /api/*      (server-side logic)      │   │
│  └───────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│               Supabase                       │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Postgres │  │  Auth    │  │  Storage   │  │
│  │          │  │          │  │ (photos/   │  │
│  │ stays    │  │ boarder  │  │  videos)   │  │
│  │ uploads  │  │ accounts │  │            │  │
│  │ boarders │  │          │  │            │  │
│  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────┘
```

## Data Model

### boarders

```
id          UUID (PK, from Supabase Auth)
name        TEXT
avatar_url  TEXT (nullable)
created_at  TIMESTAMP
```

### stays

```
id          UUID (PK)
boarder_id  UUID (FK → boarders.id)
pet_name    TEXT
pet_photo   TEXT (nullable, URL to storage)
note        TEXT (nullable)
start_date  DATE
end_date    DATE (nullable)
status      TEXT ('active' | 'completed')
share_token TEXT (unique, 8-char alphanumeric, used in public URL)
created_at  TIMESTAMP
```

### uploads

```
id          UUID (PK)
stay_id     UUID (FK → stays.id)
type        TEXT ('photo' | 'video')
file_url    TEXT (URL to storage)
thumbnail   TEXT (nullable, URL to storage, for videos)
caption     TEXT (nullable)
created_at  TIMESTAMP
```

## Key Routes

| Route                  | Access         | Purpose                         |
| ---------------------- | -------------- | ------------------------------- |
| `/`                    | Public         | Landing page / boarder login    |
| `/dashboard`           | Boarder (auth) | List of active and past stays   |
| `/dashboard/new`       | Boarder (auth) | Create a new stay               |
| `/dashboard/stay/[id]` | Boarder (auth) | View stay, upload photos/videos |
| `/stay/[share_token]`  | Public (owner) | Owner-facing photo feed         |

## File Upload Flow

```
1. Boarder selects photos/videos from camera roll
2. Client-side:
   - Photos: resize to max 1920px wide, compress to ~80% JPEG quality
   - Videos: validate duration ≤ 30 seconds (no client-side transcoding in V1)
3. Client requests presigned upload URL from /api/upload
4. Client uploads directly to Supabase Storage (bypasses server)
5. On completion, client calls /api/upload/confirm to create the database record
6. New upload appears in the feed
```

### Why Presigned URLs?

Uploading directly from the client to Supabase Storage avoids routing large files through the Vercel serverless functions, which have a request body limit and would be slow for video. The server only handles generating the presigned URL and recording the metadata.

## Image Optimisation

- **On upload:** Client resizes photos to max 1920px width and compresses to JPEG ~80% quality using browser Canvas API. This reduces a typical phone photo from ~5MB to ~300-500KB.
- **On display:** Use Next.js `<Image>` component for automatic responsive sizing, lazy loading, and format conversion (WebP where supported).
- **Thumbnails for video:** In V1, use the first frame extracted via browser Canvas API before upload. Server-side transcoding/thumbnailing is out of scope.

## Video Handling (V1)

- Max duration: 35 seconds (enforced client-side)
- Max file size: 50MB (enforced client-side after compression)
- Formats accepted: MP4, MOV (what phone cameras produce)
- No server-side transcoding — modern phone video plays natively in browsers
- Videos served directly from Supabase Storage CDN
- If transcoding becomes necessary later, add a background job (e.g. Supabase Edge Function or external service)

## Security

### Owner Feed

- Accessed via unguessable share_token (8-char alphanumeric = ~2.8 trillion combinations)
- No authentication required — anyone with the link can view
- Read-only — no actions available to the owner in V1
- Rate limiting on feed endpoint to prevent scraping

### Boarder Dashboard

- Protected by Supabase Auth (session-based)
- Row Level Security (RLS) on all tables — boarders can only access their own data
- Presigned upload URLs scoped to the specific stay's storage path

### Storage

- Supabase Storage buckets with RLS policies
- Public read access for files in stay folders (since owners need to view without auth)
- Write access restricted to authenticated boarder who owns the stay

## Estimated Costs

### Free Tier (Personal Use)

| Service          | Free Tier Limit       | Estimated Usage                                  |
| ---------------- | --------------------- | ------------------------------------------------ |
| Vercel           | 100GB bandwidth/month | ~1-2GB/month                                     |
| Supabase DB      | 500MB                 | ~10MB                                            |
| Supabase Storage | 1GB                   | ~500MB for ~100 compressed photos + a few videos |
| Supabase Auth    | 50,000 MAU            | 1 user                                           |

**Total: $0/month** for personal use with a few stays.

### When You'd Hit Paid Tiers

- ~200+ photos and several videos → Supabase Storage exceeds 1GB → Supabase Pro at $25/month
- Multiple boarders with active clients → bandwidth increases → still likely within Vercel free tier
- At scale (hundreds of boarders): estimated $25-50/month total

## Development Phases

### Phase 1: Core (Build First)

- Boarder auth (sign up, log in)
- Create a stay, generate share link
- Upload photos with optional caption
- Owner feed: newest-first photo display
- Basic mobile-responsive UI

### Phase 2: Video & Polish

- Video upload with duration validation
- Client-side photo compression
- Bulk upload (select multiple at once)
- Nicer feed UI with timestamps and boarder info
- Stay completion and archiving

### Phase 3: Quality of Life

- Past stays archive
- Edit/delete uploads
- Boarder profile (name, photo)
- Better share flow (native share sheet integration)
- PWA support for "add to home screen" on boarder's phone
