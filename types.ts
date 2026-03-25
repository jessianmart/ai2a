export enum Mode {
  AGENT_ARCHITECT = 'AGENT_ARCHITECT',
  SKILL_ARCHITECT = 'SKILL_ARCHITECT'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  mode: Mode;
}

export type StreamChunk = {
  text: string;
}