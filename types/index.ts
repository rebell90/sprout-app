// ============================================================
// INTEREST QUIZ TYPES
// ============================================================

export interface InterestProfile {
  [key: string]: number; // e.g. { coding: 0.8, art: 0.4 }
}

export interface Archetype {
  title: string;
  emoji: string;
  color: string;
  glow: string;
  powers: string[];
  desc: string;
}

export interface QuizResult {
  archetype: Archetype;
  profile: InterestProfile;
  answers: string[];
}

export interface InterestQuizProps {
  onComplete?: (result: QuizResult) => void | Promise<void>;
}

// ============================================================
// WORLD / QUIZ OPTION TYPES
// ============================================================

export interface World {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  accent: string;
  desc: string;
}

export interface PersonalityOption {
  id: string;
  label: string;
  emoji: string;
  desc: string;
}

export interface DeepDiveOption {
  id: string;
  label: string;
  emoji: string;
}

export interface TimeOption {
  id: string;
  label: string;
  desc: string;
  emoji: string;
}

// ============================================================
// LEARNING PATH TYPES (from Claude API response)
// ============================================================

export interface PathStep {
  resource_id: string;
  order: number;
  why: string;
}

export interface PathMilestone {
  title: string;
  badge: string;
}

export interface PathPhase {
  phase: number;
  title: string;
  steps: PathStep[];
  milestone: PathMilestone;
}

export interface GeneratedPath {
  path_title: string;
  phases: PathPhase[];
  first_project_idea: string;
  adaptive_notes?: string;
}

// ============================================================
// API REQUEST / RESPONSE TYPES
// ============================================================

export interface SaveInterestProfileRequest {
  profile: InterestProfile;
  archetypeTitle: string;
  answers: string[];
  timePerWeekHrs: number;
}

export interface SaveInterestProfileResponse {
  success: boolean;
  pathId?: string;
  error?: string;
}