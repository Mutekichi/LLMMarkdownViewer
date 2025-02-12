// pages/api/chat-sessions/index.ts
import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { createdAt, messages } = req.body;

      const newSession = await prisma.chatSession.create({
        data: {
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          messages: {
            create: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              model: msg.model,
              timestamp: new Date(msg.timestamp),
              cost: msg.cost ?? 0.0,
              memos: msg.memos
                ? {
                    create: msg.memos.map((memo: any) => ({
                      clientSideId: memo.clientSideId,
                      rangeStart: memo.rangeStart,
                      rangeEnd: memo.rangeEnd,
                      memo: memo.memo,
                    })),
                  }
                : undefined,
              supplementaryMessages: msg.supplementaryMessages
                ? {
                    create: msg.supplementaryMessages.map((sup: any) => ({
                      clientSideId: sup.clientSideId,
                      rangeStart: sup.rangeStart,
                      rangeEnd: sup.rangeEnd,
                      items: sup.items
                        ? {
                            create: sup.items.map((item: any) => ({
                              role: item.role,
                              content: item.content,
                              model: item.model,
                              timestamp: new Date(item.timestamp),
                              cost: item.cost ?? 0.0,
                            })),
                          }
                        : undefined,
                    })),
                  }
                : undefined,
            })),
          },
        },
        include: {
          messages: {
            include: {
              memos: true,
              supplementaryMessages: {
                include: { items: true },
              },
            },
          },
        },
      });
      return res.status(201).json(newSession);
    } catch (error: any) {
      console.error('Failed to save session', error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
