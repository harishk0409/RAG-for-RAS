import React from 'react';
import { X, FileText } from 'lucide-react';

interface SourcesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: string[];
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ isOpen, onClose, sources }) => {
  if (!isOpen) return null;
  const uniqueSources = [...new Set(sources)];

  return (
    <aside className="w-80 bg-[#0c0d12]/95 backdrop-blur-2xl border-l border-[#450a0a]/50 flex flex-col shrink-0 z-20 h-full">
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <h2 className="font-headline font-semibold text-sm text-white">Sources</h2>
        <button onClick={onClose} type="button" className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
        {uniqueSources.length === 0 && (
          <p className="text-slate-400 text-xs">No sources yet — ask a question first.</p>
        )}
        {uniqueSources.map((src) => (
          <div key={src} className="p-3 rounded-xl bg-[#13141d] border border-maroon-850/60 flex items-center gap-2 text-xs">
            <FileText className="w-4 h-4 text-[#ffc72c]" />
            <span className="text-slate-200 truncate">{src}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};