# Deen Companion

A free, fast, all-in-one Islamic utility site — no backend, no database, no login. Open `index.html` and it works.

**Features**
- **Prayer Times** — by device location or by searching any city (Aladhan API)
- **Qibla Finder** — live compass bearing to the Kaaba, with device-compass support on phones
- **Hijri Date Converter** — today's Islamic date, plus convert any Gregorian date
- **Zakat Calculator** — 2.5% zakat estimate against a Gold or Silver Nisab threshold
- **Dua of the Day** — rotates daily
- Ad slots already placed (header, two in-feed, footer) — just drop your ad network's code in

Everything is static HTML/CSS/JS. It calls the free [Aladhan API](https://aladhan.com/prayer-times-api) client-side — no API keys, no server costs.

---

## 1. Host it for free, today

Any static host works. Pick one:

### Option A — GitHub Pages (simplest, free forever)
1. Push this `DeenCompanion` folder to a GitHub repo (or a `docs/` folder / `gh-pages` branch of one).
2. Repo → **Settings → Pages** → set source to the branch/folder containing `index.html`.
3. Your site is live at `https://<username>.github.io/<repo>/` within a minute.

### Option B — Netlify (free, custom domain support, faster global CDN)
1. Go to netlify.com → "Add new site" → "Deploy manually" → drag the `DeenCompanion` folder in.
2. Or connect your GitHub repo for auto-deploys on every push.
3. Add a custom domain under Site settings → Domain management.

### Option C — Vercel
Same idea as Netlify: `vercel.com` → New Project → import the repo → deploy. Zero config needed since it's static.

**Buy a domain** (optional but recommended for branding/SEO): Namecheap, Google Domains successor (Squarespace Domains), or Cloudflare Registrar (sold at cost, no markup). Something like `deencompanion.com`, `myqibla.app`, or similar — check availability and pick what's free.

---

## 2. Turn on ads (halal-compliant)

The page already has four ad containers: `.ad-top`, two `.ad-inline`, and `.ad-bottom` in `index.html`.

1. Apply for **Google AdSense** (free, most common starting point). You'll need: the live site URL, an `ads.txt` file (AdSense gives you this after approval — add it to the site root), and some initial organic content/traffic.
2. **Keep it halal**: in AdSense → Blocking controls → **General categories**, block:
   - Gambling
   - Dating
   - Alcohol
   - Adult/mature content
   These exclusions are built into AdSense — you don't need to vet each ad manually.
3. Once approved, replace each `<div class="ad-slot ...">` placeholder with your AdSense `<ins>` snippet.
4. Alternative/complementary ad networks that also support category blocking: **Ezoic**, **Media.net** (contextual, Yahoo/Bing network), or **Carbon Ads** (curated, developer-audience, no low-quality ads at all — a very clean halal-friendly option if your traffic is tech-leaning).

### Other halal monetization to layer in later
- **"Buy me a coffee" / Ko-fi / Patreon** donation button — many users of Islamic tools happily tip.
- **Premium tier** (no ads, offline mode, multiple family locations saved) via a simple one-time or annual payment — halal since you're selling a real digital product/service, not interest or chance-based.
- **Sponsorships** from halal-conscious brands (modest clothing, halal finance apps, Islamic bookstores) once you have traffic — flat-fee banner placement, no gambling/interest-based sponsors.
- **Affiliate links** to genuinely useful halal products (Quran apps, prayer mats, Islamic finance education) — disclose clearly, avoid anything interest-based (riba) or speculative.

Avoid: any ad network without category controls, crypto/forex "trading" ads, interest-based loan/credit-card ads, gambling, and dating — block these explicitly.

---

## 3. Marketing plan

### SEO (your main free growth channel)
This niche has real, high-intent search volume. Target keywords already baked into the page's `<title>`/`<meta>` tags:
- "prayer times [city]" — huge volume, very local-intent
- "qibla direction finder"
- "hijri date today" / "islamic calendar converter"
- "zakat calculator"

To rank:
1. Submit the site to **Google Search Console** and **Bing Webmaster Tools** (both free) once live.
2. Write a short blog/FAQ section over time (e.g., "How is Zakat calculated on gold?", "What is Qibla and why does direction matter?") — long-form content around these questions ranks well and is genuinely useful.
3. Get backlinks by asking local mosques, Islamic centers, and Muslim student associations to link to you as a free resource — very achievable, high-trust links.

### Social / community
- **Short-form video** (TikTok/Instagram Reels/YouTube Shorts): 15–30s clips like "Find your Qibla in 10 seconds" or "This free site calculates your Zakat for you" — utility demos perform well organically.
- **Reddit**: r/islam, r/MuslimLounge, r/converts — share as a genuinely free tool (not a hard sell), be transparent it's your project, follow subreddit self-promo rules.
- **WhatsApp/Telegram Islamic groups** and local mosque community boards/newsletters — direct, high-trust distribution.
- **Ramadan and Hajj/Dhul-Hijjah seasons** are your biggest traffic spikes (Zakat and prayer-time searches surge) — plan a content/social push a few weeks before each.

### Product growth loops
- Add a "Share your Qibla result" button (native Web Share API) so users forward it to family.
- Add it to phone home screens via the PWA manifest already included (`Add to Home Screen` prompt) — repeat visits without needing an app store.

### Metrics to track
Use a privacy-friendly analytics tool (Plausible, Fathom, or Cloudflare Web Analytics — no invasive cookies, halal-aligned respect for user privacy) to track visits, top pages, and which feature gets used most — then double down on content/marketing around that feature.

---

## 4. Local preview

No build step required. From this folder, run any static server, e.g.:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
