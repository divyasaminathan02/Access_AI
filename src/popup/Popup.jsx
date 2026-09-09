import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Sun,
  Eye,
  Settings,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Zap,
  Activity,
  Play
} from 'lucide-react';
import { adaptiveEngine } from '../learning/adaptiveEngine.js';
import { DEFAULT_INITIAL_PROFILE } from '../learning/learningStorage.js';

export function Popup() {
  const [profile, setProfile] = useState(DEFAULT_INITIAL_PROFILE);
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(true);
  const [learnedPrefs, setLearnedPrefs] = useState({});
  const [comfortProfile, setComfortProfile] = useState({ overall: 85 });

  useEffect(() => {
    adaptiveEngine.getFullState().then(state => {
      setProfile(state.currentProfile);
      setAdaptiveEnabled(state.adaptiveLearningEnabled);
      setLearnedPrefs(state.learnedPreferences);
      setComfortProfile(state.comfortProfile);
    });

    const unsub = adaptiveEngine.subscribe(state => {
      setProfile(state.currentProfile);
      setAdaptiveEnabled(state.adaptiveLearningEnabled);
      setLearnedPrefs(state.learnedPreferences);
      setComfortProfile(state.comfortProfile);
    });

    return () => unsub();
  }, []);

  const handleToggleAdaptive = async () => {
    const next = !adaptiveEnabled;
    setAdaptiveEnabled(next);
    await adaptiveEngine.setAdaptiveLearningEnabled(next);
  };

  const handleAdjust = async (dimension, val, eventType) => {
    const fromVal = profile[dimension];
    const updated = { ...profile, [dimension]: val };
    setProfile(updated);
    await adaptiveEngine.updateCurrentProfile({ [dimension]: val });
    await adaptiveEngine.recordInteraction({
      type: eventType || `${dimension}_change`,
      dimension,
      from: fromVal,
      to: val
    });
  };

  const themes = [
    { id: 'default', label: 'Std', bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-300' },
    { id: 'warm', label: 'Warm', bg: 'bg-[#fbf4e2]', text: 'text-[#2e261a]', border: 'border-amber-300' },
    { id: 'dark', label: 'Dark', bg: 'bg-[#121824]', text: 'text-slate-100', border: 'border-slate-700' },
    { id: 'dyslexia', label: 'Dys', bg: 'bg-[#f4edd8]', text: 'text-[#1a1e24]', border: 'border-amber-400' },
  ];

  return (
    <div className="w-[360px] bg-slate-950 text-slate-100 p-4 font-sans select-none border border-slate-800 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-glow-brand">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              AccessAI
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Adaptive Reading Fingerprint</p>
          </div>
        </div>

        <a
          href="dashboard.html"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition"
          title="Open AccessAI Dashboard"
          aria-label="Open AccessAI Dashboard"
        >
          <Sliders className="w-4 h-4" />
        </a>
      </div>

      {/* Adaptive Intelligence Pill */}
      <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${adaptiveEnabled ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-slate-600'}`} />
          <div>
            <div className="text-xs font-semibold text-slate-200">Adaptive Personalization</div>
            <div className="text-[10px] text-slate-400">
              {adaptiveEnabled ? 'Gradually learning your reading habits' : 'Using fixed baseline fingerprint'}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleAdaptive}
          role="switch"
          aria-checked={adaptiveEnabled}
          aria-label="Toggle Adaptive Personalization"
          className={`w-11 h-6 rounded-full transition-colors relative ${adaptiveEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${adaptiveEnabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* Reading Comfort & Confidence Summary */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Comfort Index</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-white font-mono">{comfortProfile.overall || 85}%</span>
            <span className="text-[10px] text-emerald-400">High</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Font Size</span>
            <span className="text-[10px] font-mono text-blue-400">
              {learnedPrefs.fontSize ? `${Math.round(learnedPrefs.fontSize.confidence * 100)}% conf` : 'initial'}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-white font-mono">{profile.fontSize}px</span>
            <span className="text-[10px] text-slate-400 capitalize">{profile.fontFamily}</span>
          </div>
        </div>
      </div>

      {/* Quick Personalization Sliders */}
      <div className="mt-3 space-y-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs">
        {/* Font Size */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Text Scale</span>
            <span className="font-mono text-blue-400 font-semibold">{profile.fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjust('fontSize', Math.max(12, profile.fontSize - 1), 'font_size_change')}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            >
              -
            </button>
            <input
              type="range"
              min="12"
              max="28"
              step="1"
              value={profile.fontSize}
              onChange={(e) => handleAdjust('fontSize', Number(e.target.value), 'font_size_change')}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <button
              onClick={() => handleAdjust('fontSize', Math.min(28, profile.fontSize + 1), 'font_size_change')}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Line Spacing */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Line Spacing</span>
            <span className="font-mono text-blue-400 font-semibold">{profile.lineSpacing}x</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjust('lineSpacing', Math.max(1.1, +(profile.lineSpacing - 0.1).toFixed(2)), 'line_spacing_change')}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            >
              -
            </button>
            <input
              type="range"
              min="1.1"
              max="2.4"
              step="0.05"
              value={profile.lineSpacing}
              onChange={(e) => handleAdjust('lineSpacing', Number(e.target.value), 'line_spacing_change')}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <button
              onClick={() => handleAdjust('lineSpacing', Math.min(2.4, +(profile.lineSpacing + 0.1).toFixed(2)), 'line_spacing_change')}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Theme Buttons */}
        <div>
          <span className="text-slate-400 block mb-1.5">Reading Theme</span>
          <div className="grid grid-cols-4 gap-1.5">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => handleAdjust('theme', t.id, 'theme_change')}
                className={`py-1.5 rounded-lg border text-center text-[11px] font-medium transition ${t.bg} ${t.text} ${t.border} ${
                  profile.theme === t.id ? 'ring-2 ring-blue-500 scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <a
          href="demo.html"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-medium transition"
        >
          <Play className="w-3.5 h-3.5" />
          Demo Mode
        </a>

        <a
          href="onboarding.html"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Assessment
        </a>
      </div>

      {/* Footer Privacy Guarantee */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          100% In-Browser Privacy
        </span>
        <a
          href="dashboard.html#privacy"
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-blue-400"
        >
          Privacy Center
        </a>
      </div>
    </div>
  );
}
