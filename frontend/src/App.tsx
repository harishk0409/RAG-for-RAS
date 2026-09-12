import React, { useState, useEffect, useRef } from 'react';
import { RagState, RagResponseData, QueryHistoryItem, VisualSettings, ConversationTurn } from './types';

import { LiveRagBackground } from './components/LiveRagBackground';
import { HexapodCursorLayer } from './components/HexapodCursorLayer';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { MainCanvas } from './components/MainCanvas';
import { SourcesPanel } from './components/SourcesPanel';
import { VisualSettingsModal } from './components/VisualSettingsModal';

import { CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const EXAMPLE_QUERIES: string[] = [
  'What events has IEEE RAS organized recently?',
  'Tell me about the ESP32 workshop',
  'How can I get involved with IEEE RAS?',
  'What happened at the AWS DeepRacer event?',
];

export default function App() {
  const [ragState, setRagState] = useState<RagState>('idle');
  const [inputQuery, setInputQuery] = useState('');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sourcesPanelOpen, setSourcesPanelOpen] = useState(false);
  const [visualSettingsOpen, setVisualSettingsOpen] = useState(false);

  const [historyItems, setHistoryItems] = useState<QueryHistoryItem[]>([]);
  const currentChatIdRef = useRef<string | null>(null);
  // Guards against double-submit (e.g. Enter + click firing almost
  // simultaneously). A ref updates synchronously, unlike state, so the
  // second call sees the block immediately instead of a stale isLoading.
  const isSendingRef = useRef(false);

  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    palette: 'maroon-gold',
    cursorType: 'bot',
    theme: 'dark',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        const input = document.getElementById('user-chat-input');
        if (input) {
          input.focus();
          showToast('Query box focused (⌘K)');
        }
      }
      if (e.key === 'Escape') {
        setVisualSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const runQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isSendingRef.current) return;
    isSendingRef.current = true;

    setErrorMessage(null);
    setRagState('search');
    setIsLoading(true);
    showToast('Searching the RAS archive...');

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      if (!data || typeof data.answer !== 'string') throw new Error('Malformed response');

      const newTurn: ConversationTurn = {
        id: `turn-${Date.now()}`,
        query: trimmed,
        answer: data.answer,
        sources: Array.isArray(data.sources) ? data.sources : [],
        animate: true,
      };

      // Functional update: always builds on the true latest conversation
      // state rather than a possibly-stale closure variable, so a second
      // overlapping call can never silently overwrite the first turn.
      setConversation((prevConversation) => {
        const isFirstMessageOfChat = prevConversation.length === 0;
        const updatedConversation = [...prevConversation, newTurn];

        if (isFirstMessageOfChat) {
          const chatId = `chat-${Date.now()}`;
          currentChatIdRef.current = chatId;
          const newItem: QueryHistoryItem = {
            id: chatId,
            title: trimmed.length > 42 ? trimmed.slice(0, 42) + '...' : trimmed,
            turns: updatedConversation,
            dateGroup: 'Today',
          };
          setHistoryItems((prev: QueryHistoryItem[]) => [newItem, ...prev].slice(0, 8));
          setSelectedHistoryId(chatId);
        } else if (currentChatIdRef.current) {
          const chatId = currentChatIdRef.current;
          setHistoryItems((prev: QueryHistoryItem[]) =>
            prev.map((h) => (h.id === chatId ? { ...h, turns: updatedConversation } : h))
          );
        }

        return updatedConversation;
      });

      setRagState('response');
      setInputQuery('');
    } catch (err) {
      setErrorMessage("Couldn't reach the assistant just now. Try again in a moment.");
      setRagState(conversation.length > 0 ? 'response' : 'idle');
      showToast('Something went wrong');
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleSelectQuery = (item: QueryHistoryItem) => {
    setSelectedHistoryId(item.id);
    currentChatIdRef.current = item.id;
    setInputQuery('');
    setConversation(item.turns.map((t) => ({ ...t, animate: false })));
    setRagState('response');
  };

  const handleSubmitQuery = () => {
    const trimmed = inputQuery.trim();
    if (!trimmed) {
      showToast('Please enter a question');
      return;
    }
    runQuery(trimmed);
  };

  const handleResetWorkspace = () => {
    currentChatIdRef.current = null;
    setRagState('idle');
    setInputQuery('');
    setConversation([]);
    setSelectedHistoryId(null);
    setErrorMessage(null);
    showToast('New chat started');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedHistoryId === id) {
      handleResetWorkspace();
    }
    showToast('Chat deleted');
  };

  const handleShareHistoryItem = async (item: QueryHistoryItem) => {
    const shareText = item.turns
      .map((t) => `Q: ${t.query}\n\nA: ${t.answer}`)
      .join('\n\n---\n\n');
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Copied to clipboard');
    } catch (err) {
      showToast("Couldn't copy — try again");
    }
  };

  return (
    <div
      className={`h-full flex flex-col antialiased text-[#EDEDED] bg-[#000000] relative overflow-hidden ${
        visualSettings.cursorType === 'bot' ? 'hexapod-cursor-enabled' : ''
      } ${visualSettings.theme === 'light' ? 'theme-light' : 'theme-dark'}`}
    >
      <LiveRagBackground />
      <HexapodCursorLayer enabled={visualSettings.cursorType === 'bot'} theme={visualSettings.theme} />

      <TopHeader
        ragState={ragState}
        onSelectRagState={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSources={() => setSourcesPanelOpen((prev) => !prev)}
        onOpenVisualSettings={() => setVisualSettingsOpen(true)}
        onResetWorkspace={handleResetWorkspace}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar
          onNewChat={handleResetWorkspace}
          isOpen={sidebarOpen}
          historyItems={historyItems}
          selectedHistoryId={selectedHistoryId}
          exampleQueries={EXAMPLE_QUERIES}
          onSelectQuery={handleSelectQuery}
          onSelectExample={(q) => { setInputQuery(q); runQuery(q); }}
          onOpenSettings={() => setVisualSettingsOpen(true)}
          onDeleteQuery={handleDeleteHistoryItem}
          onShareQuery={handleShareHistoryItem}
          onFocusInput={() => {
            const input = document.getElementById('user-chat-input');
            if (input) { input.focus(); showToast('Query box active'); }
          }}
        />

        <MainCanvas
          ragState={ragState}
          conversation={conversation}
          inputQuery={inputQuery}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onInputChange={setInputQuery}
          onSubmitQuery={handleSubmitQuery}
          onToggleSourcesPanel={() => setSourcesPanelOpen((prev) => !prev)}
        />

        <SourcesPanel
          isOpen={sourcesPanelOpen}
          onClose={() => setSourcesPanelOpen(false)}
          sources={conversation.length > 0 ? conversation[conversation.length - 1].sources : []}
        />
      </div>

      <VisualSettingsModal
        isOpen={visualSettingsOpen}
        onClose={() => setVisualSettingsOpen(false)}
        settings={visualSettings}
        onUpdateSettings={(newSettings) => {
          setVisualSettings((prev) => ({ ...prev, ...newSettings }));
          showToast('Visual preferences updated');
        }}
      />

      {toastMessage && (
        <div
          id="app-toast"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-[#000000] text-[#EDEDED] text-xs shadow-2xl z-50 flex items-center gap-2 animate-fadeIn font-mono"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}