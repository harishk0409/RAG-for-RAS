import React, { useState } from 'react';
import { ChunkCitation } from '../types';
import {
  BarChart3,
  X,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Table,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

interface KnowAdvancedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citations: ChunkCitation[];
  onSync: () => void;
}

export const KnowAdvancedDrawer: React.FC<KnowAdvancedDrawerProps> = ({
  isOpen,
  onClose,
  citations,
  onSync,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'sources' | 'pipeline'>('metrics');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0c0d13]/98 border-l border-[#450a0a]/60 h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-maroon-800 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm text-white">Know Advanced Telemetry</h2>
              <div className="text-[10px] font-mono text-[#ffc72c]">
                Retrieval Weights • Vectors • Grounded Citations
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] px-4 text-xs font-mono bg-black/30">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-2.5 font-semibold transition-colors ${
              activeTab === 'metrics'
                ? 'text-[#ffc72c] border-b-2 border-[#ffc72c]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Metrics &amp; Thresholds
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-2.5 font-semibold transition-colors ${
              activeTab === 'sources'
                ? 'text-[#ffc72c] border-b-2 border-[#ffc72c]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Grounded Chunks ({citations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-2.5 font-semibold transition-colors ${
              activeTab === 'pipeline'
                ? 'text-[#ffc72c] border-b-2 border-[#ffc72c]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pipeline Architecture
          </button>
        </div>

        {/* Tab 1: Metrics & Thresholds */}
        {activeTab === 'metrics' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scroll text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-maroon-850/50">
                <div className="text-[10px] text-slate-400">MILVUS INDEX TOTAL</div>
                <div className="text-lg font-bold text-white mt-0.5">482,190</div>
                <div className="text-[10px] text-emerald-400">HNSW Indexed · Cosine Metric</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-maroon-850/50">
                <div className="text-[10px] text-slate-400">EMBEDDING DIMENSION</div>
                <div className="text-lg font-bold text-[#ffc72c] mt-0.5">1024d</div>
                <div className="text-[10px] text-slate-400">bge-m3-large (Dense + Sparse)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12131b] border border-maroon-850/60 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>RETRIEVAL VERIFICATION MATRIX</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ffc72c]/20 text-[#ffc72c] text-[10px] font-bold">
                  98.4% Confidence
                </span>
              </div>

              <div className="space-y-2.5 pt-1 text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Dense Vector Cosine Similarity (thr &gt;= 0.82)</span>
                    <span className="text-white font-semibold">0.988</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 via-crimson-500 to-[#ffc72c] h-full rounded-full"
                      style={{ width: '98.8%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>BM25 Keyword Overlap (Sparse)</span>
                    <span className="text-white font-semibold">0.912</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-maroon-700 via-red-500 to-[#ffc72c] h-full rounded-full"
                      style={{ width: '91.2%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Cross-Encoder Reranker Delta (Cohere-v3)</span>
                    <span className="text-emerald-400 font-semibold">+0.241</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 h-full rounded-full"
                      style={{ width: '88%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Hardware Pinout Graph Consistency</span>
                    <span className="text-white font-semibold">97.2%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-maroon-800 via-red-500 to-[#ffc72c] h-full rounded-full"
                      style={{ width: '97.2%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10.5px] text-slate-400">
                <span>Hallucination Guardrails:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 0 Unbounded Tokens Passed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Grounded Chunks */}
        {activeTab === 'sources' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scroll text-xs">
            {citations.map((chk) => (
              <div
                key={chk.id}
                className="p-3.5 rounded-2xl bg-[#13141d] border border-maroon-850/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {chk.file.endsWith('.pdf') ? (
                      <FileText className="w-4 h-4 text-red-400" />
                    ) : (
                      <Table className="w-4 h-4 text-[#ffc72c]" />
                    )}
                    <span className="font-medium text-white text-[12px]">{chk.file}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#ffc72c]/15 text-[#ffc72c] font-mono text-[10px] font-bold">
                    sim: {chk.similarity.toFixed(3)}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#ffc72c]">
                  Chunk ID: {chk.chunkId} · {chk.section}
                </div>
                <p className="text-slate-300 text-[11px] font-mono bg-black/30 p-2 rounded-xl">
                  {chk.excerpt}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Pipeline Architecture */}
        {activeTab === 'pipeline' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scroll text-xs font-mono text-slate-300">
            <div className="p-3.5 rounded-2xl bg-[#12131b] border border-maroon-850/50 space-y-2">
              <div className="text-[#ffc72c] font-bold text-[11px]">
                STAGE 1: SPLADE Sparse + Dense BGE-M3
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Parallel dual-stream query encoding separating mechanical hardware codes (e.g. 0x3F2,
                CAN_ID) from semantic engineering queries.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12131b] border border-maroon-850/50 space-y-2">
              <div className="text-[#ffc72c] font-bold text-[11px]">
                STAGE 2: Cross-Encoder Recency Reranking
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Top 84 Milvus candidate chunks pruned down to 5 high-density context slices via
                Cohere-v3 reranker with physical telemetry priority.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12131b] border border-maroon-850/50 space-y-2">
              <div className="text-emerald-400 font-bold text-[11px]">
                STAGE 3: Injected Grounding Context (temp: 0.0)
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Deterministic citation grounding with 0 temperature enforcement against schematics
                and CAN log frames. Zero unbounded assertions permitted.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0a0b0f]/90">
          <button
            type="button"
            onClick={onSync}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-maroon-800 via-red-600 to-amber-500 text-white font-mono text-xs font-semibold shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Vector Repositories</span>
          </button>
        </div>
      </div>
    </div>
  );
};
