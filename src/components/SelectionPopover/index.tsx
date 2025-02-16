'use client';
import { Tooltip } from '@/components/ui/tooltip';
import { ChatMessage } from '@/hooks/useOpenai';
import { Button, HStack, Icon } from '@chakra-ui/react';
import { FC } from 'react';
import { SlMagnifier, SlPencil } from 'react-icons/sl';
import { CurrentSelection } from '../Main';

interface SelectionPopoverProps {
  msgId: string;
  info: {
    partId: string;
    text?: string;
    absoluteStart: number;
    absoluteEnd: number;
    anchorRect: DOMRect;
  };
  close: () => void;
  setCurrentSelection: (selection: CurrentSelection) => void;
  setActionType: (actionType: 'memo' | 'explain' | null) => void;
  setDrawerOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  explainResetHistory: () => void;
  explainSetChatMessages: (messages: ChatMessage[]) => void;
  setTextToExplain: (text: string) => void;
  setShouldStartExplanation: (shouldStartExplanation: boolean) => void;
  setInputText: (text: string) => void;
}

export const SelectionPopover: FC<SelectionPopoverProps> = (props) => {
  const {
    msgId,
    info,
    close,
    setCurrentSelection,
    setActionType,
    setDrawerOpen,
    chatMessages,
    explainResetHistory,
    explainSetChatMessages,
    setTextToExplain,
    setShouldStartExplanation,
    setInputText,
  } = props;

  return (
    <HStack p={2} w="auto" bgColor="white" borderRadius={10}>
      <Tooltip
        content="Add memo"
        positioning={{ placement: 'bottom' }}
        openDelay={100}
        closeDelay={100}
      >
        <Button
          display="flex"
          h="100%"
          w="auto"
          bgColor="transparent"
          opacity={1}
          px={2}
          py={1}
          borderRadius={10}
          _hover={{ bgColor: 'blackAlpha.50' }}
          onClick={() => {
            setCurrentSelection({
              msgId,
              partId: info.partId,
              startOffset: info.absoluteStart,
              endOffset: info.absoluteEnd,
            });
            setActionType('memo');
            setDrawerOpen(true);
            close();
          }}
        >
          <Icon as={SlPencil} boxSize={7} color="blackAlpha.800" />
        </Button>
      </Tooltip>
      <Tooltip
        content="More details"
        positioning={{ placement: 'bottom' }}
        openDelay={100}
        closeDelay={100}
      >
        <Button
          display="flex"
          h="100%"
          w="auto"
          bgColor="transparent"
          opacity={1}
          px={2}
          py={1}
          borderRadius={10}
          _hover={{ bgColor: 'blackAlpha.50' }}
          onClick={() => {
            setCurrentSelection({
              msgId,
              partId: info.partId,
              startOffset: info.absoluteStart,
              endOffset: info.absoluteEnd,
            });
            setActionType('explain');
            setInputText(
              info.text
                ? info.text.length > 20
                  ? info.text.slice(0, 20) + '...'
                  : info.text
                : '',
            );
            explainResetHistory();
            setDrawerOpen(true);
            close();
            // TODO: should not include messages after the selected message
            explainSetChatMessages([...chatMessages]);
            setTextToExplain(info.text || '');
            setShouldStartExplanation(true);
          }}
        >
          <Icon as={SlMagnifier} boxSize={7} color="blackAlpha.800" />
        </Button>
      </Tooltip>
    </HStack>
  );
};
