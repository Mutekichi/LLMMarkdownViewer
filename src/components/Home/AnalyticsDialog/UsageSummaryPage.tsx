import { Box, FormatNumber, HStack, Stat } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { UsageBarChart } from './UsageBarChart';

// sample
const todayUsage = {
  cost: 10000,
};

interface MonthlyUsage {
  month: string; // YYYY-MM
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
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage[]>([]);
  useEffect(() => {
    const fetchMonthlyUsage = async () => {
      const response = await fetch('/api/usage-logs/stats?group=monthly');
      const data = await response.json();
      setMonthlyUsage(data);
    };

    fetchMonthlyUsage()
      .then(() => {
        // setMonthlyUsage(extendMonthlyUsage(monthlyUsage)),
      })
      .catch((error) => {
        console.error('Failed to fetch monthly usage', error);
      });
  }, []);

  console.log('monthly usage', monthlyUsage);

  return (
    <Box p={6}>
      <HStack w="50%">
        <Stat.Root size="lg">
          <Stat.Label>Today</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={todayUsage.cost / 1000000}
              style="currency"
              currency="USD"
            />
          </Stat.ValueText>
        </Stat.Root>
        <Stat.Root size="lg">
          <Stat.Label>This week</Stat.Label>
          <Stat.ValueText>
            <FormatNumber
              value={todayUsage.cost / 1000000}
              style="currency"
              currency="USD"
            />
          </Stat.ValueText>
        </Stat.Root>
      </HStack>
      <UsageBarChart data={monthlyUsage} />
    </Box>
  );
};
