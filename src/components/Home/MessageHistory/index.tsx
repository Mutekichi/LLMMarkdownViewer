import { calculateCost } from '@/config/llm-models';
import { MessageDetail } from '@/hooks/useOpenai';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FC, memo } from 'react';
import { Message } from '../Message/index';
interface MessageHistoryProps {
  messages: MessageDetail[];
  streaming?: boolean;
  streamingMessage?: string;
  highlight?: {
    highlightedPartInfo: { [messageId: string]: any };
    renderPopover: (
      msgId: string,
      info: any,
      close: () => void,
    ) => React.ReactNode;
    onHighlightedClick: (msgId: string, info: any) => void;
  };
  hasBorder?: boolean;
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
  messageId: string;
  responseType: 'user' | 'assistant' | 'error';
  response: string;
  cost?: number;
  hasBorder?: boolean;
  isStreaming?: boolean;
  highlight?: {
    highlightedPartInfo: { [messageId: string]: any };
    renderPopover: (info: any, close: () => void) => React.ReactNode;
    onHighlightedClick: (info: any) => void;
  };
}

const Response = memo<ResponseProps>((props) => {
  const { messageId, responseType, response, cost, hasBorder, highlight } =
    props;

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
          messageId={messageId}
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
          highlight={
            highlight && responseType === 'assistant'
              ? {
                  renderPopover: highlight.renderPopover,
                  onHighlightedClick: highlight.onHighlightedClick,
                  highlightedPartInfo:
                    highlight.highlightedPartInfo[messageId] || [],
                }
              : undefined
          }
          hasBorder={hasBorder}
        />
        {cost && Number((cost / 1000000).toFixed(6)).toString()}
      </Box>
    </HStack>
  );
});

const PastMessages = memo<{
  messages: MessageDetail[];
  highlight?: {
    highlightedPartInfo: { [messageId: string]: any };
    renderPopover: (
      msgId: string,
      info: any,
      close: () => void,
    ) => React.ReactNode;
    onHighlightedClick: (msgId: string, info: any) => void;
  };
  hasBorder?: boolean;
}>((props) => {
  const { messages, highlight, hasBorder } = props;
  return (
    <>
      {messages.map((message, index) => (
        <Response
          messageId={message.id.toString()}
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
          highlight={
            highlight
              ? {
                  highlightedPartInfo: highlight.highlightedPartInfo || {},
                  renderPopover: highlight
                    ? (info, close) =>
                        highlight.renderPopover(
                          message.id.toString(),
                          info,
                          close,
                        )
                    : () => null,
                  onHighlightedClick: highlight
                    ? (info) =>
                        highlight.onHighlightedClick(
                          message.id.toString(),
                          info,
                        )
                    : () => null,
                }
              : undefined
          }
          hasBorder={hasBorder}
        />
      ))}
    </>
  );
});

export const MessageHistory: FC<MessageHistoryProps> = (props) => {
  const { messages, streaming, streamingMessage, highlight, hasBorder } = props;
  return (
    <VStack align="stretch" p={4} minH="min-content" w="100%">
      <PastMessages
        messages={messages}
        highlight={highlight}
        hasBorder={hasBorder}
      />
      {streaming && (
        <Response
          messageId="streaming"
          responseType="assistant"
          response={streamingMessage || 'Generating...'}
          hasBorder={hasBorder}
        />
      )}
    </VStack>
  );
};
