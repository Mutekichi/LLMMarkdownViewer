import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Button, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FC, useState } from 'react';
import { MarkdownViewer } from '../../MarkdownViewer';

interface MessageProps {
  message: string;
  bgColor?: string;
  borderColor?: string;
}

const MotionBox = motion(Box);

export const Message: FC<MessageProps> = ({
  message,
  bgColor,
  borderColor,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      position="relative"
      px={8}
      pt={2}
      pb={2}
      bg={bgColor}
      border={borderColor ? `2px solid ${borderColor}` : undefined}
      borderRadius={20}
      // overflow="hidden"
    >
      <Button
        position="absolute"
        top="8px"
        left="-40px"
        size="sm"
        px={0}
        variant="ghost"
        _hover={{ bg: 'transparent' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {
          <Icon
            as={isCollapsed ? ChevronUpIcon : ChevronDownIcon}
            boxSize={5}
          />
        }
      </Button>

      <MotionBox
        initial={false}
        animate={{
          height: isCollapsed ? 40 : 'auto',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        overflow="hidden"
      >
        <MarkdownViewer markdown={message} />
      </MotionBox>
    </Box>
  );
};
