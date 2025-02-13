import { MarkdownViewer } from '@/components/MarkdownViewer';
import { HighlightableReactMarkdown } from '@/components/MarkdownViewer/HighlightableReactMarkdown';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Button, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FC, memo, useState } from 'react';
import { HighlightedParts } from '../Main';
import { HighlightRange } from '../MarkdownViewer/HighlightableReactMarkdown/HighlightableElement';
interface MessageProps {
  message: string;
  messageId: string;
  bgColor?: string;
  borderColor?: string;
  hasBorder?: boolean;
  onSelection?: (info: {
    id: string;
    startOffset: number;
    endOffset: number;
  }) => void;
  highlight?: {
    renderPopover: (
      info: {
        partId: string;
        text?: string;
        absoluteStart: number;
        absoluteEnd: number;
        anchorRect: DOMRect;
      },
      close: () => void,
    ) => React.ReactNode;
    onHighlightedClick: (partsId: string, range: HighlightRange) => void;
    highlightedParts: HighlightedParts;
  };
}

const MotionBox = motion(Box);

const MessageComponent: FC<MessageProps> = (props) => {
  const { message, bgColor, borderColor, hasBorder, highlight } = props;

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      // position="relative"
      px={hasBorder ? 8 : 2}
      pt={2}
      pb={2}
      bg={bgColor}
      border={hasBorder && borderColor ? `2px solid ${borderColor}` : undefined}
      borderRadius={hasBorder ? 20 : undefined}
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
        {highlight ? (
          <HighlightableReactMarkdown
            markdown={message}
            highlightedParts={highlight.highlightedParts}
            renderPopover={(info, close) =>
              highlight.renderPopover(info, close)
            }
            onHighlightedClick={highlight.onHighlightedClick}
          />
        ) : (
          <MarkdownViewer markdown={message} />
        )}
      </MotionBox>
    </Box>
  );
};

export const Message = memo(MessageComponent);
