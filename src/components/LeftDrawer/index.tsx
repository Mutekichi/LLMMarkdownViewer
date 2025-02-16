'use client';
import {
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
} from '@/components/ui/drawer';
import { ChatSessionListItem } from '@/lib/chatSessionService';
import { Button, For, HStack, Text, VStack } from '@chakra-ui/react';
import { memo } from 'react';

interface LeftDrawerProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sessions: ChatSessionListItem[];
  showSession: (sessionId: number | string) => Promise<void>;
  loadMoreChatSessions: () => void;
  sessionsCursor: number | null;
  setChatSessionId: (sessionId: number | null) => void;
}

export const LeftDrawer = memo((props: LeftDrawerProps) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    sessions,
    showSession,
    loadMoreChatSessions,
    sessionsCursor,
    setChatSessionId,
  } = props;

  return (
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
            overflowX="hidden"
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
                  w="100%"
                  h="30px"
                  fontSize="md"
                  mx={1}
                  py={6}
                  bgColor="white"
                  borderRadius={10}
                  _hover={{ bgColor: 'gray.100' }}
                  color="black"
                  key={item.id}
                  onClick={() =>
                    showSession(item.id)
                      .then(() => {
                        setChatSessionId(item.id);
                      })
                      .catch((err) => {
                        alert(
                          'Failed to load chat session data. please retry.',
                        );
                        console.error(err);
                      })
                  }
                >
                  <HStack>
                    <Text>{item.summary || 'Unnamed chat'}</Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    ></Button>
                  </HStack>
                </Button>
              )}
            </For>

            {sessionsCursor != null ? (
              <Button w="100%" onClick={loadMoreChatSessions}>
                Load More
              </Button>
            ) : (
              <Text>No more chat sessions to load.</Text>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
});
