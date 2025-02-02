import { Box, HStack, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { OpenaiMessage } from '../../../config/llm-models';
import { Message } from '../Message/index';

interface MessageHistoryProps {
  messages: OpenaiMessage[];
  streaming?: boolean;
  streamingMessage?: string;
}

const colors = {
  user: {
    bgColor: '#eeeeee',
    borderColor: '#cccccc',
  },
  assistant: {
    bgColor: undefined,
    borderColor: '#cccccc',
  },
};

export const MessageHistory: FC<MessageHistoryProps> = (props) => {
  const { messages, streaming, streamingMessage } = props;

  return (
    <VStack
      align="stretch"
      spacing={20}
      p={4}
      bg="blue.50"
      minH="min-content"
      w="80%"
    >
      {messages.map((message, index) => (
        <Response
          key={index}
          isResponseOfUser={message.role === 'user'}
          response={message.content}
        />
      ))}
      {streaming && (
        <Response
          isResponseOfUser={false}
          response={streamingMessage || 'Generating...'}
        />
      )}
    </VStack>
  );
};

interface Response {
  isResponseOfUser: boolean;
  response: string;
  isStreaming?: boolean;
}

const Response: FC<Response> = (props) => {
  const { isResponseOfUser, response } = props;
  return (
    <HStack w="100%" justify={isResponseOfUser ? 'flex-end' : 'flex-start'}>
      <Box
        maxW={isResponseOfUser ? '70%' : '100%'}
        w={isResponseOfUser ? NaN : '100%'}
        py={2}
      >
        <Message
          message={response}
          bgColor={
            isResponseOfUser ? colors.user.bgColor : colors.assistant.bgColor
          }
          borderColor={
            isResponseOfUser
              ? colors.user.borderColor
              : colors.assistant.borderColor
          }
        />
      </Box>
    </HStack>
  );
};
