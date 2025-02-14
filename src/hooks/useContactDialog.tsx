import { Button, Textarea } from '@chakra-ui/react';

import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from '@/components/ui/dialog';
import { useCallback, useState } from 'react';

type UseContactDialogReturn = {
  openDialog: () => void;
  closeDialog: () => void;
  ContactDialog: JSX.Element;
};

export const useContactDialog = (): UseContactDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState('');

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inquiryText) {
      alert('Please input your feedback');
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inquiryText,
        }),
      });

      if (response.ok) {
        alert('Feedback sent successfully');
        setInquiryText('');
      } else {
        const data = await response.json();
        console.error('Error:', data);
        alert('Failed to send feedback');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send feedback');
    }

    closeDialog();
  }, [inquiryText, closeDialog]);

  const ContactDialog = (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      size="md"
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <DialogContent>
        <DialogHeader fontSize="lg">Feedback</DialogHeader>
        <DialogBody>
          <Textarea
            placeholder="input your feedback here"
            value={inquiryText}
            onChange={(e) => setInquiryText(e.target.value)}
            rows={10}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" mr={3} onClick={closeDialog}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSend}>
            send
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );

  return {
    openDialog,
    closeDialog,
    ContactDialog,
  };
};
