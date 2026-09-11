import React from 'react';
import { RagState } from '../types';
import { Menu, GitFork, CheckCircle2, Sliders, RotateCw } from 'lucide-react';

interface TopHeaderProps {
  ragState: RagState;
  onSelectRagState: (state: RagState) => void;
  onToggleSidebar: () => void;
  onOpenSources: () => void;
  onOpenVisualSettings: () => void;
  onResetWorkspace: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  ragState,
  onSelectRagState,
  onToggleSidebar,
  onOpenSources,
  onOpenVisualSettings,
  onResetWorkspace,
}) => {
  return (
    <header className="h-14 bg-[#0c0d12]/90 backdrop-blur-xl border-b border-[#450a0a]/50 px-4 flex items-center justify-between shrink-0 z-30 relative">
      {/* Left: Branding & Hybrid Retriever Tag */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Toggle Vector Index & Logs"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-maroon-800 to-amber-500 flex items-center justify-center text-white shadow-md shadow-maroon-950/60 border border-red-500/40">
            <GitFork className="w-4 h-4 rotate-180 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-sm text-white tracking-wide">
                RAG FOR RAS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-maroon-900/60 border border-red-600/40 text-red-300 font-semibold shadow-inner hidden sm:inline-block">
                Hybrid Retriever (BM25 + ColBERTv2)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Live Vector Index Metrics */}
      <div className="hidden xl:flex items-center gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-maroon-850/60 text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Milvus v2.4 Active</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-maroon-850/60 text-slate-300 shadow-sm">
          <span className="text-[#ffc72c] font-semibold">482,190</span>
          <span className="text-slate-400">chunks indexed</span>
        </div>
      </div>

      {/* Right: Sources & Interactive RAG State Controls */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {/* RAG State Mode Controller Pill */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[#12080c] border border-maroon-850 text-[10.5px]">
          <span className="text-slate-400 mr-0.5">RAG:</span>
          {(
            [
              { key: 'idle', label: 'Idle' },
              { key: 'search', label: 'Search' },
              { key: 'retrieve', label: 'Retrieve' },
              { key: 'response', label: 'Answer' },
            ] as const
          ).map(({ key, label }) => {
            const isActive = ragState === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectRagState(key)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  isActive
                    ? 'text-[#ffc72c] font-semibold bg-white/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Sources & Accuracy Button */}
        <button
          onClick={onOpenSources}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-maroon-900/70 to-[#5b0e1e]/60 hover:from-maroon-800 hover:to-red-900/60 border border-red-500/40 text-red-200 hover:text-white font-medium transition-all group shadow-sm shadow-maroon-950/40"
        >
          <CheckCircle2 className="w-4 h-4 text-[#ffc72c] group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Sources &amp; Accuracy</span>
          <span className="px-1 rounded bg-[#ffc72c]/20 text-[#ffc72c] text-[10px] font-bold">
            98.4%
          </span>
        </button>

        {/* Visuals Modal Button */}
        <button
          onClick={onOpenVisualSettings}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
        >
          <Sliders className="w-4 h-4 text-red-400" />
          <span className="hidden md:inline">Visuals</span>
        </button>

        {/* Reset Workspace */}
        <button
          onClick={onResetWorkspace}
          type="button"
          title="Reset Workspace"
          className="hidden sm:flex items-center gap-1 p-2 rounded-full border border-white/10 text-slate-400 hover:text-slate-200 bg-white/5 transition-colors text-[11px]"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
