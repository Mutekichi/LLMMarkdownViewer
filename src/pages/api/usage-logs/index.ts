import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { promptTokens, completionTokens, cost, model } = req.body;

      const newLog = await prisma.usageLog.create({
        data: {
          promptTokens,
          completionTokens,
          model,
          cost,
        },
      });
      return res.status(201).json(newLog);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
