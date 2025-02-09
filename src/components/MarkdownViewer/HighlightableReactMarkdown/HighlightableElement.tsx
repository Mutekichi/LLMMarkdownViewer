// HighlightableElement.tsx
'use client';
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Box } from '@chakra-ui/react';
import React from 'react';

/**
 * HighlightRange
 * Represents the absolute offset range relative to the original text.
 */
export type HighlightRange = {
  startOffset: number;
  endOffset: number;
};

/**
 * HighlightInfo
 * - id: A unique ID to identify the target element.
 * - ranges: An array of HighlightRange objects for the element.
 */
export type HighlightInfo = {
  id: string;
  ranges: HighlightRange[];
};

/**
 * HighlightableElementProps
 * - children: The full text content for this element.
 * - id: A unique ID for this element.
 * - onSelection: Callback that fires when the user selects an unhighlighted range.
 * - renderPopover: A function for rendering a popover when an unhighlighted segment is selected.
 *   It receives selection info (含む対象の id) and a close function.
 * - onHighlightedClick: Callback that fires when a highlighted segment is clicked.
 * - highlightInfo: Existing highlight information for this element.
 * - elementType: The type of HTML element to render (default "p").
 * - ...rest: Any additional props.
 */
interface HighlightableElementProps {
  children: React.ReactNode;
  id: string;
  onSelection?: (info: {
    id: string;
    startOffset: number;
    endOffset: number;
  }) => void;
  renderPopover?: (
    info: {
      id: string;
      absoluteStart: number;
      absoluteEnd: number;
      anchorRect: DOMRect;
    },
    close: () => void,
  ) => React.ReactNode;
  onHighlightedClick?: (info: { id: string; range: HighlightRange }) => void;
  highlightInfo?: HighlightInfo;
  elementType?: string;
  [key: string]: any;
}

/**
 * SegmentInfo
 * Represents each segment of the text split by highlight ranges.
 */
interface SegmentInfo {
  text: string;
  highlighted: boolean;
  start: number;
  end: number;
}

/**
 * PopoverInfo
 * Information needed to display the popover.
 */
export interface PopoverInfo {
  absoluteStart: number;
  absoluteEnd: number;
  anchorRect: DOMRect;
}

/**
 * HighlightableElement
 *
 * Splits the text content into segments based on existing highlight ranges.
 * When a user selects an unhighlighted range, it either calls onSelection or,
 * if renderPopover is provided, displays a custom popover.
 * Highlighted segments are rendered in a button-like style and call onHighlightedClick when clicked.
 */
export const HighlightableElement: React.FC<HighlightableElementProps> = ({
  children,
  id,
  onSelection,
  renderPopover,
  onHighlightedClick,
  highlightInfo,
  elementType = 'p',
  ...rest
}) => {
  const originalText = typeof children === 'string' ? children : '';

  // Split the text content into segments based on the highlight ranges.
  let segments: SegmentInfo[] = [];
  if (typeof originalText === 'string') {
    const ranges = highlightInfo
      ? [...highlightInfo.ranges].sort((a, b) => a.startOffset - b.startOffset)
      : [];
    let currentIndex = 0;
    for (const range of ranges) {
      if (currentIndex < range.startOffset) {
        segments.push({
          text: originalText.substring(currentIndex, range.startOffset),
          highlighted: false,
          start: currentIndex,
          end: range.startOffset,
        });
      }
      segments.push({
        text: originalText.substring(range.startOffset, range.endOffset),
        highlighted: true,
        start: range.startOffset,
        end: range.endOffset,
      });
      currentIndex = range.endOffset;
    }
    if (currentIndex < originalText.length) {
      segments.push({
        text: originalText.substring(currentIndex),
        highlighted: false,
        start: currentIndex,
        end: originalText.length,
      });
    }
  }

  const [popoverInfo, setPopoverInfo] = React.useState<PopoverInfo | null>(
    null,
  );
  const closePopover = () => setPopoverInfo(null);

  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    // get the current selection range
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    // selection works only within the same node
    if (range.startContainer !== range.endContainer) {
      console.log('Selection spans multiple nodes. Ignoring.');
      return;
    }

    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;
    let spanElement = range.startContainer.parentElement;
    while (spanElement && !spanElement.hasAttribute('data-offset-start')) {
      spanElement = spanElement.parentElement;
    }
    if (!spanElement) return;
    const dataOffsetStart = spanElement.getAttribute('data-offset-start');
    if (!dataOffsetStart) return;
    const segmentStart = parseInt(dataOffsetStart, 10);
    // calculate the start and end offsets calculated from the whole text
    const absoluteStart = segmentStart + range.startOffset;
    const absoluteEnd = segmentStart + range.endOffset;
    if (spanElement.getAttribute('data-highlighted') === 'true') {
      if (onHighlightedClick) {
        console.log('onHighlightedClick');
        onHighlightedClick({
          id,
          range: { startOffset: absoluteStart, endOffset: absoluteEnd },
        });
      }
      selection.removeAllRanges();
      return;
    }
    if (renderPopover) {
      const rect = range.getBoundingClientRect();
      setPopoverInfo({ absoluteStart, absoluteEnd, anchorRect: rect });
    } else if (onSelection) {
      onSelection({ id, startOffset: absoluteStart, endOffset: absoluteEnd });
    }
    selection.removeAllRanges();
  };

  const renderSegment = (seg: SegmentInfo, idx: number) => {
    if (seg.highlighted) {
      return (
        <Box
          as="span"
          key={idx}
          onClick={() => {
            if (onHighlightedClick) {
              console.log('highlighted segment clicked');
              console.log(seg.start, seg.end);
              onHighlightedClick({
                id,
                range: { startOffset: seg.start, endOffset: seg.end },
              });
            }
          }}
          data-offset-start={seg.start}
          data-offset-end={seg.end}
          data-highlighted="true"
          color="red.500"
        >
          {seg.text}
        </Box>
      );
    } else {
      return (
        <Box
          as="span"
          key={idx}
          data-offset-start={seg.start}
          data-offset-end={seg.end}
          data-highlighted="false"
        >
          {seg.text}
        </Box>
      );
    }
  };

  const Element = elementType as any;

  return (
    <Box position="relative">
      <Element onMouseUp={handleMouseUp} data-id={id} {...rest}>
        {segments.length > 0 ? segments.map(renderSegment) : originalText}
      </Element>
      {popoverInfo && renderPopover && (
        <Box
          position="absolute"
          top={popoverInfo.anchorRect.top + window.scrollY}
          left={popoverInfo.anchorRect.left + window.scrollX}
          zIndex={1000}
        >
          <PopoverRoot
            open
            onOpenChange={closePopover}
            positioning={{ placement: 'bottom' }}
          >
            <PopoverTrigger>
              <Box position="absolute" width="1px" height="1px" />
            </PopoverTrigger>
            <PopoverContent>
              {renderPopover({ id, ...popoverInfo }, closePopover)}
            </PopoverContent>
          </PopoverRoot>
        </Box>
      )}
    </Box>
  );
};
