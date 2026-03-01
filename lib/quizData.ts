import type { World, PersonalityOption, DeepDiveOption, TimeOption } from "@/types";

export const WORLDS: World[] = [
  { id: "tech",    label: "Tech Forest",    emoji: "💻", bg: "#1a1a2e", accent: "#00B4D8", desc: "Code, robots, games" },
  { id: "art",     label: "Art Galaxy",     emoji: "🎨", bg: "#2d1b69", accent: "#FF6B9D", desc: "Draw, design, create" },
  { id: "science", label: "Science Ocean",  emoji: "🔬", bg: "#0d3b66", accent: "#00C896", desc: "Discover how things work" },
  { id: "music",   label: "Music Mountain", emoji: "🎵", bg: "#4a0e2d", accent: "#9B59B6", desc: "Make sounds, feel rhythm" },
  { id: "stories", label: "Story Realm",    emoji: "📖", bg: "#2d1b00", accent: "#FF9500", desc: "Write, imagine, invent" },
  { id: "nature",  label: "Nature Kingdom", emoji: "🌿", bg: "#0d2b00", accent: "#56AB2F", desc: "Animals, plants, outdoors" },
];

export const PERSONALITIES: PersonalityOption[] = [
  { id: "making",     label: "I love making things",       emoji: "🔨", desc: "Building, crafting, creating" },
  { id: "figuring",   label: "I love figuring things out", emoji: "🧩", desc: "Puzzles, logic, mysteries" },
  { id: "expressing", label: "I love expressing myself",   emoji: "💫", desc: "Art, music, performance" },
  { id: "helping",    label: "I love helping others",      emoji: "🤝", desc: "Teaching, leading, community" },
];

export const DEEP_DIVES: Record<string, DeepDiveOption[]> = {
  tech:    [
    { id: "games",     label: "Make games",       emoji: "🎮" },
    { id: "websites",  label: "Build websites",   emoji: "🌐" },
    { id: "robots",    label: "Program robots",   emoji: "🤖" },
    { id: "animation", label: "Animate stuff",    emoji: "🎬" },
  ],
  art:     [
    { id: "painting",  label: "Draw & paint",     emoji: "🖌️" },
    { id: "animation", label: "Animation",        emoji: "🎬" },
    { id: "design",    label: "Design",           emoji: "✏️" },
    { id: "music",     label: "Music",            emoji: "🎵" },
  ],
  science: [
    { id: "space",   label: "Space & stars",      emoji: "🚀" },
    { id: "animals", label: "Animals & biology",  emoji: "🐾" },
    { id: "robots",  label: "Experiments",        emoji: "⚗️" },
    { id: "cooking", label: "Kitchen science",    emoji: "🧪" },
  ],
  music:   [
    { id: "music",      label: "Instruments",        emoji: "🎸" },
    { id: "music",      label: "Songwriting",         emoji: "🎤" },
    { id: "making",     label: "Music production",   emoji: "🎧" },
    { id: "expressing", label: "Dance",              emoji: "💃" },
  ],
  stories: [
    { id: "writing",    label: "Write stories",  emoji: "✍️" },
    { id: "animation",  label: "Make comics",    emoji: "📚" },
    { id: "games",      label: "Game stories",   emoji: "🎲" },
    { id: "expressing", label: "Perform",        emoji: "🎭" },
  ],
  nature:  [
    { id: "animals", label: "Animals",         emoji: "🦋" },
    { id: "space",   label: "Weather & earth", emoji: "🌍" },
    { id: "cooking", label: "Growing food",    emoji: "🌱" },
    { id: "science", label: "Ecosystems",      emoji: "🔭" },
  ],
};

export const TIME_OPTIONS: TimeOption[] = [
  { id: "1",  label: "About 1 hour",  desc: "A little goes a long way",  emoji: "⏱️" },
  { id: "3",  label: "2-3 hours",     desc: "Enough to really explore",  emoji: "⚡" },
  { id: "5",  label: "4-5 hours",     desc: "You're serious about this", emoji: "🔥" },
  { id: "10", label: "10+ hours",     desc: "All in!",                   emoji: "🚀" },
];