import { Box, FormatNumber, HStack, Stat } from '@chakra-ui/react';
import React from 'react';
import { UsageBarChart } from './UsageBarChart';

// 今日の使用量を表すサンプルデータ
const todayUsage = {
  cost: 10000,
};

// 月ごとの使用量を表すサンプルデータ
const monthlyUsageData = [
  { month: '2025-01', cost: 0 },
  {
    month: '2024-11',
    cost: 0,
  },
  {
    month: '2024-12',
    cost: 20000,
  },
];

export const UsageSummaryPage: React.FC = () => {
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
      <UsageBarChart data={monthlyUsageData} />
    </Box>
  );
};
