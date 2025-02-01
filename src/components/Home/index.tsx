import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';
import styles from './Home.module.scss';
import Main from './Main';
import ParticleBackground from './ParticleBackground';

const Home: FC = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <div className={styles.root}>
        <ParticleBackground />
        <Main />
      </div>
    </QueryClientProvider>
  );
};

export default Home;
