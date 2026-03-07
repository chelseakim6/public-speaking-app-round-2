"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = "home" | "scenarios" | "practice" | "teleprompter";

interface Scenario {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Variable";
  difficultyColor: string;
  trains: string;
  duration: string;
  accent: string;
  tips: {
    focus: string[];
    mistakes: string[];
    body: string[];
    improv?: string;
  };
}

interface CoachingReport {
  overallScore: number;
  summary: string;
  scores: { clarity: number; confidence: number; structure: number; delivery: number };
  fillerWords: { count: number; words: Array<{ word: string; count: number }>; impact: string };
  pacing: { assessment: string; wordsPerMinute: number; suggestion: string };
  strengths: string[];
  improvements: string[];
  oneThingToFocus: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: "interview",
    icon: "💼",
    title: "Job Interview",
    subtitle: "Land the role with clarity and confidence",
    difficulty: "Intermediate",
    difficultyColor: "text-blue-400 bg-blue-400/10",
    trains: "Concise storytelling · STAR method · Composure",
    duration: "2–5 min",
    accent: "#3b82f6",
    tips: {
      focus: [
        "Use the STAR method: Situation, Task, Action, Result",
        "Quantify your achievements wherever possible",
        "Pause before answering — it signals thoughtfulness, not uncertainty",
        "Mirror the interviewer's energy and vocabulary subtly",
      ],
      mistakes: [
        "Rambling without a clear point — practice a 90-second cap per answer",
        "Saying 'um' or 'like' as filler — replace with silence",
        "Badmouthing previous employers",
        "Forgetting to ask questions at the end",
      ],
      body: [
        "Sit forward slightly — it signals engagement",
        "Maintain soft eye contact, not a stare",
        "Keep hands visible and still on the table",
        "Smile naturally when appropriate — warmth builds rapport",
      ],
    },
  },
  {
    id: "wedding",
    icon: "🥂",
    title: "Wedding Toast",
    subtitle: "A speech they'll remember for decades",
    difficulty: "Beginner",
    difficultyColor: "text-pink-400 bg-pink-400/10",
    trains: "Warmth · Storytelling · Emotional delivery",
    duration: "2–4 min",
    accent: "#ec4899",
    tips: {
      focus: [
        "Open with a specific, vivid memory — not 'When I first met...'",
        "Balance humor with genuine emotion",
        "Address the couple, not just the room",
        "End with a clear, sincere toast that everyone can raise a glass to",
      ],
      mistakes: [
        "Reading word-for-word from your phone — memorize the arc, not the script",
        "Inside jokes only 2 people understand",
        "Going over 4 minutes — audiences lose attention",
        "Making it about yourself",
      ],
      body: [
        "Hold your glass at chest height when toasting",
        "Make eye contact with the couple throughout",
        "Speak slowly — emotions make us rush",
        "Let yourself feel it — authentic emotion is contagious",
      ],
    },
  },
  {
    id: "pitch",
    icon: "📈",
    title: "Investor Pitch",
    subtitle: "Convince the room your vision is fundable",
    difficulty: "Advanced",
    difficultyColor: "text-amber-400 bg-amber-400/10",
    trains: "Persuasion · Data storytelling · Handling objections",
    duration: "5–10 min",
    accent: "#f59e0b",
    tips: {
      focus: [
        "Lead with the problem, not the solution",
        "Know your numbers cold — TAM, MRR, burn rate, runway",
        "Tell a customer story that makes the pain visceral",
        "Anticipate the top 5 objections and have crisp answers ready",
      ],
      mistakes: [
        "Too many slides, too little story",
        "Vague market sizing — 'the market is $100B' without logic",
        "Underselling your team's credibility",
        "Defensiveness when challenged — welcome pushback",
      ],
      body: [
        "Command the room by owning your space — don't hide behind the podium",
        "Vary your pace: slow down on key numbers",
        "Use deliberate hand gestures to emphasize points",
        "Dress one level above your audience",
      ],
    },
  },
  {
    id: "ted",
    icon: "🎤",
    title: "TED-Style Talk",
    subtitle: "One idea worth spreading, delivered perfectly",
    difficulty: "Advanced",
    difficultyColor: "text-amber-400 bg-amber-400/10",
    trains: "Big ideas · Narrative arc · Stage presence",
    duration: "10–18 min",
    accent: "#ef4444",
    tips: {
      focus: [
        "Start with a counterintuitive statement or bold claim",
        "Build to one central idea — resist adding more",
        "Use the 'Rule of Three' for structure",
        "End with a call to action or a memorable line that echoes your opening",
      ],
      mistakes: [
        "Starting with 'I'm so honored to be here today'",
        "Reading slides instead of speaking to the audience",
        "Covering too many ideas — less is always more",
        "No emotional hook — facts without feeling don't stick",
      ],
      body: [
        "Walk the stage with intention — every move should mean something",
        "Use the 'pregnant pause' before your key line",
        "Let silence be your punctuation",
        "Facial expressions should match your content",
      ],
    },
  },
  {
    id: "difficult",
    icon: "🔥",
    title: "Difficult Conversation",
    subtitle: "Navigate high-stakes talks with grace",
    difficulty: "Advanced",
    difficultyColor: "text-amber-400 bg-amber-400/10",
    trains: "Empathy · Directness · Emotional regulation",
    duration: "Variable",
    accent: "#f97316",
    tips: {
      focus: [
        "Lead with care, not the issue — 'I want to talk because I respect you'",
        "Use 'I' statements, not 'you always/never' accusations",
        "State the impact clearly, not just the behavior",
        "Give the other person space to respond — don't fill every silence",
      ],
      mistakes: [
        "Burying the lead — don't spend 10 minutes building to it",
        "Over-apologizing before you've even said anything",
        "Having the conversation over text or email",
        "Getting defensive if they react emotionally",
      ],
      body: [
        "Sit at the same level, never stand over someone",
        "Maintain open body language — no crossed arms",
        "Breathe deeply before responding to strong reactions",
        "Keep your voice calm and even — lower register signals authority",
      ],
    },
  },
  {
    id: "debate",
    icon: "⚡",
    title: "Debate & Argument",
    subtitle: "Win with logic, evidence, and composure",
    difficulty: "Intermediate",
    difficultyColor: "text-blue-400 bg-blue-400/10",
    trains: "Logical reasoning · Rebuttals · Composure under fire",
    duration: "2–5 min",
    accent: "#8b5cf6",
    tips: {
      focus: [
        "Steelman the opposing argument before dismantling it",
        "Lead with your strongest point, not your weakest",
        "Use concrete examples and analogies to make abstract points land",
        "Name the rhetorical technique when you see it — it disarms it",
      ],
      mistakes: [
        "Attacking the person instead of the argument (ad hominem)",
        "Getting visibly emotional — it undermines your credibility",
        "Overloading with too many points — three strong beats ten weak",
        "Not listening to what they actually said — rebutting a strawman",
      ],
      body: [
        "Stay physically still when challenged — movement signals anxiety",
        "A slight smile while listening shows confidence",
        "Take a beat before responding — it looks like you're thinking, not reacting",
        "Maintain eye contact during your strongest points",
      ],
    },
  },
  {
    id: "improv",
    icon: "🎲",
    title: "Improv Challenge",
    subtitle: "Speak on any topic, instantly, brilliantly",
    difficulty: "Variable",
    difficultyColor: "text-green-400 bg-green-400/10",
    trains: "Quick thinking · Confidence · Adaptability",
    duration: "1–3 min",
    accent: "#10b981",
    tips: {
      focus: [
        "The first thing that comes to mind is usually your best bet — commit to it",
        "Use the PREP structure: Point, Reason, Example, Point",
        "Buy yourself 3 seconds by repeating the topic as a question",
        "Every improv talk needs a beginning, middle, and end — even 60-second ones",
      ],
      mistakes: [
        "Apologizing or laughing nervously before you start",
        "Stopping to think out loud — keep moving, edit mentally",
        "Trying to be impressive instead of being clear",
        "Ending weakly — always close with a strong final sentence",
      ],
      body: [
        "Plant your feet — movement signals nervousness",
        "Take one deep breath before you start",
        "Speak to the back of the room — project",
        "Smile when you finish — sell your confidence even if unsure",
      ],
      improv: "Click 'New Topic' to get a random speaking prompt. You have 30 seconds to prepare, then speak for the full timer duration.",
    },
  },
];

const IMPROV_TOPICS = [
  "Why mornings are the most underrated part of the day",
  "The one skill every person should learn before turning 30",
  "What social media has taken from us that we don't talk about",
  "The most important lesson a failure taught you",
  "Why being boring is actually a superpower",
  "The case for slowing down in a world obsessed with speed",
  "What your commute secretly tells you about your priorities",
  "The surprising way children are smarter than adults",
  "Why the best leaders are also the best listeners",
  "The hidden cost of always being available",
  "What a perfect day actually looks like — and why you avoid it",
  "The one thing you wish you'd known at 18",
  "Why small talk is more important than we think",
  "The problem with always optimizing for efficiency",
  "What we lose when we stop being beginners",
  "The most underrated form of courage",
  "Why your assumptions about other people are usually wrong",
  "What makes a city feel alive",
  "The thing you do every day that you've never questioned",
  "Why constraints make us more creative, not less",
];

const TIMER_OPTIONS = [
  { label: "30s", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `0:${s.toString().padStart(2, "0")}`;
}

function getStreakData(): { count: number; lastDate: string } {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try {
    const raw = localStorage.getItem("speakup_streak");
    if (!raw) return { count: 0, lastDate: "" };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const data = getStreakData();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let newCount = data.count;
  if (data.lastDate === today) {
    return newCount;
  } else if (data.lastDate === yesterday) {
    newCount = data.count + 1;
  } else {
    newCount = 1;
  }

  localStorage.setItem("speakup_streak", JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StreakBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
      <span>{count >= 7 ? "🔥" : count >= 3 ? "🔥" : "✨"}</span>
      <span>Day {count} streak</span>
    </div>
  );
}

function DifficultyBadge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}

function CircularTimer({
  seconds,
  total,
  active,
}: {
  seconds: number;
  total: number;
  active: boolean;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (seconds / total) : 1;
  const offset = circumference * (1 - progress);
  const isLow = seconds <= 10 && seconds > 0 && active;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Glow ring */}
      {active && (
        <div className="absolute inset-0 rounded-full animate-glow" style={{
          boxShadow: isLow
            ? "0 0 40px rgba(239,68,68,0.4)"
            : "0 0 30px rgba(251,191,36,0.25)"
        }} />
      )}
      <svg width={160} height={160} className="absolute">
        {/* Background ring */}
        <circle
          cx={80} cy={80} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={8}
        />
        {/* Progress ring */}
        <circle
          cx={80} cy={80} r={radius}
          fill="none"
          stroke={isLow ? "#ef4444" : "#f59e0b"}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div
          className={`text-4xl font-bold tabular-nums ${isLow ? "text-red-400 animate-timer-pulse" : "text-white"}`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatTime(seconds)}
        </div>
        {active && (
          <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">
            {seconds === 0 ? "Done" : "Speaking"}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachingPanel({ scenario }: { scenario: Scenario }) {
  const [tab, setTab] = useState<"focus" | "mistakes" | "body">("focus");

  const tabs = [
    { key: "focus" as const, label: "Focus On", icon: "🎯" },
    { key: "mistakes" as const, label: "Common Mistakes", icon: "⚠️" },
    { key: "body" as const, label: "Body Language", icon: "🧍" },
  ];

  const content = {
    focus: scenario.tips.focus,
    mistakes: scenario.tips.mistakes,
    body: scenario.tips.body,
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex border-b border-white/[0.06]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
              tab === t.key
                ? "text-amber-400 border-b-2 border-amber-400 -mb-px"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="p-5 space-y-3">
        {content[tab].map((tip, i) => (
          <div
            key={i}
            className="flex gap-3 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both", opacity: 0 }}
          >
            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
              style={{ background: "rgba(251,191,36,0.15)", color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
              {i + 1}
            </div>
            <p className="text-sm text-white/75 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SpeakUp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [streak, setStreak] = useState(0);
  const [improvTopic, setImprovTopic] = useState("");

  // Timer
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerActiveRef = useRef(false);

  // Transcription
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const intentionalStopRef = useRef(false);

  // AI coaching
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachingReport, setCoachingReport] = useState<CoachingReport | null>(null);
  const [coachingError, setCoachingError] = useState<string | null>(null);

  // Teleprompter
  const [promptText, setPromptText] = useState("");
  const [promptSpeed, setPromptSpeed] = useState(50);
  const [promptScrolling, setPromptScrolling] = useState(false);
  const [promptFullscreen, setPromptFullscreen] = useState(false);
  const promptContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);

  // Keep timerActiveRef in sync (needed inside SpeechRecognition closures)
  useEffect(() => { timerActiveRef.current = timerActive; }, [timerActive]);

  // Detect SpeechRecognition support on mount
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    setStreak(getStreakData().count);
  }, []);

  const newImprovTopic = useCallback(() => {
    setImprovTopic(IMPROV_TOPICS[Math.floor(Math.random() * IMPROV_TOPICS.length)]);
  }, []);

  // ── Timer tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          timerActiveRef.current = false;
          setTimerDone(true);
          stopTranscription(false);
          playChime();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]); // eslint-disable-line react-hooks/exhaustive-deps

  function playChime() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine"; osc.frequency.value = freq;
        const s = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, s);
        gain.gain.linearRampToValueAtTime(0.18, s + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, s + 0.8);
        osc.start(s); osc.stop(s + 0.9);
      });
    } catch { /* ignore */ }
  }

  // ── Transcription ───────────────────────────────────────────────────────────
  const startTranscription = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    intentionalStopRef.current = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (ev: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => {
      let fin = ""; let int = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        ev.results[i].isFinal ? (fin += ev.results[i][0].transcript + " ") : (int += ev.results[i][0].transcript);
      }
      if (fin) setTranscript((p) => p + fin);
      setInterimText(int);
    };
    rec.onend = () => {
      setInterimText("");
      if (!intentionalStopRef.current && timerActiveRef.current) { try { rec.start(); } catch { /* ignore */ } }
    };
    rec.onerror = (ev: { error: string }) => {
      if (ev.error !== "no-speech" && ev.error !== "aborted") console.warn("SR:", ev.error);
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* ignore */ }
  }, []);

  const stopTranscription = useCallback((clearText = false) => {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterimText("");
    if (clearText) setTranscript("");
  }, []);

  // ── Timer controls ──────────────────────────────────────────────────────────
  function startTimer() {
    setTimeLeft(timerDuration); setTimerDone(false); setTimerActive(true);
    timerActiveRef.current = true;
    setTranscript(""); setCoachingReport(null); setCoachingError(null);
    startTranscription();
    setStreak(updateStreak());
  }

  function resumeTimer() {
    setTimerActive(true); timerActiveRef.current = true;
    startTranscription();
  }

  function pauseTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false); timerActiveRef.current = false;
    stopTranscription(false);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false); setTimerDone(false); timerActiveRef.current = false;
    setTimeLeft(timerDuration);
    stopTranscription(true);
    setCoachingReport(null); setCoachingError(null);
  }

  function selectTimerDuration(s: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerDuration(s); setTimeLeft(s);
    setTimerActive(false); setTimerDone(false); timerActiveRef.current = false;
    stopTranscription(true);
    setCoachingReport(null); setCoachingError(null);
  }

  // ── AI Analysis ─────────────────────────────────────────────────────────────
  const analyzeWithAI = useCallback(async () => {
    if (!selectedScenario || !transcript.trim()) return;
    setIsAnalyzing(true); setCoachingError(null);
    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim(), scenarioTitle: selectedScenario.title, duration: timerDuration }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Analysis failed"); }
      setCoachingReport(await res.json());
    } catch (e) {
      setCoachingError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally { setIsAnalyzing(false); }
  }, [selectedScenario, transcript, timerDuration]);

  // ── Teleprompter scroll ─────────────────────────────────────────────────────
  const startScroll = useCallback(() => setPromptScrolling(true), []);
  const stopScroll = useCallback(() => {
    setPromptScrolling(false);
    if (scrollAnimRef.current) { cancelAnimationFrame(scrollAnimRef.current); scrollAnimRef.current = null; }
  }, []);

  useEffect(() => {
    if (!promptScrolling || !promptContainerRef.current) return;
    const container = promptContainerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const pxPerMs = (promptSpeed / 50) * 0.06;
    let last = performance.now();
    function tick(now: number) {
      const dt = now - last; last = now;
      scrollPosRef.current = Math.min(scrollPosRef.current + pxPerMs * dt, maxScroll);
      container.scrollTop = scrollPosRef.current;
      scrollPosRef.current < maxScroll
        ? (scrollAnimRef.current = requestAnimationFrame(tick))
        : setPromptScrolling(false);
    }
    scrollAnimRef.current = requestAnimationFrame(tick);
    return () => { if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current); };
  }, [promptScrolling, promptSpeed]);

  function resetScroll() {
    stopScroll(); scrollPosRef.current = 0;
    if (promptContainerRef.current) promptContainerRef.current.scrollTop = 0;
  }

  function openScenario(scenario: Scenario) {
    setSelectedScenario(scenario); resetTimer();
    if (scenario.id === "improv") newImprovTopic();
    setScreen("practice");
  }

  if (screen === "teleprompter") {
    return (
      <TeleprompterScreen
        text={promptText} setText={setPromptText}
        speed={promptSpeed} setSpeed={setPromptSpeed}
        scrolling={promptScrolling} fullscreen={promptFullscreen} setFullscreen={setPromptFullscreen}
        onStart={startScroll} onStop={stopScroll} onReset={resetScroll}
        containerRef={promptContainerRef} onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "practice" && selectedScenario) {
    return (
      <PracticeScreen
        scenario={selectedScenario}
        timerDuration={timerDuration} timeLeft={timeLeft} timerActive={timerActive} timerDone={timerDone}
        improvTopic={improvTopic}
        transcript={transcript} interimText={interimText} speechSupported={speechSupported}
        isAnalyzing={isAnalyzing} coachingReport={coachingReport} coachingError={coachingError}
        onSelectDuration={selectTimerDuration}
        onStart={startTimer} onResume={resumeTimer} onPause={pauseTimer} onReset={resetTimer}
        onNewTopic={newImprovTopic} onAnalyze={analyzeWithAI}
        onTranscriptChange={setTranscript}
        onClearReport={() => { setCoachingReport(null); setCoachingError(null); }}
        onBack={() => { resetTimer(); setScreen("scenarios"); }}
        onTeleprompter={() => setScreen("teleprompter")}
      />
    );
  }

  if (screen === "scenarios") {
    return <ScenariosScreen onSelect={openScenario} onBack={() => setScreen("home")} />;
  }

  return <HomeScreen streak={streak} onStart={() => setScreen("scenarios")} onTeleprompter={() => setScreen("teleprompter")} />;
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

function HomeScreen({
  streak,
  onStart,
  onTeleprompter,
}: {
  streak: number;
  onStart: () => void;
  onTeleprompter: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)" }}>
      {/* Nav */}
      <nav className="nav-blur sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <span className="text-xl font-bold text-white">Speak<span className="shimmer-text">Up</span></span>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge count={streak} />
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold opacity-50 cursor-not-allowed"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}
            disabled
            title="Coming soon"
          >
            <span>✦</span>
            <span>Premium</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)",
          }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          {streak > 0 && (
            <div className="mb-8">
              <StreakBadge count={streak} />
            </div>
          )}

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-none">
            <span className="text-white">Speak with</span>
            <br />
            <span className="shimmer-text">confidence.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto mb-12 leading-relaxed">
            Practice real speaking scenarios with expert coaching, a built-in timer, and a teleprompter — right in your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="btn-primary px-8 py-4 rounded-2xl text-lg font-bold relative overflow-hidden"
            >
              <span className="relative z-10">Start Practicing →</span>
            </button>
            <button
              onClick={onTeleprompter}
              className="px-8 py-4 rounded-2xl text-lg font-semibold glass transition-all hover:border-white/20 hover:bg-white/[0.06]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Teleprompter Mode
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 mt-20 flex flex-wrap justify-center gap-3 animate-fade-in"
          style={{ animationDelay: "0.3s", animationFillMode: "both", opacity: 0 }}>
          {[
            { icon: "🎯", text: "7 Scenarios" },
            { icon: "🤖", text: "AI Coaching" },
            { icon: "⏱️", text: "Practice Timer" },
            { icon: "📋", text: "Teleprompter" },
            { icon: "🔥", text: "Daily Streaks" },
          ].map((f) => (
            <div key={f.text} className="glass flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60">
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </main>

      {/* AI Coaching banner */}
      <div className="mx-6 mb-8 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(16,185,129,0.04) 100%)", border: "1px solid rgba(251,191,36,0.14)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400">✦</span>
              <span className="text-amber-400 font-bold text-sm uppercase tracking-widest">AI Coaching Included</span>
            </div>
            <p className="text-white/50 text-sm">After each session, Claude analyzes your speech for filler words, pacing, structure, and delivery — with a personalized score and action plan.</p>
          </div>
          <button onClick={onStart} className="flex-shrink-0 btn-primary px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap">
            Try it now →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Scenarios Screen ─────────────────────────────────────────────────────────

function ScenariosScreen({
  onSelect,
  onBack,
}: {
  onSelect: (s: Scenario) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <nav className="nav-blur sticky top-0 z-50 flex items-center gap-4 px-6 py-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-white/60 hover:text-white">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎤</span>
          <span className="text-lg font-bold text-white">Speak<span className="shimmer-text">Up</span></span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Choose your scenario</h2>
          <p className="text-white/50">Pick a challenge. Each session makes you better.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SCENARIOS.map((scenario, i) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className="card-hover text-left rounded-2xl p-6 glass"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: "both",
                opacity: 0,
                animation: `fadeIn 0.4s ease-out ${i * 60}ms both`,
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{scenario.icon}</span>
                <DifficultyBadge label={scenario.difficulty} colorClass={scenario.difficultyColor} />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{scenario.title}</h3>
              <p className="text-sm text-white/50 mb-4 leading-relaxed">{scenario.subtitle}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>🎯</span>
                  <span className="leading-relaxed">{scenario.trains}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>⏱</span>
                  <span>{scenario.duration}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#f59e0b" }}>
                <span>Practice this</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Coaching Results ──────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Fair" : "Needs Work";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color }}>{grade}</span>
          <span className="text-xs text-white/30 tabular-nums w-6 text-right">{score}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 0.9s ease" }} />
      </div>
    </div>
  );
}

function CoachingResults({ report, onRedo }: { report: CoachingReport; onRedo: () => void }) {
  const overallColor = report.overallScore >= 80 ? "#10b981" : report.overallScore >= 60 ? "#f59e0b" : "#ef4444";
  const pacingColor = report.pacing.assessment === "good" ? "#10b981" : "#f59e0b";
  const fillerColor = report.fillerWords.count === 0 ? "#10b981" : report.fillerWords.count <= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3" style={{ background: "rgba(251,191,36,0.04)" }}>
        <span className="text-amber-400 text-lg">✦</span>
        <span className="font-bold text-white">AI Coaching Report</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: `${overallColor}18`, color: overallColor, border: `1px solid ${overallColor}35` }}>
            {report.overallScore}/100
          </span>
          <button onClick={onRedo} className="text-xs text-white/35 hover:text-white/65 transition-colors">↺ Retry</button>
        </div>
      </div>
      <div className="px-5 py-5 flex gap-4 items-start border-b border-white/[0.06]">
        <div className="flex-shrink-0 w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center"
          style={{ background: `${overallColor}12`, border: `2px solid ${overallColor}35` }}>
          <span className="text-2xl font-bold leading-none" style={{ color: overallColor }}>{report.overallScore}</span>
          <span className="text-[10px] text-white/40 mt-0.5">score</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed flex-1">{report.summary}</p>
      </div>
      <div className="px-5 py-5 space-y-3 border-b border-white/[0.06]">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Score Breakdown</p>
        <ScoreBar label="Clarity" score={report.scores.clarity} />
        <ScoreBar label="Confidence" score={report.scores.confidence} />
        <ScoreBar label="Structure" score={report.scores.structure} />
        <ScoreBar label="Delivery" score={report.scores.delivery} />
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        <div className="px-5 py-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Filler Words</p>
          <p className="text-3xl font-bold mb-2" style={{ color: fillerColor }}>{report.fillerWords.count}</p>
          {report.fillerWords.words.length > 0 ? (
            <div className="flex flex-wrap gap-1 mb-2">
              {report.fillerWords.words.slice(0, 4).map((w) => (
                <span key={w.word} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>{w.word} ×{w.count}</span>
              ))}
            </div>
          ) : <p className="text-xs text-green-400 mb-2">None detected 🎉</p>}
          <p className="text-[11px] text-white/40 leading-relaxed">{report.fillerWords.impact}</p>
        </div>
        <div className="px-5 py-5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Pacing</p>
          <p className="text-3xl font-bold text-white mb-2">{report.pacing.wordsPerMinute}<span className="text-sm text-white/40 ml-1">WPM</span></p>
          <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full"
            style={{ background: `${pacingColor}15`, color: pacingColor }}>{report.pacing.assessment}</span>
          <p className="text-[11px] text-white/40 leading-relaxed mt-2">{report.pacing.suggestion}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] border-b border-white/[0.06]">
        <div className="px-5 py-5">
          <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3">✅ Strengths</p>
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/65 leading-relaxed">
                <span className="text-green-400 flex-shrink-0 mt-0.5">•</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-5 py-5">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">⚡ Improve</p>
          <ul className="space-y-2">
            {report.improvements.map((imp, i) => (
              <li key={i} className="flex gap-2 text-xs text-white/65 leading-relaxed">
                <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span><span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="px-5 py-5" style={{ background: "rgba(251,191,36,0.03)" }}>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">🎯 Focus Next Session On</p>
        <p className="text-sm font-semibold text-amber-300 leading-relaxed">{report.oneThingToFocus}</p>
      </div>
    </div>
  );
}

// ─── Practice Screen ──────────────────────────────────────────────────────────

function PracticeScreen({
  scenario, timerDuration, timeLeft, timerActive, timerDone, improvTopic,
  transcript, interimText, speechSupported, isAnalyzing, coachingReport, coachingError,
  onSelectDuration, onStart, onResume, onPause, onReset, onNewTopic, onAnalyze,
  onTranscriptChange, onClearReport, onBack, onTeleprompter,
}: {
  scenario: Scenario; timerDuration: number; timeLeft: number; timerActive: boolean; timerDone: boolean;
  improvTopic: string; transcript: string; interimText: string; speechSupported: boolean;
  isAnalyzing: boolean; coachingReport: CoachingReport | null; coachingError: string | null;
  onSelectDuration: (s: number) => void; onStart: () => void; onResume: () => void;
  onPause: () => void; onReset: () => void; onNewTopic: () => void; onAnalyze: () => void;
  onTranscriptChange: (t: string) => void; onClearReport: () => void;
  onBack: () => void; onTeleprompter: () => void;
}) {
  const isPaused = !timerActive && !timerDone && timeLeft < timerDuration && timeLeft > 0;
  const isNeverStarted = !timerActive && !timerDone && timeLeft === timerDuration;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const sessionStopped = !timerActive && (timerDone || timeLeft < timerDuration);
  const canAnalyze = sessionStopped && wordCount >= 5 && !isAnalyzing;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <nav className="nav-blur sticky top-0 z-50 flex items-center gap-4 px-6 py-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-white/60 hover:text-white text-sm">
          ← Scenarios
        </button>
        <span className="text-xl">{scenario.icon}</span>
        <span className="text-base font-bold text-white">{scenario.title}</span>
        <div className="ml-auto"><DifficultyBadge label={scenario.difficulty} colorClass={scenario.difficultyColor} /></div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Timer + transcript ── */}
          <div className="lg:col-span-2 space-y-5">
            {scenario.id === "improv" && (
              <div className="rounded-2xl p-5 animate-fade-in"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Your Topic</span>
                  <button onClick={onNewTopic} className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">🎲 New Topic</button>
                </div>
                <p className="text-white font-semibold leading-relaxed">{improvTopic}</p>
                <p className="text-white/40 text-xs mt-2">{scenario.tips.improv}</p>
              </div>
            )}

            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_OPTIONS.map((opt) => (
                  <button key={opt.seconds} onClick={() => onSelectDuration(opt.seconds)} disabled={timerActive}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${timerDuration === opt.seconds ? "text-black" : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"} ${timerActive ? "opacity-40 cursor-not-allowed" : ""}`}
                    style={timerDuration === opt.seconds ? { background: "linear-gradient(135deg, #f59e0b, #d97706)" } : {}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-8 flex flex-col items-center gap-6">
              <CircularTimer seconds={timeLeft} total={timerDuration} active={timerActive} />
              {timerDone && (
                <div className="text-center animate-fade-in">
                  <p className="text-amber-400 font-bold text-lg">Time&apos;s up! 🎉</p>
                  <p className="text-white/40 text-sm mt-1">{wordCount > 0 ? `${wordCount} words captured` : "Get AI coaching →"}</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                {isNeverStarted && (
                  <button onClick={onStart} className="btn-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2"><span>▶</span> Start</button>
                )}
                {timerActive && (
                  <button onClick={onPause} className="px-8 py-3 rounded-xl font-bold glass hover:bg-white/[0.08] transition-all" style={{ color: "rgba(255,255,255,0.8)" }}>⏸ Pause</button>
                )}
                {isPaused && (
                  <>
                    <button onClick={onResume} className="btn-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2"><span>▶</span> Resume</button>
                    <button onClick={onReset} className="px-5 py-3 rounded-xl text-sm glass text-white/50 hover:text-white transition-all">↺</button>
                  </>
                )}
                {timerDone && (
                  <button onClick={onReset} className="px-5 py-3 rounded-xl text-sm glass text-white/50 hover:text-white transition-all">↺ Reset</button>
                )}
              </div>
            </div>

            {/* Live transcript */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  {timerActive && speechSupported && <div className="w-2 h-2 rounded-full bg-red-500 animate-timer-pulse" />}
                  <span className="text-xs font-semibold text-white/60">{timerActive && speechSupported ? "Recording…" : "Your Speech"}</span>
                </div>
                {wordCount > 0 && <span className="text-xs text-white/30">{wordCount} words</span>}
              </div>
              {speechSupported ? (
                <div className="h-28 overflow-y-auto px-4 py-3 scrollbar-hide">
                  {transcript || interimText ? (
                    <p className="text-sm text-white/70 leading-relaxed">
                      {transcript}
                      {interimText && <span className="text-white/30 italic">{interimText}</span>}
                    </p>
                  ) : (
                    <p className="text-sm text-white/25 italic">
                      {timerActive ? "Start speaking — your words appear here…" : "Start the timer and speak. Your transcript appears here."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-xs text-white/30 mb-2">Auto-transcription requires Chrome. Type your speech to analyze:</p>
                  <textarea value={transcript} onChange={(e) => onTranscriptChange(e.target.value)}
                    placeholder="Paste or type what you said…" rows={4}
                    className="w-full bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none resize-none" />
                </div>
              )}
            </div>

            <button onClick={onTeleprompter}
              className="w-full glass rounded-xl py-3 px-5 text-sm font-semibold text-white/50 hover:text-white/80 transition-all hover:bg-white/[0.06] flex items-center justify-center gap-2">
              <span>📋</span> Open Teleprompter
            </button>
          </div>

          {/* ── Right: AI results / coaching tips ── */}
          <div className="lg:col-span-3 space-y-5">
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-1">{coachingReport ? "AI Coaching Report" : `Coaching for ${scenario.title}`}</h2>
              <p className="text-white/50 text-sm">{scenario.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {scenario.trains.split(" · ").map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>{skill}</span>
              ))}
            </div>

            {coachingReport && <CoachingResults report={coachingReport} onRedo={onClearReport} />}

            {sessionStopped && !coachingReport && !isAnalyzing && (
              <div className="rounded-2xl p-5 animate-fade-in"
                style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.18)" }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.12)" }}>
                    <span className="text-amber-400 text-base">✦</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Get AI Coaching</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {wordCount >= 5
                        ? `Claude will analyze your ${wordCount}-word speech — filler words, pacing, structure, delivery — and give you a personalized score and action plan.`
                        : "Speak for at least a few sentences to get a full analysis."}
                    </p>
                  </div>
                </div>
                {coachingError && (
                  <div className="mb-3 px-4 py-3 rounded-xl text-sm text-red-300"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {coachingError}
                  </div>
                )}
                <button onClick={onAnalyze} disabled={!canAnalyze}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${canAnalyze ? "btn-primary" : "opacity-40 cursor-not-allowed text-white/50 glass"}`}>
                  ✦ Analyze My Speech
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="rounded-2xl p-8 animate-fade-in flex flex-col items-center gap-4"
                style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <div className="w-12 h-12 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(251,191,36,0.2)", borderTopColor: "#f59e0b" }} />
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">Claude is reviewing your speech…</p>
                  <p className="text-white/40 text-sm">Counting filler words, checking pacing, building your report.</p>
                </div>
              </div>
            )}

            {!coachingReport && !isAnalyzing && <CoachingPanel scenario={scenario} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Teleprompter Screen ──────────────────────────────────────────────────────

function TeleprompterScreen({
  text,
  setText,
  speed,
  setSpeed,
  scrolling,
  fullscreen,
  setFullscreen,
  onStart,
  onStop,
  onReset,
  containerRef,
  onBack,
}: {
  text: string;
  setText: (t: string) => void;
  speed: number;
  setSpeed: (s: number) => void;
  scrolling: boolean;
  fullscreen: boolean;
  setFullscreen: (f: boolean) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
}) {
  const PLACEHOLDER = `Paste your speech, presentation notes, or script here.

The teleprompter will scroll at your chosen speed. Use fullscreen mode for a distraction-free experience.

Tip: Write in short sentences — they're easier to read at a glance while you're speaking.`;

  if (fullscreen && text) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "#000" }}>
        {/* Controls bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-8 py-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm font-medium">Speed</span>
            <input
              type="range"
              min={10}
              max={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-28"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onReset}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white/50 hover:text-white transition-colors">
              ↺ Reset
            </button>
            {scrolling ? (
              <button onClick={onStop}
                className="px-5 py-2 rounded-lg text-sm font-bold glass text-white">
                ⏸ Pause
              </button>
            ) : (
              <button onClick={onStart}
                className="btn-primary px-5 py-2 rounded-lg text-sm font-bold">
                ▶ Play
              </button>
            )}
            <button
              onClick={() => { onStop(); setFullscreen(false); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white/50 hover:text-white transition-colors">
              ✕ Exit
            </button>
          </div>
        </div>

        {/* Text area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden px-[10%] py-16"
          style={{ overflowY: "hidden" }}
        >
          {/* Gradient masks */}
          <div className="pointer-events-none fixed top-16 left-0 right-0 h-32 z-10"
            style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-32 z-10"
            style={{ background: "linear-gradient(to top, #000, transparent)" }} />

          <p className="teleprompter-text text-white text-center"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", lineHeight: 1.7, paddingBottom: "80vh" }}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <nav className="nav-blur sticky top-0 z-50 flex items-center gap-4 px-6 py-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-white/60 hover:text-white text-sm">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span>📋</span>
          <span className="font-bold text-white">Teleprompter</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-2">Teleprompter Mode</h2>
          <p className="text-white/50">Paste your script and read it hands-free while you present.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Script input */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold text-white/60">Your Script</span>
                {text && (
                  <button onClick={() => setText("")} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={16}
                className="w-full bg-transparent px-5 py-4 text-white/80 text-sm leading-relaxed placeholder:text-white/20 outline-none"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            {/* Speed */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white/60">Scroll Speed</span>
                <span className="text-sm font-bold text-amber-400">{speed}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/30 mt-2">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Preview / Play */}
            <div className="glass rounded-2xl overflow-hidden">
              <div
                ref={containerRef}
                className="h-40 overflow-hidden px-4 py-4 relative"
              >
                <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10"
                  style={{ background: "linear-gradient(to bottom, rgba(15,15,26,0.9), transparent)" }} />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10"
                  style={{ background: "linear-gradient(to top, rgba(15,15,26,0.9), transparent)" }} />
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                  {text || PLACEHOLDER}
                </p>
              </div>
              <div className="border-t border-white/[0.06] p-4 space-y-2">
                <div className="flex gap-2">
                  {scrolling ? (
                    <button onClick={onStop}
                      className="flex-1 glass py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-white/[0.08]">
                      ⏸ Pause
                    </button>
                  ) : (
                    <button onClick={onStart} disabled={!text}
                      className={`flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold ${!text ? "opacity-30 cursor-not-allowed" : ""}`}>
                      ▶ Play
                    </button>
                  )}
                  <button onClick={onReset}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold glass text-white/50 hover:text-white transition-colors">
                    ↺
                  </button>
                </div>
                <button
                  onClick={() => { onStop(); onReset(); setFullscreen(true); }}
                  disabled={!text}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    text
                      ? "text-amber-400 hover:bg-amber-400/[0.08]"
                      : "text-white/20 cursor-not-allowed"
                  }`}
                  style={{ border: `1px solid ${text ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.06)"}` }}
                >
                  ⛶ Fullscreen Mode
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Pro Tips</p>
              {[
                "Use short sentences for easier reading",
                "Mark pauses with // or —",
                "Bold key words in your mind, not on screen",
                "Practice without scrolling first",
              ].map((tip, i) => (
                <div key={i} className="flex gap-2 text-xs text-white/50 leading-relaxed">
                  <span className="text-amber-400/60 mt-0.5">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
