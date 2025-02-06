import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface Period {
  start: string;
  end: string;
}

export interface AggregateMonthlyUsageParams {
  period?: Period;
}

export interface AggregateMonthlyUsageResponse {
  month: string; // YYYY-MM
  cost: number;
}

async function aggregateMonthlyUsage({ period }: AggregateMonthlyUsageParams) {
  // TODO: verify that the period is valid
  if (period) {
    const monthlyUsage = await prisma.$queryRaw<
      AggregateMonthlyUsageResponse[]
    >`
  SELECT
      strftime('%Y-%m', created_at / 1000, 'unixepoch', '+9 hours') AS month,
      SUM(cost) AS cost
  FROM UsageLog
  WHERE created_at BETWEEN ${period.start} AND ${period.end}
  GROUP BY month
  ORDER BY month ASC
`;
    return monthlyUsage;
  } else {
    const monthlyUsage = await prisma.$queryRaw<
      AggregateMonthlyUsageResponse[]
    >`
SELECT
  strftime('%Y-%m', created_at / 1000, 'unixepoch', '+9 hours') AS month,
  SUM(cost) AS cost
FROM UsageLog
GROUP BY month
ORDER BY month ASC;
`;
    console.log('monthlyUsage', monthlyUsage);
    return monthlyUsage;
  }
}

/**
 * example usage:
 * - /api/usage-logs/stats?group=monthly : get monthly usage for all time
 * - /api/usage-logs/stats?group=monthly&start=2025-01-01&end=2025-03-03 : get monthly usage between 2025-01-01 and 2025-03-03
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      const { group, start, end } = req.query;

      if (group === 'monthly') {
        const parsedStart = Array.isArray(start) ? start[0] : start;
        const parsedEnd = Array.isArray(end) ? end[0] : end;
        const period =
          parsedStart && parsedEnd
            ? { start: parsedStart, end: parsedEnd }
            : undefined;
        const monthlyUsage = await aggregateMonthlyUsage({ period });
        return res.status(200).json(monthlyUsage);
      } else {
        return res.status(400).json({ error: 'Invalid group' });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
