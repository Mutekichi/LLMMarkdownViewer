import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method === 'POST') {
    return createSession(req, res);
  } else if (req.method === 'GET') {
    return getSession(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

const createSession = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { createdAt, messages, summary } = req.body;

    const newSession = await prisma.chatSession.create({
      data: {
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        summary: summary,
        messages: {
          create: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            model: msg.model,
            timestamp: new Date(msg.timestamp),
            cost: msg.cost ?? NaN,
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
};

const getSession = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { cursor, take = 10 } = req.query;
    const takeNum = typeof take === 'string' ? parseInt(take, 10) : 10;

    const sessions = await prisma.chatSession.findMany({
      ...(cursor
        ? {
            cursor: {
              id: +cursor,
            },
            skip: 1,
          }
        : {}),
      take: takeNum,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(sessions);
  } catch (error: any) {
    console.error('Failed to load sessions', error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
