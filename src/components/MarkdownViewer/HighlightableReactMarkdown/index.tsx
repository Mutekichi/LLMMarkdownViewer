'use client';
import { Box, Link, List } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../CodeBlock';
import { HighlightableElement } from './HighlightableElement';
// import this to prevent double display for formula
import 'katex/dist/katex.min.css';

// Inline styled components
const InlineStrong = (props: any) => (
  <Box as="strong" fontWeight="bold" color="inherit" {...props} />
);
const InlineEm = (props: any) => (
  <Box as="em" fontStyle="italic" color="inherit" {...props} />
);
const InlineDel = (props: any) => (
  <Box as="del" textDecoration="line-through" color="inherit" {...props} />
);
const InlineLink = (props: any) => <Link color="blue.500" {...props} />;
const InlineCode = (props: any) => (
  <Box
    as="code"
    bg="gray.100"
    px={1}
    py={0.5}
    borderRadius="md"
    fontFamily="mono"
    {...props}
  />
);

const PreTag = ({ children, ...props }: any) => (
  <Box as="pre" {...props}>
    {children}
  </Box>
);

interface HighlightRange {
  startOffset: number;
  endOffset: number;
}

export type HighlightInfo = {
  id: string;
  ranges: HighlightRange[];
};

export interface HighlightableReactMarkdownProps {
  markdown: string;
  highlightedPartInfo: HighlightInfo[];
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

export const HighlightableReactMarkdown: React.FC<
  HighlightableReactMarkdownProps
> = ({
  markdown,
  highlightedPartInfo,
  onSelection,
  renderPopover,
  onHighlightedClick,
}) => {
  return (
    <Box position="relative">
      <Global
        styles={`
      .katex,
      .katex-display {
        font-size: 1.2rem;
        padding: 0.05rem 0.05rem;
      }
    `}
      />
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Paragraph
          p: (props: any) => {
            // Generate a unique ID from node position (fallback to a random string if not available)
            const id = props.node?.position
              ? `${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);

            const hi = highlightedPartInfo.find((item) => item.id === id);

            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="p"
                marginY={2}
                {...props}
              >
                {props.children}
              </HighlightableElement>
            );
          },

          h1: (props: any) => {
            const id = props.node?.position
              ? `h1-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);

            const hi = highlightedPartInfo.find((item) => item.id === id);

            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="h1"
                fontSize="xx-large"
                fontWeight="bold"
                marginY={5}
                {...props}
              >
                {props.children}
              </HighlightableElement>
            );
          },

          h2: (props: any) => {
            const id = props.node?.position
              ? `h1-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);

            const hi = highlightedPartInfo.find((item) => item.id === id);

            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="h2"
                fontSize="x-large"
                fontWeight="bold"
                marginY={5}
                {...props}
              >
                {props.children}
              </HighlightableElement>
            );
          },
          h3: (props: any) => {
            const id = props.node?.position
              ? `h1-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);

            const hi = highlightedPartInfo.find((item) => item.id === id);

            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="h3"
                fontSize="large"
                fontWeight="bold"
                marginY={5}
                {...props}
              >
                {props.children}
              </HighlightableElement>
            );
          },

          li: (props: any) => {
            const id = props.node?.position
              ? `li-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);

            const hi = highlightedPartInfo.find((item) => item.id === id);

            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="li"
                marginY={1}
                {...props}
              >
                {props.children}
              </HighlightableElement>
            );
          },
          //TODO: make list items highlightable
          ul: (props: any) => {
            const id = props.node?.position
              ? `ul-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="ul"
                {...props}
              >
                <List.Root pl={5} marginY={1} {...props} />
              </HighlightableElement>
            );
          },
          ol: (props: any) => {
            const id = props.node?.position
              ? `ol-${props.node.position.start.line}-${props.node.position.start.column}`
              : Math.random().toString(36).substr(2, 9);
            const hi = highlightedPartInfo.find((item) => item.id === id);
            return (
              <HighlightableElement
                id={id}
                onSelection={onSelection}
                renderPopover={renderPopover}
                onHighlightedClick={onHighlightedClick}
                highlightInfo={hi}
                elementType="ol"
                {...props}
              >
                <List.Root pl={5} marginY={1} {...props} />
              </HighlightableElement>
            );
          },

          //TODO: make inline elements highlightable
          a: InlineLink,
          strong: InlineStrong,
          em: InlineEm,
          del: InlineDel,

          code: CodeBlock,
          pre: PreTag,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Box>
  );
};
