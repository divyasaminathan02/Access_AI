import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  RotateCcw
} from 'lucide-react';

export function FingerprintEvolution({ initialProfile, currentProfile, learnedPreferences, onRevertTrait, onRestoreInitial }) {
  const dimensions = [
    {
      key: 'fontSize',
      label: 'Font Size',
      unit: 'px',
      icon: 'type',
      format: (v) => `${v}px`
    },
    {
      key: 'fontFamily',
      label: 'Typography',
      unit: '',
      icon: 'font',
      format: (v) => v
    },
    {
      key: 'lineSpacing',
      label: 'Line Spacing',
      unit: 'x',
      icon: 'align-justify',
      format: (v) => `${v}x`
    },
    {
      key: 'theme',
      label: 'Theme',
      unit: '',
      icon: 'palette',
      format: (v) => v.charAt(0).toUpperCase() + v.slice(1)
    },
    {
      key: 'focusMode',
      label: 'Focus Mode',
      unit: '',
      icon: 'eye',
      format: (v) => v ? 'Frequently Used' : 'Standard'
    },
    {
      key: 'reducedMotion',
      label: 'Motion',
      unit: '',
      icon: 'zap',
      format: (v) => v ? 'Reduced' : 'Standard'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/80 border border-blue-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Dynamic Personal Reading Fingerprint
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Adaptive Reading Fingerprint Evolution
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              AccessAI continuously observes your reading interactions and refines your profile gradually so the web naturally molds to how you read best.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRestoreInitial}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Initial Baseline
            </button>
          </div>
        </div>
      </div>

      {/* Tripartite Evolution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map(dim => {
          const initVal = initialProfile[dim.key];
          const currVal = currentProfile[dim.key];
          const learned = learnedPreferences[dim.key];
          const confidence = learned ? Math.round(learned.confidence * 100) : null;
          const isEvolved = learned && learned.confidence >= 0.65 && currVal !== initVal;

          return (
            <div
              key={dim.key}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isEvolved
                  ? 'bg-gradient-to-b from-blue-950/40 to-slate-900/80 border-blue-500/40 shadow-glow-brand/30'
                  : 'bg-slate-900/50 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {dim.label}
                </span>
                {confidence ? (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    confidence >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                    confidence >= 60 ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {confidence}% Confidence
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Baseline</span>
                )}
              </div>

              {/* Values Comparison */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Initial</div>
                  <div className="text-sm font-medium text-slate-400 font-mono mt-0.5">
                    {dim.format(initVal)}
                  </div>
                </div>

                <ArrowRight className={`w-4 h-4 ${isEvolved ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`} />

                <div className="text-right">
                  <div className="text-[10px] uppercase text-blue-400 font-semibold">Learned / Current</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {dim.format(currVal)}
                  </div>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      confidence >= 80 ? 'bg-gradient-to-r from-blue-500 to-emerald-400' :
                      confidence >= 60 ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                    style={{ width: `${confidence || 50}%` }}
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {learned?.observations ? `${learned.observations} observations` : 'Standard baseline'}
                </span>
                {isEvolved && (
                  <button
                    onClick={() => onRevertTrait(dim.key, initVal)}
                    className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
                    title="Revert this dimension to initial baseline"
                  >
                    Revert
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
