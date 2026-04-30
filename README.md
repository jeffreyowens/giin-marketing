# giin-marketing

Static marketing site for [giin.ai](https://giin.ai) — plain HTML/CSS/JS, deployed via Cloudflare Pages.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Landing page (B2B, bar/restaurant owners) |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Service |
| `styles.css` | All styles, shared across pages |
| `assets/` | Images and icons (add here) |

## Editing content

All copy is inline in the HTML files — no build step required. Open the file in any text editor, update the text, save, and commit. Cloudflare Pages will deploy automatically on push to `main`.

### Design tokens (in `styles.css` `:root`)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#410061` | Page background |
| `--surface` | `#0D0320` | Cards, footer |
| `--accent` | `#C5FF4F` | Lime highlights, CTA |
| `--text` | `#ffffff` | Primary text |
| `--text-muted` | `rgba(255,255,255,0.65)` | Body copy |

Fonts are loaded from Google Fonts CDN (`Syne` for headings, `Outfit` for body).

## Deployment (Cloudflare Pages)

### First-time setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages**
2. Click **Connect to Git** → authorise GitHub → select `jeffreyowens/giin-marketing`
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
4. Click **Save and Deploy**

### Custom domain (giin.ai)

After the first deploy succeeds:

1. In your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `giin.ai` → follow prompts
3. Also add `www.giin.ai` and configure a redirect to `giin.ai` if desired

### DNS records (in Cloudflare DNS for giin.ai)

Cloudflare Pages will give you an exact `*.pages.dev` target after deploy. Add:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `@` | `<project>.pages.dev` | Proxied |
| CNAME | `www` | `<project>.pages.dev` | Proxied |

> **Note:** The existing `app.giin.ai` CNAME pointing to Vercel is unaffected — it is a subdomain and does not conflict with the root (`@`) record.

## Subsequent deploys

Push to `main` — Cloudflare Pages deploys automatically, usually within 30 seconds.

## Contact / questions

hello@giin.ai — Owens Enterprises LLC
