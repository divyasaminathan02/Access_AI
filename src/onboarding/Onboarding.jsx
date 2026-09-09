import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Type,
  Sun,
  Eye,
  Sliders,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { learningStorage, DEFAULT_INITIAL_PROFILE } from '../learning/learningStorage.js';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ ...DEFAULT_INITIAL_PROFILE });
  const [isCompleted, setIsCompleted] = useState(false);

  const fonts = [
    { id: 'Inter', name: 'Inter', desc: 'Modern, balanced geometric sans-serif for general readability.' },
    { id: 'Lexend', name: 'Lexend', desc: 'Scientifically designed to reduce visual crowding and increase reading speed.' },
    { id: 'Atkinson Hyperlegible', name: 'Atkinson Hyperlegible', desc: 'Specially shaped glyphs to distinguish ambiguous characters.' },
    { id: 'Merriweather', name: 'Merriweather', desc: 'Warm serif typography optimized for extended long-form reading.' },
    { id: 'OpenDyslexic', name: 'OpenDyslexic', desc: 'Weighted gravity bottoms to minimize letter inversion and rotation.' }
  ];

  const themes = [
    { id: 'default', name: 'Clean White', desc: 'Crisp, modern standard contrast.', bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-300' },
    { id: 'warm', name: 'Warm Parchment', desc: 'Soft sepia tone reduces blue-light glare during long reading.', bg: 'bg-[#fbf4e2]', text: 'text-[#2e261a]', border: 'border-amber-300' },
    { id: 'dark', name: 'Dark Slate', desc: 'Deep charcoal background for low-light comfort.', bg: 'bg-[#121824]', text: 'text-slate-100', border: 'border-slate-700' },
    { id: 'dyslexia', name: 'Dyslexia Tint', desc: 'Gentle peach/cream tint to soften high-contrast visual stress.', bg: 'bg-[#f4edd8]', text: 'text-[#1a1e24]', border: 'border-amber-400' },
    { id: 'high-contrast', name: 'High Contrast', desc: 'Pure black & vibrant yellow for maximum boundary distinction.', bg: 'bg-black', text: 'text-yellow-300', border: 'border-yellow-400' },
  ];

  const handleFinishAssessment = async () => {
    await learningStorage.setSetting('initialProfile', profile);
    await learningStorage.setSetting('currentProfile', { ...profile });
    await learningStorage.setSetting('adaptiveLearningEnabled', true);
    await learningStorage.addHistoryEntry({
      title: 'Initial Reading Fingerprint Calibrated',
      description: `Baseline established via interactive reading assessment: ${profile.fontFamily}, ${profile.fontSize}px, ${profile.lineSpacing}x spacing, ${profile.theme} theme.`,
      changes: profile,
      timestamp: new Date().toISOString()
    });
    setIsCompleted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full">
        {/* Step Indicator */}
        {!isCompleted && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <span className="font-bold text-sm text-white">AccessAI Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? 'w-8 bg-blue-500' : s < step ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl">
          {/* STEP 1: Welcome & Philosophy */}
          {step === 1 && !isCompleted && (
            <div className="space-y-6">
              <div className="p-3 w-fit rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Accessibility attached to people, not websites.
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Welcome to AccessAI. Instead of forcing you to configure accessibility widgets on every website, AccessAI creates a personal <span className="text-blue-400 font-semibold">Reading Fingerprint</span> that seamlessly adapts any website to how you read best.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% In-Browser Privacy Guarantee</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  All learning models and preference evolution run completely in your local browser. No page text, browsing URLs, or passwords are ever captured or shared.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                <span>Begin Quick Reading Calibration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Typography Selection */}
          {step === 2 && !isCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 1 of 3</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Which typography feels most effortless to read?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select a font style. Notice how character weights and letterforms affect your visual comfort.
                </p>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {fonts.map(f => (
                  <div
                    key={f.id}
                    onClick={() => setProfile({ ...profile, fontFamily: f.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      profile.fontFamily === f.id
                        ? 'bg-blue-950/40 border-blue-500/80 ring-2 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white" style={{ fontFamily: f.id }}>
                        {f.name} — Quick brown fox jumps over the lazy dog.
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
                    </div>
                    {profile.fontFamily === f.id && (
                      <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Scale & Spacing */}
          {step === 3 && !isCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 2 of 3</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Calibrate Text Size & Line Spacing
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust the sliders to find the optimal paragraph breathing room.
                </p>
              </div>

              {/* Live Preview Box */}
              <div
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 transition-all"
                style={{
                  fontFamily: profile.fontFamily,
                  fontSize: `${profile.fontSize}px`,
                  lineHeight: profile.lineSpacing
                }}
              >
                AccessAI observes your reading habits unobtrusively. When you find yourself zooming into dense articles or switching to high-contrast themes, your profile learns without requiring manual reconfiguration.
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
                    <span>Text Size</span>
                    <span className="text-blue-400 font-mono">{profile.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    step="1"
                    value={profile.fontSize}
                    onChange={(e) => setProfile({ ...profile, fontSize: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
                    <span>Line Spacing</span>
                    <span className="text-blue-400 font-mono">{profile.lineSpacing}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.2"
                    step="0.05"
                    value={profile.lineSpacing}
                    onChange={(e) => setProfile({ ...profile, lineSpacing: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Theme & Contrast */}
          {step === 4 && !isCompleted && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 3 of 3</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Choose your Preferred Theme Background
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a background tone that feels most calming on your eyes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themes.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setProfile({ ...profile, theme: t.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition ${t.bg} ${t.text} ${t.border} ${
                      profile.theme === t.id ? 'ring-2 ring-blue-500 scale-[1.02] shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>{t.name}</span>
                      {profile.theme === t.id && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-xs opacity-80 mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishAssessment}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-glow-emerald"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Reading Fingerprint
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED SCREEN */}
          {isCompleted && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  Your Reading Fingerprint is Active!
                </h2>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Baseline calibrated to <span className="text-white font-bold">{profile.fontFamily}</span> at <span className="text-white font-bold">{profile.fontSize}px</span> with <span className="text-white font-bold">{profile.lineSpacing}x</span> spacing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                <div className="font-bold text-blue-400 uppercase tracking-wider">What happens next?</div>
                <p className="text-slate-300 leading-relaxed">
                  As you browse the web, AccessAI automatically personalizes page styling. If you adjust settings via the floating HUD, AccessAI will gradually learn your context-specific preferences.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <a
                  href="dashboard.html"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  Open Dashboard
                </a>
                <a
                  href="demo.html"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Launch Demo Simulation
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
