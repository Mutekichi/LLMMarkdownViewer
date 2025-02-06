import { useEffect, useState } from 'react';

export const useSystemPrompt = () => {
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrompt() {
      try {
        const response = await fetch('/prompts/system.txt');
        if (!response.ok) throw new Error('Failed to load system prompt');
        const prompt = await response.text();
        setSystemPrompt(prompt);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
    loadPrompt();
  }, []);

  return { systemPrompt, error };
};
