'use client';
import { DialogRoot } from '@/components/ui/dialog';
import { MessageDetail, useOpenai } from '@/hooks/useOpenai';
import { checkInputLength, excludeSystemMessages } from '@/utils/chatUtils';
import { Box, Button, Center, Input, Text, VStack } from '@chakra-ui/react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { OpenaiModelType } from '../../../config/llm-models';
import CustomTextInput from '../../CustomInput';
import { AppHeader } from '../AppHeader';

import {
  HighlightInfo,
  HighlightRange,
} from '@/components/MarkdownViewer/HighlightableReactMarkdown/HighlightableElement';
import {
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
} from '@/components/ui/drawer';
import { useContainerRef } from '@/contexts/ContainerRefContext';
import { AnalyticsDialog } from '../AnalyticsDialog';
import { MessageHistory } from '../MessageHistory';
import { MessageSettingPart } from './MessageSettingPart';

interface HighlightedPartInfo {
  [messageId: string]: HighlightInfo[];
}

interface Memos {
  [messageId: string]: {
    id: string;
    range: HighlightRange;
    memo: string;
  }[];
}

interface SupplementaryMessage {
  [messageId: string]: {
    id: string;
    range: HighlightRange;
    supplementary: MessageDetail;
  };
}

interface CurrentSelection {
  msgId: string;
  id: string;
  startOffset: number;
  endOffset: number;
  text?: string;
}

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
  } = useOpenai();

  const {
    output: explainOutput,
    isLoading: explainIsLoading,
    error: explainError,
    streamResponse: explainStreamResponse,
    stopGeneration: explainStopGeneration,
    setStopGeneration: explainSetStopGeneration,
    chatMessages: explainChatMessages,
    setChatMessages: explainSetChatMessages,
    messageDetails: explainMessageDetails,
    resetHistory: explainResetHistory,
  } = useOpenai();

  const { containerRef } = useContainerRef();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputPrompt, setInputPrompt] = useState('');
  const [model, setModel] = useState<OpenaiModelType>(OpenaiModelType.o1mini);

  const [isModelSelectPopoverOpen, setIsModelSelectPopoverOpen] =
    useState(false);
  const [isTemporaryChatOpen, setIsTemporaryChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAutoScrollMode, setIsAutoScrollMode] = useState(false);

  const [highlightedPartInfo, setHighlightedPartInfo] =
    useState<HighlightedPartInfo>({});
  const [memos, setMemos] = useState<Memos>({});
  const [supplementaryMessages, setSupplementaryMessages] =
    useState<SupplementaryMessage>({});

  const [currentSelection, setCurrentSelection] =
    useState<CurrentSelection | null>(null);
  const [actionType, setActionType] = useState<'memo' | 'explain' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const renderPopover = useCallback(
    (
      msgId: string,
      info: {
        id: string;
        text?: string;
        absoluteStart: number;
        absoluteEnd: number;
        anchorRect: DOMRect;
      },
      close: () => void,
    ) => {
      return (
        <Box p={2}>
          <Button
            colorScheme="blue"
            onClick={() => {
              setCurrentSelection({
                msgId,
                id: info.id,
                startOffset: info.absoluteStart,
                endOffset: info.absoluteEnd,
              });
              setActionType('memo');
              setDrawerOpen(true);
              close();
            }}
            mb={2}
          >
            Add memo
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              setCurrentSelection({
                msgId,
                id: info.id,
                startOffset: info.absoluteStart,
                endOffset: info.absoluteEnd,
              });
              setActionType('explain');
              explainSetChatMessages([...chatMessages]);
              setInputText(
                info.text
                  ? 'I\'d like to learn more about "' + info.text + '"'
                  : '',
              );
              setDrawerOpen(true);
              close();
            }}
            mb={2}
          >
            Explain in more detail
          </Button>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
        </Box>
      );
    },
    [],
  );

  const onHighlightedClick = useCallback(
    (msgId: string, info: { id: string; range: HighlightRange }) => {
      const memoEntry = memos[msgId]?.find(
        (m) =>
          m.id === info.id &&
          m.range.startOffset === info.range.startOffset &&
          m.range.endOffset === info.range.endOffset,
      );
      setCurrentSelection({
        msgId,
        id: info.id,
        startOffset: info.range.startOffset,
        endOffset: info.range.endOffset,
      });
      setActionType('memo');
      setInputText(memoEntry ? memoEntry.memo : '');
      setDrawerOpen(true);
    },
    [memos],
  );

  const handleDrawerDelete = useCallback(() => {
    if (currentSelection) {
      const { msgId, id, startOffset, endOffset } = currentSelection;

      setHighlightedPartInfo((prev) => {
        const currentHighlights = prev[msgId] || [];
        // save ranges that are not the same as the current selection
        const newHighlights = currentHighlights
          .map((item) => {
            if (item.id === id) {
              return {
                id: item.id,
                ranges: item.ranges.filter(
                  (r) =>
                    !(
                      r.startOffset === startOffset && r.endOffset === endOffset
                    ),
                ),
              };
            }
            return item;
          })
          .filter((item) => item.ranges.length > 0);
        return { ...prev, [msgId]: newHighlights };
      });

      setMemos((prev) => {
        const currentMemos = prev[msgId] || [];
        const newMemos = currentMemos.filter(
          (m) =>
            !(
              m.id === id &&
              m.range.startOffset === startOffset &&
              m.range.endOffset === endOffset
            ),
        );
        return { ...prev, [msgId]: newMemos };
      });
    }
    setDrawerOpen(false);
    setCurrentSelection(null);
    setActionType(null);
    setInputText('');
  }, [currentSelection, setHighlightedPartInfo, setMemos, setDrawerOpen]);

  const handleDrawerSave = useCallback(() => {
    if (currentSelection && actionType === 'memo') {
      const { msgId, id, startOffset, endOffset } = currentSelection;
      setHighlightedPartInfo((prev) => {
        const currentHighlights = prev[msgId] || [];
        const existingIndex = currentHighlights.findIndex(
          (item) => item.id === id,
        );
        const newRange: HighlightRange = { startOffset, endOffset };
        if (existingIndex >= 0) {
          const existing = currentHighlights[existingIndex];
          const alreadyExists = existing.ranges.some(
            (r) =>
              r.startOffset === newRange.startOffset &&
              r.endOffset === newRange.endOffset,
          );
          if (!alreadyExists) {
            const updated = {
              ...existing,
              ranges: [...existing.ranges, newRange],
            };
            const newHighlights = [...currentHighlights];
            newHighlights[existingIndex] = updated;
            return { ...prev, [msgId]: newHighlights };
          }
          return prev;
        } else {
          return {
            ...prev,
            [msgId]: [...currentHighlights, { id, ranges: [newRange] }],
          };
        }
      });
      setMemos((prev) => {
        const currentMemos = prev[msgId] || [];
        const idx = currentMemos.findIndex(
          (m) =>
            m.id === id &&
            m.range.startOffset === startOffset &&
            m.range.endOffset === endOffset,
        );
        if (idx >= 0) {
          const updated = { ...currentMemos[idx], memo: inputText };
          const newMemos = [...currentMemos];
          newMemos[idx] = updated;
          return { ...prev, [msgId]: newMemos };
        } else {
          return {
            ...prev,
            [msgId]: [
              ...currentMemos,
              { id, range: { startOffset, endOffset }, memo: inputText },
            ],
          };
        }
      });
    } else if (currentSelection && actionType === 'explain') {
      console.log('Explain in more detail for', currentSelection);
    }
    setDrawerOpen(false);
    setCurrentSelection(null);
    setActionType(null);
    setInputText('');
  }, [currentSelection, actionType, inputText]);

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
    } else {
      setIsAutoScrollMode(true);
    }
  }, [isLoading, temporaryIsLoading, scrollDown]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAutoScrollMode) scrollDown(true);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAutoScrollMode, scrollDown]);

  useEffect(() => {
    if (isTemporaryChatOpen && containerRef.current) scrollDown(false);
  }, [isTemporaryChatOpen, scrollDown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement !== textareaRef.current) {
        // focus on textarea if the user presses Enter key and the textarea is not focused
        textareaRef.current?.focus();
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
        position="relative"
      >
        <Box w="80%">
          <MessageHistory
            messages={excludeSystemMessages(messageDetails)}
            streaming={isLoading}
            streamingMessage={output}
            highlight={{
              highlightedPartInfo: highlightedPartInfo,
              onHighlightedClick: onHighlightedClick,
              renderPopover: renderPopover,
            }}
          />
        </Box>
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
            <Box w="80%">
              <MessageHistory
                messages={excludeSystemMessages(temporaryMessageDetails)}
                streaming={temporaryIsLoading}
                streamingMessage={temporaryOutput}
                highlight={{
                  highlightedPartInfo: highlightedPartInfo,
                  onHighlightedClick: onHighlightedClick,
                  renderPopover: renderPopover,
                }}
              />{' '}
            </Box>
          </VStack>
        )}
      </VStack>

      <VStack w="100%" gap={2} pt={4} justify="space-between" bgColor="#f5f5f5">
        <Center w="80%">
          <CustomTextInput
            textareaRef={textareaRef}
            onChange={(value) => setInputPrompt(value)}
            onButtonClick={(value) => {
              if (isTemporaryChatOpen) {
                temporaryTemporaryStreamResponse(value, model);
                setInputPrompt('');
              } else {
                streamResponse(value, model);
                setStopGeneration(false);
                setInputPrompt('');
              }
            }}
            buttonDisabled={!checkInputLength(inputPrompt)}
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
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        size="md"
      >
        <DrawerContent>
          <DrawerHeader>
            {actionType === 'memo' ? 'Memo' : 'Explain in More Detail'}
          </DrawerHeader>
          <DrawerBody>
            <Input
              placeholder={
                actionType === 'memo' ? 'Enter memo...' : 'Enter explanation...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {actionType === 'explain' && (
              <VStack mt={2}>
                <Text fontSize="sm" color="gray.500">
                  This will be sent to the AI model to generate more detailed
                  explanation.
                </Text>
                <MessageHistory
                  messages={[...explainMessageDetails]}
                  streaming={explainIsLoading}
                  streamingMessage={explainOutput}
                  hasBorder={false}
                />
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    for (const msg of explainChatMessages) {
                      // show 50 characters of the message
                      const text = msg.content.slice(0, 50);
                      console.log('text', text);
                    }
                    explainStreamResponse(inputText, model);
                    setInputText('');
                  }}
                />
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            {currentSelection && (
              <Button colorScheme="red" mr={3} onClick={handleDrawerDelete}>
                Delete
              </Button>
            )}
            <Button colorScheme="blue" onClick={handleDrawerSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </VStack>
  );
};

export default Main;
