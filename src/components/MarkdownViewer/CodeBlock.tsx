'use client';

import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { Box, Button, HStack, Icon } from '@chakra-ui/react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  inline,
  className,
  children,
  ...rest
}) => {
  // check if the code block is a markdown code block or not
  // by checking the language- prefix in the className
  const match = /language-(\w+)/.exec(className || '');

  // inline code
  if (inline || !match) {
    return (
      <code {...rest} className={className}>
        {children}
      </code>
    );
  }

  // block code
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard
      .writeText(codeString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
      })
      .catch((err) => {
        console.error('Copy failed ', err);
      });
  };

  return (
    <Box position="relative" my={4} borderRadius={10} overflow="hidden">
      <HStack
        bgColor="transparent"
        px={3}
        py={0}
        justifyContent="space-between"
        alignItems="center"
      >
        <Box
          as="span"
          color="blackAlpha800"
          fontSize="sm"
          fontWeight="bold"
          py={2}
        >
          {match[1].toUpperCase()}
        </Box>
        <Button
          size="xs"
          top={2}
          bgColor={copied ? 'blackAlpha.500' : 'blackAlpha.400'}
          onClick={handleCopy}
        >
          {copied ? (
            <Icon as={CheckIcon} boxSize={4} />
          ) : (
            <Icon as={CopyIcon} boxSize={4} />
          )}
        </Button>
      </HStack>
      <SyntaxHighlighter language={match[1]} style={a11yDark} {...rest}>
        {codeString}
      </SyntaxHighlighter>
    </Box>
  );
};
