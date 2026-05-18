import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const RequestSchema = z.object({
  texts: z.array(z.string().min(1).max(5000)).min(1).max(50),
});

const ResultSchema = z.object({
  results: z.array(
    z.object({
      text: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      score: z.number(),
      confidence: z.number(),
      emotions: z.array(z.string()),
      keywords: z.array(z.string()),
      summary: z.string(),
    })
  ),
  overview: z.object({
    headline: z.string(),
    insights: z.array(z.string()),
    recommendations: z.array(z.string()),
    themes: z.array(z.string()),
  }),
});

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json();
          const { texts } = RequestSchema.parse(body);

          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(
              JSON.stringify({ error: "Missing LOVABLE_API_KEY" }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");

          const schemaDescription = `{
  "results": [
    {
      "text": string (echo the original text),
      "sentiment": "positive" | "neutral" | "negative",
      "score": number between -1 and 1,
      "confidence": number between 0 and 1,
      "emotions": string[] (up to 5),
      "keywords": string[] (up to 8),
      "summary": string (one sentence)
    }
  ],
  "overview": {
    "headline": string,
    "insights": string[] (2-6 items),
    "recommendations": string[] (2-5 items),
    "themes": string[] (1-8 items)
  }
}`;

          const { text } = await generateText({
            model,
            system:
              "You are an expert sentiment analysis and data insights engine. Analyze each text precisely. Score: -1 (very negative) to 1 (very positive). Always respond with ONLY valid JSON, no markdown fences, no commentary.",
            prompt:
              `Analyze the texts below. Return JSON exactly matching this shape:\n${schemaDescription}\n\nTexts:\n` +
              texts.map((t, i) => `[${i + 1}] ${t}`).join("\n\n"),
          });

          // Strip optional code fences and parse
          const cleaned = text
            .trim()
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "");
          const parsed = ResultSchema.parse(JSON.parse(cleaned));

          return Response.json(parsed);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /402/.test(message)
            ? 402
            : /429/.test(message)
              ? 429
              : 500;
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});