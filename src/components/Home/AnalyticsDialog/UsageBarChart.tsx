import { Box } from '@chakra-ui/react';
import { FC } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MonthlyUsage {
  month: string;
  cost: number;
}

export interface UsageBarChartProps {
  data: MonthlyUsage[];
}

/**
 * Since the cost is in the unit of 1/1000000, we need to divide it by 1000000 to get the actual cost.
 */
const formatData = (data: MonthlyUsage[]): MonthlyUsage[] => {
  return data.map((d) => {
    return {
      ...d,
      cost: d.cost / 1000000,
    };
  });
};

export const UsageBarChart: FC<UsageBarChartProps> = (props) => {
  const { data } = props;
  console.log(data);
  return (
    <Box w="100%" h="300px">
      <ResponsiveContainer>
        <BarChart data={formatData(data)}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            cursor={false}
            formatter={(value: number): string => {
              return '$' + value.toFixed(4);
            }}
          />
          <Bar dataKey="cost" fill="#777777" name="cost" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
