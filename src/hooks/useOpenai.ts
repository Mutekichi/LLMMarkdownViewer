import { createChatStream } from '@/lib/openaiService';
import { handleStreamResponse } from '@/lib/streamHandler';
import { logUsage } from '@/lib/usageServices';
import OpenAI from 'openai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OpenaiModelType } from '../config/llm-models';
import { useSystemPrompt } from './useSystemPrompt';

const SYSTEM_PROMPT_ROLE = 'user';
export interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export interface MessageDetail {
  id: number;
  role: 'user' | 'assistant' | 'error';
  content: string;
  model?: OpenaiModelType;
  timestamp: Date;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
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
  stopGeneration: boolean;
  setStopGeneration: (stop: boolean) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  messageDetails: MessageDetail[];
  setMessageDetails: React.Dispatch<React.SetStateAction<MessageDetail[]>>;
  resetHistory: () => void;
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

  const messageIdRef = useRef<number>(1);
  const getNextMessageId = useCallback(() => {
    const currentId = messageIdRef.current;
    messageIdRef.current += 1;
    return currentId;
  }, []);

  const { systemPrompt } = useSystemPrompt();

  useEffect(() => {
    const loadSystemPrompt = async () => {
      // set system prompt as the initial message
      // NOTE: this should not be seen on the UI
      // role: 'system' cannot be applied to some models, so it is not used
      setChatMessages([{ role: SYSTEM_PROMPT_ROLE, content: systemPrompt }]);
      setMessageDetails([
        {
          id: getNextMessageId(),
          role: SYSTEM_PROMPT_ROLE,
          content: systemPrompt,
          timestamp: new Date(),
        },
      ]);
    };

    loadSystemPrompt();
  }, [systemPrompt]);

  const addMessage = useCallback(
    (message?: ChatMessage, detail?: MessageDetail) => {
      message && setChatMessages((prev) => [...prev, message]);
      detail && setMessageDetails((prev) => [...prev, detail]);
    },
    [],
  );

  const resetHistory = useCallback(() => {
    setOutput('');
    setError(null);
    setChatMessages(
      systemPrompt ? [{ role: SYSTEM_PROMPT_ROLE, content: systemPrompt }] : [],
    );
    setMessageDetails(
      systemPrompt
        ? [
            {
              id: getNextMessageId(),
              role: SYSTEM_PROMPT_ROLE,
              content: systemPrompt,
              timestamp: new Date(),
            },
          ]
        : [],
    );
    setIsLoading(false);
    setStopGeneration(false);
  }, [systemPrompt]);

  /**
   * Handles streaming responses from the OpenAI API.
   *
   * - Reads text chunks from the stream and updates the `output` state.
   * - Stops if `stopGeneration` is true.
   * - Calls `onComplete` with the final response and usage info.
   * - Logs usage if provided by the API.
   */
  const processStream = useCallback(
    async (
      stream: AsyncIterable<any>,
      model: OpenaiModelType,
      onComplete: (response: string, usage?: any) => void,
    ) => {
      const { fullResponse, usageDetail } = await handleStreamResponse(
        stream,
        () => stopGeneration,
        (chunk) => setOutput((prev) => prev + chunk),
      );
      if (!stopGeneration && fullResponse) {
        onComplete(fullResponse, usageDetail);
        if (usageDetail) {
          await logUsage(model, usageDetail);
        }
      }
    },
    [stopGeneration],
  );

  /**
   * Sends a prompt to the OpenAI API and streams the response back.
   *
   * - Resets states (loading, error, etc.) before sending.
   * - Adds the user's message to chat history.
   * - Streams the response using `processStream`.
   * - Appends the assistant's answer to the conversation on completion.
   */
  const streamResponse = useCallback(
    async (prompt: string, model: OpenaiModelType, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        addMessage(
          { role: 'user', content: prompt },
          {
            id: getNextMessageId(),
            role: 'user',
            content: prompt,
            model,
            timestamp: new Date(),
          },
        );

        const messages = [...chatMessages, { role: 'user', content: prompt }];
        console.log(messages);
        const stream = await createChatStream(messages, model, image);

        await processStream(stream, model, (fullResponse, usageDetail) => {
          addMessage(
            { role: 'assistant', content: fullResponse },
            {
              id: getNextMessageId(),
              role: 'assistant',
              content: fullResponse,
              model,
              timestamp: new Date(),
              inputTokens: usageDetail?.prompt_tokens,
              outputTokens: usageDetail?.completion_tokens,
            },
          );
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMsg);
        addMessage(undefined, {
          id: getNextMessageId(),
          role: 'error',
          content: errorMsg,
          timestamp: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [chatMessages, addMessage, processStream],
  );

  /**
   * Sends a prompt using only the system prompt (if any) and the given prompt, ignoring previous messages.
   *
   * - Resets states (loading, error, etc.) before sending.
   * - Optionally includes the system prompt and the user's prompt.
   * - Streams the response using `processStream`.
   * - Appends the assistant's answer to the conversation on completion.
   */
  const temporaryStreamResponse = useCallback(
    async (prompt: string, model: OpenaiModelType, image?: File) => {
      try {
        setIsLoading(true);
        setError(null);
        setStopGeneration(false);
        setOutput('');

        const temporaryMessages = systemPrompt
          ? [
              { role: SYSTEM_PROMPT_ROLE, content: systemPrompt },
              { role: 'user', content: prompt },
            ]
          : [{ role: 'user', content: prompt }];

        addMessage(
          { role: 'user', content: prompt },
          {
            id: getNextMessageId(),
            role: 'user',
            content: prompt,
            model,
            timestamp: new Date(),
          },
        );

        const stream = await createChatStream(temporaryMessages, model, image);

        await processStream(stream, model, (fullResponse, usageDetail) => {
          addMessage(
            { role: 'assistant', content: fullResponse },
            {
              id: getNextMessageId(),
              role: 'assistant',
              content: fullResponse,
              model,
              timestamp: new Date(),
              inputTokens: usageDetail?.prompt_tokens,
              outputTokens: usageDetail?.completion_tokens,
            },
          );
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMsg);
        addMessage(undefined, {
          id: getNextMessageId(),
          role: 'error',
          content: errorMsg,
          timestamp: new Date(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [systemPrompt, addMessage, processStream],
  );

  return {
    output,
    isLoading,
    error,
    streamResponse,
    stopGeneration,
    setStopGeneration,
    chatMessages,
    setChatMessages,
    messageDetails,
    setMessageDetails,
    resetHistory,
    temporaryStreamResponse,
  };
};
