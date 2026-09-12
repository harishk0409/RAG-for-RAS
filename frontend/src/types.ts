export type RagState = 'idle' | 'search' | 'retrieve' | 'response';

export interface RagResponseData {
  answer: string;
  sources: string[];
}

export interface ConversationTurn {
  id: string;
  query: string;
  answer: string;
  sources: string[];
  animate?: boolean;
}

export interface QueryHistoryItem {
  id: string;
  title: string;
  turns: ConversationTurn[];
  dateGroup: 'Today' | 'Yesterday';
}

export interface VisualSettings {
  palette: 'maroon-gold' | 'cyber-amber' | 'titanium-white';
  cursorType: 'normal' | 'bot';
  theme: 'light' | 'dark';
}