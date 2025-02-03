import { calculateCost } from '@/config/llm-models';
import { MessageDetail } from '@/hooks/useOpenai';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FC, memo } from 'react';
import { Message } from '../Message/index';

interface MessageHistoryProps {
  messages: MessageDetail[];
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
  error: {
    bgColor: '#ffcccc',
    borderColor: '#ff0000',
  },
};
interface ResponseProps {
  responseType: 'user' | 'assistant' | 'error';
  response: string;
  cost?: number;
  isStreaming?: boolean;
}

const Response = memo<ResponseProps>((props) => {
  const { responseType, response, cost } = props;

  return (
    <HStack
      w="100%"
      justify={responseType === 'user' ? 'flex-end' : 'flex-start'}
    >
      <Box
        maxW={responseType === 'user' ? '70%' : '100%'}
        w={responseType === 'user' ? undefined : '100%'}
        py={2}
      >
        <Message
          message={response}
          bgColor={
            responseType === 'user'
              ? colors.user.bgColor
              : responseType === 'assistant'
              ? colors.assistant.bgColor
              : colors.error.bgColor
          }
          borderColor={
            responseType === 'user'
              ? colors.user.borderColor
              : responseType === 'assistant'
              ? colors.assistant.borderColor
              : colors.error.borderColor
          }
        />
        {cost && Number((cost / 1000000).toFixed(6)).toString()}
      </Box>
    </HStack>
  );
});

const PastMessages = memo<{ messages: MessageDetail[] }>((props) => {
  const { messages } = props;
  return (
    <>
      {messages.map((message, index) => (
        <Response
          key={index}
          responseType={message.role}
          response={message.content}
          cost={
            message.inputTokens &&
            message.outputTokens &&
            message.model &&
            calculateCost(
              message.model,
              message.inputTokens,
              message.outputTokens,
            )
          }
        />
      ))}
    </>
  );
});

export const MessageHistory: FC<MessageHistoryProps> = (props) => {
  const { messages, streaming, streamingMessage } = props;
  return (
    <VStack align="stretch" p={4} minH="min-content" w="80%">
      <PastMessages messages={messages} />
      {streaming && (
        <Response
          responseType="assistant"
          response={streamingMessage || 'Generating...'}
        />
      )}
    </VStack>
  );
};
