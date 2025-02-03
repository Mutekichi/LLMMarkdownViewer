import { Box } from '@chakra-ui/react';
import { FC } from 'react';
import { MarkdownViewer } from '../../MarkdownViewer';
interface MessageProps {
  message: string;
  bgColor?: string;
  borderColor?: string;
}

export const Message: FC<MessageProps> = (props) => {
  const { message, bgColor, borderColor } = props;

  return (
    <Box
      px={8}
      pt={2}
      pb={2}
      bg={bgColor}
      border={borderColor ? `2px solid ${borderColor}` : undefined}
      borderRadius="20"
      overflow="hidden"
    >
      <MarkdownViewer markdown={message} />
    </Box>
  );
};
