import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Sliders,
  Eye,
  Sun,
  Type,
  AlignJustify,
  ShieldCheck,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';
import { adaptiveEngine } from '../learning/adaptiveEngine.js';
import { learningStorage } from '../learning/learningStorage.js';

export function DemoMode() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeProfile, setActiveProfile] = useState({
    fontFamily: 'Inter',
    fontSize: 16,
    lineSpacing: 1.4,
    theme: 'default',
    focusMode: false,
    reducedMotion: false
  });
  const [confidenceData, setConfidenceData] = useState({
    fontSize: 0,
    lineSpacing: 0,
    theme: 0,
    focusMode: 0,
    overall: 65
  });
  const [logs, setLogs] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [evolvedNotice, setEvolvedNotice] = useState(null);

  const steps = [
    {
      id: 0,
      title: '1. Initial Baseline Fingerprint',
      user: 'Sarah',
      description: 'Sarah has just completed standard onboarding with standard 16px text and 1.4 line spacing.',
      action: 'Baseline Established',
      profile: { fontFamily: 'Inter', fontSize: 16, lineSpacing: 1.4, theme: 'default', focusMode: false },
      confidence: { fontSize: 15, lineSpacing: 15, theme: 20, focusMode: 10, overall: 60 },
      log: 'Initialized baseline profile: Inter, 16px, 1.4x, Default theme.'
    },
    {
      id: 1,
      title: '2. User Adjusts Text Size on Articles',
      user: 'Sarah',
      description: 'While reading dense multi-column tech news, Sarah manually increases text size to 18px multiple times.',
      action: 'Font Size: 16px → 18px (3 adjustments logged)',
      profile: { fontFamily: 'Inter', fontSize: 18, lineSpacing: 1.4, theme: 'default', focusMode: false },
      confidence: { fontSize: 62, lineSpacing: 25, theme: 20, focusMode: 15, overall: 72 },
      log: 'Observed repeated font_size_change to 18px across 3 articles. Confidence rising to 62%.'
    },
    {
      id: 2,
      title: '3. User Expands Line Spacing & Font Family',
      user: 'Sarah',
      description: 'Sarah consistently sets line spacing to 1.7x and tests Lexend for easier eye-tracking.',
      action: 'Spacing: 1.4x → 1.7x & Lexend Selected',
      profile: { fontFamily: 'Lexend', fontSize: 18, lineSpacing: 1.7, theme: 'default', focusMode: false },
      confidence: { fontSize: 78, lineSpacing: 84, theme: 35, focusMode: 20, overall: 81 },
      log: 'Observed line_spacing_change to 1.7x (5 sessions). Spacing confidence: 84%.'
    },
    {
      id: 3,
      title: '4. User Enables Warm Theme & Focus Mode',
      user: 'Sarah',
      description: 'During a 20-minute evening session, Sarah activates Focus Mode and switches to Warm parchment.',
      action: 'Theme: Warm Parchment & Focus Mode: ON',
      profile: { fontFamily: 'Lexend', fontSize: 18, lineSpacing: 1.7, theme: 'warm', focusMode: true },
      confidence: { fontSize: 87, lineSpacing: 91, theme: 76, focusMode: 82, overall: 89 },
      log: 'Extended reading session observed. Focus Mode & Warm theme pattern established.'
    },
    {
      id: 4,
      title: '5. AccessAI Generates Explainable Suggestion',
      user: 'Sarah',
      description: 'Confidence scores cross the 85% threshold. AccessAI presents a transparent, non-intrusive suggestion.',
      action: 'Suggestion Prompt Displayed',
      profile: { fontFamily: 'Lexend', fontSize: 18, lineSpacing: 1.7, theme: 'warm', focusMode: true },
      confidence: { fontSize: 87, lineSpacing: 91, theme: 76, focusMode: 82, overall: 89 },
      recommendation: {
        title: 'Update Reading Fingerprint?',
        explanation: 'AccessAI noticed that you frequently increase text size to 18px and use 1.7x spacing on articles (87% confidence).',
        buttonText: 'Approve Profile Evolution'
      },
      log: 'Explainable recommendation generated: evolve_fingerprint_sarah.'
    },
    {
      id: 5,
      title: '6. Reading Fingerprint Successfully Evolves',
      user: 'Sarah',
      description: 'Sarah approves the update. AccessAI now applies Lexend 18px with 1.7x spacing & Warm theme automatically across all websites!',
      action: 'Adaptive Evolution Complete',
      profile: { fontFamily: 'Lexend', fontSize: 18, lineSpacing: 1.7, theme: 'warm', focusMode: true },
      confidence: { fontSize: 94, lineSpacing: 96, theme: 88, focusMode: 90, overall: 94 },
      evolved: true,
      log: 'Personal Reading Fingerprint permanently evolved and saved to IndexedDB!'
    }
  ];

  const applyStep = (stepIdx) => {
    const s = steps[stepIdx];
    setCurrentStep(stepIdx);
    setActiveProfile(s.profile);
    setConfidenceData(s.confidence);
    setRecommendation(s.recommendation || null);
    if (s.evolved) {
      setEvolvedNotice('Your Reading Fingerprint is evolving: Lexend 18px, 1.7x Line Spacing, Warm Theme');
    } else {
      setEvolvedNotice(null);
    }
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), text: s.log },
      ...prev.slice(0, 7)
    ]);
  };

  useEffect(() => {
    applyStep(0);
  }, []);

  // Auto-play timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            const next = prev + 1;
            applyStep(next);
            return next;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleApproveEvolution = async () => {
    // Record into actual storage as demo persistence
    await adaptiveEngine.updateCurrentProfile(activeProfile);
    applyStep(5);
  };

  const handleResetDemo = () => {
    setIsPlaying(false);
    applyStep(0);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-glow-brand">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">AccessAI Demo Simulator</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-500/30">
                  Hackathon Showcase
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live simulation of Sarah's adaptive reading evolution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Auto-Play Scenario'}</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Reset Demo to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <a
              href="dashboard.html"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Evolution Notification Banner */}
        {evolvedNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border border-emerald-500/50 text-emerald-300 flex items-center justify-between gap-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Your Reading Fingerprint is Evolving!
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  {evolvedNotice}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-black">
              Evolved Successfully
            </span>
          </div>
        )}

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setIsPlaying(false);
                applyStep(idx);
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                currentStep === idx
                  ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40'
                  : currentStep > idx
                  ? 'bg-slate-900/80 border-emerald-500/40 text-slate-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase">Step {idx + 1}</span>
                {currentStep > idx ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${currentStep === idx ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
                )}
              </div>
              <div className="text-xs font-bold text-white truncate">{s.title.split('. ')[1]}</div>
            </button>
          ))}
        </div>

        {/* Core Demo Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Storyboard & Learning Engine Metrics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Storyboard Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Scenario Progression
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Subject: Sarah
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <h2 className="text-lg font-bold text-white">
                  {steps[currentStep].title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {steps[currentStep].description}
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Observed Action:</span>
                  <span className="font-mono text-indigo-300 font-bold">{steps[currentStep].action}</span>
                </div>
              </div>

              {/* Suggestion Card if step 4 */}
              {recommendation && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 shadow-lg space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {recommendation.title}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {recommendation.explanation}
                  </p>
                  <button
                    onClick={handleApproveEvolution}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-glow-brand"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {recommendation.buttonText}
                  </button>
                </div>
              )}
            </div>

            {/* Confidence Gauges Live Panel */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Learned Confidence Engine
                </h3>
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {confidenceData.overall}% Total
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Font Size Gauge */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Font Size (18px)</span>
                    <span className="font-mono font-bold text-blue-400">{confidenceData.fontSize}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${confidenceData.fontSize}%` }}
                    />
                  </div>
                </div>

                {/* Line Spacing Gauge */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Line Spacing (1.7x)</span>
                    <span className="font-mono font-bold text-cyan-400">{confidenceData.lineSpacing}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                      style={{ width: `${confidenceData.lineSpacing}%` }}
                    />
                  </div>
                </div>

                {/* Theme Gauge */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Warm Theme Alignment</span>
                    <span className="font-mono font-bold text-amber-400">{confidenceData.theme}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${confidenceData.theme}%` }}
                    />
                  </div>
                </div>

                {/* Focus Mode Gauge */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Focus Mode Tendency</span>
                    <span className="font-mono font-bold text-purple-400">{confidenceData.focusMode}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${confidenceData.focusMode}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Event Log Feed */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1.5 max-h-40 overflow-y-auto">
              <div className="text-[10px] text-slate-500 uppercase font-sans font-bold mb-1">
                Local Interaction Event Bus (Zero Cloud Sync)
              </div>
              {logs.map((l, i) => (
                <div key={i} className="text-slate-400 flex items-start gap-2">
                  <span className="text-slate-600 shrink-0">[{l.time}]</span>
                  <span className="text-slate-300">{l.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live In-Page Reading Experience (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Simulated Web Article: Scientific American</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Font: {activeProfile.fontFamily}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {activeProfile.fontSize}px
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {activeProfile.lineSpacing}x
                  </span>
                </div>
              </div>

              {/* Simulated Article Body adhering to activeProfile */}
              <div
                className={`mt-4 p-8 rounded-2xl border transition-all duration-500 min-h-[440px] flex flex-col justify-between ${
                  activeProfile.theme === 'warm'
                    ? 'bg-[#fbf4e2] text-[#2e261a] border-amber-300 shadow-md'
                    : activeProfile.theme === 'dark'
                    ? 'bg-[#121824] text-slate-100 border-slate-700'
                    : 'bg-white text-slate-900 border-slate-300'
                }`}
                style={{
                  fontFamily: activeProfile.fontFamily,
                  fontSize: `${activeProfile.fontSize}px`,
                  lineHeight: activeProfile.lineSpacing
                }}
              >
                <div>
                  <div className="text-xs uppercase tracking-widest font-bold opacity-60 mb-2">
                    Neuroscience & Cognitive Reading
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight mb-4" style={{ lineHeight: 1.25 }}>
                    Why Visual Typography Shapes Cognitive Endurance
                  </h1>
                  <div className="text-xs opacity-70 mb-6 font-mono">
                    Published Sept 2026 • 6 min read • Verified Research
                  </div>

                  <p className="mb-4">
                    For decades, digital accessibility has been treated as a static checklist for web developers. A button in the corner would toggle high contrast or magnify the entire page, often breaking navigational layouts and creating visual friction.
                  </p>

                  <p className="mb-4">
                    When digital typography dynamically aligns with an individual's personal perceptual ergonomics, cognitive load drops significantly. Lexend and Atkinson letterforms reduce saccadic disorientation and crowding effects.
                  </p>

                  <p>
                    With AccessAI's continuous adaptive learning, the user never has to repeatedly tune sliders. The web becomes naturally tailored to their evolving comfort.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t opacity-40 text-xs flex justify-between">
                  <span>Simulated AccessAI Content Engine</span>
                  <span>100% In-Browser Adaptation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
