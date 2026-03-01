import type { InterestProfile, Archetype } from "@/types";

// ============================================================
// ANSWER WEIGHTS
// Maps each quiz answer key to weighted interest category scores
// Add new answers here as you expand the quiz
// ============================================================

const ANSWER_WEIGHTS: Record<string, Record<string, number>> = {
  // World selection
  "world:tech":    { coding: 0.8, math: 0.5, science: 0.4, making: 0.6 },
  "world:art":     { art: 0.9, creativity: 0.8, design: 0.6, storytelling: 0.3 },
  "world:science": { science: 0.9, math: 0.5, nature: 0.4, making: 0.3 },
  "world:music":   { music: 0.9, creativity: 0.6, art: 0.3, performance: 0.5 },
  "world:stories": { storytelling: 0.9, creativity: 0.7, art: 0.3, writing: 0.7 },
  "world:nature":  { nature: 0.9, science: 0.5, animals: 0.7, outdoors: 0.6 },

  // Personality
  "style:making":     { making: 0.9, coding: 0.3, art: 0.3, hands_on: 0.8 },
  "style:figuring":   { math: 0.6, science: 0.7, coding: 0.5, problem_solving: 0.9 },
  "style:expressing": { art: 0.7, creativity: 0.9, storytelling: 0.5, music: 0.4 },
  "style:helping":    { teamwork: 0.9, teaching: 0.7, community: 0.8 },

  // Deep dives
  "deep:games":     { coding: 0.8, game_design: 0.9, art: 0.3, math: 0.4 },
  "deep:websites":  { coding: 0.9, design: 0.7, creativity: 0.4 },
  "deep:robots":    { coding: 0.6, science: 0.7, making: 0.9, math: 0.5 },
  "deep:animation": { art: 0.8, coding: 0.5, storytelling: 0.4, creativity: 0.7 },
  "deep:painting":  { art: 0.9, creativity: 0.8, design: 0.5 },
  "deep:music":     { music: 0.9, creativity: 0.6, math: 0.3 },
  "deep:writing":   { writing: 0.9, storytelling: 0.8, creativity: 0.6 },
  "deep:animals":   { animals: 0.9, nature: 0.7, science: 0.5 },
  "deep:space":     { science: 0.9, math: 0.6, nature: 0.4 },
  "deep:cooking":   { making: 0.7, science: 0.4, creativity: 0.5 },

  // Time
  "time:1":  { consistency: 0.3 },
  "time:3":  { consistency: 0.6 },
  "time:5":  { consistency: 0.9 },
  "time:10": { consistency: 1.0 },
};

// ============================================================
// BUILD INTEREST PROFILE
// Aggregates all answer weights, normalizes to 0-1 range
// ============================================================

export function buildInterestProfile(answers: string[]): InterestProfile {
  const totals: Record<string, number> = {};

  answers.forEach((answer) => {
    const weights = ANSWER_WEIGHTS[answer] ?? {};
    Object.entries(weights).forEach(([key, val]) => {
      totals[key] = (totals[key] ?? 0) + val;
    });
  });

  const max = Math.max(...Object.values(totals), 1);

  return Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, parseFloat((v / max).toFixed(2))])
  );
}

// ============================================================
// GET ARCHETYPE
// Maps top interests to a kid-friendly identity
// ============================================================

export function getArchetype(profile: InterestProfile): Archetype {
  const sorted = Object.entries(profile).sort(([, a], [, b]) => b - a);
  const top = sorted.slice(0, 3).map(([k]) => k);

  if (top.includes("coding") && top.includes("game_design")) return {
    title: "Game Inventor", emoji: "🎮",
    color: "#6C63FF", glow: "#a29bfe",
    powers: [
      "Turn ideas into playable worlds",
      "Speak the language of computers",
      "Create things millions of people can enjoy",
    ],
    desc: "You love building things that come alive — and games are your superpower.",
  };

  if (top.includes("coding") || top.includes("making")) return {
    title: "Digital Builder", emoji: "⚡",
    color: "#00B4D8", glow: "#90e0ef",
    powers: [
      "Bring ideas to life with code",
      "Solve problems nobody else can",
      "Build tools that help real people",
    ],
    desc: "You see a problem and immediately start thinking about how to fix it.",
  };

  if (top.includes("art") && top.includes("storytelling")) return {
    title: "Story Weaver", emoji: "✨",
    color: "#FF6B9D", glow: "#ffb3c6",
    powers: [
      "Paint pictures with words and images",
      "Make people feel things",
      "Create worlds that didn't exist before",
    ],
    desc: "You express what others can't even put into words.",
  };

  if (top.includes("art") || top.includes("creativity")) return {
    title: "Visual Dreamer", emoji: "🎨",
    color: "#FF9500", glow: "#ffcc80",
    powers: [
      "See beauty where others see nothing",
      "Turn blank pages into adventures",
      "Make people stop and look twice",
    ],
    desc: "You experience the world differently — and you can share that vision with everyone.",
  };

  if (top.includes("science") || top.includes("math")) return {
    title: "Discovery Explorer", emoji: "🔭",
    color: "#00C896", glow: "#69f0ae",
    powers: [
      "Ask the questions nobody else thought of",
      "Uncover how the universe works",
      "Turn data into understanding",
    ],
    desc: "You're driven by curiosity — and the world needs more people like you.",
  };

  if (top.includes("nature") || top.includes("animals")) return {
    title: "Nature Guardian", emoji: "🌿",
    color: "#56AB2F", glow: "#a8e063",
    powers: [
      "Understand living things deeply",
      "Protect what others take for granted",
      "Connect the dots between ecosystems",
    ],
    desc: "You see the world as something worth protecting.",
  };

  if (top.includes("music")) return {
    title: "Sound Architect", emoji: "🎵",
    color: "#9B59B6", glow: "#d7bde2",
    powers: [
      "Move people without saying a word",
      "Find patterns in rhythm and melody",
      "Create something felt before it's understood",
    ],
    desc: "Music is your language — and it's one the whole world speaks.",
  };

  return {
    title: "Renaissance Explorer", emoji: "🌟",
    color: "#FF6B6B", glow: "#ffb3b3",
    powers: [
      "Connect ideas across different worlds",
      "Bring a fresh perspective to everything",
      "Surprise people with unexpected creativity",
    ],
    desc: "You don't fit in one box — and that's exactly your superpower.",
  };
}

// ============================================================
// EXTRACT TIME FROM ANSWERS
// ============================================================

export function getTimeFromAnswers(answers: string[]): number {
  const timeAnswer = answers.find((a) => a.startsWith("time:"));
  const map: Record<string, number> = {
    "time:1": 1, "time:3": 3, "time:5": 5, "time:10": 10,
  };
  return timeAnswer ? (map[timeAnswer] ?? 3) : 3;
}