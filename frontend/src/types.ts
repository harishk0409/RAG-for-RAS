export type RagState = 'idle' | 'search' | 'response';

export interface RagResponseData {
  answer: string;
  sources: string[];
}

export interface ConversationTurn {
  id: string;
  query: string;
  answer: string;
  sources: string[];
}

export interface QueryHistoryItem {
  id: string;
  title: string;
  query: string;
  responseData: RagResponseData;
  dateGroup: 'Today' | 'Yesterday';
}

export interface VisualSettings {
  palette: 'maroon-gold' | 'cyber-amber' | 'titanium-white';
  hexapodCursorEnabled: boolean;
  scanlineEnabled: boolean;
}