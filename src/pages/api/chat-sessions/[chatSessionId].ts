// pages/api/chat-sessions/[chatSessionId].ts

import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

interface ChatSessionData {
  highlightedPartInfo: {
    id: string;
    ranges: { startOffset: number; endOffset: number }[];
  }[];
  messages: ChatSessionMessage[];
}

interface ChatSessionMessage {
  role: string;
  content: string;
  model: string;
  timestamp: string; // ISO 8601 format
  cost: number;
  memos: {
    clientSideId: string;
    rangeStart: number;
    rangeEnd: number;
    memo: string;
  }[];
  supplementaryMessages: {
    clientSideId: string;
    rangeStart: number;
    rangeEnd: number;
    items: {
      role: string;
      content: string;
      model: string;
      timestamp: string;
      cost: number;
    }[];
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatSessionData | { error: string }>,
) {
  if (req.method === 'GET') {
    try {
      const { chatSessionId } = req.query;
      if (!chatSessionId || Array.isArray(chatSessionId)) {
        return res.status(400).json({ error: 'Invalid chatSessionId' });
      }

      const sessionId = parseInt(chatSessionId, 10);
      if (isNaN(sessionId)) {
        return res
          .status(400)
          .json({ error: 'chatSessionId must be a number' });
      }

      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            include: {
              memos: true,
              supplementaryMessages: {
                include: {
                  items: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const chatSessionData: ChatSessionData = {
        messages: session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          model: msg.model,
          timestamp: msg.timestamp.toISOString(),
          cost: Number(msg.cost),
          memos: msg.memos.map((memo) => ({
            clientSideId: memo.clientSideId,
            rangeStart: memo.rangeStart,
            rangeEnd: memo.rangeEnd,
            memo: memo.memo,
          })),
          supplementaryMessages: msg.supplementaryMessages.map((sup) => ({
            clientSideId: sup.clientSideId,
            rangeStart: sup.rangeStart,
            rangeEnd: sup.rangeEnd,
            items: sup.items.map((item) => ({
              role: item.role,
              content: item.content,
              model: item.model,
              timestamp: item.timestamp.toISOString(),
              cost: Number(item.cost),
            })),
          })),
        })),
      };

      return res.status(200).json(chatSessionData);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
