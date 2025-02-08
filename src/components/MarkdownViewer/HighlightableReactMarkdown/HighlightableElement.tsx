import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Box, Button } from '@chakra-ui/react';
import React from 'react';

/**
 * HighlightRange
 *
 * Note: The range is absolute offset in the original text element (not the offset in the segment).
 * - startOffset: start offset of the highlighted range
 * - endOffset: end offset of the highlighted range
 */
export type HighlightRange = {
  startOffset: number;
  endOffset: number;
};

/**
 * HighlightInfo
 * - id: a unique ID to identify the target element (e.g., paragraph, heading, list item, etc.)
 * - ranges: an array of HighlightRange objects
 */
export type HighlightInfo = {
  id: string;
  ranges: HighlightRange[];
};

//
// HighlightableElementProps
// － elementType（例："p", "h1" など）を指定できる汎用コンポーネントです。
// － onHighlight: ユーザが「ハイライトする」を選択した場合の通知コールバック。
// － onRemoveHighlight: ユーザが「ハイライトを解除する」を選択した場合の通知コールバック。
// － highlightInfo: 対象要素の既存ハイライト情報
//

/**
 * HighlightableElementProps
 * - children: the text content of the element
 * - id: a unique ID to identify the target element (e.g., paragraph, heading, list item, etc.)
 * - onHighlight: a callback function called when a segment is highlighted. The position of the highlighted range is passed as an argument.
 * - onRemoveHighlight: a callback function called when a segment is unhighlighted.
 * - highlightInfo: the information of the positions of the highlighted ranges
 * - elementType: the type of the element (e.g., "p", "h1", "li", etc.). The default value is "p".
 * - other props: any other props to pass
 */
interface HighlightableElementProps {
  children: React.ReactNode;
  id: string;
  onHighlight: (info: {
    id: string;
    startOffset: number;
    endOffset: number;
  }) => void;
  onRemoveHighlight?: (info: { id: string; range: HighlightRange }) => void;
  highlightInfo?: HighlightInfo;
  elementType?: string;
  // to accept any other props
  [key: string]: any;
}

interface SegmentInfo {
  text: string;
  highlighted: boolean;
  start: number;
  end: number;
}

interface PopoverInfo {
  mode: 'add' | 'remove';
  absoluteStart: number;
  absoluteEnd: number;
  anchorRect: DOMRect;
}

/**
 * HighlightableElement
 * This component splits the text content into segments based on the existing highlight ranges
 * and pass data-offset-start / data-offset-end and data-highlighted attributes to each segment.
 *
 * When the user selects a text segment, a popover is displayed to allow the user to highlight or unhighlight the selected text.
 *
 * TODO: make it able to customize the content of the popover
 *
 * The component accepts the following props:
 *  - children: the text content of the element
 *  - id: a unique ID to identify the target element (e.g., paragraph, heading, list item, etc.)
 *  - onHighlight: a callback function called when a segment is highlighted
 *  - onRemoveHighlight: a callback function called when a segment is unhighlighted
 *  - highlightInfo: the information of the positions of the highlighted ranges
 *  - elementType: the type of the element (e.g., "p", "h1", "li", etc.). The default value is "p".
 *  - other props: any other props to pass
 */
export const HighlightableElement: React.FC<HighlightableElementProps> = ({
  children,
  id,
  onHighlight,
  onRemoveHighlight,
  highlightInfo,
  elementType = 'p',
  ...rest
}) => {
  const originalText = typeof children === 'string' ? children : '';

  // if there is an existing highlight information, split the text based on the absolute offset ranges
  let segments: SegmentInfo[] = [];
  if (typeof originalText === 'string') {
    // sort the ascending order of the start offset
    const ranges = highlightInfo
      ? [...highlightInfo.ranges].sort((a, b) => a.startOffset - b.startOffset)
      : [];
    let currentIndex = 0;
    // split the text into segments based on the highlight ranges
    for (const range of ranges) {
      // generally for each range the text is split into three parts:
      // before the highlight, highlighted, and after the highlight
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

  // state for displaying the popover
  const [popoverInfo, setPopoverInfo] = React.useState<PopoverInfo | null>(
    null,
  );

  // called when the user releases the mouse button after selecting a text segment
  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    // if the selection spans multiple nodes, ignore it
    // TODO: support for multiple nodes
    if (range.startContainer !== range.endContainer) {
      console.log(
        'The selection spans multiple nodes. Ignoring the selection.',
      );
      return;
    }
    // make sure the selected node is a text node
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    // the selected text element itself is a text node, so we need to get the parent (segment) element
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

    // possible actions are highlighted => unhighlighted or unhighlighted => highlighted
    const mode: 'add' | 'remove' =
      spanElement.getAttribute('data-highlighted') === 'true'
        ? 'remove'
        : 'add';

    // get the position of the selected (this is used to display the popover)
    const rect = range.getBoundingClientRect();

    setPopoverInfo({
      mode,
      absoluteStart,
      absoluteEnd,
      anchorRect: rect,
    });

    selection.removeAllRanges();
  };

  // temporarily use "any" type to adapt any element type
  const Element = elementType as any;

  return (
    <Box position="relative">
      <Element onMouseUp={handleMouseUp} data-id={id} {...rest}>
        {segments.length > 0
          ? segments.map((seg, idx) => (
              <span
                key={idx}
                data-offset-start={seg.start}
                data-offset-end={seg.end}
                data-highlighted={seg.highlighted ? 'true' : 'false'}
                style={seg.highlighted ? { color: 'red' } : {}}
              >
                {seg.text}
              </span>
            ))
          : originalText}
      </Element>

      {popoverInfo && (
        <Box
          position="absolute"
          // TODO: fix position
          top={popoverInfo.anchorRect.top}
          left={popoverInfo.anchorRect.left}
        >
          <PopoverRoot
            open
            onOpenChange={() => setPopoverInfo(null)}
            positioning={{ placement: 'bottom' }}
          >
            <PopoverTrigger>
              <Box position="absolute" width="1px" height="1px" />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverHeader>
                {popoverInfo.mode === 'add'
                  ? 'Highlight the selected text'
                  : 'Remove the highlight'}
              </PopoverHeader>
              <PopoverBody display="flex" flexDirection="column" gap={2}>
                {popoverInfo.mode === 'add' ? (
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      onHighlight({
                        id,
                        startOffset: popoverInfo.absoluteStart,
                        endOffset: popoverInfo.absoluteEnd,
                      });
                      setPopoverInfo(null);
                    }}
                  >
                    Highlight
                  </Button>
                ) : (
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      if (onRemoveHighlight) {
                        onRemoveHighlight({
                          id,
                          range: {
                            startOffset: popoverInfo.absoluteStart,
                            endOffset: popoverInfo.absoluteEnd,
                          },
                        });
                      }
                      setPopoverInfo(null);
                    }}
                  >
                    Remove highlight
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setPopoverInfo(null)}>
                  Cancel
                </Button>
              </PopoverBody>
            </PopoverContent>
          </PopoverRoot>
        </Box>
      )}
    </Box>
  );
};
