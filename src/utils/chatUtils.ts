import { MessageDetail } from '@/hooks/useOpenai';

export const excludeSystemMessages = (
  chatMessages: MessageDetail[],
): MessageDetail[] => {
  // first message is always system message
  return chatMessages.slice(1);
};

export const checkInputLength = (inputText: string): boolean => {
  return inputText.length > 1;
};
