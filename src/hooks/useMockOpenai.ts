import { useCallback, useState } from 'react';
import { OpenaiMessage, OpenaiModel, UseOpenaiReturn } from './useOpenai';

// モック用の定数
export const MOCK_RESPONSES = {
  GREETING:
    'こんにちは！私はAIアシスタントです。どのようなお手伝いができますか？',
  ERROR: 'エラーが発生しました。申し訳ありません。',
  MARKDOWN: `
# Markdown記法サンプル

めちゃくちゃ長い文章の表示は、どのようになるのでしょうか？確認したいですよね。今、その長い文章がどのように出力されるかのサンプルとして、この文章が生成されています。このままだと、まだ長さが足りないでしょうか。。。？このくらいあれば十分かと思います。

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
\`\`\`

`,
  // 必要に応じて他の定型文を追加
};

// 遅延時間の設定（ミリ秒）
const MOCK_STREAM_DELAY = 1; // 文字送り速度
const MOCK_INITIAL_DELAY = 20; // レスポンス開始までの遅延

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

        const mockResponse =
          prompt === 'md' ? MOCK_RESPONSES.MARKDOWN : MOCK_RESPONSES.GREETING;
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
