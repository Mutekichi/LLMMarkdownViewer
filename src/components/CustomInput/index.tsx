import React, { useState, useRef, useEffect } from 'react';
import { Textarea, Box } from '@chakra-ui/react';

interface CustomTextInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  onButtonClick?: (value: string) => void;
  buttonDisabled?: boolean;
  inputDisabled?: boolean;
  error?: boolean;
}

const C_DEFAULT = '#00FFFF';
const C_PENDING = '#00FFFF33';
const C_ERROR = '#FF0000';

const CustomTextInput: React.FC<CustomTextInputProps> = (props) => {
  const {
    placeholder,
    onChange,
    onButtonClick,
    buttonDisabled,
    inputDisabled,
    error,
  } = props;

  const [value, setValue] = useState('');
  const [lines, setLines] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const LINE_HEIGHT = 32;
  const DEFAULT_HEIGHT = LINE_HEIGHT;
  const BUTTON_WIDTH = 40;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (onButtonClick && !buttonDisabled) {
        onButtonClick(value);
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${DEFAULT_HEIGHT}px`;
      const newHeight = Math.max(textarea.scrollHeight, DEFAULT_HEIGHT);
      textarea.style.height = `${newHeight}px`;
      const newLines = Math.ceil(newHeight / LINE_HEIGHT);
      setLines(newLines);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  return (
    <Box
      width="560px"
      height={`${Math.max(lines, 3) * LINE_HEIGHT}px`}
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
        fontSize="1.5rem"
        fontFamily="'Roboto Mono', monospace"
        resize="none"
        overflow="hidden"
        _placeholder={{ color: 'gray.500' }}
        _focus={{ outline: 'none' }}
        sx={{
          '&::-webkit-scrollbar': {
            width: '0px',
          },
          lineHeight: `${LINE_HEIGHT}px`,
          letterSpacing: '0.02em',
        }}
      />
      <Box
        as="button"
        aria-label="Send message"
        onClick={() => onButtonClick && onButtonClick(value)}
        disabled={buttonDisabled}
        position="absolute"
        right="20px"
        top="50%"
        transform="translateY(-50%)"
        bg="transparent"
        border="none"
        padding="0"
        cursor="pointer"
        outline="none"
        _hover={{ opacity: 0.8 }}
        _active={{ opacity: 0.6 }}
        _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
        transition="opacity 0.2s"
        width={`${BUTTON_WIDTH}px`}
        height={`${BUTTON_WIDTH}px`}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <svg
          width={BUTTON_WIDTH}
          height={BUTTON_WIDTH}
          viewBox={`0 0 ${BUTTON_WIDTH} ${BUTTON_WIDTH}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx={BUTTON_WIDTH / 2}
            cy={BUTTON_WIDTH / 2}
            r={BUTTON_WIDTH / 2 - 2}
            stroke={error ? C_ERROR : inputDisabled ? C_PENDING : C_DEFAULT}
            strokeWidth="2"
          />
        </svg>
      </Box>
    </Box>
  );
};

export default CustomTextInput;
