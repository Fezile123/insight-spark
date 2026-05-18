import { createFileRoute } from "@tanstack/react-router";
import { SentimentDashboard } from "@/components/SentimentDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentiment Analysis & Data Insights" },
      {
        name: "description",
        content:
          "AI-powered sentiment analysis tool. Paste reviews, tweets, or feedback and get sentiment scores, themes, and actionable insights.",
      },
    ],
  }),
  component: () => <SentimentDashboard />,
});
