import Anthropic from '@anthropic-ai/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';

export enum ClaudeModel {
  OPUS = 'claude-3-opus-20240229',
  SONNET = 'claude-3-sonnet-20240229',
  HAIKU = 'claude-3-haiku-20240229',
}

export interface MessageContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string | MessageContent[];
}

export interface UseClaudeReturn {
  output: string;
  isLoading: boolean;
  error: string | null;
  streamResponse: (
    prompt: string,
    model: ClaudeModel,
    image?: File,
  ) => Promise<void>;
  clearOutput: () => void;
  stopGeneration: boolean;
  setStopGeneration: (stop: boolean) => void;
  messages: Message[];
}

export const useClaude = (): UseClaudeReturn => {
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stopGeneration, setStopGeneration] = useState<boolean>(false);
  // 会話の履歴（ユーザーとアシスタントのメッセージのみ）
  const [messages, setMessages] = useState<Message[]>([]);
  // システムプロンプトは別途保持（UI上に表示する場合は messages にも含めるか検討）
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  // Anthropic クライアントを再生成しないように useMemo で固定
  const anthropic = useMemo(
    () =>
      new Anthropic({
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
        dangerouslyAllowBrowser: true,
      }),
    [],
  );

  // コンポーネント初回マウント時にシステムプロンプトを読み込む
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        const response = await fetch('/prompts/system.txt');
        if (!response.ok) {
          throw new Error('Failed to load system prompt');
        }
        const prompt = await response.text();
        setSystemPrompt(prompt);
        // UI上でシステムメッセージとして表示したい場合は以下のようにする（API には送らない）
        setMessages([{ role: 'system', content: prompt }]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load system prompt',
        );
      }
    };

    loadSystemPrompt();
  }, []);

  // 出力やエラー、会話履歴を初期状態に戻す
  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
    // UI上はシステムメッセージを表示する場合
    setMessages([{ role: 'system', content: systemPrompt }]);
  }, [systemPrompt]);

  // File を Base64 に変換するヘルパー関数
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ストリーミングレスポンスを取得する処理
  const streamResponse = useCallback(
    async (prompt: string, model: ClaudeModel, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        // ユーザーの入力（テキストまたは画像付き）を用意
        let content: string | MessageContent[] = prompt;
        if (image) {
          const base64Image = await convertFileToBase64(image);
          content = [
            { type: 'text', text: prompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: image.type,
                data: base64Image.split(',')[1],
              },
            },
          ];
        }

        // UI上の会話履歴にユーザーメッセージを追加
        setMessages((prev) => [...prev, { role: 'user', content }]);

        // API へのリクエスト時には、システムプロンプトはトップレベルパラメータとして渡し、
        // 会話履歴にはシステムメッセージは含めず、ユーザーとアシスタントのメッセージのみを送る
        const conversationMessages = messages.filter(
          (msg) => msg.role !== 'system',
        );
        // ※直前の setMessages で追加したユーザーメッセージはまだ反映されていない可能性があるため、
        // 必要に応じて最新の会話履歴の管理方法を調整してください。

        const stream = await anthropic.messages.stream({
          model,
          system: systemPrompt,
          messages: [...conversationMessages, { role: 'user', content }] as any,
          max_tokens: 4096,
        });

        let fullResponse = '';

        // ストリーミングイベントの処理
        for await (const event of stream) {
          if (stopGeneration) break;
          if (event.type === 'content_block_delta') {
            // 型ガードやキャストで delta.text にアクセス
            const text = (event as { delta: { text: string } }).delta.text;
            fullResponse += text;
            setOutput((prev) => prev + text);
          }
        }

        // 生成完了していれば、会話履歴にアシスタントからの返答を追加
        if (!stopGeneration) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: fullResponse },
          ]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [anthropic, messages, systemPrompt, stopGeneration],
  );

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
