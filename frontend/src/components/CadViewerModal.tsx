import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Cpu, CheckCircle2 } from 'lucide-react';

interface CadViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  chunkId?: string;
}

export const CadViewerModal: React.FC<CadViewerModalProps> = ({
  isOpen,
  onClose,
  title = 'Ares-IV_Schematic_Rev3.pdf — Page 14',
  chunkId = '#chk-sch-1402',
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeProbe, setActiveProbe] = useState<string | null>('pin12');

  if (!isOpen) return null;

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
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-sm text-white">{title}</h2>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-[#ffc72c]/40 text-[#ffc72c] text-[10px] font-mono font-bold">
                  {chunkId}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Power Distribution &amp; CAN Transceiver MCP2562 Sub-circuit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-full px-2 py-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                className="p-1 hover:text-white text-slate-400"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                className="p-1 hover:text-white text-slate-400"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1 hover:text-white text-slate-400"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CAD Schematic Canvas */}
        <div className="flex-1 bg-[#090a0f] relative overflow-auto p-6 flex items-center justify-center custom-scroll">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 relative bg-[#0d0e14] border border-white/15 rounded-2xl p-8 shadow-2xl min-w-[680px]"
          >
            {/* Blueprint Grid Watermark */}
            <div className="absolute inset-0 blueprint-grid opacity-30 rounded-2xl pointer-events-none" />

            {/* Title Block in Corner */}
            <div className="absolute bottom-4 right-4 p-2.5 bg-black/80 border border-white/15 rounded-lg text-[9px] font-mono text-slate-400 leading-tight">
              <div className="text-white font-bold">PROJECT: ARES-IV 6-DOF RAS</div>
              <div>SHEET: 14 OF 28 (POWERTRAIN)</div>
              <div>REV: 3.2.1-B (DBC_0x3F2)</div>
            </div>

            {/* Circuit Diagram SVG */}
            <svg viewBox="0 0 620 340" className="w-[620px] h-[340px] text-slate-200">
              <defs>
                <linearGradient id="activeTrace" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#ffc72c" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* LDO Regulator IC U12 */}
              <rect x="50" y="70" width="130" height="90" rx="6" fill="#151620" stroke="#ffc72c" strokeWidth="1.5" />
              <text x="115" y="100" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                U12: TPS7A47
              </text>
              <text x="115" y="118" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                Ultra-Low Noise LDO
              </text>
              <text x="115" y="136" fill="#10b981" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                VOUT: 3.30V (Trip 2.85V)
              </text>

              {/* Supply Rails */}
              <line x1="10" y1="115" x2="50" y2="115" stroke="#ef4444" strokeWidth="2" />
              <text x="12" y="108" fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono">VIN 12V</text>

              {/* LDO to CAN Transceiver VCC_IO Trace */}
              <path
                d="M 180 115 L 260 115 L 260 180 L 330 180"
                fill="none"
                stroke="url(#activeTrace)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <circle cx="260" cy="115" r="4" fill="#ffc72c" />
              <text x="268" y="145" fill="#ffc72c" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono">
                VCC_IO (3.3V)
              </text>

              {/* CAN Transceiver IC U14 */}
              <rect x="330" y="120" width="150" height="140" rx="8" fill="#161724" stroke="#dc2626" strokeWidth="1.8" />
              <text x="405" y="145" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                U14: MCP2562
              </text>
              <text x="405" y="160" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                High-Speed CAN FD
              </text>

              {/* Pin Connections */}
              <g fontFamily="JetBrains Mono" fontSize="9">
                <line x1="300" y1="180" x2="330" y2="180" stroke="#ffc72c" strokeWidth="2" />
                <text x="335" y="184" fill="#ffc72c" fontWeight="bold">PIN 5: VIO (3.3V)</text>

                <line x1="300" y1="205" x2="330" y2="205" stroke="#64748b" strokeWidth="1.5" />
                <text x="335" y="209" fill="#94a3b8">PIN 1: TXD (CAN_TX)</text>

                <line x1="300" y1="230" x2="330" y2="230" stroke="#64748b" strokeWidth="1.5" />
                <text x="335" y="234" fill="#94a3b8">PIN 4: RXD (CAN_RX)</text>

                <line x1="480" y1="175" x2="520" y2="175" stroke="#3b82f6" strokeWidth="2" />
                <text x="440" y="179" fill="#38bdf8" textAnchor="end">PIN 7: CANH</text>
                <text x="525" y="179" fill="#38bdf8">CAN_H Bus</text>

                <line x1="480" y1="210" x2="520" y2="210" stroke="#3b82f6" strokeWidth="2" />
                <text x="440" y="214" fill="#38bdf8" textAnchor="end">PIN 6: CANL</text>
                <text x="525" y="214" fill="#38bdf8">CAN_L Bus</text>
              </g>

              {/* Probe Highlight Box */}
              <rect x="235" y="95" width="100" height="40" rx="4" fill="#000000" stroke="#ffc72c" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
              <text x="245" y="112" fill="#ffc72c" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
                PROBE #CHK-1402
              </text>
              <text x="245" y="126" fill="#ffffff" fontSize="8.5" fontFamily="JetBrains Mono">
                Nom: 3.30V | Trip: 2.85V
              </text>
            </svg>
          </div>
        </div>

        {/* Footer Technical Breakdown */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#0b0c11] flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-[#ffc72c]" />
            <span>
              Grounding Verification: MCP2562 VIO rail verified against Rev3 PCB layout layer 2.
            </span>
          </div>
          <span className="text-emerald-400 font-bold">MILVUS_VERIFIED_CHUNK_1402</span>
        </div>
      </div>
    </div>
  );
};
