import { Box } from '@chakra-ui/react';
import 'katex/dist/katex.min.css';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import AutoScrollWrapper from '../AutoScrollWrapper';

interface MarkdownViewerProps {
  markdown: string;
}

const PreTag = ({ children, ...props }: any) => (
  <Box as="pre" {...props}>
    {children}
  </Box>
);

const MarkdownViewer: FC<MarkdownViewerProps> = ({ markdown }) => {
  return (
    <AutoScrollWrapper dependencies={[markdown]}>
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
                // {...rest}
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      />
    </AutoScrollWrapper>
  );
};

export default MarkdownViewer;
