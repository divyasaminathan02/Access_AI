import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  ShieldCheck,
  Activity,
  FileText,
  Code,
  LayoutDashboard,
  Eye,
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';
import { FloatingHUD } from './content/floatingHUD.jsx';
import { SmartFocusEngine } from './content/smartFocus.js';
import { adaptiveEngine } from './learning/adaptiveEngine.js';
import { DEFAULT_INITIAL_PROFILE } from './learning/learningStorage.js';

export function App() {
  const [profile, setProfile] = useState(DEFAULT_INITIAL_PROFILE);
  const [activeCategory, setActiveCategory] = useState('article');
  const [state, setState] = useState(null);

  useEffect(() => {
    adaptiveEngine.getFullState(activeCategory).then(s => {
      setState(s);
      setProfile(s.currentProfile);
    });

    const unsub = adaptiveEngine.subscribe(s => {
      setState(s);
      setProfile(s.currentProfile);
    });

    const handleApply = (e) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener('accessai:apply_profile', handleApply);

    return () => {
      unsub();
      window.removeEventListener('accessai:apply_profile', handleApply);
    };
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Top Banner */}
      <nav className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-glow-brand">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">AccessAI</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-500/30">
                  Adaptive Intelligence v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Accessibility attached to people, not websites</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <a
              href="dashboard.html"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-glow-brand"
            >
              <Sliders className="w-3.5 h-3.5" />
              Dashboard
            </a>
            <a
              href="demo.html"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Demo Mode
            </a>
            <a
              href="onboarding.html"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Assessment
            </a>
          </div>
        </div>
      </nav>

      {/* Main Sandbox Experience */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Category Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulated Page Context:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCategory('article')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeCategory === 'article' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Long Article
              </button>
              <button
                onClick={() => setActiveCategory('documentation')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeCategory === 'documentation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Documentation
              </button>
              <button
                onClick={() => setActiveCategory('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeCategory === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard UI
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              100% Local Intelligence
            </span>
          </div>
        </div>

        {/* Live Personalization Sandbox Content */}
        <div
          className={`p-6 sm:p-10 rounded-3xl border transition-all duration-300 shadow-2xl min-h-[520px] ${
            profile.theme === 'warm'
              ? 'bg-[#fbf4e2] text-[#2e261a] border-amber-300'
              : profile.theme === 'dark'
              ? 'bg-[#121824] text-slate-100 border-slate-700'
              : profile.theme === 'dyslexia'
              ? 'bg-[#f4edd8] text-[#1a1e24] border-amber-400'
              : profile.theme === 'high-contrast'
              ? 'bg-black text-yellow-300 border-yellow-400'
              : 'bg-white text-slate-900 border-slate-300'
          }`}
          style={{
            fontFamily: profile.fontFamily,
            fontSize: `${profile.fontSize}px`,
            lineHeight: profile.lineSpacing,
            letterSpacing: `${profile.letterSpacing || 0}px`
          }}
        >
          {activeCategory === 'article' && (
            <article className="max-w-3xl mx-auto space-y-6">
              <div className="opacity-60 text-xs font-mono uppercase tracking-widest">
                Cognitive Accessibility & Human-Centric AI
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ lineHeight: 1.2 }}>
                The Evolution of Adaptive Web Reading
              </h1>
              <div className="text-xs opacity-70 flex items-center gap-3 font-mono">
                <span>By AccessAI Research</span>
                <span>•</span>
                <span>5 min read</span>
                <span>•</span>
                <span>Context: Long Article</span>
              </div>

              <p>
                Reading comfort on the modern web is notoriously inconsistent. Different websites employ wildly contrasting font weights, diminutive line spacing, and harsh contrasts that induce visual fatigue.
              </p>

              <p>
                AccessAI introduces continuous behavioral adaptation. Instead of forcing users to manually calibrate sliders on every new domain, AccessAI observes subtle, non-sensitive interactions.
              </p>

              <blockquote className="p-4 border-l-4 border-blue-500 my-6 italic opacity-90">
                "Accessibility is no longer attached to websites. It is attached to people."
              </blockquote>

              <p>
                Try interacting with the <strong>floating AccessAI HUD</strong> in the lower-right corner. Increase font size, test Lexend or Atkinson fonts, switch themes, or toggle Focus Mode to watch the adaptive engine learn in real-time.
              </p>
            </article>
          )}

          {activeCategory === 'documentation' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="opacity-60 text-xs font-mono uppercase tracking-widest">
                API Reference • Developer Docs
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Adaptive Learning Engine Architecture
              </h1>
              <p>
                The AccessAI recommendation and scoring pipeline executes deterministically inside client web workers:
              </p>

              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto border border-slate-800">
{`// AccessAI Local Pipeline
import { adaptiveEngine } from './learning/adaptiveEngine.js';

const result = await adaptiveEngine.recordInteraction({
  type: 'font_size_change',
  from: 16,
  to: 18,
  domain: 'developer.mozilla.org'
});
console.log('Learned preference confidence:', result.learnedData.confidence);`}
              </pre>

              <p>
                In documentation contexts, syntax blocks remain formatted in clean monospaced font while surrounding body descriptions adopt the user's preferred typography and line spacing.
              </p>
            </div>
          )}

          {activeCategory === 'dashboard' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="opacity-60 text-xs font-mono uppercase tracking-widest">
                Analytics & Portal
              </div>
              <h1 className="text-2xl font-bold">
                Operational Telemetry Dashboard
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                  <div className="text-xs opacity-70">Active Sessions</div>
                  <div className="text-2xl font-bold font-mono mt-1">2,841</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                  <div className="text-xs opacity-70">Preference Convergence</div>
                  <div className="text-2xl font-bold font-mono mt-1">94.8%</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                  <div className="text-xs opacity-70">Average Comfort Score</div>
                  <div className="text-2xl font-bold font-mono mt-1">89%</div>
                </div>
              </div>
              <p>
                In dashboard mode, AccessAI applies soft-touch typographic scaling to readable text passages while preserving compact metric cards and data grids.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating HUD Embedded for Live Interactive Testing */}
      <FloatingHUD
        initialProfile={state?.initialProfile || DEFAULT_INITIAL_PROFILE}
        currentProfile={profile}
        pageCategory={activeCategory}
      />
    </div>
  );
}
