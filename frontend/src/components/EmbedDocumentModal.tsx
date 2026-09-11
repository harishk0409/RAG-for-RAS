import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Database } from 'lucide-react';

interface EmbedDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileName: string, chunksCount: number) => void;
}

export const EmbedDocumentModal: React.FC<EmbedDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRepo, setTargetRepo] = useState('ares-iv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartEmbedding = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(15);

    setTimeout(() => {
      setProgress(45);
      setTimeout(() => {
        setProgress(85);
        setTimeout(() => {
          setProgress(100);
          setIsProcessing(false);
          const chunks = Math.floor(Math.random() * 400 + 120);
          onSuccess(selectedFile.name, chunks);
          onClose();
        }, 500);
      }, 600);
    }, 500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0f1017] border border-maroon-800/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm text-white">Embed Document / Log</h2>
              <p className="text-xs text-slate-400 font-mono">
                Parse, split, and vectorize into Milvus collection
              </p>
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

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs font-mono">
          {/* Target Collection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              TARGET VECTOR REPOSITORY
            </label>
            <select
              value={targetRepo}
              onChange={(e) => setTargetRepo(e.target.value)}
              className="w-full bg-[#13141d] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="ares-iv">Ares-IV Schematics (18.4k vectors)</option>
              <option value="can-telemetry">CAN Telemetry 2024 (42.1k vectors)</option>
              <option value="ros2-nav2">ROS2 Nav2/MoveIt (9.2k vectors)</option>
              <option value="ieee-standards">IEEE Robotics Stds (12.8k vectors)</option>
            </select>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-maroon-800/70 hover:border-red-500/80 rounded-2xl p-6 text-center bg-[#13141d]/50 hover:bg-[#13141d] transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer"
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.csv,.json,.yaml,.xml,.stp,.bag,.mcap"
            />

            <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center text-[#ffc72c]">
              <FileText className="w-5 h-5" />
            </div>

            {selectedFile ? (
              <div className="text-slate-200">
                <span className="font-bold text-white">{selectedFile.name}</span>
                <span className="text-slate-400 block text-[10px]">
                  ({(selectedFile.size / 1024).toFixed(1)} KB) — Ready to chunk
                </span>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-200">Click or drag &amp; drop files here</p>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Supports CAD Schematics (.pdf, .stp), CAN logs (.csv), ROS2 logs (.bag)
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ffc72c]" />
                  bge-m3-large embedding ({progress}%)
                </span>
                <span className="text-[#ffc72c] font-bold">1024d Dense + BM25</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 via-amber-500 to-[#ffc72c] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!selectedFile || isProcessing}
              onClick={handleStartEmbedding}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-maroon-800 via-red-600 to-amber-500 text-white font-medium shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Vector Embeddings...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Embed Document into Milvus</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
