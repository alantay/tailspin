 # Design: Pet Boarding Photo Feed

## Personality

The app should feel like it was made by someone who genuinely loves animals — not by a corporation. It's playful, warm, and doesn't take itself too seriously. Think "your fun friend who happens to be great with dogs" rather than "professional pet services platform."

Humour is welcome. Pet puns are encouraged. Empty states, loading messages, placeholder text, and microcopy are all opportunities to make someone smile.

### Tone Examples
- Empty stay dashboard: "No stays yet. Your future furry guests are out there somewhere, probably chewing a shoe."
- Upload success: "Paw-sted! 🐾"
- Owner feed empty: "Nothing here yet — your boarder is probably busy giving belly rubs."
- Stay completed: "That's a wrap! Another tail well told."
- Loading: "Fetching updates... (pun intended)"
- No new photos on refresh: "No new snaps yet. Check back later — good things come to those who wait."

### Tone Don'ts
- Never clinical or corporate ("Your session has been initiated")
- Never pushy or guilt-tripping ("You haven't checked in 3 days!")
- Never cringey-cute to the point of being annoying — one pun per screen is plenty

## Colour Palette

Warm, soft, and inviting. Nothing harsh or neon. The palette should feel like a sunny afternoon at the park.

### Primary Colours
- **Warm Coral** — primary buttons, key actions, accents. Friendly and energetic without being aggressive.
- **Soft Cream / Warm White** — page backgrounds. Never stark white — always a hint of warmth.
- **Warm Charcoal** — text. Softer than pure black, easier on the eyes.

### Secondary / Accent Colours
- **Muted Sage Green** — success states, positive indicators
- **Soft Sky Blue** — secondary buttons, links
- **Warm Amber / Honey** — highlights, badges, small accents
- **Dusty Rose** — subtle accent for hover states or decorative elements

### Colours to Avoid
- Pure black (#000000) — too harsh
- Pure white (#FFFFFF) — too clinical
- Bright red — feels like an error or warning
- Neon anything — wrong vibe entirely
- Corporate blue — this isn't a SaaS dashboard

## Typography

- **Headings:** A rounded, friendly sans-serif. Something like Nunito, Quicksand, or Poppins. Should feel approachable, not authoritative.
- **Body text:** Clean and readable. The same font family at a lighter weight works fine.
- **Sizes:** Generous — don't cram things in. This is a photo app, give everything room to breathe.

## Shape & Spacing

### Soft Edges Everywhere
- All cards, buttons, inputs, and containers use **generous border radius** (12–16px for cards, 8–12px for buttons and inputs)
- Photos in the feed: rounded corners (8–12px), never sharp rectangles
- Profile photos / pet photos: circular
- No sharp corners anywhere in the UI

### Shadows
- Soft, warm drop shadows — not harsh or dark
- Use sparingly: cards, floating action buttons, modals
- Shadow colour should have a warm tint (not pure grey/black)
- Example: `box-shadow: 0 4px 12px rgba(180, 140, 120, 0.12)`

### Spacing
- Generous padding and margins throughout
- The feed should feel spacious — each photo gets room to breathe
- Don't pack information tightly. White space (warm-white space) is a feature, not a waste.

## Feed Design (Owner View)

This is the most important screen. It should feel like opening a personal photo album, not scrolling a social media feed.

- **Pet name and photo** at the top, prominent — this is *their* pet's page
- **Boarder info** subtle but visible — name and small photo, so the owner knows who's sharing
- **Photos are the hero** — large, full-width on mobile, with generous spacing between them
- **Captions** underneath in a friendly font, not competing with the photo
- **Timestamps** present but understated — "2 hours ago" or "This morning", not "2026-03-31T14:22:00Z"
- **Pull to refresh** should feel satisfying — maybe a small paw print animation
- **No infinite scroll fatigue** — for a typical stay there are maybe 5–30 photos, so the feed is naturally finite

## Boarder Dashboard

- Clean and uncluttered
- Active stays are front and centre — each stay card shows the pet's photo, name, and a quick "upload" action
- Past stays are accessible but secondary
- The "new stay" action should be prominent and inviting
- Upload button should be the most obvious thing on a stay page — big, friendly, impossible to miss

## Illustrations & Decorative Elements

- Small paw print motifs as decorative accents (sparingly — background patterns, dividers, loading states)
- Friendly, simple illustrations for empty states (a happy dog, a sleeping cat, etc.) — keep them simple line-art or flat style, nothing photorealistic
- Emoji are welcome in microcopy: 🐾 🐶 🐱 ✨

## Animations & Micro-interactions

- Keep them subtle and quick — nothing that slows down the experience
- Photo upload: gentle fade-in when a new photo appears
- Pull to refresh: paw print or bouncy animation
- Button taps: soft scale or colour shift, nothing aggressive
- Page transitions: simple fade, no dramatic sliding

## Mobile-First

Everything is designed for phones first. Desktop is a nice-to-have but not the priority.

- Touch targets: minimum 44px
- Thumb-friendly: primary actions within easy thumb reach at the bottom of the screen
- The upload flow should work one-handed
- Feed scrolls smoothly and photos resize to full viewport width

## What Good Looks Like

The app should feel like the intersection of:
- **Instagram** — photo-first, clean, visual
- **A handwritten note** — personal, warm, human
- **A fridge covered in pet photos** — joyful, casual, unpretentious

It should NOT feel like:
- A veterinary portal
- A corporate dashboard
- A social media platform with engagement metrics
- An enterprise SaaS product