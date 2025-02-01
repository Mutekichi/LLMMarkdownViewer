import { useCallback, useState } from 'react';
import { OpenaiMessage, OpenaiModel, UseOpenaiReturn } from './useOpenai';

// モック用の定数
export const MOCK_RESPONSES = {
  GREETING:
    'こんにちは！私はAIアシスタントです。どのようなお手伝いができますか？',
  ERROR: 'エラーが発生しました。申し訳ありません。',
  // 必要に応じて他の定型文を追加
};

// 遅延時間の設定（ミリ秒）
const MOCK_STREAM_DELAY = 10; // 文字送り速度
const MOCK_INITIAL_DELAY = 0; // レスポンス開始までの遅延

export const useMockOpenai = (): UseOpenaiReturn => {
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stopGeneration, setStopGeneration] = useState<boolean>(false);
  const [messages, setMessages] = useState<OpenaiMessage[]>([]);

  const clearOutput = useCallback(() => {
    setOutput('');
    setError(null);
  }, []);

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

        // 初期遅延
        await new Promise((resolve) => setTimeout(resolve, MOCK_INITIAL_DELAY));

        const mockResponse = MOCK_RESPONSES.GREETING;
        let fullResponse = '';

        // 文字送りのシミュレーション
        for (let i = 0; i < mockResponse.length; i++) {
          if (stopGeneration) break;

          await new Promise((resolve) =>
            setTimeout(resolve, MOCK_STREAM_DELAY),
          );
          const char = mockResponse[i];
          fullResponse += char;
          setOutput(fullResponse);
        }

        if (!stopGeneration) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: fullResponse },
          ]);
        }
      } catch (err) {
        setError(MOCK_RESPONSES.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, stopGeneration],
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
