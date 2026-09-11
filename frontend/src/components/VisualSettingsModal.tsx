import React from 'react';
import { VisualSettings } from '../types';
import { Sliders, X, Check } from 'lucide-react';

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
        className="relative w-full max-w-lg bg-[#0f1017] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-maroon-900/50 flex items-center justify-center text-red-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-semibold text-sm text-white">Visual Settings</h2>
              <p className="text-xs text-slate-400">Toggle cursor and background effects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-semibold">Hexapod cursor</label>
            <button
              type="button"
              onClick={() => onUpdateSettings({ hexapodCursorEnabled: !settings.hexapodCursorEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.hexapodCursorEnabled ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.hexapodCursorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-semibold">Background scan effect</label>
            <button
              type="button"
              onClick={() => onUpdateSettings({ scanlineEnabled: !settings.scanlineEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.scanlineEnabled ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.scanlineEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-maroon-800 via-red-600 to-amber-500 text-white font-medium shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};