import OpenAI from 'openai';
import { useCallback, useEffect, useState } from 'react';
import { OPENAI_MODEL_API_NAMES, OpenaiModelType } from '../config/llm-models';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MessageDetail {
  role: 'user' | 'assistant' | 'error';
  content: string;
  model?: OpenaiModelType;
  timestamp: Date;
  inputTokens?: number;
  outputTokens?: number;
}

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
  chatMessages: ChatMessage[];
  messageDetails: MessageDetail[];
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageDetails, setMessageDetails] = useState<MessageDetail[]>([]);

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
        // set system prompt as the initial message
        // NOTE: this should not be seen on the UI
        // role: 'system' cannot be applied to some models, so it is not used
        setChatMessages([{ role: 'user', content: prompt }]);
        setMessageDetails([
          { role: 'user', content: prompt, timestamp: new Date() },
        ]);

        // TODO: remove this sample content
        const sampleContent = `# Markdown記法サンプル

めちゃくちゃ長い文章の表示は、どのようになるのでしょうか？確認したいですよね。今、その長い文章がどのように出力されるかのサンプルとして、この文章が生成されています。

## テキストスタイル
**太字テキスト**
*イタリック*
~~打ち消し線~~
\`インラインコード\`

## リンク
[Google](https://www.google.com)

## リスト
- 項目1
  - ネスト項目1-1
  - ネスト項目1-2

## Math
$\\frac{1}{2}$ + $\\frac{1}{3}$ = $\\frac{5}{6}$ のように、数式を記述できます。

## コードブロック
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\``;

        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: sampleContent },
        ]);
        setMessageDetails((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: sampleContent,
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to load system prompt';
        setError(errorMsg);
        setMessageDetails((prev) => [
          ...prev,
          { role: 'error', content: errorMsg, timestamp: new Date() },
        ]);
      }
    };

    loadSystemPrompt();
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
    setChatMessages([{ role: 'user', content: systemPrompt }]);
    setMessageDetails([
      { role: 'user', content: systemPrompt, timestamp: new Date() },
    ]);
  }, [systemPrompt]);

  const streamResponse = useCallback(
    async (prompt: string, model: OpenaiModelType, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        setChatMessages((prev) => [...prev, { role: 'user', content: prompt }]);
        setMessageDetails((prev) => [
          ...prev,
          { role: 'user', content: prompt, model, timestamp: new Date() },
        ]);

        let payload: any = {
          model: OPENAI_MODEL_API_NAMES[model],
          messages: [...chatMessages, { role: 'user', content: prompt }],
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
        let usageDetail: any = null;
        for await (const chunk of stream as any) {
          if (stopGeneration) break;
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          setOutput((prev) => prev + content);
          if (chunk.usage) {
            usageDetail = chunk.usage;
          }
        }

        if (!stopGeneration) {
          setChatMessages((prev) => [
            ...prev,
            { role: 'assistant', content: fullResponse },
          ]);
          setMessageDetails((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: fullResponse,
              model,
              timestamp: new Date(),
              inputTokens: usageDetail.prompt_tokens,
              outputTokens: usageDetail.completion_tokens,
            },
          ]);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : '予期せぬエラーが発生しました';
        setError(errorMsg);
        setMessageDetails((prev) => [
          ...prev,
          { role: 'error', content: errorMsg, timestamp: new Date() },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatMessages, stopGeneration],
  );

  const clearAllHistory = useCallback(() => {
    setOutput('');
    setError(null);
    setChatMessages([{ role: 'user', content: systemPrompt }]);
    setMessageDetails([
      { role: 'user', content: systemPrompt, timestamp: new Date() },
    ]);
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

        const temporaryMessages: ChatMessage[] = [
          { role: 'user', content: systemPrompt },
          { role: 'user', content: prompt },
        ];

        setChatMessages((prev) => [...prev, { role: 'user', content: prompt }]);
        setMessageDetails((prev) => [
          ...prev,
          { role: 'user', content: prompt, model, timestamp: new Date() },
        ]);

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
        let usageDetail: any = null;

        for await (const chunk of stream as any) {
          if (stopGeneration) break;
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          setOutput((prev) => prev + content);
          if (chunk.usage) {
            usageDetail = chunk.usage;
          }
        }

        if (!stopGeneration && fullResponse) {
          setChatMessages((prev) => [
            ...prev,
            { role: 'assistant', content: fullResponse },
          ]);
          setMessageDetails((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: fullResponse,
              model,
              timestamp: new Date(),
              inputTokens: usageDetail.prompt_tokens,
              outputTokens: usageDetail.completion_tokens,
            },
          ]);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : '予期せぬエラーが発生しました';
        setError(errorMsg);
        setMessageDetails((prev) => [
          ...prev,
          { role: 'error', content: errorMsg, timestamp: new Date() },
        ]);
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
    chatMessages,
    messageDetails,
    clearAllHistory,
    temporaryStreamResponse,
  };
};
