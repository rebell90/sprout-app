"use client";

import { useRouter } from "next/navigation";
import InterestQuiz from "@/components/InterestQuiz";
import type { QuizResult } from "@/types";

export default function QuizPage() {
  const router = useRouter();

  async function handleComplete({ archetype, profile, answers }: QuizResult) {
    const timeAnswer = answers.find((a) => a.startsWith("time:"));
    const timeMap: Record<string, number> = { "time:1": 1, "time:3": 3, "time:5": 5, "time:10": 10 };
    const timePerWeekHrs = timeAnswer ? (timeMap[timeAnswer] ?? 3) : 3;

    const res = await fetch("/api/interest-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        archetypeTitle: archetype.title,
        answers,
        timePerWeekHrs,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      console.error("Failed to save profile");
    }
  }

  return <InterestQuiz onComplete={handleComplete} />;
}