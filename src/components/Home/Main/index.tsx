'use client';
import { DialogRoot } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { useOpenai } from '@/hooks/useOpenai';
import { checkInputLength, excludeSystemMessages } from '@/utils/chatUtils';
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FC, useState } from 'react';
import { RxTrash } from 'react-icons/rx';
import {
  OPENAI_MODEL_DISPLAY_NAMES,
  OpenaiModelType,
} from '../../../config/llm-models';
import CustomTextInput from '../../CustomInput';
import { PopoverSelect, PopoverSelectOption } from '../../PopoverSelect';
import { AppHeader } from '../AppHeader';
import { MessageHistory } from '../MessageHistory';

import { AnalyticsDialog } from '../AnalyticsDialog';

const createModelOptions = (): PopoverSelectOption<OpenaiModelType>[] => {
  return Object.entries(OPENAI_MODEL_DISPLAY_NAMES).map(([value, label]) => ({
    value: value as OpenaiModelType,
    label,
  }));
};

const Main: FC = () => {
  const [inputText, setInputText] = useState('');
  const {
    output,
    isLoading,
    error,
    streamResponse,
    clearOutput,
    stopGeneration,
    setStopGeneration,
    chatMessages,
    messageDetails,
    clearAllHistory,
  } = useOpenai();
  // } = useMockOpenai();

  const {
    output: temporaryOutput,
    isLoading: temporaryIsLoading,
    error: temporaryError,
    streamResponse: temporaryStreamResponse,
    clearOutput: temporaryClearOutput,
    stopGeneration: temporaryStopGeneration,
    setStopGeneration: temporarySetStopGeneration,
    chatMessages: temporaryChatMessages,
    messageDetails: temporaryMessageDetails,
    clearAllHistory: temporaryClearAllHistory,
    temporaryStreamResponse: temporaryTemporaryStreamResponse,
    // } = useMockOpenai();
  } = useOpenai();
  const [isModelSelectPopoverOpen, setIsModelSelectPopoverOpen] =
    useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [model, setModel] = useState<OpenaiModelType>(OpenaiModelType.GPT4o);

  const onTemporaryChatButtonClick = () => {
    if (isChecked) {
      temporaryClearOutput();
    }
    setIsChecked(!isChecked);
  };
  return (
    <VStack
      w="100%"
      h="100%"
      maxH="100%"
      gap={0}
      justify="space-between"
      bgColor="#f5f5f5"
      boxSizing="border-box"
      pb={2}
      position="relative"
    >
      {/* we need to wrap AppHeader and AnalyticsDialog in DialogRoot to enable DialogRoot's context */}
      <DialogRoot
        open={isAnalyticsOpen}
        onOpenChange={(e) => setIsAnalyticsOpen(e.open)}
        size="cover"
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <AppHeader />
        <AnalyticsDialog />
      </DialogRoot>
      <VStack flex="1" overflowY="auto" w="100%" pb={4} minH="20vh">
        <MessageHistory
          messages={excludeSystemMessages(messageDetails)}
          // chatMessages={chatMessages}
          streaming={isLoading}
          streamingMessage={output}
        />
        {isChecked && (
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
            </VStack>
            <MessageHistory
              messages={excludeSystemMessages(temporaryMessageDetails)}
              streaming={temporaryIsLoading}
              streamingMessage={temporaryOutput}
            />
          </VStack>
        )}
      </VStack>
      <VStack w="100%" gap={2} pt={4} justify="space-between" bgColor="#f5f5f5">
        <Center w="80%">
          <CustomTextInput
            onChange={(value) => setInputText(value)}
            onButtonClick={(value) => {
              if (isChecked) {
                temporaryTemporaryStreamResponse(value, model);
                // temporarySetStopGeneration(false);
              } else {
                streamResponse(value, model);
                setStopGeneration(false);
              }
              setInputText('');
            }}
            buttonDisabled={!checkInputLength(inputText)}
            inputDisabled={isLoading}
          />
        </Center>
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
                opacity={isChecked ? 1 : 0.5}
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
                <Switch size="lg" checked={isChecked} />
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
              onClick={() => {
                clearAllHistory();
                if (isChecked) {
                  temporaryClearAllHistory();
                  setIsChecked(false);
                }
              }}
            >
              {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
              <Icon as={RxTrash} boxSize={10} color="blackAlpha.800" />
            </Button>
          </Tooltip>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default Main;
