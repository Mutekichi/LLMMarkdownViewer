'use client';
import { Memos, SupplementaryMessages } from '@/components/Home/Main';
import { calculateCost, OpenaiModelType } from '@/config/llm-models';
import { MessageDetail } from '@/hooks/useOpenai';

interface ChatSessionData {
  messages: ChatSessionMessage[];
}

interface ChatSessionMessage {
  role: string;
  content: string;
  model: string;
  timestamp: string;
  cost?: number;
  memos?: {
    clientSideId: string;
    rangeStart: number;
    rangeEnd: number;
    memo: string;
  }[];
  supplementaryMessages?: {
    clientSideId: string;
    rangeStart: number;
    rangeEnd: number;
    items: {
      role: string;
      content: string;
      model: string;
      timestamp: string;
      cost?: number;
    }[];
  }[];
}

export const createChatSessionData = (
  messages: MessageDetail[],
  memos: Memos,
  supplementaryMessages: SupplementaryMessages,
): ChatSessionData => {
  return {
    messages: messages.map((msg) => {
      const messageData: ChatSessionMessage = {
        role: msg.role,
        content: msg.content,
        model: msg.model || '',
        timestamp: msg.timestamp.toISOString(),
        cost:
          msg.model && msg.inputTokens && msg.outputTokens
            ? calculateCost(msg.model, msg.inputTokens, msg.outputTokens)
            : 0.0,
      };

      const messagesMemos = memos[msg.id.toString()];
      console.log(messagesMemos);
      if (messagesMemos?.length > 0) {
        messageData.memos = messagesMemos.map((memo) => ({
          clientSideId: memo.id,
          rangeStart: memo.range.startOffset,
          rangeEnd: memo.range.endOffset,
          memo: memo.memo,
        }));
      }

      const messagesSupplementaryMessages =
        supplementaryMessages[msg.id.toString()];
      if (messagesSupplementaryMessages?.length > 0) {
        messageData.supplementaryMessages = messagesSupplementaryMessages
          .filter((entry) => entry.supplementary !== null)
          .map((entry) => ({
            clientSideId: entry.id,
            rangeStart: entry.range.startOffset,
            rangeEnd: entry.range.endOffset,
            items: [
              {
                role: entry.supplementary!.role,
                content: entry.supplementary!.content,
                model: entry.supplementary!.model || '',
                timestamp: entry.supplementary!.timestamp.toISOString(),
                cost:
                  entry.supplementary!.model &&
                  entry.supplementary!.inputTokens &&
                  entry.supplementary!.outputTokens
                    ? calculateCost(
                        entry.supplementary!.model,
                        entry.supplementary!.inputTokens,
                        entry.supplementary!.outputTokens,
                      )
                    : 0.0,
              },
            ],
          }));
      }
      return messageData;
    }),
  };
};

export const saveChatSession = async (chatSessionData: ChatSessionData) => {
  try {
    await fetch('/api/chat-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatSessionData),
    });
  } catch (error) {
    console.error('Failed to save chat session', error);
  }
};

export const loadChatSession = async (
  chatSessionId: string,
): Promise<{
  messages: MessageDetail[];
  memos: Memos;
  supplementaryMessages: SupplementaryMessages;
}> => {
  const res = await fetch(`/api/chat-sessions/${chatSessionId}`);
  if (!res.ok) {
    throw new Error('Failed to load chat session');
  }
  const data: ChatSessionData = await res.json();

  const messages: MessageDetail[] = [];
  const memos: Memos = {};
  const supplementaryMessages: SupplementaryMessages = {};

  data.messages.forEach((msg, index) => {
    const messageId = index;
    messages.push({
      id: messageId,
      role: msg.role as 'user' | 'assistant' | 'error',
      content: msg.content,
      model: msg.model ? (msg.model as OpenaiModelType) : undefined,
      timestamp: new Date(msg.timestamp),
    });

    if (!msg.memos) {
      msg.memos = [];
    }
    memos[messageId.toString()] = msg.memos.map((memo) => ({
      id: memo.clientSideId,
      range: { startOffset: memo.rangeStart, endOffset: memo.rangeEnd },
      memo: memo.memo,
    }));

    if (!msg.supplementaryMessages) {
      msg.supplementaryMessages = [];
    }

    supplementaryMessages[messageId.toString()] = msg.supplementaryMessages.map(
      (sup) => ({
        id: sup.clientSideId,
        range: { startOffset: sup.rangeStart, endOffset: sup.rangeEnd },
        supplementary:
          sup.items && sup.items.length > 0
            ? {
                id: Number(sup.clientSideId),
                role: sup.items[0].role as 'user' | 'assistant' | 'error',
                content: sup.items[0].content,
                model: sup.items[0].model
                  ? (sup.items[0].model as OpenaiModelType)
                  : undefined,
                timestamp: new Date(sup.items[0].timestamp),
              }
            : null,
      }),
    );
  });

  return { messages, memos, supplementaryMessages };
};
