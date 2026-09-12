import React from 'react';
import { RagState } from '../types';
import { Menu, Sliders, RotateCw, FileText } from 'lucide-react';

interface TopHeaderProps {
  ragState: RagState;
  onSelectRagState: (state: RagState) => void;
  onToggleSidebar: () => void;
  onOpenSources: () => void;
  onOpenVisualSettings: () => void;
  onResetWorkspace: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  onOpenSources,
  onOpenVisualSettings,
  onResetWorkspace,
}) => {
  return (
    <header className="h-14 bg-[#000000] backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-30 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#000000] transition-colors"
          title="Toggle sidebar"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img
            src="/ieee-ras-logo.png"
            alt="IEEE RAS Logo"
            className="h-8 w-auto"
          />
          <span className="font-headline font-bold text-sm text-[#EDEDED] tracking-wide">
            RAG FOR RAS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono">
        <button
          onClick={onOpenSources}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#000000] hover:bg-[#262626] text-[#CCCCCC] hover:text-[#EDEDED] font-medium transition-all"
        >
          <FileText className="w-4 h-4 text-[#FFFFFF]" />
          <span className="hidden sm:inline">Sources</span>
        </button>

        <button
          onClick={onOpenVisualSettings}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#000000] hover:bg-[#262626] text-[#CCCCCC] hover:text-[#EDEDED] transition-all"
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden md:inline">Visuals</span>
        </button>

        <button
          onClick={onResetWorkspace}
          type="button"
          title="New chat"
          className="flex items-center gap-1 p-2 rounded-full text-[#CCCCCC] hover:text-[#EDEDED] bg-[#000000] transition-colors text-[11px]"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};