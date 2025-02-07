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
import { FC, useCallback, useEffect, useRef, useState } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    output,
    isLoading,
    error,
    streamResponse,
    stopGeneration,
    setStopGeneration,
    chatMessages,
    messageDetails,
    resetHistory,
  } = useOpenai();

  const {
    output: temporaryOutput,
    isLoading: temporaryIsLoading,
    error: temporaryError,
    streamResponse: temporaryStreamResponse,
    stopGeneration: temporaryStopGeneration,
    setStopGeneration: temporarySetStopGeneration,
    chatMessages: temporaryChatMessages,
    messageDetails: temporaryMessageDetails,
    resetHistory: temporaryResetHistory,
    temporaryStreamResponse: temporaryTemporaryStreamResponse,
    // } = useMockOpenai();
  } = useOpenai();
  const [isModelSelectPopoverOpen, setIsModelSelectPopoverOpen] =
    useState(false);
  const [isTemporaryChatOpen, setIsTemporaryChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [model, setModel] = useState<OpenaiModelType>(OpenaiModelType.o1mini);
  const containerRef = useRef<HTMLDivElement>(null);

  // const onTemporaryChatButtonClick = () => {
  //   if (isTemporaryChatOpen) {
  //     temporaryResetHistory();
  //   }
  //   setIsTemporaryChatOpen(!isTemporaryChatOpen);
  // };

  const onTemporaryChatButtonClick = useCallback(() => {
    if (isTemporaryChatOpen) {
      temporaryResetHistory();
    }
    setIsTemporaryChatOpen(!isTemporaryChatOpen);
  }, [isTemporaryChatOpen]);

  const scrollDown = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [containerRef]);

  useEffect(() => {
    if (isTemporaryChatOpen && containerRef.current) scrollDown();
  }, [isTemporaryChatOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == 'Enter' && document.activeElement !== textareaRef.current) {
        // focus on textarea if the user presses Enter key and the textarea is not focused
        textareaRef.current?.focus();
        // prevent default behavior if the textarea is focused
        // otherwise, the Enter will trigger the new line in the textarea
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
      <VStack
        flex="1"
        overflowY="auto"
        w="100%"
        pb={4}
        minH="20vh"
        ref={containerRef}
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
            textareaRef={textareaRef}
            onChange={(value) => setInputText(value)}
            onButtonClick={(value) => {
              if (isTemporaryChatOpen) {
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
              onClick={() => {
                resetHistory();
                if (isTemporaryChatOpen) {
                  temporaryResetHistory();
                  setIsTemporaryChatOpen(false);
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
