import { useState, useEffect, useRef } from "react";

// ============================================================
// INTEREST SCORING ENGINE
// Maps quiz answers to weighted interest scores (0-1 per category)
// ============================================================
const ANSWER_WEIGHTS = {
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

  // Deep dives (conditional)
  "deep:games":    { coding: 0.8, game_design: 0.9, art: 0.3, math: 0.4 },
  "deep:websites": { coding: 0.9, design: 0.7, creativity: 0.4 },
  "deep:robots":   { coding: 0.6, science: 0.7, making: 0.9, math: 0.5 },
  "deep:animation":{ art: 0.8, coding: 0.5, storytelling: 0.4, creativity: 0.7 },
  "deep:painting": { art: 0.9, creativity: 0.8, design: 0.5 },
  "deep:music":    { music: 0.9, creativity: 0.6, math: 0.3 },
  "deep:writing":  { writing: 0.9, storytelling: 0.8, creativity: 0.6 },
  "deep:animals":  { animals: 0.9, nature: 0.7, science: 0.5 },
  "deep:space":    { science: 0.9, math: 0.6, nature: 0.4 },
  "deep:cooking":  { making: 0.7, science: 0.4, creativity: 0.5 },

  // Time
  "time:1": { consistency: 0.3 },
  "time:3": { consistency: 0.6 },
  "time:5": { consistency: 0.9 },
  "time:10": { consistency: 1.0 },
};

function buildInterestProfile(answers) {
  const totals = {};
  answers.forEach(answer => {
    const weights = ANSWER_WEIGHTS[answer] || {};
    Object.entries(weights).forEach(([key, val]) => {
      totals[key] = (totals[key] || 0) + val;
    });
  });
  const max = Math.max(...Object.values(totals), 1);
  return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, +(v / max).toFixed(2)]));
}

// ============================================================
// ARCHETYPE REVEAL — maps top interests to a kid-friendly identity
// ============================================================
function getArchetype(profile) {
  const sorted = Object.entries(profile).sort(([, a], [, b]) => b - a);
  const top = sorted.slice(0, 3).map(([k]) => k);

  if (top.includes("coding") && top.includes("game_design")) return {
    title: "Game Inventor", emoji: "🎮",
    color: "#6C63FF", glow: "#a29bfe",
    powers: ["Turn ideas into playable worlds", "Speak the language of computers", "Create things millions of people can enjoy"],
    desc: "You love building things that come alive — and games are your superpower."
  };
  if (top.includes("coding") || top.includes("making")) return {
    title: "Digital Builder", emoji: "⚡",
    color: "#00B4D8", glow: "#90e0ef",
    powers: ["Bring ideas to life with code", "Solve problems nobody else can", "Build tools that help real people"],
    desc: "You're the kind of person who sees a problem and immediately starts thinking about how to fix it."
  };
  if (top.includes("art") && top.includes("storytelling")) return {
    title: "Story Weaver", emoji: "✨",
    color: "#FF6B9D", glow: "#ffb3c6",
    powers: ["Paint pictures with words and images", "Make people feel things", "Create worlds that didn't exist before"],
    desc: "You're a creator at heart — you express what others can't even put into words."
  };
  if (top.includes("art") || top.includes("creativity")) return {
    title: "Visual Dreamer", emoji: "🎨",
    color: "#FF9500", glow: "#ffcc80",
    powers: ["See beauty where others see nothing", "Turn blank pages into adventures", "Make people stop and look twice"],
    desc: "You experience the world differently — and you can share that vision with everyone."
  };
  if (top.includes("science") || top.includes("math")) return {
    title: "Discovery Explorer", emoji: "🔭",
    color: "#00C896", glow: "#69f0ae",
    powers: ["Ask the questions nobody else thought of", "Uncover how the universe works", "Turn data into understanding"],
    desc: "You're driven by curiosity — and the world needs more people like you."
  };
  if (top.includes("nature") || top.includes("animals")) return {
    title: "Nature Guardian", emoji: "🌿",
    color: "#56AB2F", glow: "#a8e063",
    powers: ["Understand living things deeply", "Protect what others take for granted", "Connect the dots between ecosystems"],
    desc: "You see the world as something worth protecting — and your passion makes a difference."
  };
  if (top.includes("music")) return {
    title: "Sound Architect", emoji: "🎵",
    color: "#9B59B6", glow: "#d7bde2",
    powers: ["Move people without saying a word", "Find patterns in rhythm and melody", "Create something felt before it's understood"],
    desc: "Music is your language — and it's one the whole world speaks."
  };
  return {
    title: "Renaissance Explorer", emoji: "🌟",
    color: "#FF6B6B", glow: "#ffb3b3",
    powers: ["Connect ideas across different worlds", "Bring a fresh perspective to everything", "Surprise people with unexpected creativity"],
    desc: "You don't fit in one box — and that's exactly your superpower."
  };
}

// ============================================================
// QUIZ STEPS
// ============================================================
const WORLDS = [
  { id: "tech",    label: "Tech Forest",     emoji: "💻", bg: "#1a1a2e", accent: "#00B4D8", desc: "Code, robots, games" },
  { id: "art",     label: "Art Galaxy",      emoji: "🎨", bg: "#2d1b69", accent: "#FF6B9D", desc: "Draw, design, create" },
  { id: "science", label: "Science Ocean",   emoji: "🔬", bg: "#0d3b66", accent: "#00C896", desc: "Discover how things work" },
  { id: "music",   label: "Music Mountain",  emoji: "🎵", bg: "#4a0e2d", accent: "#9B59B6", desc: "Make sounds, feel rhythm" },
  { id: "stories", label: "Story Realm",     emoji: "📖", bg: "#2d1b00", accent: "#FF9500", desc: "Write, imagine, invent" },
  { id: "nature",  label: "Nature Kingdom",  emoji: "🌿", bg: "#0d2b00", accent: "#56AB2F", desc: "Animals, plants, outdoors" },
];

const PERSONALITIES = [
  { id: "making",     label: "I love making things",          emoji: "🔨", desc: "Building, crafting, creating" },
  { id: "figuring",   label: "I love figuring things out",    emoji: "🧩", desc: "Puzzles, logic, mysteries" },
  { id: "expressing", label: "I love expressing myself",      emoji: "💫", desc: "Art, music, performance" },
  { id: "helping",    label: "I love helping others",         emoji: "🤝", desc: "Teaching, leading, community" },
];

const DEEP_DIVES = {
  tech:    [{ id: "games", label: "Make games", emoji: "🎮" }, { id: "websites", label: "Build websites", emoji: "🌐" }, { id: "robots", label: "Program robots", emoji: "🤖" }, { id: "animation", label: "Animate stuff", emoji: "🎬" }],
  art:     [{ id: "painting", label: "Draw & paint", emoji: "🖌️" }, { id: "animation", label: "Animation", emoji: "🎬" }, { id: "design", label: "Design", emoji: "✏️" }, { id: "music", label: "Music", emoji: "🎵" }],
  science: [{ id: "space", label: "Space & stars", emoji: "🚀" }, { id: "animals", label: "Animals & biology", emoji: "🐾" }, { id: "robots", label: "Experiments", emoji: "⚗️" }, { id: "cooking", label: "Kitchen science", emoji: "🧪" }],
  music:   [{ id: "music", label: "Instruments", emoji: "🎸" }, { id: "music", label: "Songwriting", emoji: "🎤" }, { id: "making", label: "Music production", emoji: "🎧" }, { id: "expressing", label: "Dance", emoji: "💃" }],
  stories: [{ id: "writing", label: "Write stories", emoji: "✍️" }, { id: "animation", label: "Make comics", emoji: "📚" }, { id: "games", label: "Game stories", emoji: "🎲" }, { id: "expressing", label: "Perform", emoji: "🎭" }],
  nature:  [{ id: "animals", label: "Animals", emoji: "🦋" }, { id: "space", label: "Weather & earth", emoji: "🌍" }, { id: "cooking", label: "Growing food", emoji: "🌱" }, { id: "science", label: "Ecosystems", emoji: "🔭" }],
};

const TIME_OPTIONS = [
  { id: "1",  label: "About 1 hour",   desc: "A little goes a long way",   emoji: "⏱️" },
  { id: "3",  label: "2-3 hours",      desc: "Enough to really explore",   emoji: "⚡" },
  { id: "5",  label: "4-5 hours",      desc: "You're serious about this",  emoji: "🔥" },
  { id: "10", label: "10+ hours",      desc: "All in!",                    emoji: "🚀" },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function InterestQuiz({ onComplete }) {
  const [step, setStep] = useState(0); // 0=intro, 1=world, 2=personality, 3=deepdive, 4=time, 5=reveal
  const [answers, setAnswers] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [archetype, setArchetype] = useState(null);
  const [showPowers, setShowPowers] = useState([]);
  const timerRef = useRef(null);

  const totalSteps = 4;
  const progress = step === 0 ? 0 : step >= 5 ? 100 : ((step - 1) / totalSteps) * 100;

  function choose(key) {
    setSelected(key);
    timerRef.current = setTimeout(() => advance(key), 420);
  }

  function advance(key) {
    const newAnswers = [...answers, key];
    setAnswers(newAnswers);
    setSelected(null);

    if (step === 1) {
      const worldId = key.replace("world:", "");
      setSelectedWorld(worldId);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      // Build profile and reveal
      const profile = buildInterestProfile(newAnswers);
      const arch = getArchetype(profile);
      setArchetype(arch);
      setRevealing(true);
      setStep(5);
      // Stagger power reveals
      [0, 1, 2].forEach(i => {
        setTimeout(() => setShowPowers(p => [...p, i]), 1400 + i * 600);
      });
    }
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const deepOptions = selectedWorld ? DEEP_DIVES[selectedWorld] || [] : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
      fontFamily: "'Nunito', 'Quicksand', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px 40px",
      overflowX: "hidden",
    }}>

      {/* Stars background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {[...Array(40)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: Math.random() * 3 + 1 + "px",
            height: Math.random() * 3 + 1 + "px",
            borderRadius: "50%",
            background: "white",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            opacity: Math.random() * 0.7 + 0.1,
            animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: Math.random() * 3 + "s",
          }} />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50% { box-shadow: 0 0 40px currentColor; }
        }
        @keyframes revealText {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .world-card:hover {
          transform: translateY(-6px) scale(1.03);
          filter: brightness(1.15);
        }
        .choice-card:hover {
          transform: translateY(-4px);
          filter: brightness(1.1);
        }
        .selected-card {
          transform: scale(0.96) !important;
          filter: brightness(0.9) !important;
        }
      `}</style>

      {/* Header / progress */}
      {step > 0 && step < 5 && (
        <div style={{ width: "100%", maxWidth: 620, zIndex: 10, paddingTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
              YOUR QUEST
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700 }}>
              {step} of {totalSteps}
            </span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, #00B4D8, #9B59B6)",
              width: progress + "%",
              transition: "width 0.5s cubic-bezier(.4,2,.6,1)",
            }} />
          </div>
        </div>
      )}

      {/* ── STEP 0: INTRO ── */}
      {step === 0 && (
        <div style={{ textAlign: "center", animation: "slideUp .6s ease both", maxWidth: 500, zIndex: 10, paddingTop: 60 }}>
          <div style={{ fontSize: 72, animation: "float 3s ease-in-out infinite", marginBottom: 24 }}>🌟</div>
          <h1 style={{ color: "white", fontSize: 36, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>
            Find Your Quest
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.6, margin: "0 0 36px" }}>
            Answer a few quick questions and we'll build a personalized learning adventure just for you. Takes about 2 minutes!
          </p>
          <button
            onClick={() => setStep(1)}
            style={{
              background: "linear-gradient(135deg, #00B4D8, #9B59B6)",
              border: "none", borderRadius: 99, color: "white",
              fontSize: 18, fontWeight: 800, padding: "16px 48px",
              cursor: "pointer", letterSpacing: 0.5,
              boxShadow: "0 8px 32px rgba(0,180,216,0.4)",
              transition: "transform .15s, box-shadow .15s",
            }}
            onMouseOver={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 12px 40px rgba(0,180,216,0.5)"; }}
            onMouseOut={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 8px 32px rgba(0,180,216,0.4)"; }}
          >
            Start My Quest ✨
          </button>
        </div>
      )}

      {/* ── STEP 1: WORLD SELECTION ── */}
      {step === 1 && (
        <div style={{ width: "100%", maxWidth: 660, zIndex: 10, paddingTop: 32, animation: "slideUp .5s ease both" }}>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 8px" }}>
            What world do you want to explore?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Pick the one that excites you most
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14,
          }}>
            {WORLDS.map((w, i) => (
              <div
                key={w.id}
                className={`world-card ${selected === `world:${w.id}` ? "selected-card" : ""}`}
                onClick={() => choose(`world:${w.id}`)}
                style={{
                  background: `linear-gradient(135deg, ${w.bg} 0%, ${w.accent}22 100%)`,
                  border: `2px solid ${selected === `world:${w.id}` ? w.accent : w.accent + "44"}`,
                  borderRadius: 20, padding: "20px 16px", cursor: "pointer",
                  transition: "all .2s cubic-bezier(.4,2,.6,1)",
                  animation: `pop .4s ease both`, animationDelay: i * 0.07 + "s",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{w.emoji}</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{w.label}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: PERSONALITY ── */}
      {step === 2 && (
        <div style={{ width: "100%", maxWidth: 560, zIndex: 10, paddingTop: 32, animation: "slideUp .5s ease both" }}>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 8px" }}>
            What sounds most like you?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Pick the one that feels most true
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PERSONALITIES.map((p, i) => (
              <div
                key={p.id}
                className={`choice-card ${selected === `style:${p.id}` ? "selected-card" : ""}`}
                onClick={() => choose(`style:${p.id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${selected === `style:${p.id}` ? "#00B4D8" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16, padding: "16px 20px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                  transition: "all .2s ease",
                  animation: `pop .4s ease both`, animationDelay: i * 0.08 + "s",
                }}
              >
                <span style={{ fontSize: 32 }}>{p.emoji}</span>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{p.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: DEEP DIVE ── */}
      {step === 3 && selectedWorld && (
        <div style={{ width: "100%", maxWidth: 560, zIndex: 10, paddingTop: 32, animation: "slideUp .5s ease both" }}>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 8px" }}>
            In your world, what would you do?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Pick what sounds most interesting
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {deepOptions.map((opt, i) => (
              <div
                key={opt.id + i}
                className={`world-card ${selected === `deep:${opt.id}` ? "selected-card" : ""}`}
                onClick={() => choose(`deep:${opt.id}`)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `2px solid ${selected === `deep:${opt.id}` ? "#9B59B6" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16, padding: "20px 16px", textAlign: "center",
                  cursor: "pointer", transition: "all .2s cubic-bezier(.4,2,.6,1)",
                  animation: `pop .4s ease both`, animationDelay: i * 0.08 + "s",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>{opt.emoji}</div>
                <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{opt.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 4: TIME ── */}
      {step === 4 && (
        <div style={{ width: "100%", maxWidth: 560, zIndex: 10, paddingTop: 32, animation: "slideUp .5s ease both" }}>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 8px" }}>
            How much time do you have each week?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Be honest — we'll build around your schedule
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TIME_OPTIONS.map((t, i) => (
              <div
                key={t.id}
                className={`choice-card ${selected === `time:${t.id}` ? "selected-card" : ""}`}
                onClick={() => choose(`time:${t.id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${selected === `time:${t.id}` ? "#00C896" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16, padding: "14px 20px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                  transition: "all .2s ease",
                  animation: `pop .4s ease both`, animationDelay: i * 0.07 + "s",
                }}
              >
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{t.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 5: REVEAL ── */}
      {step === 5 && archetype && (
        <div style={{ width: "100%", maxWidth: 540, zIndex: 10, paddingTop: 40, textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 700, letterSpacing: 3, margin: "0 0 20px", animation: "slideUp .6s ease both" }}>
            BASED ON YOUR ANSWERS...
          </p>

          {/* Big emoji reveal */}
          <div style={{
            fontSize: 96, marginBottom: 0,
            animation: "pop .8s cubic-bezier(.4,2,.6,1) .3s both, float 3s ease-in-out 1.5s infinite",
            filter: `drop-shadow(0 0 24px ${archetype.glow})`,
          }}>
            {archetype.emoji}
          </div>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: "0 0 4px", animation: "slideUp .6s .5s both" }}>
            You are a...
          </p>

          <h1 style={{
            color: archetype.color, fontSize: 44, fontWeight: 900, margin: "0 0 16px",
            animation: "pop .7s cubic-bezier(.4,2,.6,1) .7s both",
            textShadow: `0 0 30px ${archetype.glow}`,
            lineHeight: 1.1,
          }}>
            {archetype.title}
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.6,
            margin: "0 0 32px", animation: "slideUp .6s .9s both",
          }}>
            {archetype.desc}
          </p>

          {/* Superpowers */}
          <div style={{ margin: "0 0 36px", textAlign: "left" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "0 0 12px" }}>
              YOUR SUPERPOWERS
            </p>
            {archetype.powers.map((power, i) => (
              showPowers.includes(i) && (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 12, marginBottom: 8,
                  background: `${archetype.color}18`,
                  border: `1px solid ${archetype.color}33`,
                  animation: "revealText .5s ease both",
                }}>
                  <span style={{ fontSize: 16, color: archetype.color }}>⚡</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600 }}>{power}</span>
                </div>
              )
            ))}
          </div>

          {/* CTA */}
          {showPowers.length === 3 && (
            <div style={{ animation: "pop .5s ease both" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 16 }}>
                Your personalized adventure is ready 🗺️
              </p>
              <button
                onClick={() => {
                  const profile = buildInterestProfile(answers);
                  onComplete?.({ archetype, profile, answers });
                  alert(`Profile built!\n\nArchetype: ${archetype.title}\n\nTop interests:\n${
                    Object.entries(profile).sort(([,a],[,b])=>b-a).slice(0,5).map(([k,v])=>`  ${k}: ${v}`).join('\n')
                  }\n\nNext step: Send this to Claude API to generate a learning path!`);
                }}
                style={{
                  background: `linear-gradient(135deg, ${archetype.color}, ${archetype.glow})`,
                  border: "none", borderRadius: 99, color: "white",
                  fontSize: 17, fontWeight: 800, padding: "16px 44px",
                  cursor: "pointer", boxShadow: `0 8px 32px ${archetype.color}55`,
                  transition: "transform .15s",
                }}
                onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                onMouseOut={e => e.target.style.transform = "scale(1)"}
              >
                See My Learning Path →
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/*
USAGE IN YOUR NEXT.JS APP:
--------------------------
// pages/quiz.jsx  (or app/quiz/page.jsx)
import InterestQuiz from "@/components/InterestQuiz";
import { useRouter } from "next/router";

export default function QuizPage() {
  const router = useRouter();

  async function handleComplete({ archetype, profile, answers }) {
    // 1. Save to DB
    await fetch("/api/interest-profile", {
      method: "POST",
      body: JSON.stringify({ profile, archetypeTitle: archetype.title }),
    });
    // 2. Trigger Claude API path generation
    router.push("/dashboard");
  }

  return <InterestQuiz onComplete={handleComplete} />;
}

API ROUTE — /api/interest-profile.js:
--------------------------------------
export default async function handler(req, res) {
  const { profile, archetypeTitle } = req.body;
  // 1. Save interest profile to Prisma/Postgres
  // 2. Filter resources from DB by top interest tags
  // 3. Call Claude API with profile + resources
  // 4. Save generated path to learning_paths table
  // 5. Return path ID
}
*/