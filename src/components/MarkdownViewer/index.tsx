'use client';
import { Box, Button, Link, List } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import 'katex/dist/katex.min.css';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from './CodeBlock';
import SelectableParagraph from './SelectableParagraph';

interface MarkdownViewerProps {
  markdown: string;
}

const PreTag = ({ children, ...props }: any) => (
  <Box as="pre" {...props}>
    {children}
  </Box>
);

interface Position {
  start: { line: number; column: number; offset: number };
  end: { line: number; column: number; offset: number };
}

const getPositionData = (position: Position): string => {
  return `${position.start.line}:${position.start.column}-${position.end.line}:${position.end.column}`;
};

const CustomP = ({ children, ...props }: any) => {
  const handleMouseUp = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      console.log('range', range);
      console.log(range.startOffset, range.endOffset);
      const rect = range.getBoundingClientRect();
      // rect を元に、選択範囲の中央付近の位置を計算
      const toggleX = rect.left + rect.width / 2;
      const toggleY = rect.top; // 必要に応じて調整
      console.log('toggleX', toggleX);
      console.log('toggleY', toggleY);
    }
  };

  console.log('position' + JSON.stringify(props.node.position));
  const positionData = getPositionData(props.node.position);

  const handleClick = () => {
    console.log('positionData', positionData);
    const elements = document.querySelectorAll(
      `[data-position="${positionData}"]`,
    );
    elements.forEach((element) => {
      (element as HTMLElement).style.color = 'red';
    });
  };

  return (
    <Button
      all="unset"
      as="p"
      marginY={2}
      data-position={positionData}
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {children}
    </Button>
  );
};

export const MarkdownViewer: FC<MarkdownViewerProps> = ({ markdown }) => {
  const handleMouseUp = (e: React.MouseEvent<HTMLParagraphElement>) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      console.log('range', range);
      console.log(range.startOffset, range.endOffset);

      const startContainer = range.startContainer;
      let dataPosition: string | null = null;

      if (startContainer.nodeType === Node.ELEMENT_NODE) {
        const element = startContainer as HTMLElement;
        dataPosition = element.getAttribute('data-position');
      } else if (startContainer.nodeType === Node.TEXT_NODE) {
        const parentElement = startContainer.parentNode as HTMLElement;
        if (parentElement) {
          dataPosition = parentElement.getAttribute('data-position');
        }
      }

      console.log('data-position:', dataPosition);
    }
  };
  return (
    <Box onMouseUp={handleMouseUp}>
      <SelectableParagraph />
      <Global
        styles={`
      .katex,
      .katex-display {
        font-size: 1.5em;
        padding: 0.1em 0.1em;
      }
    `}
      />
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        children={markdown}
        components={{
          code: (props) => <CodeBlock {...props} />,
          // p: (props) => <Box as="p" marginY={2} {...props} />,
          // p: (props) => <CustomP {...props} />,
          p: (props) => <SelectableParagraph {...props} />,
          h1: (props) => (
            <Box
              as="h1"
              fontSize="xx-large"
              fontWeight="bold"
              marginY={5}
              {...props}
            />
          ),
          h2: (props) => (
            <Box
              as="h2"
              fontSize="xl"
              fontWeight="bold"
              marginY={4}
              {...props}
            />
          ),
          h3: (props) => (
            <Box
              as="h3"
              fontSize="large"
              fontWeight="bold"
              marginY={3}
              {...props}
            />
          ),
          // その他のコンポネント
          ul: (props) => <List.Root pl={5} marginY={1} {...props} />,
          ol: (props) => <List.Root pl={5} marginY={1} {...props} />,
          li: (props) => <List.Item marginY={1} {...props} />,
          a: (props) => <Link color="blue.500" {...props} />,
          pre: PreTag,
        }}
      />
    </Box>
  );
};
