# Sentiment Analysis & Data Insights

An AI-powered web app that analyzes the sentiment of any batch of texts
(reviews, tweets, survey responses, support tickets) and produces an
interactive dashboard plus a downloadable insights report.

Built as the individual project for the **AI for Data Analysis & Insights**
learning track.

---

## 1. Project goals

| Competency | How this project demonstrates it |
|---|---|
| Data interpretation using AI | An LLM scores each text and extracts emotions, keywords, themes. |
| Analytical thinking | Per-item scores are aggregated into distributions, averages, and themes. |
| AI-assisted insights generation | The model returns a headline, insights and recommendations. |
| Individual project ownership | Full-stack app, owned, designed, and deployed end-to-end. |

## 2. Technical concepts covered

- **Sentiment analysis fundamentals** — positive / neutral / negative classification with a continuous score in `[-1, +1]`.
- **Text classification** — performed by `google/gemini-3-flash-preview` via the Lovable AI Gateway, with a strict Zod schema (structured output).
- **Basic ML concepts** — confidence scores, classes, feature extraction (keywords, emotions), aggregation.
- **Data visualization** — distribution pie chart, per-item score bar chart, KPI cards (Recharts).

## 3. Architecture

```
 Browser (React + Tailwind + Recharts)
        │   POST /api/analyze  { texts: string[] }
        ▼
 TanStack Start server route  src/routes/api/analyze.ts
        │   AI SDK · generateText + Output.object(zod schema)
        ▼
 Lovable AI Gateway  →  google/gemini-3-flash-preview
        │
        ▼   structured JSON  { results[], overview }
 Dashboard renders KPIs, charts, per-item cards, downloadable .md report
```

### Why this stack
- **TanStack Start** — file-based routing + server routes in one project, deployed at the edge.
- **AI SDK (`ai`)** — `generateText` with `Output.object` returns *typed*, schema-validated output, no manual JSON parsing.
- **Lovable AI Gateway** — one key, multiple models, server-side only (`LOVABLE_API_KEY` is never shipped to the browser).
- **Recharts** — lightweight charts that fit the design system.

## 4. Key files

| Path | Purpose |
|---|---|
| `src/routes/index.tsx` | Home page, mounts the dashboard. |
| `src/components/SentimentDashboard.tsx` | UI: input, KPIs, charts, per-item cards, report download. |
| `src/routes/api/analyze.ts` | Server route that calls the LLM with a Zod schema. |
| `src/lib/ai-gateway.ts` | Tiny helper that wires the AI SDK to the Lovable AI Gateway. |
| `src/styles.css` | Design tokens (oklch colors, gradients, shadows). |

## 5. The data schema

The model is forced to return this structure (see `src/routes/api/analyze.ts`):

```ts
{
  results: Array<{
    text: string;
    sentiment: "positive" | "neutral" | "negative";
    score: number;        // -1 .. +1
    confidence: number;   //  0 .. 1
    emotions: string[];   // up to 5
    keywords: string[];   // up to 8
    summary: string;
  }>,
  overview: {
    headline: string;
    insights: string[];        // 2..6
    recommendations: string[]; // 2..5
    themes: string[];          // 1..8
  }
}
```

Because the schema is enforced server-side, the frontend can render
confidently without defensive parsing.

## 6. Running locally

Requires Bun.

```bash
bun install
bun run dev
```

The `LOVABLE_API_KEY` environment variable must be set on the server. In
Lovable it is auto-provisioned. For self-hosting set it manually.

## 7. Using the app

1. Paste one text per line in the input box (max 50 lines, 5000 chars each).
2. Click **Run sentiment analysis**.
3. Inspect the KPIs, charts and per-item cards.
4. Click **Download insights report** to export a Markdown report.

## 8. Deliverables checklist

- [x] Working sentiment analysis solution (dashboard)
- [x] Per-item scores + dataset-level insights
- [x] Downloadable insights report (Markdown)
- [x] Documented technical explanation (this file)
- [x] Individual project, deployable from GitHub

## 9. Pushing to GitHub

Lovable has a two-way GitHub sync. In the Lovable editor:

1. Open the **+** menu (bottom-left of the chat input) → **GitHub** → **Connect project**.
2. Authorize the Lovable GitHub App.
3. Click **Create Repository**.

After that, every change in Lovable is pushed automatically, and any commit
you push to GitHub syncs back into Lovable.

## 10. Courses referenced

- *Python for Data Science, AI & Development* — IBM (Coursera)
- *Generative AI with Large Language Models* — AWS & DeepLearning.AI (Coursera)

Concepts from those courses applied here: feature extraction & classification
(course 1), structured prompting and using LLMs as zero-shot classifiers
(course 2).