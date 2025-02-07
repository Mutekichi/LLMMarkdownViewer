'use client';
import { DialogRoot } from '@/components/ui/dialog';
import { useOpenai } from '@/hooks/useOpenai';
import { checkInputLength } from '@/utils/chatUtils';
import { Center, VStack } from '@chakra-ui/react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  OPENAI_MODEL_DISPLAY_NAMES,
  OpenaiModelType,
} from '../../../config/llm-models';
import CustomTextInput from '../../CustomInput';
import { PopoverSelectOption } from '../../PopoverSelect';
import { AppHeader } from '../AppHeader';

import { AnalyticsDialog } from '../AnalyticsDialog';
import { MessageHistoryPart } from './MessagePart';
import { MessageSettingPart } from './MessageSettingPart';

const createModelOptions = (): PopoverSelectOption<OpenaiModelType>[] => {
  return Object.entries(OPENAI_MODEL_DISPLAY_NAMES).map(([value, label]) => ({
    value: value as OpenaiModelType,
    label,
  }));
};

const Main: FC = () => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputText, setInputText] = useState('');
  const [model, setModel] = useState<OpenaiModelType>(OpenaiModelType.o1mini);

  const [isModelSelectPopoverOpen, setIsModelSelectPopoverOpen] =
    useState(false);
  const [isTemporaryChatOpen, setIsTemporaryChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAutoScrollMode, setIsAutoScrollMode] = useState(false);

  const onTemporaryChatButtonClick = useCallback(() => {
    if (isTemporaryChatOpen) {
      temporaryResetHistory();
    }
    setIsTemporaryChatOpen(!isTemporaryChatOpen);
  }, [isTemporaryChatOpen]);

  const isNearBottom = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop - clientHeight < 300;
    }
    return false;
  }, [containerRef]);

  const scrollDown = useCallback(
    (onlyWhenNearBottom: boolean = false) => {
      if (containerRef.current && (!onlyWhenNearBottom || isNearBottom())) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    },
    [containerRef, isNearBottom],
  );

  useEffect(() => {
    // this effect is fired when starting or finishing the generation
    // loading -> not loading means the generation is finished
    if (!(isLoading || temporaryIsLoading)) {
      scrollDown(true);
      setIsAutoScrollMode(false);
      // not loading -> loading means the generation is starting
      // we set the auto scroll mode while the generation is running
    } else {
      setIsAutoScrollMode(true);
    }
  }, [isLoading, temporaryIsLoading]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAutoScrollMode) scrollDown(true);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAutoScrollMode]);

  useEffect(() => {
    if (isTemporaryChatOpen && containerRef.current) scrollDown(false);
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
      {/* <VStack
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
      </VStack> */}
      <MessageHistoryPart
        isTemporaryChatOpen={isTemporaryChatOpen}
        temporaryMessageDetails={temporaryMessageDetails}
        temporaryIsLoading={temporaryIsLoading}
        temporaryOutput={temporaryOutput}
        chatMessages={chatMessages}
        messageDetails={messageDetails}
        isLoading={isLoading}
        output={output}
        openTemporaryChat={onTemporaryChatButtonClick}
        closeTemporaryChat={onTemporaryChatButtonClick}
        containerRef={containerRef}
      />
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
        <MessageSettingPart
          model={model}
          setModel={setModel}
          isModelSelectPopoverOpen={isModelSelectPopoverOpen}
          setIsModelSelectPopoverOpen={setIsModelSelectPopoverOpen}
          isLoading={isLoading}
          isTemporaryChatOpen={isTemporaryChatOpen}
          setIsTemporaryChatOpen={setIsTemporaryChatOpen}
          resetHistory={resetHistory}
          temporaryResetHistory={temporaryResetHistory}
        />
      </VStack>
    </VStack>
  );
};

export default Main;
