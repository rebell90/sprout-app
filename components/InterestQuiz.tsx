"use client";

import { useState, useEffect, useRef } from "react";
import type { InterestQuizProps } from "@/types";
import { buildInterestProfile, getArchetype } from "@/lib/quiz";
import { WORLDS, PERSONALITIES, DEEP_DIVES, TIME_OPTIONS } from "@/lib/quizData";

interface Star {
  id: number;
  width: number;
  top: number;
  left: number;
  opacity: number;
  duration: number;
  delay: number;
}

export default function InterestQuiz({ onComplete }: InterestQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<ReturnType<typeof getArchetype> | null>(null);
  const [showPowers, setShowPowers] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-generate star data once so server and client values match (fixes hydration warning)
  const [stars] = useState<Star[]>(() =>
    [...Array(40)].map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    }))
  );

  const totalSteps = 4;
  const progress = step === 0 ? 0 : step >= 5 ? 100 : ((step - 1) / totalSteps) * 100;

  function choose(key: string) {
    setSelected(key);
    timerRef.current = setTimeout(() => advance(key), 420);
  }

  function advance(key: string) {
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
      const profile = buildInterestProfile(newAnswers);
      const arch = getArchetype(profile);
      setArchetype(arch);
      setStep(5);
      [0, 1, 2].forEach((i) => {
        setTimeout(() => setShowPowers((p) => [...p, i]), 1400 + i * 600);
      });
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const deepOptions = selectedWorld ? (DEEP_DIVES[selectedWorld] ?? []) : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
      fontFamily: "'Nunito', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px 40px",
    }}>

      {/* Stars — stable values prevent hydration mismatch */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {stars.map((s) => (
          <div key={s.id} style={{
            position: "absolute",
            width: s.width + "px",
            height: s.width + "px",
            borderRadius: "50%",
            background: "white",
            top: s.top + "%",
            left: s.left + "%",
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: s.delay + "s",
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
        @keyframes revealText {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .card-hover { transition: all .2s cubic-bezier(.4,2,.6,1); cursor: pointer; }
        .card-hover:hover { transform: translateY(-6px) scale(1.03); filter: brightness(1.12); }
        .choice-hover { transition: all .2s ease; cursor: pointer; }
        .choice-hover:hover { transform: translateY(-4px); filter: brightness(1.1); }
      `}</style>

      {/* Progress bar */}
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
              height: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg, #00B4D8, #9B59B6)",
              width: progress + "%",
              transition: "width 0.5s cubic-bezier(.4,2,.6,1)",
            }} />
          </div>
        </div>
      )}

      {/* ── STEP 0: INTRO ── */}
      {step === 0 && (
        <div style={{
          textAlign: "center",
          animation: "slideUp .6s ease both",
          maxWidth: 500,
          zIndex: 10,
          paddingTop: 60,
        }}>
          <div style={{ fontSize: 80, animation: "float 3s ease-in-out infinite", marginBottom: 24 }}>
            🌟
          </div>
          <h1 style={{ color: "white", fontSize: 38, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>
            Find Your Quest
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.6, margin: "0 0 36px" }}>
            Answer a few quick questions and we&apos;ll build a personalized learning adventure just for you. Takes about 2 minutes!
          </p>
          <button
            onClick={() => setStep(1)}
            style={{
              background: "linear-gradient(135deg, #00B4D8, #9B59B6)",
              border: "none",
              borderRadius: 99,
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              padding: "16px 48px",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,180,216,0.4)",
              transition: "transform .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Start My Quest ✨
          </button>
        </div>
      )}

      {/* ── STEP 1: WORLD ── */}
      {step === 1 && (
        <div style={{ width: "100%", maxWidth: 660, zIndex: 10, paddingTop: 32, animation: "slideUp .5s ease both" }}>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 6px" }}>
            What world do you want to explore?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Pick the one that excites you most
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {WORLDS.map((w, i) => (
              <div
                key={w.id}
                className="card-hover"
                onClick={() => choose(`world:${w.id}`)}
                style={{
                  background: `linear-gradient(135deg, ${w.bg} 0%, ${w.accent}22 100%)`,
                  border: `2px solid ${selected === `world:${w.id}` ? w.accent : w.accent + "44"}`,
                  borderRadius: 20,
                  padding: "20px 16px",
                  animation: `pop .4s ease both`,
                  animationDelay: i * 0.07 + "s",
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
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 6px" }}>
            What sounds most like you?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Pick the one that feels most true
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PERSONALITIES.map((p, i) => (
              <div
                key={p.id}
                className="choice-hover"
                onClick={() => choose(`style:${p.id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${selected === `style:${p.id}` ? "#00B4D8" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  animation: `pop .4s ease both`,
                  animationDelay: i * 0.08 + "s",
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
      {step === 3 && (
        <div style={{ width: "100%", maxWidth: 560, zIndex: 10, paddingTop: 32, animation: "slideUp .5s ease both" }}>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 6px" }}>
            In your world, what would you do?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Pick what sounds most interesting
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {deepOptions.map((opt, i) => (
              <div
                key={`${opt.id}-${i}`}
                className="card-hover"
                onClick={() => choose(`deep:${opt.id}`)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `2px solid ${selected === `deep:${opt.id}` ? "#9B59B6" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16,
                  padding: "20px 16px",
                  textAlign: "center",
                  animation: `pop .4s ease both`,
                  animationDelay: i * 0.08 + "s",
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
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 900, textAlign: "center", margin: "0 0 6px" }}>
            How much time do you have each week?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14, margin: "0 0 28px" }}>
            Be honest — we&apos;ll build around your schedule
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TIME_OPTIONS.map((t, i) => (
              <div
                key={t.id}
                className="choice-hover"
                onClick={() => choose(`time:${t.id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${selected === `time:${t.id}` ? "#00C896" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 16,
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  animation: `pop .4s ease both`,
                  animationDelay: i * 0.07 + "s",
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
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 3,
            margin: "0 0 20px",
            animation: "slideUp .6s ease both",
          }}>
            BASED ON YOUR ANSWERS...
          </p>

          <div style={{
            fontSize: 96,
            animation: "pop .8s cubic-bezier(.4,2,.6,1) .3s both, float 3s ease-in-out 1.5s infinite",
            filter: `drop-shadow(0 0 24px ${archetype.glow})`,
          }}>
            {archetype.emoji}
          </div>

          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 15,
            margin: "0 0 4px",
            animation: "slideUp .6s .5s both",
          }}>
            You are a...
          </p>

          <h1 style={{
            color: archetype.color,
            fontSize: 44,
            fontWeight: 900,
            margin: "0 0 16px",
            animation: "pop .7s cubic-bezier(.4,2,.6,1) .7s both",
            textShadow: `0 0 30px ${archetype.glow}`,
            lineHeight: 1.1,
          }}>
            {archetype.title}
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: "0 0 32px",
            animation: "slideUp .6s .9s both",
          }}>
            {archetype.desc}
          </p>

          <div style={{ margin: "0 0 36px", textAlign: "left" }}>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              margin: "0 0 12px",
            }}>
              YOUR SUPERPOWERS
            </p>
            {archetype.powers.map((power, i) =>
              showPowers.includes(i) && (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  marginBottom: 8,
                  background: `${archetype.color}18`,
                  border: `1px solid ${archetype.color}33`,
                  animation: "revealText .5s ease both",
                }}>
                  <span style={{ fontSize: 16, color: archetype.color }}>⚡</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600 }}>
                    {power}
                  </span>
                </div>
              )
            )}
          </div>

          {showPowers.length === 3 && (
            <div style={{ animation: "pop .5s ease both" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 16 }}>
                Your personalized adventure is ready 🗺️
              </p>
              <button
                onClick={() => {
                  const profile = buildInterestProfile(answers);
                  onComplete?.({ archetype, profile, answers });
                }}
                style={{
                  background: `linear-gradient(135deg, ${archetype.color}, ${archetype.glow})`,
                  border: "none",
                  borderRadius: 99,
                  color: "white",
                  fontSize: 17,
                  fontWeight: 800,
                  padding: "16px 44px",
                  cursor: "pointer",
                  boxShadow: `0 8px 32px ${archetype.color}55`,
                  transition: "transform .15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
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