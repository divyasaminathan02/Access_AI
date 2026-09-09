import React from 'react';
import {
  Type,
  AlignJustify,
  Eye,
  Sun,
  Zap,
  Info,
  Activity,
  HeartPulse
} from 'lucide-react';

export function ConfidenceGauges({ comfortProfile }) {
  const metrics = [
    {
      key: 'typography',
      name: 'Typography',
      score: comfortProfile.typography || 92,
      icon: Type,
      color: 'from-blue-500 to-indigo-500',
      description: 'Font choice & letter scaling comfort'
    },
    {
      key: 'spacing',
      name: 'Spacing',
      score: comfortProfile.spacing || 84,
      icon: AlignJustify,
      color: 'from-cyan-500 to-blue-500',
      description: 'Paragraph density & line clearance'
    },
    {
      key: 'theme',
      name: 'Theme',
      score: comfortProfile.theme || 89,
      icon: Sun,
      color: 'from-amber-500 to-orange-500',
      description: 'Contrast harmony & background warmth'
    },
    {
      key: 'focus',
      name: 'Focus',
      score: comfortProfile.focus || 78,
      icon: Eye,
      color: 'from-indigo-500 to-purple-500',
      description: 'Distraction reduction & content emphasis'
    },
    {
      key: 'motion',
      name: 'Motion',
      score: comfortProfile.motion || 95,
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      description: 'Animation stability & visual stillness'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              Reading Comfort Profile
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Personalized Reading Comfort Index
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Quantifies how closely current web styles match your learned behavioral comfort across 5 core dimensions.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Overall Index</div>
              <div className="text-2xl font-black text-white font-mono">{comfortProfile.overall || 88}%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 5 Dimensional Gauges */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {metrics.map(m => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-900 text-blue-400 border border-slate-800">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold font-mono text-white">{m.score}%</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200">{m.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700`}
                      style={{ width: `${m.score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-medical Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-300">
            Important Product Principle: Personalization, Not Diagnosis
          </p>
          <p className="text-slate-300 leading-relaxed">
            AccessAI measures non-sensitive behavioral interaction patterns to tailor your digital reading environment.
            These scores represent <span className="text-white font-medium">confidence in your learned preference alignment</span>, and are never a clinical or medical assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
