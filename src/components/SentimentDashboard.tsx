import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Download,
  FileText,
  Lightbulb,
  Target,
} from "lucide-react";

type Sentiment = "positive" | "neutral" | "negative";

interface Result {
  text: string;
  sentiment: Sentiment;
  score: number;
  confidence: number;
  emotions: string[];
  keywords: string[];
  summary: string;
}

interface Overview {
  headline: string;
  insights: string[];
  recommendations: string[];
  themes: string[];
}

interface AnalysisResponse {
  results: Result[];
  overview: Overview;
}

const SAMPLE = `The new update is incredibly smooth and saves me hours every week.
Customer support never replied to my ticket. Really disappointed.
It works fine, nothing special but does the job.
Absolutely love the redesign — the dashboard feels modern and fast!
The pricing is too high for what you get. Considering alternatives.
Onboarding was confusing but once I got it, the product is solid.`;

function sentimentColor(s: Sentiment) {
  if (s === "positive") return "var(--positive)";
  if (s === "negative") return "var(--negative)";
  return "var(--neutral)";
}

function SentimentIcon({ s }: { s: Sentiment }) {
  if (s === "positive") return <TrendingUp className="h-4 w-4" />;
  if (s === "negative") return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

export function SentimentDashboard() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  async function analyze() {
    const texts = input
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!texts.length) {
      toast.error("Please enter at least one line of text.");
      return;
    }
    if (texts.length > 50) {
      toast.error("Max 50 lines per analysis.");
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429)
          toast.error("Rate limit reached. Try again shortly.");
        else if (res.status === 402)
          toast.error("AI credits exhausted. Add credits in Workspace settings.");
        else toast.error(err.error || "Analysis failed");
        return;
      }
      const json = (await res.json()) as AnalysisResponse;
      setData(json);
      toast.success(`Analyzed ${json.results.length} item(s)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    if (!data) return;
    const md = buildReport(data);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sentiment-insights-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  const counts = data
    ? data.results.reduce(
        (acc, r) => {
          acc[r.sentiment] = (acc[r.sentiment] ?? 0) + 1;
          return acc;
        },
        { positive: 0, neutral: 0, negative: 0 } as Record<Sentiment, number>
      )
    : null;

  const distribution = counts
    ? [
        { name: "Positive", value: counts.positive, color: "var(--positive)" },
        { name: "Neutral", value: counts.neutral, color: "var(--neutral)" },
        { name: "Negative", value: counts.negative, color: "var(--negative)" },
      ]
    : [];

  const scoreData = data?.results.map((r, i) => ({
    name: `#${i + 1}`,
    score: Number(r.score.toFixed(2)),
    fill: sentimentColor(r.sentiment),
  }));

  const avgScore = data
    ? data.results.reduce((a, r) => a + r.score, 0) / data.results.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header
        className="relative overflow-hidden border-b"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 60%, white 0, transparent 35%)",
          }}
        />
        <div className="container relative mx-auto px-6 py-20 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI for Data Analysis & Insights</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
            Sentiment Analysis &<br />
            <span className="opacity-90">Data Insights</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base opacity-90 md:text-lg">
            Turn raw feedback into clear, AI-powered insights — sentiment scores,
            themes, and recommendations in one click.
          </p>
        </div>
      </header>

      <main className="container mx-auto -mt-10 space-y-8 px-6 pb-16">
        {/* Input */}
        <Card
          className="border-0"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <CardContent className="space-y-4 pt-6">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={7}
              placeholder="Paste your text here — one entry per line.&#10;e.g. customer reviews, survey responses, tweets…"
              className="resize-none border-muted bg-background text-sm leading-relaxed focus-visible:ring-primary"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={analyze}
                disabled={loading}
                size="lg"
                style={{ background: "var(--gradient-primary)" }}
                className="text-primary-foreground shadow-md transition-transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze sentiment
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput(SAMPLE)}
                disabled={loading}
              >
                <FileText className="mr-2 h-4 w-4" />
                Try sample data
              </Button>
              </div>
              <div className="flex items-center gap-3">
              {data && (
                <Button variant="outline" size="sm" onClick={downloadReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Download report
                </Button>
              )}
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {input.split("\n").filter((l) => l.trim()).length} entries
              </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {data && counts && (
          <>
            {/* Overview KPIs */}
            <section className="grid gap-4 md:grid-cols-4">
              <KpiCard
                label="Total analyzed"
                value={data.results.length.toString()}
              />
              <KpiCard
                label="Positive"
                value={counts.positive.toString()}
                accent="var(--positive)"
              />
              <KpiCard
                label="Negative"
                value={counts.negative.toString()}
                accent="var(--negative)"
              />
              <KpiCard
                label="Avg score"
                value={avgScore.toFixed(2)}
                accent="var(--primary)"
              />
            </section>

            {/* Charts */}
            <section className="grid gap-6 lg:grid-cols-2">
              <Card style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <CardTitle>Sentiment distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={distribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {distribution.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex justify-center gap-4 text-sm">
                    {distribution.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <CardTitle>Sentiment scores per item</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[-1, 1]} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {scoreData?.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            {/* Insights */}
            <section className="grid gap-6 lg:grid-cols-3">
              <Card
                className="lg:col-span-2"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg font-medium">{data.overview.headline}</p>
                  <ul className="space-y-2">
                    {data.overview.insights.map((i, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Target className="h-4 w-4" /> Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {data.overview.recommendations.map((r, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-foreground" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <CardTitle>Top themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.overview.themes.map((t) => (
                      <Badge key={t} variant="secondary" className="text-sm">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Per-item */}
            <section>
              <h2 className="mb-4 text-xl font-semibold">Per-item analysis</h2>
              <div className="grid gap-4">
                {data.results.map((r, i) => (
                  <Card key={i} style={{ boxShadow: "var(--shadow-card)" }}>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm">{r.text}</p>
                        <Badge
                          className="shrink-0 capitalize text-primary-foreground"
                          style={{ backgroundColor: sentimentColor(r.sentiment) }}
                        >
                          <SentimentIcon s={r.sentiment} />
                          <span className="ml-1">{r.sentiment}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {r.summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Score:{" "}
                          <span className="font-mono font-medium text-foreground">
                            {r.score.toFixed(2)}
                          </span>
                        </span>
                        <span>
                          Confidence:{" "}
                          <span className="font-mono font-medium text-foreground">
                            {(r.confidence * 100).toFixed(0)}%
                          </span>
                        </span>
                        {r.emotions.length > 0 && (
                          <span className="flex flex-wrap gap-1">
                            {r.emotions.map((e) => (
                              <Badge
                                key={e}
                                variant="outline"
                                className="text-xs"
                              >
                                {e}
                              </Badge>
                            ))}
                          </span>
                        )}
                        {r.keywords.length > 0 && (
                          <span className="flex flex-wrap gap-1">
                            {r.keywords.map((k) => (
                              <Badge
                                key={k}
                                variant="secondary"
                                className="text-xs"
                              >
                                #{k}
                              </Badge>
                            ))}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        <footer className="pt-8 text-center text-xs text-muted-foreground">
          Built with Lovable AI · Sentiment Analysis & Data Insights project
        </footer>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card style={{ boxShadow: "var(--shadow-card)" }}>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className="mt-1 text-3xl font-bold"
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function buildReport(d: AnalysisResponse) {
  const counts = d.results.reduce(
    (a, r) => ({ ...a, [r.sentiment]: (a[r.sentiment] ?? 0) + 1 }),
    {} as Record<string, number>
  );
  const avg = d.results.reduce((s, r) => s + r.score, 0) / d.results.length;
  return `# Sentiment Analysis & Data Insights Report

_Generated ${new Date().toLocaleString()}_

## Overview

**${d.overview.headline}**

- Total items analyzed: ${d.results.length}
- Positive: ${counts.positive ?? 0}
- Neutral: ${counts.neutral ?? 0}
- Negative: ${counts.negative ?? 0}
- Average sentiment score: ${avg.toFixed(2)} (range -1 to +1)

## Key insights

${d.overview.insights.map((i) => `- ${i}`).join("\n")}

## Recommendations

${d.overview.recommendations.map((r) => `- ${r}`).join("\n")}

## Themes

${d.overview.themes.map((t) => `- ${t}`).join("\n")}

## Per-item analysis

${d.results
  .map(
    (r, i) => `### Item ${i + 1} — ${r.sentiment.toUpperCase()} (score ${r.score.toFixed(2)}, confidence ${(r.confidence * 100).toFixed(0)}%)

> ${r.text}

${r.summary}

- Emotions: ${r.emotions.join(", ") || "—"}
- Keywords: ${r.keywords.join(", ") || "—"}
`
  )
  .join("\n")}
`;
}