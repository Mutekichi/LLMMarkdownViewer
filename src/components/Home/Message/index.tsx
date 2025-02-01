import { Box } from '@chakra-ui/react';
import { FC } from 'react';

interface MessageProps {
  message: string;
}

export const Message: FC<MessageProps> = (props) => {
  const { message } = props;

  return (
    <Box p={2} bg="gray.100" borderRadius="md">
      {message}
    </Box>
  );
};
