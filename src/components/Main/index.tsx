'use client';
import {
  HighlightInfo,
  HighlightRange,
} from '@/components/MarkdownViewer/HighlightableReactMarkdown/HighlightableElement';
import { DialogRoot } from '@/components/ui/dialog';
import {
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
} from '@/components/ui/drawer';
import { Tooltip } from '@/components/ui/tooltip';
import { useContainerRef } from '@/contexts/ContainerRefContext';
import { MessageDetail, useOpenai } from '@/hooks/useOpenai';
import {
  createChatSessionData,
  loadChatSession,
  saveChatSession,
} from '@/lib/storageChatSession';
import { checkInputLength, excludeSystemMessages } from '@/utils/chatUtils';
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { LuPencilLine } from 'react-icons/lu';
import { OpenaiModelType } from '../../config/llm-models';
import { AnalyticsDialog } from '../AnalyticsDialog';
import { AppHeader } from '../AppHeader';
import CustomTextInput from '../CustomInput';
import { MessageHistory } from '../MessageHistory';
import { MessageSettingPart } from '../MessageSettingPart/MessageSettingPart';

interface HighlightedPartInfo {
  [messageId: string]: HighlightInfo[];
}

export interface Memos {
  [messageId: string]: {
    id: string;
    range: HighlightRange;
    memo: string;
  }[];
}

export interface SupplementaryMessageEntry {
  id: string;
  range: HighlightRange;
  supplementary: MessageDetail | null;
}

export interface SupplementaryMessages {
  [messageId: string]: SupplementaryMessageEntry[];
}

export interface CurrentSelection {
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
    setChatMessages,
    messageDetails,
    setMessageDetails,
    resetHistory,
  } = useOpenai();

  const {
    output: temporaryOutput,
    isLoading: temporaryIsLoading,
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
    setMessageDetails: explainSetMessageDetails,
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
  const [shouldStartExplanation, setShouldStartExplanation] = useState(false);
  const [textToExplain, setTextToExplain] = useState('');

  const [highlightedPartInfo, setHighlightedPartInfo] =
    useState<HighlightedPartInfo>({});
  const [memos, setMemos] = useState<Memos>({});
  const [supplementaryMessages, setSupplementaryMessages] =
    useState<SupplementaryMessages>({});

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
        <HStack p={2} w="auto">
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
                  id: info.id,
                  startOffset: info.absoluteStart,
                  endOffset: info.absoluteEnd,
                });
                setActionType('memo');
                setDrawerOpen(true);
                close();
              }}
            >
              <Icon as={LuPencilLine} boxSize={8} color="blackAlpha.800" />
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
                  id: info.id,
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
              <Icon as={HiMagnifyingGlass} boxSize={8} color="blackAlpha.800" />
            </Button>
          </Tooltip>
        </HStack>
      );
    },
    [chatMessages],
  );

  const onHighlightedClick = useCallback(
    (msgId: string, info: { id: string; range: HighlightRange }) => {
      const memoEntry = memos[msgId]?.find(
        (m) =>
          m.id === info.id &&
          m.range.startOffset === info.range.startOffset &&
          m.range.endOffset === info.range.endOffset,
      );
      const supplementaryDetail = supplementaryMessages[msgId]?.find(
        (entry) =>
          entry.id === info.id &&
          entry.range.startOffset === info.range.startOffset &&
          entry.range.endOffset === info.range.endOffset,
      );
      if (memoEntry) {
        console.log('Memo entry found for this selection.');
        setCurrentSelection({
          msgId,
          id: info.id,
          startOffset: info.range.startOffset,
          endOffset: info.range.endOffset,
        });
        setActionType('memo');
        setInputText(memoEntry ? memoEntry.memo : '');
        setDrawerOpen(true);
      } else if (supplementaryDetail) {
        console.log('Supplementary detail found for this selection.');
        setCurrentSelection({
          msgId,
          id: info.id,
          startOffset: info.range.startOffset,
          endOffset: info.range.endOffset,
        });
        // the first two messages should be the system prompt and the background message
        // for the explanation
        // currently dummy messages are added to the beginning of the explainMessageDetails
        // because they are not shown in the MessageHistory component
        explainSetMessageDetails([
          {
            id: NaN,
            role: 'user',
            content: '',
            model: model,
            timestamp: new Date(),
          },
          {
            id: NaN,
            role: 'user',
            content: '',
            model: model,
            timestamp: new Date(),
          },
          supplementaryDetail.supplementary!,
        ]);
        setActionType('explain');
        setInputText('');
        setDrawerOpen(true);
      } else {
        console.log(
          'No memo or supplementary detail found for this selection.',
        );
        setCurrentSelection(null);
        setActionType(null);
        setInputText('');
        setDrawerOpen(false);
      }
    },
    [memos, supplementaryMessages, model],
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

      setSupplementaryMessages((prev) => {
        const currentList = prev[msgId] || [];
        const newList = currentList.filter(
          (entry) =>
            !(
              entry.id === id &&
              entry.range.startOffset === startOffset &&
              entry.range.endOffset === endOffset
            ),
        );
        return { ...prev, [msgId]: newList };
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
          newMemos.sort((a, b) => a.range.startOffset - b.range.startOffset);
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
      setHighlightedPartInfo((prev) => {
        const currentHighlights = prev[currentSelection.msgId] || [];
        const existingIndex = currentHighlights.findIndex(
          (item) => item.id === currentSelection.id,
        );
        const newRange: HighlightRange = {
          startOffset: currentSelection.startOffset,
          endOffset: currentSelection.endOffset,
        };

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
            return { ...prev, [currentSelection.msgId]: newHighlights };
          }
          return prev;
        } else {
          return {
            ...prev,
            [currentSelection.msgId]: [
              ...currentHighlights,
              { id: currentSelection.id, ranges: [newRange] },
            ],
          };
        }
      });

      setSupplementaryMessages((prev) => {
        const supplementaryDetail =
          explainMessageDetails && explainMessageDetails.length > 0
            ? explainMessageDetails[explainMessageDetails.length - 1]
            : null;

        const currentList = prev[currentSelection.msgId] || [];
        const existingIndex = currentList.findIndex(
          (entry) =>
            entry.id === currentSelection.id &&
            entry.range.startOffset === currentSelection.startOffset &&
            entry.range.endOffset === currentSelection.endOffset,
        );
        if (existingIndex >= 0) {
          const updatedEntry = {
            ...currentList[existingIndex],
            supplementary: supplementaryDetail,
          };
          const newList = [...currentList];
          newList[existingIndex] = updatedEntry;
          return { ...prev, [currentSelection.msgId]: newList };
        } else {
          return {
            ...prev,
            [currentSelection.msgId]: [
              ...currentList,
              {
                id: currentSelection.id,
                range: {
                  startOffset: currentSelection.startOffset,
                  endOffset: currentSelection.endOffset,
                },
                supplementary: supplementaryDetail,
              },
            ],
          };
        }
      });
    }

    setDrawerOpen(false);
    setCurrentSelection(null);
    setActionType(null);
    setInputText('');
  }, [currentSelection, actionType, inputText, explainMessageDetails]);

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

  const handleLoadButtonClick = useCallback(async () => {
    const chatSessionData = await loadChatSession(inputPrompt);
    if (chatSessionData) {
      const { messages, memos, supplementaryMessages } = chatSessionData;

      // reconstruct the highlightedPartInfo
      const highlightInfo: HighlightedPartInfo = {};
      messages.forEach((msg) => {
        console.log('msg', msg);
        const matchedMemos = memos[msg.id.toString()];
        if (matchedMemos) {
          const highlights = matchedMemos.map((m) => ({
            id: m.id,
            ranges: [
              {
                startOffset: m.range.startOffset,
                endOffset: m.range.endOffset,
              },
            ],
          }));
          highlightInfo[msg.id.toString()] = highlights;
        }
        const matchedSupplementaryMessages =
          supplementaryMessages[msg.id.toString()];
        if (matchedSupplementaryMessages) {
          const highlights = matchedSupplementaryMessages.map((m) => ({
            id: m.id,
            ranges: [
              {
                startOffset: m.range.startOffset,
                endOffset: m.range.endOffset,
              },
            ],
          }));
          highlightInfo[msg.id.toString()].push(...highlights);
        }
        // sort the highlights by startOffset
        highlightInfo[msg.id.toString()].sort(
          (a, b) => a.ranges[0].startOffset - b.ranges[0].startOffset,
        );
      });
      setHighlightedPartInfo(highlightInfo);

      // reconstruct the chat messages
      const chatMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        model: msg.model,
        timestamp: new Date(msg.timestamp),
      }));
      setChatMessages(chatMessages);

      setMemos(memos);
      setSupplementaryMessages(supplementaryMessages);
      setMessageDetails(messages);
    } else {
      console.error('Failed to load chat session data.');
    }
  }, [inputPrompt, setChatMessages, setMessageDetails]);

  const handleResetButtonClick = useCallback(() => {
    resetHistory();
    if (isTemporaryChatOpen) {
      temporaryResetHistory();
      setIsTemporaryChatOpen(false);
    }
    setMemos({});
    setSupplementaryMessages({});
    setHighlightedPartInfo({});
  }, [resetHistory, isTemporaryChatOpen, temporaryResetHistory]);

  const handleSaveButtonClick = useCallback(async () => {
    const chatSessionData = createChatSessionData(
      messageDetails,
      memos,
      supplementaryMessages,
    );

    await saveChatSession(chatSessionData);
  }, [messageDetails, memos, supplementaryMessages]);

  useEffect(() => {
    if (shouldStartExplanation) {
      explainStreamResponse(
        `${textToExplain}の部分について、もう少しだけ詳細に説明してください。`,
        OpenaiModelType.GPT4omini,
      );
      setShouldStartExplanation(false);
    }
  }, [shouldStartExplanation, textToExplain, explainStreamResponse, model]);

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
    }, 500);

    const consoleLogIntervalId = setInterval(() => {
      console.log('memos', memos);
      console.log('supplementaryMessages', supplementaryMessages);
      console.log('highlightedPartInfo', highlightedPartInfo);
      console.log('chatMessages', chatMessages);
      console.log('messageDetails', messageDetails);
    }, 5000);
    return () => {
      clearInterval(consoleLogIntervalId);
      clearInterval(intervalId);
    };
  }, [
    isAutoScrollMode,
    scrollDown,
    memos,
    supplementaryMessages,
    chatMessages,
    messageDetails,
    highlightedPartInfo,
    setMemos,
  ]);

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
              />
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
          temporaryResetHistory={temporaryResetHistory}
          onSaveButtonClick={handleSaveButtonClick}
          onLoadButtonClick={handleLoadButtonClick}
          onResetButtonClick={handleResetButtonClick}
        />
      </VStack>
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        size={actionType === 'memo' ? 'sm' : 'md'}
      >
        <DrawerContent>
          <DrawerHeader fontSize="md">
            {actionType === 'memo' ? 'Memo' : 'More about ' + inputText}
          </DrawerHeader>
          <DrawerBody>
            {actionType === 'memo' && (
              <Input
                placeholder={
                  actionType === 'memo'
                    ? 'Enter memo...'
                    : 'Enter explanation...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            )}
            {actionType === 'explain' && (
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  This will be sent to 4o-mini to generate more detailed
                  explanation.
                </Text>
                <MessageHistory
                  // exclude the system message and the prompt for "...について、もう少しだけ簡潔に説明してください。"
                  messages={explainMessageDetails.slice(2)}
                  streaming={explainIsLoading}
                  streamingMessage={explainOutput}
                  hasBorder={false}
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
