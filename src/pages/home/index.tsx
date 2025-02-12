import Main from '@/components/Main';
import { ContainerRefProvider } from '@/contexts/ContainerRefContext';
import { Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';

const Home: FC = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ContainerRefProvider>
        <Box w="100%" h="100vh">
          <Main />;
        </Box>
      </ContainerRefProvider>
    </QueryClientProvider>
  );
};

export default Home;
