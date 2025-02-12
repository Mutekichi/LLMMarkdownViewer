'use client';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { Box, Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { Dispatch, FC, memo, SetStateAction, useCallback } from 'react';
import { CiSaveDown1 } from 'react-icons/ci';
import { RxTrash } from 'react-icons/rx';
import {
  OPENAI_MODEL_DISPLAY_NAMES,
  OpenaiModelType,
} from '../../../config/llm-models';
import { PopoverSelect, PopoverSelectOption } from '../../PopoverSelect';

interface MessageSettingPartProps {
  model: string;
  setModel: Dispatch<SetStateAction<OpenaiModelType>>;
  isModelSelectPopoverOpen: boolean;
  setIsModelSelectPopoverOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  isTemporaryChatOpen: boolean;
  setIsTemporaryChatOpen: (isOpen: boolean) => void;
  temporaryResetHistory: () => void;
  onSaveButtonClick: () => void;
  onLoadButtonClick: () => void;
  onResetButtonClick: () => void;
}

const createModelOptions = (): PopoverSelectOption<OpenaiModelType>[] => {
  return Object.entries(OPENAI_MODEL_DISPLAY_NAMES).map(([value, label]) => ({
    value: value as OpenaiModelType,
    label,
  }));
};

export const MessageSettingPart: FC<MessageSettingPartProps> = memo((props) => {
  const {
    model,
    setModel,
    isModelSelectPopoverOpen,
    setIsModelSelectPopoverOpen,
    isLoading,
    isTemporaryChatOpen,
    setIsTemporaryChatOpen,
    temporaryResetHistory,
    onSaveButtonClick,
    onLoadButtonClick,
    onResetButtonClick,
  } = props;

  const onTemporaryChatButtonClick = useCallback(() => {
    if (isTemporaryChatOpen) {
      temporaryResetHistory();
    }
    setIsTemporaryChatOpen(!isTemporaryChatOpen);
  }, [isTemporaryChatOpen]);

  return (
    <HStack w="80%" h="100%" gap={4}>
      <PopoverSelect
        options={createModelOptions()}
        value={model}
        onChange={setModel}
        isOpen={isModelSelectPopoverOpen}
        setIsOpen={setIsModelSelectPopoverOpen}
        onOpen={() => setIsModelSelectPopoverOpen(true)}
        onClose={() => setIsModelSelectPopoverOpen(false)}
        disabled={isLoading}
        tooltipLabelOnDisabled="You can't change the model while generating."
      />
      <Tooltip
        content="Temporary chat"
        positioning={{ placement: 'right-end' }}
        openDelay={100}
        closeDelay={100}
      >
        <HStack
          h="100%"
          alignItems="flex-end"
          pb={2}
          gap={0}
          onClick={onTemporaryChatButtonClick}
          cursor="pointer"
          borderRadius={10}
          _hover={{ bgColor: 'blackAlpha.50' }}
        >
          <Box
            display="flex"
            alignItems="flex-start"
            h="100%"
            opacity={isTemporaryChatOpen ? 1 : 0.5}
          >
            {/* <img src="/icons/vanish.svg" alt="SVG" width={40} height={40} /> */}
            <img
              src="/icons/temporary_chat.svg"
              alt="SVG"
              width={40}
              height={40}
            />
          </Box>
          <Flex justify="flex-end">
            <Switch size="lg" checked={isTemporaryChatOpen} />
          </Flex>
        </HStack>
      </Tooltip>
      <Tooltip
        content="Clear all history"
        positioning={{ placement: 'right-end' }}
        openDelay={100}
        closeDelay={100}
      >
        <Button
          display="flex"
          h="100%"
          w="80px"
          bgColor="transparent"
          opacity={1}
          px={2}
          borderRadius={10}
          _hover={{ bgColor: 'blackAlpha.50' }}
          onClick={onResetButtonClick}
        >
          {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
          <Icon as={RxTrash} boxSize={10} color="blackAlpha.800" />
        </Button>
      </Tooltip>
      <Button
        display="flex"
        h="100%"
        w="80px"
        bgColor="transparent"
        opacity={1}
        px={2}
        borderRadius={10}
        _hover={{ bgColor: 'blackAlpha.50' }}
        onClick={() => {
          onSaveButtonClick();
        }}
      >
        {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
        <Icon as={CiSaveDown1} boxSize={10} color="blackAlpha.800" />
      </Button>
      <Button
        display="flex"
        h="100%"
        w="80px"
        bgColor="transparent"
        opacity={1}
        px={2}
        borderRadius={10}
        _hover={{ bgColor: 'blackAlpha.50' }}
        onClick={() => {
          onLoadButtonClick();
        }}
      >
        {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
        <Icon as={CiSaveDown1} boxSize={10} color="blackAlpha.800" />
      </Button>
    </HStack>
  );
});
