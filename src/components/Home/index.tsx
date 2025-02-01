import { Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';
import Main from './Main';

const Home: FC = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Box w="100%" h="100vh">
        <Main />
      </Box>
    </QueryClientProvider>
  );
};

export default Home;
