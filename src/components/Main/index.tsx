'use client';
import { HighlightRange } from '@/components/MarkdownViewer/HighlightableReactMarkdown/HighlightableElement';
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
  ChatSessionListItem,
  createChatSessionData,
  loadChatSession,
  loadChatSessions,
  saveChatSession,
} from '@/lib/chatSessionService';
import { checkInputLength, excludeSystemMessages } from '@/utils/chatUtils';
import {
  Box,
  Button,
  Center,
  For,
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

export interface HighlightedParts {
  [partId: string]: HighlightRange[];
}
export interface HighlightedPartInfo {
  [messageId: string]: HighlightedParts;
}
export interface MemoEntry {
  range: HighlightRange;
  memo: string;
}
export interface Memos {
  [messageId: string]: {
    [partId: string]: MemoEntry[];
  };
}

export interface SupplementaryMessageEntry {
  range: HighlightRange;
  supplementary: MessageDetail[];
}

export interface SupplementaryMessages {
  [messageId: string]: {
    [partId: string]: SupplementaryMessageEntry[];
  };
}

export interface CurrentSelection {
  msgId: string;
  partId: string;
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
  const [model, setModel] = useState<OpenaiModelType>(
    OpenaiModelType.GPT4omini,
  );

  const [isModelSelectPopoverOpen, setIsModelSelectPopoverOpen] =
    useState(false);
  const [isTemporaryChatOpen, setIsTemporaryChatOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAutoScrollMode, setIsAutoScrollMode] = useState(false);
  const [shouldStartExplanation, setShouldStartExplanation] = useState(false);
  const [textToExplain, setTextToExplain] = useState('');
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [sessionsCursor, setSessionsCursor] = useState<number | null>(null);

  const [highlightedPartInfo, setHighlightedPartInfo] =
    useState<HighlightedPartInfo>({});
  const [memos, setMemos] = useState<Memos>({});
  const [supplementaryMessages, setSupplementaryMessages] =
    useState<SupplementaryMessages>({});

  const [currentSelection, setCurrentSelection] =
    useState<CurrentSelection | null>(null);
  const [actionType, setActionType] = useState<'memo' | 'explain' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const renderPopover = useCallback(
    (
      msgId: string,
      info: {
        partId: string;
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
                  partId: info.partId,
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
              <Icon as={HiMagnifyingGlass} boxSize={8} color="blackAlpha.800" />
            </Button>
          </Tooltip>
        </HStack>
      );
    },
    [chatMessages],
  );

  const addHighlightRange = useCallback(
    (msgId: string, partId: string, range: HighlightRange) => {
      setHighlightedPartInfo((prev) => {
        const rangeToAppend: HighlightRange = { ...range };

        const oldRanges = prev[msgId]?.[partId] || [];
        const newRanges = [...oldRanges, rangeToAppend];
        return {
          ...prev,
          [msgId]: { ...prev[msgId], [partId]: newRanges },
        };
      });
    },
    [setHighlightedPartInfo],
  );

  const removeHighlightRange = useCallback(
    (msgId: string, partId: string, range: HighlightRange) => {
      setHighlightedPartInfo((prev) => {
        const currentHighlightRanges = prev[msgId]?.[partId];
        // drop the range that is the same as the current selection
        const newHighlightRanges = currentHighlightRanges.filter(
          (r) =>
            !(
              r.startOffset === range.startOffset &&
              r.endOffset === range.endOffset
            ),
        );
        return {
          ...prev,
          [msgId]: { ...prev[msgId], [partId]: newHighlightRanges },
        };
      });
    },
    [setHighlightedPartInfo],
  );

  const onHighlightedClick = useCallback(
    (msgId: string, partId: string, range: HighlightRange) => {
      const memoEntry = memos[msgId]?.[partId]?.find(
        (m) =>
          m.range.startOffset === range.startOffset &&
          m.range.endOffset === range.endOffset,
      );
      const supplementaryDetail = supplementaryMessages[msgId]?.[partId]?.find(
        (entry) =>
          entry.range.startOffset === range.startOffset &&
          entry.range.endOffset === range.endOffset,
      );
      if (memoEntry) {
        console.log('Memo entry found for this selection.');
        setCurrentSelection({
          msgId,
          partId,
          ...range,
        });
        setActionType('memo');
        setInputText(memoEntry ? memoEntry.memo : '');
        setDrawerOpen(true);
      } else if (supplementaryDetail) {
        console.log('Supplementary detail found for this selection.');
        setCurrentSelection({
          msgId,
          partId,
          ...range,
        });
        // the first two messages should be the system prompt and the background message
        // for the explanation
        // currently dummy messages are added to the beginning of the explainMessageDetails
        // because they are not shown in the MessageHistory component
        explainSetMessageDetails(supplementaryDetail.supplementary);
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
      const { msgId, partId, startOffset, endOffset } = currentSelection;

      setHighlightedPartInfo((prev) => {
        const currentHighlightRanges = prev[msgId]?.[partId];
        // drop the range that is the same as the current selection
        const newHighlightRanges = currentHighlightRanges.filter(
          (r) => !(r.startOffset === startOffset && r.endOffset === endOffset),
        );
        return {
          ...prev,
          [msgId]: { ...prev[msgId], [partId]: newHighlightRanges },
        };
      });

      setMemos((prev) => {
        const currentMemos = prev[msgId]?.[partId];
        if (!currentMemos) return prev;
        const newMemos = currentMemos.filter(
          (m) =>
            !(
              m.range.startOffset === startOffset &&
              m.range.endOffset === endOffset
            ),
        );
        return {
          ...prev,
          [msgId]: {
            ...prev[msgId],
            [partId]: newMemos,
          },
        };
      });

      setSupplementaryMessages((prev) => {
        const currentSupplementaryMessages = prev[msgId]?.[partId];
        if (!currentSupplementaryMessages) return prev;
        const newSupplementaryMessages = currentSupplementaryMessages.filter(
          (entry) =>
            !(
              entry.range.startOffset === startOffset &&
              entry.range.endOffset === endOffset
            ),
        );
        return {
          ...prev,
          [msgId]: {
            ...prev[msgId],
            [partId]: newSupplementaryMessages,
          },
        };
      });
    }

    setDrawerOpen(false);
    setCurrentSelection(null);
    setActionType(null);
    setInputText('');
  }, [currentSelection, setHighlightedPartInfo, setMemos, setDrawerOpen]);

  const handleDrawerSave = useCallback(() => {
    if (currentSelection && actionType === 'memo') {
      const { msgId, partId, startOffset, endOffset } = currentSelection;

      // if the selection is not highlighted yet, add it to the highlightedPartInfo
      if (
        !highlightedPartInfo[msgId]?.[partId]?.find(
          (r) => r.startOffset === startOffset && r.endOffset === endOffset,
        )
      ) {
        addHighlightRange(msgId, partId, { startOffset, endOffset });
      }

      setMemos((prev) => {
        // if memo already exists for the same range, update it
        const currentMemo = prev[msgId]?.[partId]?.find(
          (m) =>
            m.range.startOffset === startOffset &&
            m.range.endOffset === endOffset,
        );
        if (currentMemo) {
          const newMemos = prev[msgId][partId].map((m) => {
            if (
              m.range.startOffset === startOffset &&
              m.range.endOffset === endOffset
            ) {
              return { ...m, memo: inputText };
            }
            return m;
          });
          return {
            ...prev,
            [msgId]: { ...prev[msgId], [partId]: newMemos },
          };
        }

        const memoEntryToAdd: MemoEntry = {
          range: { startOffset, endOffset },
          memo: inputText,
        };
        const oldMemos = prev[msgId]?.[partId] || [];
        const newMemos = [...oldMemos, memoEntryToAdd];
        return {
          ...prev,
          [msgId]: { ...prev[msgId], [partId]: newMemos },
        };
      });
    } else if (currentSelection && actionType === 'explain') {
      const { msgId, partId, startOffset, endOffset } = currentSelection;

      addHighlightRange(msgId, partId, { startOffset, endOffset });

      setSupplementaryMessages((prev) => {
        const supplementaryEntryToAdd: SupplementaryMessageEntry = {
          range: { startOffset, endOffset },
          supplementary: explainMessageDetails,
        };
        const oldSupplementaryMessages = prev[msgId]?.[partId] || [];
        const newSupplementaryMessages = [
          ...oldSupplementaryMessages,
          supplementaryEntryToAdd,
        ];
        return {
          ...prev,
          [msgId]: { ...prev[msgId], [partId]: newSupplementaryMessages },
        };
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

  const showSession = useCallback(
    async (sessionId: number | string) => {
      const chatSessionData = await loadChatSession(sessionId.toString());
      if (chatSessionData) {
        const { messages, memos, supplementaryMessages } = chatSessionData;

        // reconstruct the highlightedPartInfo
        const highlightedPartInfo: HighlightedPartInfo = {};
        messages.forEach((msg) => {
          const highlightedPartsForMemos: HighlightedParts = {};
          const matchedMemos = memos[msg.id.toString()];
          if (matchedMemos) {
            for (const [partId, entry] of Object.entries(matchedMemos)) {
              const highlightRanges: HighlightRange[] = [];
              entry.forEach((m) => {
                highlightRanges.push({
                  startOffset: m.range.startOffset,
                  endOffset: m.range.endOffset,
                });
              });
              highlightedPartsForMemos[partId] = highlightRanges;
            }
          }

          const highlightedPartsForSupplementaryMessages: HighlightedParts = {};
          const matchedSupplementaryMessages =
            supplementaryMessages[msg.id.toString()];
          if (matchedSupplementaryMessages) {
            for (const [partId, entry] of Object.entries(
              matchedSupplementaryMessages,
            )) {
              const highlightRanges: HighlightRange[] = [];
              entry.forEach((e) => {
                highlightRanges.push({
                  startOffset: e.range.startOffset,
                  endOffset: e.range.endOffset,
                });
              });
              highlightedPartsForSupplementaryMessages[partId] =
                highlightRanges;
            }
          }

          // merge the two parts
          const newHighlightedParts: HighlightedParts = {
            ...highlightedPartsForMemos,
          };
          for (const [partId, entry] of Object.entries(
            highlightedPartsForSupplementaryMessages,
          )) {
            if (newHighlightedParts[partId]) {
              newHighlightedParts[partId] = [
                ...newHighlightedParts[partId],
                ...entry,
              ];
            } else {
              newHighlightedParts[partId] = [...entry];
            }
          }

          highlightedPartInfo[msg.id.toString()] = newHighlightedParts;
        });
        setHighlightedPartInfo(highlightedPartInfo);

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
    },
    [inputPrompt, setChatMessages, setMessageDetails],
  );

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

  const loadMoreChatSessions = useCallback(async () => {
    async () => {
      if (!sessionsCursor) return;
      try {
        const more = await loadChatSessions(sessionsCursor, 10);
        setSessions([...sessions, ...more]);
        if (more.length > 0) {
          setSessionsCursor(more[more.length - 1].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
  }, [sessionsCursor, sessions]);

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

    return () => {
      clearInterval(intervalId);
    };
  }, [isAutoScrollMode, scrollDown]);

  const handleDoubleClick = useCallback(() => {
    console.log('memos', memos);
    console.log('supplementaryMessages', supplementaryMessages);
    console.log('highlightedPartInfo', highlightedPartInfo);
    console.log('chatMessages', chatMessages);
    console.log('messageDetails', messageDetails);
  }, [
    memos,
    supplementaryMessages,
    highlightedPartInfo,
    chatMessages,
    messageDetails,
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

  useEffect(() => {
    (async () => {
      try {
        const data = await loadChatSessions(undefined, 30);
        setSessions(data);
        if (data.length > 0) {
          setSessionsCursor(data[data.length - 1].id);
        }
        for (const session of data) {
          console.log(session);
        }
      } catch (err) {
        console.error(err);
      }
    })();
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
      onDoubleClick={handleDoubleClick}
    >
      {/* we need to wrap AppHeader and AnalyticsDialog in DialogRoot to enable DialogRoot's context */}
      <DialogRoot
        open={isAnalyticsOpen}
        onOpenChange={(e) => setIsAnalyticsOpen(e.open)}
        size="cover"
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <AppHeader onSidebarIconClick={() => setSidebarOpen(true)} />
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
          onLoadButtonClick={() => {}}
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
                  // exclude the system message @/and the prompt for "...について、もう少しだけ簡潔に説明してください。"
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
      <DrawerRoot
        open={sidebarOpen}
        onOpenChange={(e) => setSidebarOpen(e.open)}
        placement="start"
      >
        <DrawerContent>
          <DrawerHeader fontSize="md">History</DrawerHeader>
          <DrawerBody>
            <VStack
              gap={2}
              overflowY="auto"
              _scrollbar={{
                width: '10px',
                background: '#000000',
                backgroundColor: '#000000',
              }}
              _scrollbarTrack={{
                backgroundColor: '#000000',
              }}
              _scrollbarThumb={{
                backgroundColor: '#ffffff',
              }}
              pb={4}
              mb={4}
            >
              <For
                each={sessions}
                fallback={<Text>No chat sessions found.</Text>}
              >
                {(item) => (
                  <Button
                    bgColor="white"
                    color="black"
                    key={item.id}
                    onClick={() => showSession(item.id)}
                  >
                    {`id: ${item.id} summary: ${item.summary}`}
                  </Button>
                )}
              </For>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </VStack>
  );
};

export default Main;
