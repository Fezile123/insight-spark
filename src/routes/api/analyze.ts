import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateObject } from "ai";
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

          const { object } = await generateObject({
            model,
            system:
              "You are an expert sentiment analysis and data insights engine. Analyze each text precisely. Score: -1 (very negative) to 1 (very positive). Confidence: 0..1. Provide actionable insights and recurring themes across the dataset.",
            prompt:
              "Analyze the following texts and produce per-item sentiment plus an overall overview.\n\n" +
              texts.map((t, i) => `[${i + 1}] ${t}`).join("\n\n"),
            schema: ResultSchema,
          });

          return Response.json(object);
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