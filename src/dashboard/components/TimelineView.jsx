import React from 'react';
import {
  History,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function TimelineView({ history }) {
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <History className="w-4 h-4" />
              Evolution History
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              How Your Reading Fingerprint Evolved
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              A transparent, chronological log of when and why AccessAI refined your reading preferences.
            </p>
          </div>
        </div>

        {/* Timeline Entries */}
        <div className="mt-8 relative pl-6 border-l-2 border-slate-800 space-y-8">
          {history.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-sm">
              No evolution history recorded yet. Interact with the HUD to begin learning!
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-blue-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-glow-brand" />

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {item.title}
                      {item.confidence && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30">
                          {item.confidence}% conf
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.timestamp)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Changes Diff Tags */}
                  {item.changes && Object.keys(item.changes).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                      {Object.entries(item.changes).map(([dim, diff]) => {
                        if (typeof diff === 'object' && diff !== null && diff.from !== undefined) {
                          return (
                            <span key={dim} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-mono flex items-center gap-1.5">
                              <span className="text-slate-400 capitalize">{dim}:</span>
                              <span className="text-slate-500 line-through">{String(diff.from)}</span>
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                              <span className="text-emerald-400 font-bold">{String(diff.to)}</span>
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
