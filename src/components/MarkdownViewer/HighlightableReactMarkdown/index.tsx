import { Box, Link, List } from '@chakra-ui/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '../CodeBlock';
import {
  HighlightableElement,
  HighlightInfo,
  HighlightRange,
} from './HighlightableElement';

interface HighlightableReactMarkdownProps {
  markdown: string;
  highlightedPartInfo: HighlightInfo[];
  setHighlightedPartInfo: React.Dispatch<React.SetStateAction<HighlightInfo[]>>;
}

const mergeRanges = (ranges: HighlightRange[]): HighlightRange[] => {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.startOffset - b.startOffset);
  const merged: HighlightRange[] = [];
  let current = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.startOffset <= current.endOffset) {
      current = {
        startOffset: current.startOffset,
        endOffset: Math.max(current.endOffset, r.endOffset),
      };
    } else {
      merged.push(current);
      current = r;
    }
  }
  merged.push(current);
  return merged;
};

export const HighlightableReactMarkdown: React.FC<
  HighlightableReactMarkdownProps
> = ({ markdown, highlightedPartInfo, setHighlightedPartInfo }) => {
  // merge overlapping ranges

  const handleHighlight = (info: {
    id: string;
    startOffset: number;
    endOffset: number;
  }) => {
    setHighlightedPartInfo((prev) => {
      // find the index representing the target element
      const index = prev.findIndex((item) => item.id === info.id);
      if (index >= 0) {
        const existing = prev[index];
        // first, add the new range to the existing ranges
        const newRanges = [
          ...existing.ranges,
          { startOffset: info.startOffset, endOffset: info.endOffset },
        ];
        // then merge the ranges and update the state
        const mergedRanges = mergeRanges(newRanges);
        const updated = { ...existing, ranges: mergedRanges };

        // replace the whole range-info array with the updated one
        const newHighlights = [...prev];
        newHighlights[index] = updated;
        return newHighlights;
      } else {
        // if there is no existing range-info for the target element, create a new one
        return [
          ...prev,
          {
            id: info.id,
            ranges: [
              { startOffset: info.startOffset, endOffset: info.endOffset },
            ],
          },
        ];
      }
    });
  };

  // ハイライト解除時の処理（選択した範囲と既存ハイライトとの重なりを取り除く）
  const handleRemoveHighlight = (info: {
    id: string;
    range: HighlightRange;
  }) => {
    setHighlightedPartInfo((prev) => {
      const index = prev.findIndex((item) => item.id === info.id);
      if (index >= 0) {
        const existing = prev[index];
        const newRanges: HighlightRange[] = [];
        for (const r of existing.ranges) {
          // 重なりがなければそのまま残す
          if (
            info.range.endOffset <= r.startOffset ||
            info.range.startOffset >= r.endOffset
          ) {
            newRanges.push(r);
          } else {
            // 重なっている場合、削除部分の前後を残す
            if (info.range.startOffset > r.startOffset) {
              newRanges.push({
                startOffset: r.startOffset,
                endOffset: info.range.startOffset,
              });
            }
            if (info.range.endOffset < r.endOffset) {
              newRanges.push({
                startOffset: info.range.endOffset,
                endOffset: r.endOffset,
              });
            }
          }
        }
        const updated = { ...existing, ranges: newRanges };
        const newHighlights = [...prev];
        newHighlights[index] = updated;
        return newHighlights;
      }
      return prev;
    });
  };

  return (
    <Box position="relative">
      <ReactMarkdown
        children={markdown}
        components={{
          p: (props: any) => {
            const id = props.node?.position
              ? `${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            let textContent: string = '';
            if (Array.isArray(props.children)) {
              textContent = props.children.join('');
            } else if (typeof props.children === 'string') {
              textContent = props.children;
            }
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onHighlight={handleHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                highlightInfo={hi}
                elementType="p"
              >
                {textContent}
              </HighlightableElement>
            );
          },
          h1: (props: any) => {
            const id = props.node?.position
              ? `h1-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            let textContent: string = '';
            if (Array.isArray(props.children)) {
              textContent = props.children.join('');
            } else if (typeof props.children === 'string') {
              textContent = props.children;
            }
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onHighlight={handleHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                highlightInfo={hi}
                elementType="h1"
                style={{ fontSize: 'xx-large', fontWeight: 'bold', marginY: 5 }}
              >
                {textContent}
              </HighlightableElement>
            );
          },
          h2: (props: any) => {
            const id = props.node?.position
              ? `h2-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            let textContent: string = '';
            if (Array.isArray(props.children)) {
              textContent = props.children.join('');
            } else if (typeof props.children === 'string') {
              textContent = props.children;
            }
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onHighlight={handleHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                highlightInfo={hi}
                elementType="h2"
                style={{ fontSize: 'xl', fontWeight: 'bold', marginY: 4 }}
              >
                {textContent}
              </HighlightableElement>
            );
          },
          h3: (props: any) => {
            const id = props.node?.position
              ? `h3-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            let textContent: string = '';
            if (Array.isArray(props.children)) {
              textContent = props.children.join('');
            } else if (typeof props.children === 'string') {
              textContent = props.children;
            }
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onHighlight={handleHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                highlightInfo={hi}
                elementType="h3"
                style={{ fontSize: 'large', fontWeight: 'bold', marginY: 3 }}
              >
                {textContent}
              </HighlightableElement>
            );
          },
          li: (props: any) => {
            const id = props.node?.position
              ? `li-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            let textContent: string = '';
            if (Array.isArray(props.children)) {
              textContent = props.children.join('');
            } else if (typeof props.children === 'string') {
              textContent = props.children;
            }
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onHighlight={handleHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                highlightInfo={hi}
                elementType="li"
                style={{ marginY: 1 }}
              >
                {textContent}
              </HighlightableElement>
            );
          },

          code: (props: any) => <CodeBlock {...props} />,

          ul: (props: any) => <List.Root pl={5} marginY={1} {...props} />,
          ol: (props: any) => <List.Root pl={5} marginY={1} {...props} />,
          a: (props: any) => <Link color="blue.500" {...props} />,
        }}
      />
    </Box>
  );
};
