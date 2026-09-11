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

  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    palette: 'maroon-gold',
    hexapodCursorEnabled: true,
    scanlineEnabled: true,
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
    if (!trimmed || isLoading) return;

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
      };

      const isFirstMessageOfChat = conversation.length === 0;

      setConversation((prev) => [...prev, newTurn]);
      setRagState('response');
      setInputQuery('');

      if (isFirstMessageOfChat) {
        const chatId = `chat-${Date.now()}`;
        currentChatIdRef.current = chatId;
        const newItem: QueryHistoryItem = {
          id: chatId,
          title: trimmed.length > 42 ? trimmed.slice(0, 42) + '...' : trimmed,
          query: trimmed,
          responseData: { answer: data.answer, sources: newTurn.sources },
          dateGroup: 'Today',
        };
        setHistoryItems((prev: QueryHistoryItem[]) => [newItem, ...prev].slice(0, 8));
        setSelectedHistoryId(chatId);
      }
    } catch (err) {
      setErrorMessage("Couldn't reach the assistant just now. Try again in a moment.");
      setRagState(conversation.length > 0 ? 'response' : 'idle');
      showToast('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuery = (item: QueryHistoryItem) => {
    setSelectedHistoryId(item.id);
    currentChatIdRef.current = item.id;
    setInputQuery(item.query);
    setConversation((prev) => [
      ...prev,
      { id: item.id, query: item.query, answer: item.responseData.answer, sources: item.responseData.sources },
    ]);
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

  return (
    <div
      className={`h-full flex flex-col antialiased select-none text-slate-200 bg-[#0a0b0e] relative overflow-hidden ${
        visualSettings.hexapodCursorEnabled ? 'hexapod-cursor-enabled' : ''
      }`}
    >
      <LiveRagBackground />
      <HexapodCursorLayer enabled={visualSettings.hexapodCursorEnabled} />

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
          isOpen={sidebarOpen}
          historyItems={historyItems}
          selectedHistoryId={selectedHistoryId}
          exampleQueries={EXAMPLE_QUERIES}
          onSelectQuery={handleSelectQuery}
          onSelectExample={(q) => { setInputQuery(q); runQuery(q); }}
          onOpenSettings={() => setVisualSettingsOpen(true)}
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
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-[#13141d] border border-maroon-800/80 text-white text-xs shadow-2xl z-50 flex items-center gap-2 animate-fadeIn font-mono"
        >
          <CheckCircle2 className="w-4 h-4 text-[#ffc72c]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}