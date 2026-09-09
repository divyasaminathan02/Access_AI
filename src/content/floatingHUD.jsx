import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Type,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Compass,
  Sliders,
  Check,
  X,
  Eye,
  Settings,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import { adaptiveEngine } from '../learning/adaptiveEngine.js';
import { SmartFocusEngine } from './smartFocus.js';
import { sessionTracker } from '../analytics/readingSession.js';

export function FloatingHUD({ initialProfile, currentProfile, pageCategory = 'general' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(currentProfile || initialProfile);
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(true);
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [showLearningFeedback, setShowLearningFeedback] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Subscribe to engine state updates
    const unsubscribe = adaptiveEngine.subscribe((state) => {
      if (state.currentProfile) {
        setProfile(state.currentProfile);
      }
      setAdaptiveEnabled(state.adaptiveLearningEnabled);
      if (state.recommendations && state.recommendations.length > 0) {
        setActiveRecommendation(state.recommendations[0]);
      } else {
        setActiveRecommendation(null);
      }
    });

    // Initial load
    adaptiveEngine.getFullState(pageCategory, sessionTracker.getCurrentSession()).then(state => {
      setProfile(state.currentProfile);
      setAdaptiveEnabled(state.adaptiveLearningEnabled);
      if (state.recommendations && state.recommendations.length > 0) {
        setActiveRecommendation(state.recommendations[0]);
      }
    });

    return () => unsubscribe();
  }, [pageCategory]);

  const handleAdjust = async (dimension, value, eventType) => {
    const fromVal = profile[dimension];
    const newProfile = { ...profile, [dimension]: value };
    setProfile(newProfile);

    // Track session adjustment count
    sessionTracker.recordAdjustment();

    // Trigger visual style injection immediately
    window.dispatchEvent(new CustomEvent('accessai:apply_profile', { detail: newProfile }));

    // Record interaction event into Adaptive Learning Engine
    const result = await adaptiveEngine.recordInteraction({
      type: eventType || `${dimension}_change`,
      dimension,
      from: fromVal,
      to: value,
      category: pageCategory
    });

    // Provide subtle learning feedback if confidence increased
    if (result && result.learned && adaptiveEnabled) {
      const confPercent = Math.round((result.learnedData?.confidence || 0.5) * 100);
      setShowLearningFeedback({
        dimension,
        text: `Learned preference (${confPercent}% confidence)`,
        evolved: result.profileUpdated
      });
      setTimeout(() => setShowLearningFeedback(null), 3200);
    }
  };

  const handleAcceptRecommendation = async (rec) => {
    await adaptiveEngine.applyRecommendation(rec.id, rec.targetDimension, rec.suggestedValue, rec.type === 'profile_evolution');
    setActiveRecommendation(null);
    setShowLearningFeedback({
      dimension: rec.targetDimension,
      text: 'Reading Fingerprint updated!',
      evolved: true
    });
    setTimeout(() => setShowLearningFeedback(null), 3500);
  };

  const handleDismissRecommendation = async (rec) => {
    await adaptiveEngine.dismissRecommendation(rec.id);
    setActiveRecommendation(null);
  };

  const themes = [
    { id: 'default', label: 'Default', bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-300' },
    { id: 'warm', label: 'Warm', bg: 'bg-[#fbf4e2]', text: 'text-[#2e261a]', border: 'border-amber-300' },
    { id: 'dark', label: 'Dark', bg: 'bg-[#121824]', text: 'text-slate-100', border: 'border-slate-700' },
    { id: 'dyslexia', label: 'Dyslexia', bg: 'bg-[#f4edd8]', text: 'text-[#1a1e24]', border: 'border-amber-400' },
    { id: 'high-contrast', label: 'High Contrast', bg: 'bg-black', text: 'text-yellow-300', border: 'border-yellow-400' },
  ];

  const fonts = [
    { id: 'Inter', name: 'Inter (Default)' },
    { id: 'Lexend', name: 'Lexend (Clean Reading)' },
    { id: 'Atkinson Hyperlegible', name: 'Atkinson Hyperlegible' },
    { id: 'Merriweather', name: 'Merriweather (Serif)' },
    { id: 'OpenDyslexic', name: 'OpenDyslexic' },
  ];

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[2147483647] font-sans">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 text-white rounded-full shadow-2xl border border-blue-500/30 hover:border-blue-400 backdrop-blur-md transition-all group"
          aria-label="Expand AccessAI controls"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <span className="text-xs font-medium text-slate-200 group-hover:text-white">AccessAI</span>
          <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[2147483647] font-sans antialiased text-slate-100 select-none">
      {/* Dynamic Recommendation Toast */}
      {activeRecommendation && (
        <div
          role="alert"
          className="mb-3 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-blue-500/40 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Adaptive Suggestion
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                  {Math.round(activeRecommendation.confidence * 100)}% match
                </span>
              </div>
              <p className="text-xs font-semibold text-white mt-1">
                {activeRecommendation.title}
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeRecommendation.explanation}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleAcceptRecommendation(activeRecommendation)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {activeRecommendation.actions[0]?.label || 'Apply'}
                </button>
                <button
                  onClick={() => handleDismissRecommendation(activeRecommendation)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  {activeRecommendation.actions[1]?.label || 'Not Now'}
                </button>
              </div>
            </div>
            <button
              onClick={() => handleDismissRecommendation(activeRecommendation)}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Close suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Real-time Learning Feedback Badge */}
      {showLearningFeedback && (
        <div className="mb-2 flex items-center justify-end">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-lg border flex items-center gap-2 transition-all ${
            showLearningFeedback.evolved
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-blue-950/90 text-blue-300 border-blue-500/40'
          }`}>
            <Sparkle className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span>{showLearningFeedback.text}</span>
          </div>
        </div>
      )}

      {/* Expanded Control Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 p-4 rounded-2xl bg-slate-900/95 border border-slate-700/70 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <span className="font-semibold text-sm text-white">AccessAI HUD</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                {pageCategory}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Minimize HUD"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Close drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 py-3 text-xs max-h-96 overflow-y-auto pr-1">
            {/* Typography Choice */}
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">Typography Font</label>
              <select
                value={profile.fontFamily}
                onChange={(e) => handleAdjust('fontFamily', e.target.value, 'font_change')}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {fonts.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Font Size & Line Spacing Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Font Size</span>
                  <span className="font-mono text-blue-400">{profile.fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjust('fontSize', Math.max(12, profile.fontSize - 1), 'font_size_change')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
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
                    className="w-full accent-blue-500"
                  />
                  <button
                    onClick={() => handleAdjust('fontSize', Math.min(28, profile.fontSize + 1), 'font_size_change')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Line Spacing</span>
                  <span className="font-mono text-blue-400">{profile.lineSpacing}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjust('lineSpacing', Math.max(1.1, +(profile.lineSpacing - 0.1).toFixed(2)), 'line_spacing_change')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1.1"
                    max="2.5"
                    step="0.05"
                    value={profile.lineSpacing}
                    onChange={(e) => handleAdjust('lineSpacing', Number(e.target.value), 'line_spacing_change')}
                    className="w-full accent-blue-500"
                  />
                  <button
                    onClick={() => handleAdjust('lineSpacing', Math.min(2.5, +(profile.lineSpacing + 0.1).toFixed(2)), 'line_spacing_change')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Reading Themes Palette */}
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">Reading Theme</label>
              <div className="grid grid-cols-5 gap-1.5">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleAdjust('theme', t.id, 'theme_change')}
                    className={`h-9 rounded-lg border-2 flex items-center justify-center text-[10px] font-medium transition ${t.bg} ${t.text} ${t.border} ${
                      profile.theme === t.id ? 'ring-2 ring-blue-400 scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={t.label}
                  >
                    {t.id === 'default' ? 'Std' : t.id === 'warm' ? 'Warm' : t.id === 'dark' ? 'Dark' : t.id === 'dyslexia' ? 'Dys' : 'HC'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Helpers Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Smart Focus Mode</span>
                <button
                  onClick={() => {
                    const next = !profile.focusMode;
                    handleAdjust('focusMode', next, 'focus_mode_toggle');
                    SmartFocusEngine.applyFocusMode(next, pageCategory);
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${profile.focusMode ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${profile.focusMode ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Reading Ruler Guide</span>
                <button
                  onClick={() => {
                    const next = !profile.readingRuler;
                    handleAdjust('readingRuler', next, 'ruler_toggle');
                    SmartFocusEngine.toggleReadingRuler(next);
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${profile.readingRuler ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${profile.readingRuler ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Reduced Motion</span>
                <button
                  onClick={() => handleAdjust('reducedMotion', !profile.reducedMotion, 'animation_toggle')}
                  className={`w-10 h-5 rounded-full transition-colors relative ${profile.reducedMotion ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${profile.reducedMotion ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${adaptiveEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{adaptiveEnabled ? 'Adaptive Learning Active' : 'Fixed Fingerprint'}</span>
            </div>
            <a
              href="dashboard.html"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              Dashboard
              <Sliders className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Quick Dock */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-xs transition ${
            isOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
          }`}
          aria-expanded={isOpen}
          aria-label="AccessAI Quick Tuning Menu"
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
            A
          </div>
          <span>AccessAI</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {/* Quick Text Increase */}
        <button
          onClick={() => handleAdjust('fontSize', Math.min(28, profile.fontSize + 1), 'font_size_change')}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center text-xs font-bold transition"
          title="Increase font size"
          aria-label="Increase text size"
        >
          A+
        </button>

        {/* Quick Text Decrease */}
        <button
          onClick={() => handleAdjust('fontSize', Math.max(12, profile.fontSize - 1), 'font_size_change')}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center text-xs font-bold transition"
          title="Decrease font size"
          aria-label="Decrease text size"
        >
          A-
        </button>

        {/* Quick Theme Cycle */}
        <button
          onClick={() => {
            const currentIdx = themes.findIndex(t => t.id === profile.theme);
            const nextIdx = (currentIdx + 1) % themes.length;
            handleAdjust('theme', themes[nextIdx].id, 'theme_change');
          }}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 flex items-center justify-center transition"
          title="Cycle reading theme"
          aria-label="Cycle reading theme"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Quick Focus Toggle */}
        <button
          onClick={() => {
            const next = !profile.focusMode;
            handleAdjust('focusMode', next, 'focus_mode_toggle');
            SmartFocusEngine.applyFocusMode(next, pageCategory);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
            profile.focusMode ? 'bg-blue-600 text-white' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          title="Toggle Smart Focus Mode"
          aria-label="Toggle Focus Mode"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
