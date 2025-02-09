// HighlightableReactMarkdown.tsx
'use client';
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
  /**
   * onSelection: (任意) 未ハイライト部分の選択時のコールバック
   * renderPopover: HighlightableElement 内で呼ばれるカスタムポップオーバーのレンダラ
   * onHighlightedClick: ハイライト済み部分がクリックされたときのコールバック
   */
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
> = ({
  markdown,
  highlightedPartInfo,
  setHighlightedPartInfo,
  onSelection,
  renderPopover,
  onHighlightedClick,
}) => {
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
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
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
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="h1"
                style={{ fontSize: 'xx-large', fontWeight: 'bold', marginY: 5 }}
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
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="li"
                style={{ marginY: 1 }}
              >
                {textContent}
              </HighlightableElement>
            );
          },
          code: (props: any) => <CodeBlock {...props} />,
          a: (props: any) => <Link color="blue.500" {...props} />,
          ul: (props: any) => <List.Root pl={5} marginY={1} {...props} />,
          ol: (props: any) => <List.Root pl={5} marginY={1} {...props} />,
        }}
      />
    </Box>
  );
};
