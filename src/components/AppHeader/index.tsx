'use client';
import { DialogTrigger } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { Button, Flex, Icon } from '@chakra-ui/react';
import { FC } from 'react';
import { IoAnalytics } from 'react-icons/io5';
import { PiSidebarSimple } from 'react-icons/pi';

type AppHeaderProps = {
  onMenuClick?: () => void;
  onSidebarIconClick?: () => void;
};

export const AppHeader: FC<AppHeaderProps> = (props) => {
  const { onMenuClick, onSidebarIconClick } = props;

  return (
    <Flex
      as="header"
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      pl={2}
      pr={4}
      py={2}
    >
      <Button
        h="50px"
        display="flex"
        bgColor="transparent"
        opacity={1}
        borderRadius={8}
        _hover={{ bgColor: 'gray.300' }}
        onClick={onSidebarIconClick}
      >
        {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
        <Icon as={PiSidebarSimple} boxSize={8} color="blackAlpha.800" />
      </Button>
      <Tooltip content="Analytics" positioning={{ placement: 'bottom' }}>
        <DialogTrigger asChild>
          <Button
            h="50px"
            display="flex"
            bgColor="transparent"
            opacity={1}
            borderRadius={8}
            _hover={{ bgColor: 'gray.300' }}
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
