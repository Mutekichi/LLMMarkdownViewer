import OpenAI from 'openai';
import { useCallback, useEffect, useState } from 'react';
import {
  OPENAI_MODEL_API_NAMES,
  OpenaiMessage,
  OpenaiModelType,
} from '../config/llm-models';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface UseOpenaiReturn {
  output: string;
  isLoading: boolean;
  error: string | null;
  streamResponse: (
    prompt: string,
    model: OpenaiModelType,
    image?: File,
  ) => Promise<void>;
  clearOutput: () => void;
  stopGeneration: boolean;
  setStopGeneration: (stop: boolean) => void;
  messages: OpenaiMessage[];
  clearAllHistory: () => void;
  temporaryStreamResponse: (
    prompt: string,
    model: OpenaiModelType,
    image?: File,
  ) => Promise<void>;
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
        setMessages([{ role: 'user', content: prompt }]);
        // TODO: Delete
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `# Markdown記法サンプル\n\nめちゃくちゃ長い文章の表示は、どのようになるのでしょうか？確認したいですよね。今、その長い文章がどのように出力されるかのサンプルとして、この文章が生成されています。このままだと、まだ長さが足りないでしょうか。。。？このくらいあれば十分かと思います。\n\n## テキストスタイル\n**太字テキスト**\n*イタリック*\n~~打ち消し線~~\n\`インラインコード\`\n\n## リンク\n[Google](https://www.google.com)\n\n## リスト\n- 項目1\n  - ネスト項目1-1\n  - ネスト項目1-2\n\n## Math\n$\\frac{1}{2}$ + $\\frac{1}{3}$ = $\\frac{5}{6}$ のように、数式を記述できます。\n\n## コードブロック\n\`\`\`python\ndef hello():\n   print("Hello, World!")\n\`\`\`\n`,
          },
        ]);
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
    setMessages([{ role: 'user', content: systemPrompt }]);
  }, [systemPrompt]);

  const streamResponse = useCallback(
    async (prompt: string, model: OpenaiModelType, image?: File) => {
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
          model: OPENAI_MODEL_API_NAMES[model],
          messages: newMessages,
          stream: true,
          stream_options: {
            include_usage: true,
          },
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

          chunk.usage && console.log(chunk.usage);
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

  const clearAllHistory = useCallback(() => {
    setOutput('');
    setError(null);
    setMessages([{ role: 'user', content: systemPrompt }]);
    setIsLoading(false);
    setStopGeneration(false);
  }, [systemPrompt]);

  const temporaryStreamResponse = useCallback(
    async (prompt: string, model: OpenaiModelType, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        const temporaryMessages: OpenaiMessage[] = [
          { role: 'user', content: systemPrompt },
          { role: 'user', content: prompt },
        ];

        setMessages((prev) => [...prev, { role: 'user', content: prompt }]);

        let payload: any = {
          model: OPENAI_MODEL_API_NAMES[model],
          messages: temporaryMessages,
          stream: true,
          stream_options: {
            include_usage: true,
          },
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

        if (!stopGeneration && fullResponse) {
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
    [systemPrompt, stopGeneration],
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
    clearAllHistory,
    temporaryStreamResponse,
  };
};
