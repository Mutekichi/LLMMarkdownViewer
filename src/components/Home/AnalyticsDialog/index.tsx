import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      <DialogCloseTrigger />
    </DialogContent>
  );
};
