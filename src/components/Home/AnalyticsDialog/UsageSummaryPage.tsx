import { FormatNumber, HStack, Stat, VStack } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { UsageBarChart } from './UsageBarChart';

interface MonthlyUsage {
  month: string; // YYYY-MM
  cost: number;
}

interface WeeklyUsage {
  cost: number;
}

interface DaylyUsage {
  cost: number;
}

const extendMonthlyUsage = (monthlyUsage: MonthlyUsage[]): MonthlyUsage[] => {
  if (monthlyUsage.length >= 3) return monthlyUsage;

  monthlyUsage.sort((a, b) => a.month.localeCompare(b.month));

  const extendedUsage = [...monthlyUsage];

  // get the most previous month
  let [year, month] =
    extendedUsage.length > 0
      ? extendedUsage[0].month.split('-').map(Number)
      : [new Date().getFullYear(), new Date().getMonth() + 1];

  // extend the usage to 3 months
  while (extendedUsage.length < 3) {
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    const newMonth = `${year}-${String(month).padStart(2, '0')}`;
    extendedUsage.unshift({ month: newMonth, cost: 0 });
  }

  return extendedUsage;
};

export const UsageSummaryPage: FC = () => {
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>([
    {
      month: '1900-01',
      cost: 0,
    },
  ]);
  const [weeklyUsage, setWeeklyUsage] = useState<WeeklyUsage[]>([
    {
      cost: 0,
    },
  ]);
  const [dailyUsage, setDailyUsage] = useState<DaylyUsage[]>([
    {
      cost: 0,
    },
  ]);

  useEffect(() => {
    const fetchMonthlyUsage = async () => {
      const response = await fetch('/api/usage-logs/stats?group=monthly');
      const data = await response.json();
      setMonthlyUsage(data);
    };
    const fetchWeeklyUsage = async () => {
      const response = await fetch('/api/usage-logs/stats?group=weekly');
      const data = await response.json();
      setWeeklyUsage(data);
    };
    const fetchDailyUsage = async () => {
      const response = await fetch('/api/usage-logs/stats?group=daily');
      const data = await response.json();
      setDailyUsage(data);
    };

    fetchMonthlyUsage()
      .then(() => {
        // setMonthlyUsage(extendMonthlyUsage(monthlyUsage)),
      })
      .catch((error) => {
        console.error('Failed to fetch monthly usage', error);
      });

    fetchWeeklyUsage()
      .then(() => {
        // setWeeklyUsage(extendMonthlyUsage(weeklyUsage)),
      })
      .catch((error) => {
        console.error('Failed to fetch weekly usage', error);
      });

    fetchDailyUsage()
      .then(() => {
        // setDailyUsage(extendMonthlyUsage(dailyUsage)),
      })
      .catch((error) => {
        console.error('Failed to fetch daily usage', error);
      });
  }, []);

  return (
    <VStack p={6} gap={10} align="start">
      <HStack w="50%">
        <Stat.Root size="lg">
          <Stat.Label>Today</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={dailyUsage[0].cost / 1000000}
              style="currency"
              currency="USD"
            />
          </Stat.ValueText>
        </Stat.Root>
        <Stat.Root size="lg">
          <Stat.Label>This week</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={weeklyUsage[0].cost / 1000000}
              style="currency"
              currency="USD"
            />
          </Stat.ValueText>
        </Stat.Root>
      </HStack>
      <UsageBarChart data={extendMonthlyUsage(monthlyUsage)} />
    </VStack>
  );
};
