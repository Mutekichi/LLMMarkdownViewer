import { useCallback, useState } from 'react';
export interface HighlightedParts {
  [partId: string]: HighlightRange[];
}
export interface HighlightedPartInfo {
  [messageId: string]: HighlightedParts;
}
/**
 * HighlightRange
 * Represents an absolute offset range within the original text.
 */
export type HighlightRange = {
  startOffset: number;
  endOffset: number;
};

const [highlightedPartInfo, setHighlightedPartInfo] =
  useState<HighlightedPartInfo>({});

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

export const useHighlight = () => {
  return { highlightedPartInfo, setHighlightedPartInfo, addHighlightRange };
};
