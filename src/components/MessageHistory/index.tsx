import { calculateCost } from '@/config/llm-models';
import { HighlightedPartInfo, HighlightRange } from '@/hooks/useHighlight';
import { MessageDetail } from '@/hooks/useOpenai';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { FC, memo } from 'react';
import { Message, MessageStyle } from '../Message/index';
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
    onHighlightedClick: (
      msgId: string,
      partsId: string,
      range: HighlightRange,
    ) => void;
  };
  style?: {
    hasBorder: boolean;
    canCollapse: boolean;
  };
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
  style?: MessageStyle;
  highlight?: {
    highlightedPartInfo: HighlightedPartInfo;
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
  };
}

const Response = memo<ResponseProps>((props) => {
  const { messageId, responseType, response, cost, style, highlight } = props;

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
                  highlightedParts:
                    highlight.highlightedPartInfo[messageId] || [],
                }
              : undefined
          }
          style={style}
        />
        {cost && '$ ' + Number((cost / 1000000).toFixed(6)).toString()}
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
    onHighlightedClick: (
      msgId: string,
      partsId: string,
      range: HighlightRange,
    ) => void;
  };
  style?: MessageStyle;
  hasBorder?: boolean;
}>((props) => {
  const { messages, highlight, style } = props;
  return (
    <>
      {messages.map((message, index) => (
        <Response
          messageId={message.id.toString()}
          key={index}
          responseType={message.role}
          response={message.content}
          cost={
            message.cost
              ? message.cost
              : message.inputTokens &&
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
                    ? (partsId, range) =>
                        highlight.onHighlightedClick(
                          message.id.toString(),
                          partsId,
                          range,
                        )
                    : () => null,
                }
              : undefined
          }
          style={style}
        />
      ))}
    </>
  );
});

export const MessageHistory: FC<MessageHistoryProps> = (props) => {
  const {
    messages,
    streaming,
    streamingMessage,
    highlight,
    style = {
      hasBorder: true,
      canCollapse: true,
    },
  } = props;
  return (
    <VStack align="stretch" p={4} minH="min-content" w="100%">
      <PastMessages messages={messages} highlight={highlight} style={style} />
      {streaming && (
        <Response
          messageId="streaming"
          responseType="assistant"
          response={streamingMessage || 'Generating...'}
          style={style}
        />
      )}
    </VStack>
  );
};
