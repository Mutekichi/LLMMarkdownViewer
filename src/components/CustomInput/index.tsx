import { Box, Button, Textarea } from '@chakra-ui/react';
import { ChangeEvent, FC, memo, useEffect, useState } from 'react';

interface CustomTextInputProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  placeholder?: string;
  onChange?: (value: string) => void;
  onButtonClick?: (value: string) => void;
  buttonDisabled?: boolean;
  inputDisabled?: boolean;
  error?: boolean;
}

const C_DEFAULT = '#000000';
const C_PENDING = '#cccccc';
const C_ERROR = '#ff0000';

const MAX_HEIGHT = 400;

export const CustomTextInput: FC<CustomTextInputProps> = memo((props) => {
  const {
    textareaRef,
    placeholder,
    onChange,
    onButtonClick,
    buttonDisabled,
    inputDisabled,
    error,
  } = props;

  const [value, setValue] = useState('');

  const LINE_HEIGHT = 28;
  const DEFAULT_HEIGHT = LINE_HEIGHT;
  const BUTTON_WIDTH = 40;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick && !buttonDisabled) {
      onButtonClick(value);
      clearInput();
    }
  };

  const clearInput = () => {
    setValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleButtonClick();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${LINE_HEIGHT}px`;
      const newHeight = Math.max(textarea.scrollHeight, LINE_HEIGHT);
      const limitedHeight = Math.min(newHeight, MAX_HEIGHT);
      textarea.style.height = `${limitedHeight}px`;
      const newLines = Math.ceil(limitedHeight / LINE_HEIGHT);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [inputDisabled]);

  return (
    <Box
      width="100%"
      borderRadius="50px"
      borderWidth="4px"
      border={
        inputDisabled ? `2px solid ${C_PENDING}` : `2px solid ${C_DEFAULT}`
      }
      overflow="hidden"
      display="flex"
      alignItems="center"
      position="relative"
      transition={`border-color 0.2s`}
    >
      <Textarea
        ref={textareaRef}
        rows={1}
        height={`${1.2 * LINE_HEIGHT}px`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={inputDisabled}
        width={`calc(100% - ${BUTTON_WIDTH + 50}px)`}
        marginLeft="20px"
        border="none"
        backgroundColor="transparent"
        color={inputDisabled ? C_PENDING : C_DEFAULT}
        fontSize="1.2rem"
        resize="none"
        overflowY="auto"
        py={6}
        _placeholder={{ color: 'gray.500' }}
        _focus={{ outline: 'none' }}
        lineHeight={`${LINE_HEIGHT}px`}
        letterSpacing={'0.02em'}
      />
      <Button
        aria-label="Send message"
        onClick={handleButtonClick}
        disabled={buttonDisabled || inputDisabled}
        position="absolute"
        right="20px"
        top="50%"
        transform="translateY(-50%)"
        bg="transparent"
        p={0}
        cursor="pointer"
        outline="none"
        _hover={{ opacity: 0.8 }}
        _active={{ opacity: 0.6 }}
        _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
        transition="opacity 0.2s"
        width={`${BUTTON_WIDTH}px`}
        height={`${BUTTON_WIDTH}px`}
        borderRadius="full"
        borderWidth="2px"
        borderColor={error ? C_ERROR : inputDisabled ? C_PENDING : C_DEFAULT}
      />
    </Box>
  );
});
