'use client';
import { ChatMessage, MessageDetail } from '@/hooks/useOpenai';
import { excludeSystemMessages } from '@/utils/chatUtils';
import { Text, VStack } from '@chakra-ui/react';
import { FC, memo } from 'react';
import { MessageHistory } from '../MessageHistory';

interface MessageHistoryPartProps {
  isTemporaryChatOpen: boolean;
  temporaryMessageDetails: MessageDetail[];
  temporaryIsLoading: boolean;
  temporaryOutput: string;
  chatMessages: ChatMessage[];
  messageDetails: MessageDetail[];
  isLoading: boolean;
  output: string;
  openTemporaryChat: () => void;
  closeTemporaryChat: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  selectedText: string;
  setSelectedText: (text: string) => void;
}

export const MessageHistoryPart: FC<MessageHistoryPartProps> = memo((props) => {
  const {
    isTemporaryChatOpen,
    temporaryMessageDetails,
    temporaryIsLoading,
    temporaryOutput,
    chatMessages,
    messageDetails,
    isLoading,
    output,
    openTemporaryChat,
    closeTemporaryChat,
    containerRef,
    selectedText,
    setSelectedText,
  } = props;

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
    }
  };

  const handleMouseLeave = () => {
    setSelectedText('');
  };

  return (
    <VStack
      flex="1"
      overflowY="auto"
      w="100%"
      pb={4}
      minH="20vh"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <MessageHistory
        messages={excludeSystemMessages(messageDetails)}
        // chatMessages={chatMessages}
        streaming={isLoading}
        streamingMessage={output}
      />
      {isTemporaryChatOpen && (
        <VStack
          w="80%"
          gap={2}
          justify="space-between"
          bgColor="#eeeeee"
          flex="1"
          borderTopRadius={20}
          border="1"
          justifyContent="start"
        >
          <VStack p={2} gap={0}>
            <Text fontSize="1.5rem" textAlign="center">
              Temporary Chat
            </Text>
            <Text fontSize="1.2rem" textAlign="center">
              This conversation does not include any previous chat history and
              will not be saved.
            </Text>
            <Text fontSize="1.2rem" textAlign="center">
              {selectedText}
            </Text>
          </VStack>
          <MessageHistory
            messages={excludeSystemMessages(temporaryMessageDetails)}
            streaming={temporaryIsLoading}
            streamingMessage={temporaryOutput}
          />
        </VStack>
      )}
    </VStack>
  );
});
