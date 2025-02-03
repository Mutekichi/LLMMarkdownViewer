'use client';
import { Box, List } from '@chakra-ui/react';
import 'katex/dist/katex.min.css';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        children={markdown}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
          // Markdown の各要素に Chakra UI のコンポーネントを使用
          p: (props) => <Box as="p" marginY={1} {...props} />,
          h1: (props) => <Box as="h1" fontSize="2xl" marginY={4} {...props} />,
          h2: (props) => <Box as="h2" fontSize="xl" marginY={3} {...props} />,
          h3: (props) => <Box as="h3" fontSize="lg" marginY={2} {...props} />,
          ul: (props) => <List.Root pl={4} marginY={4} {...props} />,
          ol: (props) => <List.Root pl={4} marginY={4} {...props} />,
          li: (props) => <List.Item marginY={1} {...props} />,
          pre: PreTag,
        }}
      />
    </Box>
  );
};
