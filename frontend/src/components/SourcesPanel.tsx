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
    <aside className="w-80 bg-[#000000] backdrop-blur-2xl flex flex-col shrink-0 z-20 h-full">
      <div className="p-4 flex items-center justify-between bg-[#000000]">
        <h2 className="font-headline font-semibold text-sm text-[#EDEDED]">Sources</h2>
        <button onClick={onClose} type="button" className="p-1.5 rounded-full text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#262626]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
        {uniqueSources.length === 0 && (
          <p className="text-[#CCCCCC] text-xs">No sources yet — ask a question first.</p>
        )}
        {uniqueSources.map((src) => (
          <div key={src} className="p-3 rounded-xl bg-[#000000] flex items-center gap-2 text-xs">
            <FileText className="w-4 h-4 text-[#FFFFFF]" />
            <span className="text-[#EDEDED] truncate">{src}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};