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

export const UsageBarChart: FC<UsageBarChartProps> = (props) => {
  const { data } = props;
  console.log(data);
  return (
    <Box w="100%" h="300px">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip cursor={false} />
          <Bar dataKey="cost" fill="#777777" name="cost" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
