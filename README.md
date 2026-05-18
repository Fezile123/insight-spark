# Sentiment Analysis & Data Insights

AI-powered web app for analyzing sentiment across batches of text and
generating an insights report. Individual project for the **AI for Data
Analysis & Insights** track.

- Paste reviews / tweets / survey responses (one per line)
- Get sentiment classification, confidence, score, emotions, keywords
- See KPI cards, distribution pie chart and per-item bar chart
- Download a Markdown insights report

## Stack

- TanStack Start (React + file-based routing + edge server routes)
- AI SDK (`ai`) with structured output (Zod schema)
- Lovable AI Gateway → `google/gemini-3-flash-preview`
- Tailwind v4 design system + Recharts

## Prerequisites

- [Bun](https://bun.sh) installed on your machine
- A [Lovable](https://lovable.dev) account (or see self-hosting options below)

## Environment variables

The app needs one environment variable at runtime:

| Variable | Required | Description |
|---|---|---|
| `LOVABLE_API_KEY` | Yes | Lovable AI Gateway key. Auto-provisioned in Lovable Cloud; see self-hosting below for manual setup. |

No `.env` file is needed in Lovable — secrets are managed in the platform. For self-hosting, set `LOVABLE_API_KEY` in your host's environment variables dashboard.

## Install dependencies

```bash
bun install
```

## Development

```bash
bun run dev
```

The dev server starts on `http://localhost:8080`. The server-side AI call will only work if `LOVABLE_API_KEY` is available in the server environment.

## Build for production

```bash
bun run build
```

This produces a production bundle ready for the edge runtime (Cloudflare Workers compatible).

## Hosting options

### Option A: Lovable Cloud (recommended)

1. Click **Publish** (top right on desktop, bottom-right in preview on mobile).
2. Your app goes live instantly at a `.lovable.app` URL.
3. Backend routes (like `/api/analyze`) deploy automatically.
4. To update the live frontend after code changes, click **Update** in the publish dialog.

### Option B: Self-host on Cloudflare Workers

1. Build the app: `bun run build`
2. Make sure `wrangler.jsonc` is present (it ships with the project).
3. Add `LOVABLE_API_KEY` to your Cloudflare Workers secrets:
   ```bash
   wrangler secret put LOVABLE_API_KEY
   ```
4. Deploy:
   ```bash
   wrangler deploy
   ```

### Option C: Self-host on Vercel

1. Fork or clone the repo to your GitHub account.
2. Import the project into Vercel.
3. In **Project Settings → Environment Variables**, add:
   - `LOVABLE_API_KEY` → your key
4. Set the build command to `bun run build` and output directory to `dist/`.
5. Deploy.

> Note: TanStack Start defaults to a Cloudflare Workers runtime. If you switch to a Node.js runtime on Vercel, you may need to adjust `vite.config.ts` and remove Cloudflare-specific settings.

### Option D: Self-host on Netlify

1. Connect your GitHub repo to Netlify.
2. In **Site Settings → Environment Variables**, add `LOVABLE_API_KEY`.
3. Build command: `bun run build`
4. Publish directory: `dist/`
5. Deploy.

### Option E: Docker / VPS / other Node-compatible host

1. Build locally: `bun run build`
2. Serve the `dist/` folder with any static file server, **or**
3. Run the SSR worker entry with a Node-compatible server (e.g. `node dist/server.js` if your build target supports it).

> For non-Cloudflare runtimes, review `wrangler.jsonc` and `vite.config.ts` to ensure compatibility with your target.

## Getting your own `LOVABLE_API_KEY` (for self-hosting)

If you are not using Lovable Cloud, you can get a key by:

1. Creating a free project on [Lovable](https://lovable.dev).
2. Going to your project settings to find the auto-generated key.
3. Copying that key into your own hosting provider's environment variables.

## Documentation

Full technical explanation, schema, deliverables and learning-track
mapping: see **[docs/PROJECT.md](./docs/PROJECT.md)**.

## Push to GitHub

In the Lovable editor: **+** menu → **GitHub** → **Connect project** →
**Create Repository**. Sync is bidirectional.