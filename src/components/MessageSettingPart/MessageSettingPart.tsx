'use client';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { Box, Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { FC, memo, useCallback } from 'react';
import { SlFolder, SlSupport, SlTrash } from 'react-icons/sl';
import {
  OPENAI_MODEL_DISPLAY_NAMES,
  OpenaiModelType,
} from '../../config/llm-models';
import { PopoverSelect, PopoverSelectOption } from '../PopoverSelect';
interface MessageSettingPartProps {
  model: OpenaiModelType;
  setModel: (model: OpenaiModelType) => void;
  isModelSelectPopoverOpen: boolean;
  setIsModelSelectPopoverOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  isTemporaryChatOpen: boolean;
  setIsTemporaryChatOpen: (isOpen: boolean) => void;
  temporaryResetHistory: () => void;
  onSaveButtonClick: () => void;
  onResetButtonClick: () => void;
  onContactButtonClick: () => void;
}

const createModelOptions = (): PopoverSelectOption<OpenaiModelType>[] => {
  return Object.entries(OPENAI_MODEL_DISPLAY_NAMES).map(([value, label]) => ({
    value: value as OpenaiModelType,
    label,
  }));
};
// MessageSettingPart.tsx
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
    onResetButtonClick,
    onContactButtonClick: openContactDialog,
  } = props;

  const onTemporaryChatButtonClick = useCallback(() => {
    if (isTemporaryChatOpen) {
      temporaryResetHistory();
    }
    setIsTemporaryChatOpen(!isTemporaryChatOpen);
  }, [isTemporaryChatOpen]);

  return (
    <HStack w="80%" h="100%" justify="space-between">
      <HStack w="100%" h="100%" gap={4}>
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
        <HStack w="auto" h="100%" gap={4}>
          <Tooltip
            content="Temporary chat"
            positioning={{ placement: 'right-end' }}
            openDelay={100}
            closeDelay={100}
          >
            <HStack
              h="100%"
              w="70px"
              alignItems="flex-end"
              pb={2}
              gap={0}
              onClick={onTemporaryChatButtonClick}
              cursor="pointer"
              borderRadius={10}
              _hover={{ bgColor: 'blackAlpha.50' }}
            >
              <Box
                pt={2}
                display="flex"
                alignItems="flex-start"
                h="100%"
                opacity={isTemporaryChatOpen ? 1 : 0.5}
              >
                <img
                  src="/icons/temporary_chat.svg"
                  alt="SVG"
                  width={30}
                  height={30}
                />
              </Box>
              <Flex justify="flex-end">
                <Switch size="md" checked={isTemporaryChatOpen} />
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
              w="70px"
              bgColor="transparent"
              opacity={1}
              px={2}
              borderRadius={10}
              _hover={{ bgColor: 'blackAlpha.50' }}
              onClick={onResetButtonClick}
            >
              <Icon as={SlTrash} boxSize={8} color="blackAlpha.800" />
            </Button>
          </Tooltip>

          <Tooltip
            content="Save chat history"
            positioning={{ placement: 'right-end' }}
            openDelay={100}
            closeDelay={100}
          >
            <Button
              display="flex"
              h="100%"
              w="70px"
              bgColor="transparent"
              opacity={1}
              px={2}
              borderRadius={10}
              _hover={{ bgColor: 'blackAlpha.50' }}
              onClick={() => {
                onSaveButtonClick();
              }}
            >
              <Icon as={SlFolder} boxSize={8} color="blackAlpha.800" />
            </Button>
          </Tooltip>
        </HStack>
      </HStack>
      <Tooltip
        content="Give your feedback"
        positioning={{ placement: 'right-end' }}
        openDelay={100}
        closeDelay={100}
      >
        <Button
          display="flex"
          h="100%"
          w="70px"
          bgColor="transparent"
          opacity={1}
          px={2}
          borderRadius={10}
          _hover={{ bgColor: 'blackAlpha.50' }}
          onClick={openContactDialog}
        >
          <Icon as={SlSupport} boxSize={8} color="blackAlpha.800" />
        </Button>
      </Tooltip>
    </HStack>
  );
});
