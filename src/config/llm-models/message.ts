export interface OpenaiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
