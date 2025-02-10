'use client';
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useContainerRef } from '@/contexts/ContainerRefContext';
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
  text?: string;
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
      text?: string;
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
 * Takes a text node and splits it into segments based on highlight information
 * according to the global offset, wrapping each segment in a span element
 * and returning the result.
 */
const wrapText = (
  text: string,
  globalStart: number,
  highlightRanges: HighlightRange[],
): React.ReactNode[] => {
  const segments: React.ReactNode[] = [];
  let localOffset = 0;
  // Extract relevant highlight ranges for this text node (those that overlap with the global offset)
  const relevantRanges = highlightRanges.filter(
    (range) =>
      range.endOffset > globalStart &&
      range.startOffset < globalStart + text.length,
  );
  relevantRanges.sort((a, b) => a.startOffset - b.startOffset);

  for (const range of relevantRanges) {
    const segHighlightStart =
      Math.max(range.startOffset, globalStart) - globalStart;
    const segHighlightEnd =
      Math.min(range.endOffset, globalStart + text.length) - globalStart;
    // Unhighlighted part before the highlighted segment
    if (localOffset < segHighlightStart) {
      const unhighlightedText = text.substring(localOffset, segHighlightStart);
      segments.push(
        <Box
          as="span"
          key={`${globalStart}-${localOffset}-un`}
          data-offset-start={globalStart + localOffset}
          data-offset-end={globalStart + segHighlightStart}
          data-highlighted="false"
        >
          {unhighlightedText}
        </Box>,
      );
    }
    // Highlighted part
    const highlightedText = text.substring(segHighlightStart, segHighlightEnd);
    segments.push(
      <Box
        as="span"
        key={`${globalStart}-${segHighlightStart}-hl`}
        data-offset-start={globalStart + segHighlightStart}
        data-offset-end={globalStart + segHighlightEnd}
        data-highlighted="true"
        color="blue.500"
        textDecoration="underline"
        cursor="pointer"
      >
        {highlightedText}
      </Box>,
    );
    localOffset = segHighlightEnd;
  }
  // Remaining unhighlighted part
  if (localOffset < text.length) {
    segments.push(
      <Box
        as="span"
        key={`${globalStart}-${localOffset}-end`}
        data-offset-start={globalStart + localOffset}
        data-offset-end={globalStart + text.length}
        data-highlighted="false"
      >
        {text.substring(localOffset)}
      </Box>,
    );
  }
  return segments;
};

/**
 * Recursively traverses the children and applies wrapText to each text node.
 * currentOffset represents the number of characters processed so far (global offset).
 */
const wrapChildren = (
  children: React.ReactNode,
  highlightRanges: HighlightRange[],
  currentOffset: number,
): { newChildren: React.ReactNode[]; offset: number } => {
  let newChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      // If it's a text node, split and wrap using wrapText
      const wrapped = wrapText(child, currentOffset, highlightRanges);
      newChildren.push(...wrapped);
      currentOffset += child.length;
    } else if (React.isValidElement(child)) {
      // If it's a React element, recursively process child elements to create a clone
      const childProps = child.props;
      const result = wrapChildren(
        childProps.children,
        highlightRanges,
        currentOffset,
      );
      currentOffset = result.offset;
      newChildren.push(
        React.cloneElement(child, {
          ...childProps,
          children: result.newChildren,
        }),
      );
    } else {
      // Other elements are added as is
      newChildren.push(child);
    }
  });
  return { newChildren, offset: currentOffset };
};

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
  const { containerRef } = useContainerRef();
  const [popoverInfo, setPopoverInfo] = React.useState<PopoverInfo | null>(
    null,
  );
  const closePopover = () => setPopoverInfo(null);

  const highlightRanges = highlightInfo
    ? [...highlightInfo.ranges].sort((a, b) => a.startOffset - b.startOffset)
    : [];

  // process each text node recursively and attach offset information to each text
  const { newChildren } = wrapChildren(children, highlightRanges, 0);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    let spanElement = e.target as HTMLElement;
    while (spanElement && !spanElement.hasAttribute('data-offset-start')) {
      spanElement = spanElement.parentElement as HTMLElement;
    }
    if (!spanElement) return;

    const startOffset = spanElement.getAttribute('data-offset-start');
    const endOffset = spanElement.getAttribute('data-offset-end');

    if (!startOffset || !endOffset) return;

    const absoluteStart = parseInt(startOffset, 10);
    const absoluteEnd = parseInt(endOffset, 10);

    if (
      spanElement.getAttribute('data-highlighted') === 'true' &&
      onHighlightedClick
    ) {
      onHighlightedClick({
        id,
        range: { startOffset: absoluteStart, endOffset: absoluteEnd },
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);

    if (range.startContainer !== range.endContainer) {
      console.log('Selection across multiple nodes is not supported.');
      return;
    }
    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
      console.log(
        'Selection within non-text nodes is not supported. The selected node type is:',
        range.startContainer.nodeType,
      );
      return;
    }

    // find the nearest parent span element with data-offset-start attribute
    let spanElement = range.startContainer.parentElement;
    while (spanElement && !spanElement.hasAttribute('data-offset-start')) {
      spanElement = spanElement.parentElement;
    }
    if (!spanElement) {
      console.log('Failed to find the parent span element.');
      return;
    }

    const dataOffsetStart = spanElement.getAttribute('data-offset-start');
    if (!dataOffsetStart) {
      console.log('Failed to retrieve data-offset-start attribute.');
      return;
    }
    const segmentStart = parseInt(dataOffsetStart, 10);
    const absoluteStart = segmentStart + range.startOffset;
    const absoluteEnd = segmentStart + range.endOffset;

    // already highlighted
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

    // otherwise, show the popover
    if (renderPopover) {
      const text = selection.toString();
      const rect = range.getBoundingClientRect();
      setPopoverInfo({ absoluteStart, absoluteEnd, text, anchorRect: rect });
    } else if (onSelection) {
      onSelection({ id, startOffset: absoluteStart, endOffset: absoluteEnd });
    }
    selection.removeAllRanges();
  };

  return (
    <Box>
      <Box
        as={elementType as React.ElementType}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        data-id={id}
        {...rest}
      >
        {newChildren}
      </Box>
      {popoverInfo && renderPopover && (
        <Box
          position="absolute"
          {...(() => {
            const offset = { x: 50, y: -20 };
            const top = containerRef.current?.getBoundingClientRect().top || 0;
            const scrollY = containerRef.current?.scrollTop || 0;
            const scrollX = containerRef.current?.scrollLeft || 0;
            return {
              top: popoverInfo.anchorRect.bottom + scrollY - top + offset.y,
              left: popoverInfo.anchorRect.right + scrollX + offset.x,
            };
          })()}
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
