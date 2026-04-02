# Deployment

## Vercel (recommended)

1. Push the repo to GitHub
2. Import the project at vercel.com/new
3. Vercel auto-detects Next.js — no `vercel.json` needed
4. Add the following environment variables in **Project Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Deploy. Vercel gives you a URL like `https://tailspin-xxx.vercel.app`

## Post-deploy Supabase config

After deploying, update these in the Supabase Dashboard:

**Auth → URL Configuration:**
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: add `https://your-vercel-url.vercel.app/auth/callback`

## PWA icons

The manifest references `/icon-192.png` and `/icon-512.png` in the `public/` folder.
Add these before deploying for the best "Add to home screen" experience.
A simple approach: use a paw print emoji rendered to PNG at 192×192 and 512×512.

## Custom domain (optional)

In Vercel → Project → Domains, add your domain and follow the DNS instructions.
Then update Supabase Site URL and Redirect URLs to match the custom domain.
