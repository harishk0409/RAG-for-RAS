import React, { useState, useRef, useEffect } from 'react';
import { QueryHistoryItem } from '../types';
import { Search, Settings, Sparkles, MoreVertical, Trash2, Link2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  historyItems: QueryHistoryItem[];
  selectedHistoryId: string | null;
  exampleQueries: string[];
  onSelectQuery: (item: QueryHistoryItem) => void;
  onSelectExample: (query: string) => void;
  onOpenSettings: () => void;
  onFocusInput: () => void;
  onNewChat: () => void;
  onDeleteQuery: (id: string) => void;
  onShareQuery: (item: QueryHistoryItem) => void;
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
  onNewChat,
  onDeleteQuery,
  onShareQuery,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <aside
      className={`bg-[#000000] backdrop-blur-2xl flex flex-col shrink-0 transition-all duration-300 z-20 overflow-hidden ${
        isOpen ? 'w-72' : 'w-0'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0 w-72">
        <div className="p-3 pb-2 space-y-2.5">
          <button
            onClick={onNewChat}
            type="button"
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1F1F1F] hover:bg-[#262626] text-[#EDEDED] font-medium text-xs transition-all mb-2"
          >
            <span className="text-lg leading-none">+</span>
            <span>New chat</span>
          </button>
          <button
            onClick={onFocusInput}
            type="button"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#000000] hover:bg-[#262626] text-[#EDEDED] font-medium text-xs transition-all shadow-lg group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#FFFFFF]" />
              <span className="tracking-wide text-[13px] font-semibold">Ask a question</span>
            </div>
            <span className="text-[10px] text-[#CCCCCC] font-mono px-1.5 py-0.5 rounded bg-[#000000]">
              ⌘K
            </span>
          </button>
        </div>

        <div className="px-3 py-2">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#CCCCCC] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#FFFFFF]" /> Try asking
          </div>
          <div className="space-y-1.5 mt-1">
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => onSelectExample(q)}
                type="button"
                className="w-full text-left px-3 py-2 rounded-xl bg-[#000000] hover:bg-[#262626] text-[#CCCCCC] hover:text-[#EDEDED] text-[11.5px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scroll text-xs">
          {historyItems.length > 0 && (
            <div className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#CCCCCC] font-semibold">
              History
            </div>
          )}
          {historyItems.map((item) => {
            const isSelected = selectedHistoryId === item.id;
            const isMenuOpen = openMenuId === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSelectQuery(item)}
                  type="button"
                  className={`w-full text-left pl-3 pr-8 py-2 rounded-2xl transition-colors ${
                    isSelected
                      ? 'bg-[#000000] border-l-2 border-[#FFFFFF] text-[#EDEDED]'
                      : 'hover:bg-[#000000] text-[#CCCCCC] hover:text-[#EDEDED]'
                  }`}
                >
                  <div className="truncate font-medium text-[11.5px] copyable-text">{item.title}</div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : item.id);
                  }}
                  type="button"
                  title="More options"
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#262626] transition-opacity ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-1.5 top-8 z-30 w-36 rounded-xl bg-[#1a1a1a] shadow-2xl py-1 text-xs"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareQuery(item);
                        setOpenMenuId(null);
                      }}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-[#EDEDED] hover:bg-[#262626] transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Share as link</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteQuery(item.id);
                        setOpenMenuId(null);
                      }}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-[#262626] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-[#000000]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-[#FFFFFF] font-bold text-xs">
                RAS
              </div>
              <div className="overflow-hidden">
                <div className="font-medium text-xs text-[#EDEDED] truncate copyable-text">IEEE RAS VIT Chennai</div>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              type="button"
              className="p-1.5 rounded-lg text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#000000] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};