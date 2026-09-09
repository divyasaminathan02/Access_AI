import React, { useState } from 'react';
import {
  Globe,
  FileText,
  Code,
  LayoutDashboard,
  GraduationCap,
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { learningStorage } from '../../learning/learningStorage.js';

export function ContextSettings({ siteOverrides, onOverridesUpdated }) {
  const [newDomain, setNewDomain] = useState('');
  const [newFontSize, setNewFontSize] = useState(18);
  const [newTheme, setNewTheme] = useState('warm');
  const [statusMsg, setStatusMsg] = useState('');

  const contextRules = [
    {
      category: 'article',
      title: 'Long Articles & News',
      icon: FileText,
      behavior: 'Prioritize reading comfort: enables distraction dimming and optimal paragraph column width.',
      active: true
    },
    {
      category: 'documentation',
      title: 'Technical Documentation',
      icon: Code,
      behavior: 'Preserve code syntax blocks, sidebars, and API tables while enhancing body copy readability.',
      active: true
    },
    {
      category: 'dashboard',
      title: 'Web Dashboards & Portals',
      icon: LayoutDashboard,
      behavior: 'Avoid modifying dense interactive controls and charts; apply soft font scaling to readable blocks only.',
      active: true
    },
    {
      category: 'education',
      title: 'Learning & Courseware',
      icon: GraduationCap,
      behavior: 'Enable Reading Ruler assistance and warm background tint by default.',
      active: true
    },
    {
      category: 'shopping',
      title: 'E-Commerce & Shopping',
      icon: ShoppingBag,
      behavior: 'Maintain strict product card and button dimensions; personalize item descriptions and reviews.',
      active: true
    },
  ];

  const handleAddOverride = async (e) => {
    e.preventDefault();
    if (!newDomain) return;

    let clean = newDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();
    if (!clean) return;

    await learningStorage.saveSiteOverride(clean, {
      fontSize: Number(newFontSize),
      theme: newTheme
    });

    setNewDomain('');
    setStatusMsg(`Saved custom override for ${clean}`);
    setTimeout(() => setStatusMsg(''), 3000);
    if (onOverridesUpdated) onOverridesUpdated();
  };

  const handleDeleteOverride = async (domain) => {
    await learningStorage.deleteSiteOverride(domain);
    setStatusMsg(`Deleted override for ${domain}`);
    setTimeout(() => setStatusMsg(''), 3000);
    if (onOverridesUpdated) onOverridesUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Status Msg */}
      {statusMsg && (
        <div className="p-3 rounded-xl bg-blue-950/90 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Structural Context Heuristics */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            Smart Structural Adaptation
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Site Context Rules
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            AccessAI recognizes page structures (articles, docs, dashboards) and tailors its accessibility enhancements without reading webpage text.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {contextRules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.category}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-500/20 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{rule.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rule.behavior}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20 shrink-0">
                  Active
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Site Overrides Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Per-Website Custom Overrides
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Specify fixed preferences for specific websites that take precedence over the global fingerprint.
          </p>
        </div>

        {/* Add Override Form */}
        <form onSubmit={handleAddOverride} className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Domain</label>
            <input
              type="text"
              placeholder="e.g. github.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Font Size</label>
            <select
              value={newFontSize}
              onChange={(e) => setNewFontSize(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[14, 16, 18, 20, 22, 24].map(s => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Theme</label>
            <select
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="warm">Warm Parchment</option>
              <option value="dark">Dark Slate</option>
              <option value="dyslexia">Dyslexia Tint</option>
              <option value="high-contrast">High Contrast</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Override
          </button>
        </form>

        {/* Overrides Table */}
        <div className="space-y-2">
          {siteOverrides.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              No custom site overrides configured. Global reading fingerprint applies everywhere.
            </div>
          ) : (
            siteOverrides.map((override) => (
              <div
                key={override.domain}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white font-mono">{override.domain}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {override.settings?.fontSize}px
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                    {override.settings?.theme} theme
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteOverride(override.domain)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  title="Remove override"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
