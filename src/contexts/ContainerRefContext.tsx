import { createContext, ReactNode, useContext, useRef } from 'react';

interface ContainerRefContextType {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ContainerRefContext = createContext<ContainerRefContextType | null>(null);

export const ContainerRefProvider = ({ children }: { children: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <ContainerRefContext.Provider value={{ containerRef }}>
      {children}
    </ContainerRefContext.Provider>
  );
};

export const useContainerRef = () => {
  const context = useContext(ContainerRefContext);
  if (!context) {
    throw new Error(
      'useContainerRef must be used within a ContainerRefProvider',
    );
  }
  return context;
};
