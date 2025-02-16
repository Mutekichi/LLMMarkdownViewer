'use client';
import {
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
} from '@/components/ui/drawer';
import { HighlightedPartInfo } from '@/hooks/useHighlight';
import { UseOpenaiReturn } from '@/hooks/useOpenai';
import { Button, Text, Textarea, VStack } from '@chakra-ui/react';
import { FC, memo } from 'react';
import { CurrentSelection } from '../Main';
import { MessageHistory } from '../MessageHistory';

interface RightDrawerProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  actionType: 'memo' | 'explain' | null;
  inputText: string;
  setInputText: (text: string) => void;
  openai: UseOpenaiReturn;
  currentSelection: CurrentSelection | null;
  highlightedPartInfo: HighlightedPartInfo;
  handleDrawerDelete: () => void;
  handleDrawerSave: () => void;
}

export const RightDrawer: FC<RightDrawerProps> = memo((props) => {
  const {
    drawerOpen,
    setDrawerOpen,
    actionType,
    inputText,
    setInputText,
    openai,
    currentSelection,
    highlightedPartInfo,
    handleDrawerDelete,
    handleDrawerSave,
  } = props;

  return (
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
            <Textarea
              placeholder={
                actionType === 'memo' ? 'Enter memo...' : 'Enter explanation...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              overflowY="auto"
              h="50vh"
              resize="none"
            />
          )}
          {actionType === 'explain' && (
            <VStack>
              <Text fontSize="sm" color="gray.500">
                This will be sent to 4o-mini to generate more detailed
                explanation.
              </Text>
              <MessageHistory
                openai={openai}
                style={{
                  hasBorder: false,
                  canCollapse: false,
                }}
                // exclude the system message @/and the prompt for "...について、もう少しだけ簡潔に説明してください。"
                messagesToSlice={2}
              />
            </VStack>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={() => setDrawerOpen(false)}>
            Cancel
          </Button>
          {
            // only show delete button if the current selection is highlighted
            currentSelection &&
              highlightedPartInfo[currentSelection.msgId]?.[
                currentSelection.partId
              ]?.find(
                (r) =>
                  r.startOffset === currentSelection.startOffset &&
                  r.endOffset === currentSelection.endOffset,
              ) && (
                <Button colorScheme="red" mr={3} onClick={handleDrawerDelete}>
                  Delete
                </Button>
              )
          }
          <Button colorScheme="blue" onClick={handleDrawerSave}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
});
