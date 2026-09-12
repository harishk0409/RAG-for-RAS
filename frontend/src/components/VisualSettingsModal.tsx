import React from 'react';
import { VisualSettings } from '../types';
import { Sliders, X, Check, MousePointer2, Bot, Sun, Moon } from 'lucide-react';

interface VisualSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VisualSettings;
  onUpdateSettings: (newSettings: Partial<VisualSettings>) => void;
}

export const VisualSettingsModal: React.FC<VisualSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#000000] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between bg-[#000000]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-[#FFFFFF]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-semibold text-sm text-[#EDEDED]">Visual Settings</h2>
              <p className="text-xs text-[#CCCCCC]">Choose cursor style and theme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-full text-[#CCCCCC] hover:text-[#EDEDED] hover:bg-[#262626] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs font-mono">
          <div className="space-y-2.5">
            <label className="text-[#EDEDED] font-semibold">Cursor type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ cursorType: 'normal' })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${
                  settings.cursorType === 'normal'
                    ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]'
                    : 'bg-[#000000] text-[#CCCCCC] border-[#3a3a3a] hover:bg-[#1a1a1a]'
                }`}
              >
                <MousePointer2 className="w-3.5 h-3.5" />
                <span>Normal</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ cursorType: 'bot' })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${
                  settings.cursorType === 'bot'
                    ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]'
                    : 'bg-[#000000] text-[#CCCCCC] border-[#3a3a3a] hover:bg-[#1a1a1a]'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Bot</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[#EDEDED] font-semibold">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]'
                    : 'bg-[#000000] text-[#CCCCCC] border-[#3a3a3a] hover:bg-[#1a1a1a]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-[#FFFFFF] text-[#000000] border-[#FFFFFF]'
                    : 'bg-[#000000] text-[#CCCCCC] border-[#3a3a3a] hover:bg-[#1a1a1a]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#FFFFFF] text-[#000000] font-medium shadow-md hover:brightness-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};