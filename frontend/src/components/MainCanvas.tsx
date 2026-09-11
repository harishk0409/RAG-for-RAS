import React, { useRef, useEffect, useState } from 'react';
import { RagState, ConversationTurn } from '../types';
import { CheckCircle, ArrowUp } from 'lucide-react';

interface MainCanvasProps {
  ragState: RagState;
  conversation: ConversationTurn[];
  inputQuery: string;
  isLoading: boolean;
  errorMessage: string | null;
  onInputChange: (val: string) => void;
  onSubmitQuery: () => void;
  onToggleSourcesPanel: () => void;
}

function TypingAnswer({ text, msPerWord = 45 }: { text: string; msPerWord?: number }) {
  const [shownCount, setShownCount] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    console.log('[TypingAnswer] mounted, text length:', words.length, 'words');
    setShownCount(0);
    let raf: number;
    let last = performance.now();
    let acc = 0;
    let idx = 0;

    const step = (now: number) => {
      acc += now - last;
      last = now;
      while (acc >= msPerWord && idx < words.length) {
        idx++;
        acc -= msPerWord;
      }
      setShownCount(idx);
      if (idx < words.length) {
        raf = requestAnimationFrame(step);
      } else {
        console.log('[TypingAnswer] finished');
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  const isTyping = shownCount < words.length;

  return (
    <p>
      {words.slice(0, shownCount).join(' ')}
      {isTyping && (
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 14,
            marginLeft: 2,
            verticalAlign: 'middle',
            background: '#ffc72c',
          }}
          className="animate-pulse"
        />
      )}
    </p>
  );
}

export const MainCanvas: React.FC<MainCanvasProps> = ({
  ragState,
  conversation,
  inputQuery,
  isLoading,
  errorMessage,
  onInputChange,
  onSubmitQuery,
  onToggleSourcesPanel,
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmitQuery();
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 relative h-full">
      <div
        ref={scrollerRef}
        id="chat-scroller"
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 space-y-6 max-w-4xl mx-auto w-full custom-scroll"
      >
        {conversation.length === 0 && !isLoading && (
          <div className="flex flex-col justify-center items-center text-center px-4 py-16 sm:py-20 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-maroon-950/80 text-red-200 font-mono text-xs backdrop-blur-sm shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#ffc72c] animate-pulse" />
              <span>IEEE RAS Assistant</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-white leading-tight">
              Ask me about{' '}
              <span className="bg-gradient-to-r from-red-500 via-[#ffc72c] to-amber-300 bg-clip-text text-transparent font-bold">
                IEEE RAS
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed font-mono">
              I've read through our event recaps, workshops, and hackathons — ask away.
            </p>
          </div>
        )}

        {conversation.map((turn, idx) => (
          <div key={turn.id} className="space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-maroon-900/70 text-white text-sm">
                {turn.query}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#12141c]/95 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#ffc72c]" />
                  <span className="font-headline font-semibold text-sm text-white">Answer</span>
                </div>
              </div>
              <div className="text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3">
                {idx === conversation.length - 1 ? (
                  <TypingAnswer text={turn.answer} />
                ) : (
                  <p>{turn.answer}</p>
                )}
                {turn.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10.5px]">
                    <span className="text-slate-400">Sources:</span>
                    {[...new Set(turn.sources)].map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-black/40 text-[#ffc72c] font-mono"
                      >
                        📄 {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3.5 rounded-2xl bg-[#111218]/90 backdrop-blur-md flex items-center gap-2.5 font-mono text-xs shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffc72c] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-slate-300 font-medium">Scanning event archive...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 text-red-200 text-sm">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 bg-gradient-to-t from-[#0a0b0e] via-[#0a0b0e]/95 to-transparent relative z-20 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-[#13151d]/95 shadow-2xl backdrop-blur-2xl p-3 sm:p-3.5 transition-all">
            <textarea
              ref={inputRef}
              id="user-chat-input"
              rows={2}
              value={inputQuery}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about IEEE RAS events, workshops, or how to join..."
              className="w-full bg-transparent border-0 resize-none text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:ring-0 px-2 py-1 focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-end pt-2 px-1">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[11px] font-mono text-slate-500">Send ↵</span>
                <button
                  onClick={onSubmitQuery}
                  disabled={isLoading}
                  type="button"
                  title="Send"
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-maroon-800 via-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-maroon-950/80 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};