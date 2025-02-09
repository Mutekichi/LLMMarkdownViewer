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

  // 分割：highlightInfo に基づいて元テキストをセグメントに分割する
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

  // ポップオーバー表示用状態
  const [popoverInfo, setPopoverInfo] = React.useState<PopoverInfo | null>(
    null,
  );
  const closePopover = () => setPopoverInfo(null);

  /**
   * handleMouseUp:
   * 1. Selection API で選択範囲を取得
   * 2. 単一テキストノード内の選択の場合、親の data-offset-start 属性から絶対オフセットを計算する
   * 3. 既にハイライト済みなら onHighlightedClick を呼び、そうでなければ renderPopover（または onSelection）を呼ぶ
   */
  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
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
    const absoluteStart = segmentStart + range.startOffset;
    const absoluteEnd = segmentStart + range.endOffset;
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
    if (renderPopover) {
      const rect = range.getBoundingClientRect();
      // 対象要素の id も含めた情報を渡す
      setPopoverInfo({ absoluteStart, absoluteEnd, anchorRect: rect });
    } else if (onSelection) {
      onSelection({ id, startOffset: absoluteStart, endOffset: absoluteEnd });
    }
    selection.removeAllRanges();
  };

  // セグメント描画：ハイライト済みはボタン風に、それ以外は通常の <span> として描画
  const renderSegment = (seg: SegmentInfo, idx: number) => {
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
          //   sx={{
          //     border: '1px solid',
          //     borderColor: 'blue.300',
          //     borderRadius: '4px',
          //     padding: '2px 4px',
          //     cursor: 'pointer',
          //     marginRight: '2px',
          //   }}
        >
          {seg.text}
        </Box>
      );
    } else {
      return (
        <span
          key={idx}
          data-offset-start={seg.start}
          data-offset-end={seg.end}
          data-highlighted="false"
        >
          {seg.text}
        </span>
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
              {/**
               * renderPopover を呼び出す際、対象要素の id を含めた情報を渡す
               */}
              {renderPopover({ id, ...popoverInfo }, closePopover)}
            </PopoverContent>
          </PopoverRoot>
        </Box>
      )}
    </Box>
  );
};
