'use client';
import { Memos, SupplementaryMessages } from '@/components/Main';
import { calculateCost, OpenaiModelType } from '@/config/llm-models';
import { MessageDetail } from '@/hooks/useOpenai';

interface ChatSessionData {
  id?: number;
  messages: ChatSessionMessage[];
  summary: string;
}

interface ChatSessionMessage {
  id: number;
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
  summary: string,
  id?: number,
): ChatSessionData => {
  return {
    messages: messages.map((msg) => {
      const messageData: ChatSessionMessage = {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        model: msg.model || '',
        timestamp: msg.timestamp.toISOString(),
        cost:
          msg.model && msg.inputTokens && msg.outputTokens
            ? calculateCost(msg.model, msg.inputTokens, msg.outputTokens)
            : 0.0,
      };

      if (memos[msg.id.toString()]) {
        const messagesMemos = Object.entries(memos[msg.id.toString()]).flatMap(
          ([partId, memoEntries]) =>
            memoEntries.map(({ range, memo }) => ({
              partId,
              range,
              memo,
            })),
        );

        if (messagesMemos?.length > 0) {
          messageData.memos = messagesMemos.map((memo) => ({
            clientSideId: memo.partId,
            rangeStart: memo.range.startOffset,
            rangeEnd: memo.range.endOffset,
            memo: memo.memo,
          }));
        }
      }

      if (supplementaryMessages[msg.id.toString()]) {
        const messagesSupplementaryMessages = Object.entries(
          supplementaryMessages[msg.id.toString()],
        ).flatMap(([partId, supplementaryEntries]) =>
          supplementaryEntries.map(({ range, supplementary }) => ({
            partId,
            range,
            // currently only one item in the array
            supplementary: supplementary[2],
          })),
        );

        if (messagesSupplementaryMessages?.length > 0) {
          messageData.supplementaryMessages = messagesSupplementaryMessages
            .filter((entry) => entry.supplementary !== null)
            .map((entry) => ({
              clientSideId: entry.partId,
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
      }
      return messageData;
    }),
    summary,
    id,
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
  const res = await fetch(`/api/chat-sessions/${chatSessionId}`, {
    method: 'GET',
    // // id-designated data can be modified so we need to disable cache
    // headers: {
    //   'Cache-Control': 'no-cache, no-store, must-revalidate',
    //   Pragma: 'no-cache',
    //   Expires: '0',
    // },
  });
  if (!res.ok) {
    throw new Error('Failed to load chat session');
  }
  const data: ChatSessionData = await res.json();

  const messages: MessageDetail[] = [];
  const memos: Memos = {};
  const supplementaryMessages: SupplementaryMessages = {};

  data.messages.forEach((msg) => {
    const messageId = msg.id;
    messages.push({
      id: messageId,
      role: msg.role as 'user' | 'assistant' | 'error',
      content: msg.content,
      model: msg.model ? (msg.model as OpenaiModelType) : undefined,
      timestamp: new Date(msg.timestamp),
      cost: msg.cost,
    });

    const memosInMessage = msg.memos;

    if (memosInMessage) {
      const newMemos: Memos = {};
      for (const memo of memosInMessage) {
        if (!newMemos[messageId]) {
          newMemos[messageId] = {};
        }
        if (!newMemos[messageId][memo.clientSideId]) {
          newMemos[messageId][memo.clientSideId] = [];
        }
        newMemos[messageId][memo.clientSideId].push({
          range: { startOffset: memo.rangeStart, endOffset: memo.rangeEnd },
          memo: memo.memo,
        });
      }

      memos[messageId] = newMemos[messageId];
    }

    const supplementaryMessagesInMessage = msg.supplementaryMessages;

    if (supplementaryMessagesInMessage) {
      const newSupplementaryMessages: SupplementaryMessages = {};
      for (const supplementaryMessage of supplementaryMessagesInMessage) {
        if (!newSupplementaryMessages[messageId]) {
          newSupplementaryMessages[messageId] = {};
        }
        if (
          !newSupplementaryMessages[messageId][
            supplementaryMessage.clientSideId
          ]
        ) {
          newSupplementaryMessages[messageId][
            supplementaryMessage.clientSideId
          ] = [];
        }
        newSupplementaryMessages[messageId][
          supplementaryMessage.clientSideId
        ].push({
          range: {
            startOffset: supplementaryMessage.rangeStart,
            endOffset: supplementaryMessage.rangeEnd,
          },
          supplementary: [
            // currently add dummy data for the first two items
            // they are not shown in the UI
            {
              id: NaN,
              role: 'error',
              content: '',
              model: undefined,
              timestamp: new Date(),
            },
            {
              id: NaN,
              role: 'error',
              content: '',
              model: undefined,
              timestamp: new Date(),
            },
            supplementaryMessage.items.map((item) => ({
              id: NaN,
              role: item.role as 'user' | 'assistant' | 'error',
              content: item.content,
              model: item.model ? (item.model as OpenaiModelType) : undefined,
              timestamp: new Date(item.timestamp),
            }))[0],
          ],
        });
      }

      supplementaryMessages[messageId] = newSupplementaryMessages[messageId];
    }
  });

  return { messages, memos, supplementaryMessages };
};

export interface ChatSessionListItem {
  id: number;
  summary: string;
}

/**
 * get chat session list
 * @param cursor
 * @param take
 */
export const loadChatSessions = async (
  cursor?: number,
  take: number = 10,
): Promise<ChatSessionListItem[]> => {
  const params = new URLSearchParams();
  if (cursor !== undefined) {
    params.set('cursor', String(cursor));
  }
  params.set('take', String(take));

  const res = await fetch(`/api/chat-sessions?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to load chat sessions');
  }

  const sessions: ChatSessionListItem[] = await res.json();

  return sessions;
};

export const updateChatSession = async (chatSessionData: ChatSessionData) => {
  console.log('updateChatSession', chatSessionData);
  try {
    await fetch(`/api/chat-sessions/${chatSessionData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatSessionData),
    });
  } catch (error) {
    console.error('Failed to update chat session', error);
  }
};
