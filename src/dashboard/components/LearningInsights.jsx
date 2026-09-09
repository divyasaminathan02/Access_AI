import React from 'react';
import {
  Sparkles,
  Type,
  AlignJustify,
  Sun,
  Eye,
  Zap,
  BookOpen,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export function LearningInsights({ insights }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'type': return Type;
      case 'align-justify': return AlignJustify;
      case 'sun': return Sun;
      case 'scan':
      case 'eye': return Eye;
      case 'book-open': return BookOpen;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Behavioral Pattern Recognition
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              What AccessAI Has Learned
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Plain-language behavioral insights derived from your non-sensitive reading adjustments.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const Icon = getIcon(insight.icon);
            const confPercent = Math.round((insight.confidence || 0.5) * 100);

            return (
              <div
                key={insight.id}
                className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-900/50">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      {insight.category}
                    </span>
                  </div>

                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    confPercent >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                    'bg-blue-950 text-blue-300 border border-blue-500/30'
                  }`}>
                    {confPercent}% Match
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  "{insight.text}"
                </p>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    Behavioral Observation
                  </span>
                  <span className="text-slate-500 font-mono">100% Client-Side</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
