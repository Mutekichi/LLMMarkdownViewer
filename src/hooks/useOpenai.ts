import OpenAI from 'openai';
import { useCallback, useEffect, useState } from 'react';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export enum OpenaiModel {
  GPT4o = 'gpt-4o',
  o1 = 'o1',
  o1mini = 'o1-mini',
  o3mini = 'o3-mini',
}

export interface OpenaiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UseOpenaiReturn {
  output: string;
  isLoading: boolean;
  error: string | null;
  streamResponse: (
    prompt: string,
    model: OpenaiModel,
    image?: File,
  ) => Promise<void>;
  clearOutput: () => void;
  stopGeneration: boolean;
  setStopGeneration: (stop: boolean) => void;
  messages: OpenaiMessage[];
}

export const useOpenai = (): UseOpenaiReturn => {
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stopGeneration, setStopGeneration] = useState<boolean>(false);
  const [messages, setMessages] = useState<OpenaiMessage[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        const response = await fetch('/prompts/system.txt');
        if (!response.ok) {
          throw new Error('Failed to load system prompt');
        }
        const prompt = await response.text();
        setSystemPrompt(prompt);
        setMessages([{ role: 'system', content: prompt }]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load system prompt',
        );
      }
    };

    loadSystemPrompt();
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
    setMessages([{ role: 'system', content: systemPrompt }]);
  }, [systemPrompt]);

  const streamResponse = useCallback(
    async (prompt: string, model: OpenaiModel, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        const newMessages: OpenaiMessage[] = [
          ...messages,
          { role: 'user', content: prompt },
        ];
        setMessages(newMessages);

        let payload: any = {
          model: model,
          messages: newMessages,
          stream: true,
        };

        if (image) {
          const base64Image = await convertFileToBase64(image);
          payload.messages[payload.messages.length - 1].content = [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: base64Image } },
          ];
        }

        const stream = await openai.chat.completions.create(payload);

        let fullResponse = '';

        for await (const chunk of stream as any) {
          if (stopGeneration) break;

          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          setOutput((prev) => prev + content);
        }

        if (!stopGeneration) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: fullResponse },
          ]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '予期せぬエラーが発生しました',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, stopGeneration],
  );

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    output,
    isLoading,
    error,
    streamResponse,
    clearOutput,
    stopGeneration,
    setStopGeneration,
    messages,
  };
};
