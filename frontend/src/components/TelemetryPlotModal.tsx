import React, { useState } from 'react';
import { X, Activity, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

interface TelemetryPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  chunkId?: string;
}

export const TelemetryPlotModal: React.FC<TelemetryPlotModalProps> = ({
  isOpen,
  onClose,
  title = 'CAN_Log_2024-04-12.csv — Frame 0x3F2',
  chunkId = '#chk-can-0842',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(14);

  if (!isOpen) return null;

  // 30 sample points representing T+14:00 to T+14:30
  const telemetryData = [
    { t: '14:00', current: 2.1, voltage: 24.2, incline: 4.2 },
    { t: '14:02', current: 2.2, voltage: 24.1, incline: 6.1 },
    { t: '14:04', current: 2.3, voltage: 24.1, incline: 8.5 },
    { t: '14:06', current: 2.5, voltage: 24.0, incline: 11.0 },
    { t: '14:08', current: 2.8, voltage: 23.9, incline: 13.2 },
    { t: '14:10', current: 3.1, voltage: 23.8, incline: 14.5 },
    { t: '14:12', current: 3.6, voltage: 23.7, incline: 15.0 },
    { t: '14:13', current: 4.4, voltage: 23.5, incline: 15.2 },
    { t: '14:14', current: 5.12, voltage: 23.1, incline: 15.2, isSpike: true }, // PEAK SPIKE
    { t: '14:15', current: 4.85, voltage: 23.2, incline: 15.1 },
    { t: '14:16', current: 4.2, voltage: 23.4, incline: 15.0 },
    { t: '14:18', current: 3.8, voltage: 23.6, incline: 14.8 },
    { t: '14:20', current: 3.2, voltage: 23.8, incline: 13.5 },
    { t: '14:22', current: 2.7, voltage: 23.9, incline: 10.2 },
    { t: '14:24', current: 2.4, voltage: 24.0, incline: 7.0 },
    { t: '14:26', current: 2.2, voltage: 24.1, incline: 5.0 },
    { t: '14:28', current: 2.1, voltage: 24.1, incline: 4.0 },
    { t: '14:30', current: 2.0, voltage: 24.2, incline: 3.8 },
  ];

  const activePoint = hoverIndex !== null ? telemetryData[hoverIndex] : telemetryData[8];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0e1017] border border-maroon-800/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#ffc72c]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-sm text-white">{title}</h2>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-[#ffc72c]/40 text-[#ffc72c] text-[10px] font-mono font-bold">
                  {chunkId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                High-rate CAN DBC telemetry stream: Powertrain Phase Current vs Incline Angle
              </p>
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

        {/* Live Readout Cards */}
        <div className="px-6 py-3 border-b border-white/[0.08] bg-[#0c0d13] grid grid-cols-4 gap-3 shrink-0 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
            <span className="text-slate-400 text-[10px]">TIME OFFSET</span>
            <div className="text-white font-bold text-sm">T+{activePoint.t}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-red-500/30">
            <span className="text-red-400 text-[10px]">PHASE CURRENT (A)</span>
            <div className={`font-bold text-sm ${activePoint.current > 4.8 ? 'text-red-400' : 'text-white'}`}>
              {activePoint.current.toFixed(2)} A
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
            <span className="text-slate-400 text-[10px]">BUS VOLTAGE</span>
            <div className="text-emerald-400 font-bold text-sm">{activePoint.voltage.toFixed(1)} V</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/30">
            <span className="text-amber-400 text-[10px]">TERRAIN INCLINE</span>
            <div className="text-[#ffc72c] font-bold text-sm">{activePoint.incline.toFixed(1)}°</div>
          </div>
        </div>

        {/* Waveform Canvas */}
        <div className="flex-1 bg-[#090a0f] relative overflow-hidden p-6 flex flex-col justify-center">
          <div className="relative w-full h-64 bg-[#0d0e14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            {/* 4.8A Continuous Limit Line */}
            <div className="absolute top-[26%] left-0 right-0 border-b border-dashed border-red-500/60 flex items-center justify-between px-3 text-[10px] font-mono text-red-400 pointer-events-none">
              <span>TMC5160 Continuous Thermal Limit (4.80A)</span>
              <span>TRIP_THR: 120ms</span>
            </div>

            {/* 2.0A Baseline Line */}
            <div className="absolute top-[80%] left-0 right-0 border-b border-white/5 flex items-center px-3 text-[10px] font-mono text-slate-500 pointer-events-none">
              <span>Baseline Idling (2.0A)</span>
            </div>

            {/* Plot SVG */}
            <svg viewBox="0 0 700 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="plotGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                points="
                  20,180
                  60,175 100,170 140,165 180,150 220,135 260,110 300,70
                  340,30
                  380,50 420,80 460,110 500,135 540,160 580,172 620,178 660,182
                  660,210 20,210
                "
                fill="url(#plotGrad)"
              />

              {/* Waveform line */}
              <polyline
                fill="none"
                stroke="#ffc72c"
                strokeWidth="2.5"
                points="
                  20,180
                  60,175 100,170 140,165 180,150 220,135 260,110 300,70
                  340,30
                  380,50 420,80 460,110 500,135 540,160 580,172 620,178 660,182
                "
              />

              {/* Peak marker at T+14:14 */}
              <circle cx="340" cy="30" r="6" fill="#ef4444" className="animate-pulse" />
              <circle cx="340" cy="30" r="12" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
              <text x="350" y="24" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono">
                5.12A Peak Spike (T+14:14)
              </text>
            </svg>

            {/* Interactive Timeline Hover Scrubbers */}
            <div className="absolute inset-x-4 inset-y-4 flex items-stretch">
              {telemetryData.map((d, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoverIndex(i)}
                  className="flex-1 hover:bg-white/[0.04] cursor-crosshair transition-colors relative group"
                >
                  {hoverIndex === i && (
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/40 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Callout Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#0b0c11] flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              TMC5160 Safe Operation Limit: Peak 5.12A spike lasted 84ms (&lt; 120ms threshold). No thermal trip triggered.
            </span>
          </div>
          <span className="text-emerald-400 font-bold">STATUS: COMPLIANT</span>
        </div>
      </div>
    </div>
  );
};
