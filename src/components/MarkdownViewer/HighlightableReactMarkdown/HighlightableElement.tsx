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
 * Represents an absolute offset range within the original text.
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
 * PopoverInfo
 * Information needed to display the popover.
 */
export interface PopoverInfo {
  absoluteStart: number;
  absoluteEnd: number;
  anchorRect: DOMRect;
}

/**
 * HighlightableElementProps
 * - children: The full text content or React elements for this element.
 * - id: A unique ID for this element.
 * - onSelection: Callback when the user selects an unhighlighted range.
 * - renderPopover: A function for rendering a popover when an unhighlighted segment is selected.
 *   It receives selection info (including the element ID) and a close function.
 * - onHighlightedClick: Callback when a highlighted segment is clicked.
 * - highlightInfo: Existing highlight information for this element.
 * - elementType: The type of HTML element to render (default "p").
 * - ...rest: Any additional props.
 */
export interface HighlightableElementProps {
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
  // Detect if children is a plain string
  const isPlainString = typeof children === 'string';
  const [popoverInfo, setPopoverInfo] = React.useState<PopoverInfo | null>(
    null,
  );
  const closePopover = () => setPopoverInfo(null);

  /**
   * handleMouseUp
   * Triggered when the user finishes a mouse selection,
   * detects the highlight range and either calls onHighlightedClick or onSelection/renderPopover.
   */
  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);

    // For simplicity, only handle cases where the selection is within a single text node
    if (range.startContainer !== range.endContainer) return;
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    // Retrieve the offset start from data attributes
    let spanElement = range.startContainer.parentElement;
    while (spanElement && !spanElement.hasAttribute('data-offset-start')) {
      spanElement = spanElement.parentElement;
    }
    if (!spanElement) return;

    const dataOffsetStart = spanElement.getAttribute('data-offset-start');
    if (!dataOffsetStart) return;

    const segmentStart = parseInt(dataOffsetStart, 10);
    const absoluteStart = segmentStart + range.startOffset;
    const absoluteEnd = segmentStart + range.endOffset;

    // If it's already highlighted, call onHighlightedClick
    if (spanElement.getAttribute('data-highlighted') === 'true') {
      if (onHighlightedClick) {
        onHighlightedClick({
          id,
          range: { startOffset: absoluteStart, endOffset: absoluteEnd },
        });
      }
      selection.removeAllRanges();
      return;
    }

    // Otherwise, call renderPopover or onSelection
    if (renderPopover) {
      const rect = range.getBoundingClientRect();
      setPopoverInfo({ absoluteStart, absoluteEnd, anchorRect: rect });
    } else if (onSelection) {
      onSelection({
        id,
        startOffset: absoluteStart,
        endOffset: absoluteEnd,
      });
    }
    selection.removeAllRanges();
  };

  /**
   * If children is a plain string, split it into segments based on highlight ranges,
   * and wrap them with spans containing data attributes for offset tracking.
   */
  if (isPlainString) {
    const originalText = children as string;
    let segments: Array<{
      text: string;
      highlighted: boolean;
      start: number;
      end: number;
    }> = [];

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

    const renderSegment = (
      seg: { text: string; highlighted: boolean; start: number; end: number },
      idx: number,
    ) => {
      if (seg.highlighted) {
        return (
          <Box
            as="span"
            key={idx}
            onClick={() => {
              if (onHighlightedClick) {
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
      }
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
    };

    const Element = elementType as any;

    return (
      <Box position="relative">
        <Box as={Element} onMouseUp={handleMouseUp} data-id={id} {...rest}>
          {segments.map(renderSegment)}
        </Box>
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
  }

  /**
   * If children contains complex React elements (not a plain string),
   * render them directly and use onMouseUp for highlight selection.
   */
  const Element = elementType as any;
  return (
    <Box position="relative">
      <Box as={Element} onMouseUp={handleMouseUp} data-id={id} {...rest}>
        {children}
      </Box>
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
