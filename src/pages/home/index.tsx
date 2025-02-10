import { ContainerRefProvider } from '@/contexts/ContainerRefContext';
import { FC } from 'react';
import Home from '../../components/Home';

const homepage: FC = () => {
  return (
    <ContainerRefProvider>
      <Home />;
    </ContainerRefProvider>
  );
};

export default homepage;
