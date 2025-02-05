import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@chakra-ui/react';
import { FC } from 'react';
import { UsageSummaryPage } from './UsageSummaryPage';

export const AnalyticsDialog: FC = () => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Analytics</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <UsageSummaryPage />
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button variant="outline">Cancel</Button>
        </DialogActionTrigger>
        <Button>Save</Button>
      </DialogFooter>
      <DialogCloseTrigger />
    </DialogContent>
  );
};
