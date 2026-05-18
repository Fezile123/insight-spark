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

## Run locally

```bash
bun install
bun run dev
```

Requires the `LOVABLE_API_KEY` environment variable on the server.

## Documentation

Full technical explanation, schema, deliverables and learning-track
mapping: see **[docs/PROJECT.md](./docs/PROJECT.md)**.

## Push to GitHub

In the Lovable editor: **+** menu → **GitHub** → **Connect project** →
**Create Repository**. Sync is bidirectional.