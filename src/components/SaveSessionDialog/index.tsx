'use client';
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from '@/components/ui/dialog';
import { Button, Input } from '@chakra-ui/react';
import { FC, memo } from 'react';

interface SaveSessionDialogProps {
  isSaveDialogOpen: boolean;
  setIsSaveDialogOpen: (open: boolean) => void;
  summaryInput: string;
  setSummaryInput: (summary: string) => void;
  handleConfirmSave: () => void;
}

export const SaveSessionDialog: FC<SaveSessionDialogProps> = memo((props) => {
  const {
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    summaryInput,
    setSummaryInput,
    handleConfirmSave,
  } = props;

  return (
    <DialogRoot
      open={isSaveDialogOpen}
      onOpenChange={(e) => setIsSaveDialogOpen(e.open)}
      size="md"
      placement="center"
    >
      <DialogContent>
        <DialogHeader fontSize="md">Save Chat Session</DialogHeader>
        <DialogBody>
          <Input
            placeholder="Enter summary..."
            value={summaryInput}
            onChange={(e) => setSummaryInput(e.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            mr={3}
            onClick={() => setIsSaveDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleConfirmSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
});
