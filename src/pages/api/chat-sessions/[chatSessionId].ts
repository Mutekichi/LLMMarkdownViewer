import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

interface ChatSessionData {
  messages: ChatSessionMessage[];
}

interface ChatSessionMessage {
  id: number;
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
  res: NextApiResponse<
    | ChatSessionData
    | {
        error: string;
      }
    | void
  >,
) {
  const { chatSessionId } = req.query;

  if (!chatSessionId || Array.isArray(chatSessionId)) {
    return res.status(400).json({ error: 'Invalid chatSessionId' });
  }

  const sessionId = parseInt(chatSessionId, 10);
  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'chatSessionId must be a number' });
  }

  if (req.method === 'GET') {
    try {
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
          id: msg.id,
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
  } else if (req.method === 'PUT') {
    try {
      const { summary, messages } = req.body;

      // check the existing summary
      // if the new summary is empty and the existing summary is not empty, do not update
      const __session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { summary: true },
      });
      if (summary !== '' || __session?.summary === '') {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { summary },
        });
      }

      // Delete all existing messages for this session
      await prisma.chatMessage.deleteMany({
        where: { sessionId },
      });

      // Insert new messages if provided
      if (messages && Array.isArray(messages) && messages.length > 0) {
        await prisma.chatMessage.createMany({
          data: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            model: msg.model,
            timestamp: new Date(msg.timestamp),
            cost: msg.cost,
            sessionId: sessionId, // Direct reference to the chatSession
          })),
        });
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
        return res
          .status(404)
          .json({ error: 'Session not found after update' });
      }

      const chatSessionData: ChatSessionData = {
        messages: session.messages.map((msg) => ({
          id: msg.id,
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
  } else if (req.method === 'DELETE') {
    try {
      await prisma.chatSession.delete({
        where: { id: sessionId },
      });
      return res.status(200).end();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
