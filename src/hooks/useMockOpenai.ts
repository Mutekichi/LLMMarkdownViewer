import { useCallback, useState } from 'react';
import { OpenaiMessage, OpenaiModelType } from '../config/llm-models';

import { UseOpenaiReturn } from './useOpenai';

export const MOCK_RESPONSES = {
  GREETING:
    'こんにちは！私はAIアシスタントです。どのようなお手伝いができますか？',
  ERROR: 'エラーが発生しました。申し訳ありません。',
  MARKDOWN: `# Markdown記法サンプル\n\nめちゃくちゃ長い文章の表示は、どのようになるのでしょうか？確認したいですよね。今、その長い文章がどのように出力されるかのサンプルとして、この文章が生成されています。このままだと、まだ長さが足りないでしょうか。。。？このくらいあれば十分かと思います。\n\n## テキストスタイル\n**太字テキスト**\n*イタリック*\n~~打ち消し線~~\n\`インラインコード\`\n\n## リンク\n[Google](https://www.google.com)\n\n## リスト\n- 項目1\n  - ネスト項目1-1\n  - ネスト項目1-2\n\n## Math\n$\\frac{1}{2}$ + $\\frac{1}{3}$ = $\\frac{5}{6}$ のように、数式を記述できます。\n\n## コードブロック\n\`\`\`python\ndef hello():\n   print("Hello, World!")\n\`\`\`\n`,
};

const MOCK_STREAM_DELAY = 0;
const MOCK_INITIAL_DELAY = 20;

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

  const clearAllHistory = useCallback(() => {
    setOutput('');
    setError(null);
    setMessages([]);
    setIsLoading(false);
    setStopGeneration(false);
  }, []);

  const mockStreamProcess = async (
    response: string,
    updateMessages: boolean = true,
  ) => {
    let fullResponse = '';
    for (let i = 0; i < response.length; i++) {
      if (stopGeneration) break;
      await new Promise((resolve) => setTimeout(resolve, MOCK_STREAM_DELAY));
      fullResponse += response[i];
      setOutput(fullResponse);
    }

    if (!stopGeneration && updateMessages) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fullResponse },
      ]);
    }
    return fullResponse;
  };

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

        await new Promise((resolve) => setTimeout(resolve, MOCK_INITIAL_DELAY));
        const mockResponse =
          prompt === 'md' ? MOCK_RESPONSES.MARKDOWN : MOCK_RESPONSES.GREETING;
        await mockStreamProcess(mockResponse);
      } catch (err) {
        setError(MOCK_RESPONSES.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, stopGeneration],
  );

  const temporaryStreamResponse = useCallback(
    async (prompt: string, model: OpenaiModelType, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        setMessages([{ role: 'user', content: prompt }]);
        await new Promise((resolve) => setTimeout(resolve, MOCK_INITIAL_DELAY));

        const mockResponse =
          prompt === 'md' ? MOCK_RESPONSES.MARKDOWN : MOCK_RESPONSES.GREETING;
        const fullResponse = await mockStreamProcess(mockResponse, false);

        if (!stopGeneration) {
          setMessages([
            { role: 'user', content: prompt },
            { role: 'assistant', content: fullResponse },
          ]);
        }
      } catch (err) {
        setError(MOCK_RESPONSES.ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [stopGeneration],
  );

  return {
    output,
    isLoading,
    error,
    streamResponse,
    temporaryStreamResponse,
    clearOutput,
    clearAllHistory,
    stopGeneration,
    setStopGeneration,
    messages,
  };
};
