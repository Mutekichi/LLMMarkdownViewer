'use client';
import { DialogTrigger } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { Button, Flex, Icon } from '@chakra-ui/react';
import { FC } from 'react';
import { IoAnalytics } from 'react-icons/io5';

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export const AppHeader: FC<AppHeaderProps> = (props) => {
  const { onMenuClick } = props;

  console.log('re-rendering AppHeader');

  return (
    <Flex
      as="header"
      w="100%"
      h="50px"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      px={6}
      py={2}
    >
      <div />
      <Tooltip content="Analytics" positioning={{ placement: 'bottom' }}>
        <DialogTrigger asChild>
          <Button
            display="flex"
            bgColor="transparent"
            opacity={1}
            borderRadius={10}
            //   _hover={{ bgColor: 'blackAlpha.50' }}
            onClick={onMenuClick}
          >
            {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
            <Icon as={IoAnalytics} boxSize={8} color="blackAlpha.800" />
          </Button>
        </DialogTrigger>
      </Tooltip>
    </Flex>
  );
};
