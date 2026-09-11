import React from 'react';
import { QueryHistoryItem } from '../types';
import { Search, Settings, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  historyItems: QueryHistoryItem[];
  selectedHistoryId: string | null;
  exampleQueries: string[];
  onSelectQuery: (item: QueryHistoryItem) => void;
  onSelectExample: (query: string) => void;
  onOpenSettings: () => void;
  onFocusInput: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  historyItems,
  selectedHistoryId,
  exampleQueries,
  onSelectQuery,
  onSelectExample,
  onOpenSettings,
  onFocusInput,
}) => {
  return (
    <aside
      className={`bg-[#0c0d12]/95 backdrop-blur-2xl border-r border-[#450a0a]/50 flex flex-col shrink-0 transition-all duration-300 z-20 overflow-hidden ${
        isOpen ? 'w-72' : 'w-0'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0 w-72">
        <div className="p-3 pb-2 space-y-2.5">
          <button
            onClick={onFocusInput}
            type="button"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-maroon-900 via-darkred-800/80 to-red-600/40 hover:from-maroon-800 hover:to-red-600/60 border border-red-500/50 text-white font-medium text-xs transition-all shadow-lg shadow-maroon-950/60 group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#ffc72c]" />
              <span className="tracking-wide text-[13px] font-semibold">Ask a question</span>
            </div>
            <span className="text-[10px] text-amber-200/70 font-mono px-1.5 py-0.5 rounded bg-black/60 border border-amber-500/30">
              ⌘K
            </span>
          </button>
        </div>

        <div className="px-3 py-2">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#ffc72c]" /> Try asking
          </div>
          <div className="space-y-1.5 mt-1">
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => onSelectExample(q)}
                type="button"
                className="w-full text-left px-3 py-2 rounded-xl bg-black/40 border border-white/[0.06] hover:border-[#ffc72c]/40 text-slate-300 hover:text-white text-[11.5px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scroll text-xs">
          {historyItems.length > 0 && (
            <div className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              History
            </div>
          )}
          {historyItems.map((item) => {
            const isSelected = selectedHistoryId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectQuery(item)}
                type="button"
                className={`w-full text-left px-3 py-2 rounded-2xl transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-r from-maroon-950/80 to-black/60 border border-red-600/30 text-white'
                    : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="truncate font-medium text-[11.5px]">{item.title}</div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#450a0a]/50 bg-[#0a0b0f]/90">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 via-maroon-800 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-red-500/30">
                RAS
              </div>
              <div className="overflow-hidden">
                <div className="font-medium text-xs text-slate-100 truncate">IEEE RAS VIT Chennai</div>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};