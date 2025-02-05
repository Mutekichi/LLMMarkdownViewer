'use client';
import { Box, Link, List } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import 'katex/dist/katex.min.css';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from './CodeBlock';

interface MarkdownViewerProps {
  markdown: string;
}

const PreTag = ({ children, ...props }: any) => (
  <Box as="pre" {...props}>
    {children}
  </Box>
);

export const MarkdownViewer: FC<MarkdownViewerProps> = ({ markdown }) => {
  return (
    <Box>
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
          // Markdown の各要素に Chakra UI のコンポーネントを使用
          p: (props) => <Box as="p" marginY={2} {...props} />,
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
          ul: (props) => <List.Root pl={5} marginY={4} {...props} />,
          ol: (props) => <List.Root pl={5} marginY={4} {...props} />,
          li: (props) => <List.Item marginY={1} {...props} />,
          a: (props) => <Link color="blue.500" {...props} />,
          pre: PreTag,
        }}
      />
    </Box>
  );
};
