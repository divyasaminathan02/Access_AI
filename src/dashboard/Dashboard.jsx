import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Layers,
  History,
  ShieldCheck,
  Globe,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
  Check,
  Info,
  Menu,
  X
} from 'lucide-react';
import { adaptiveEngine } from '../learning/adaptiveEngine.js';
import { FingerprintEvolution } from './components/FingerprintEvolution.jsx';
import { ConfidenceGauges } from './components/ConfidenceGauges.jsx';
import { LearningInsights } from './components/LearningInsights.jsx';
import { TimelineView } from './components/TimelineView.jsx';
import { PrivacyCenter } from './components/PrivacyCenter.jsx';
import { ContextSettings } from './components/ContextSettings.jsx';
import { DEFAULT_INITIAL_PROFILE } from '../learning/learningStorage.js';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('evolution');
  const [state, setState] = useState({
    initialProfile: DEFAULT_INITIAL_PROFILE,
    currentProfile: DEFAULT_INITIAL_PROFILE,
    learnedPreferences: {},
    comfortProfile: { overall: 88 },
    insights: [],
    evolutionTimeline: [],
    adaptiveLearningEnabled: true,
    siteOverrides: []
  });
  const [notification, setNotification] = useState('');

  const loadState = async () => {
    const fullState = await adaptiveEngine.getFullState();
    setState(fullState);
  };

  useEffect(() => {
    loadState();
    const unsub = adaptiveEngine.subscribe(updated => {
      setState(updated);
    });

    // Handle hash routing if URL contains #privacy etc
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (['evolution', 'comfort', 'insights', 'timeline', 'context', 'privacy'].includes(hash)) {
        setActiveTab(hash);
      }
    }

    return () => unsub();
  }, []);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleToggleAdaptive = async () => {
    const next = !state.adaptiveLearningEnabled;
    await adaptiveEngine.setAdaptiveLearningEnabled(next);
    notify(next ? 'Adaptive personalization enabled.' : 'Adaptive personalization paused.');
  };

  const handleRevertTrait = async (dimension, originalValue) => {
    await adaptiveEngine.updateCurrentProfile({ [dimension]: originalValue });
    notify(`Reverted ${dimension} to baseline ${originalValue}.`);
  };

  const handleRestoreInitial = async () => {
    await adaptiveEngine.restoreInitialFingerprint();
    notify('Restored initial reading fingerprint.');
  };

  const handleResetLearning = async () => {
    await adaptiveEngine.resetLearnedPreferences();
    notify('Reset learned preferences while keeping initial fingerprint.');
  };

  const handleResetAll = async () => {
    await adaptiveEngine.resetEverything();
    notify('Reset all AccessAI data.');
  };

  const tabs = [
    { id: 'evolution', label: 'Fingerprint Evolution', icon: Sparkles },
    { id: 'comfort', label: 'Comfort Profile', icon: Activity },
    { id: 'insights', label: 'Learned Insights', icon: Layers },
    { id: 'timeline', label: 'Evolution Timeline', icon: History },
    { id: 'context', label: 'Site Context Rules', icon: Globe },
    { id: 'privacy', label: 'Privacy Center', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-glow-brand">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">AccessAI Dashboard</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-500/30">
                  Adaptive Intelligence v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Accessibility attached to people, not websites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="demo.html"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Demo Presentation Mode
            </a>
            <a
              href="onboarding.html"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Assessment
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div className="p-3.5 rounded-xl bg-blue-950/90 border border-blue-500/50 text-blue-200 text-xs font-semibold flex items-center gap-2 shadow-xl animate-in fade-in">
            <Check className="w-4 h-4 text-blue-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.location.hash = tab.id;
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-glow-brand'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div className="transition-all duration-200">
          {activeTab === 'evolution' && (
            <FingerprintEvolution
              initialProfile={state.initialProfile}
              currentProfile={state.currentProfile}
              learnedPreferences={state.learnedPreferences}
              onRevertTrait={handleRevertTrait}
              onRestoreInitial={handleRestoreInitial}
            />
          )}

          {activeTab === 'comfort' && (
            <ConfidenceGauges comfortProfile={state.comfortProfile} />
          )}

          {activeTab === 'insights' && (
            <LearningInsights insights={state.insights} />
          )}

          {activeTab === 'timeline' && (
            <TimelineView history={state.evolutionTimeline} />
          )}

          {activeTab === 'context' && (
            <ContextSettings
              siteOverrides={state.siteOverrides}
              onOverridesUpdated={loadState}
            />
          )}

          {activeTab === 'privacy' && (
            <PrivacyCenter
              adaptiveEnabled={state.adaptiveLearningEnabled}
              onToggleAdaptive={handleToggleAdaptive}
              onResetLearning={handleResetLearning}
              onResetAll={handleResetAll}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">
        <p>
          AccessAI v2.0 • Accessibility is no longer attached to websites. It is attached to people.
        </p>
      </footer>
    </div>
  );
}
