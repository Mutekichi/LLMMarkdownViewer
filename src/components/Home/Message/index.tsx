import { Box } from '@chakra-ui/react';
import { FC } from 'react';
import MarkdownViewer from '../../MarkdownViewer';

interface MessageProps {
  message: string;
}

export const Message: FC<MessageProps> = (props) => {
  const { message } = props;

  return (
    <Box p={2} borderRadius="md">
      {MarkdownViewer({ markdown: message })}
    </Box>
  );
};
