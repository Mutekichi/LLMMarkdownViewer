import { Button, ButtonProps } from '@chakra-ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Text, VStack } from '@chakra-ui/layout';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/popover';
import { Tooltip } from '@chakra-ui/tooltip';
import { FC } from 'react';

export type PopoverSelectOption<T> = {
  value: T;
  label: string;
};

type PopoverSelectProps<T> = {
  options: PopoverSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  disabled?: boolean;
  tooltipLabelOnDisabled?: string;
};

export const PopoverSelect: FC<PopoverSelectProps<any>> = ({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  onOpen,
  disabled,
  tooltipLabelOnDisabled = '',
}) => {
  const currentLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Button
          px={8}
          py={4}
          h="60px"
          border="none"
          borderRadius="40"
          bg="#f5f5f5"
          _hover={{ bg: '#e8e8e8' }}
          onClick={onOpen}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          cursor="pointer"
          minW="300px"
        >
          <Text fontSize="1.2rem">{currentLabel}</Text>
          {isOpen ? (
            <ChevronDownIcon boxSize={5} />
          ) : (
            <ChevronUpIcon boxSize={5} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent sx={{ all: 'unset' }}>
        <PopoverBody>
          <VStack spacing={0} p={0} sx={{ all: 'unset' }}>
            {options.map((option) => (
              <PopoverSelectButton
                key={option.value}
                w="full"
                variant="ghost"
                onClick={() => {
                  disabled || onChange(option.value);
                  disabled || onClose?.();
                }}
                isActive={value === option.value}
                disabled={disabled}
                tooltipLabelOnDisabled={tooltipLabelOnDisabled}
              >
                {option.label}
              </PopoverSelectButton>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const PopoverSelectButton: FC<
  ButtonProps & { isActive: boolean; tooltipLabelOnDisabled: string }
> = (props) => {
  return (
    <Tooltip
      label={props.disabled ? props.tooltipLabelOnDisabled : ''}
      placement="bottom-start"
    >
      <Button
        // disable default button styles
        py={4}
        h="60px"
        border="none"
        borderRadius="4"
        bg="#fafafa"
        _hover={{ bg: '#f3f3f3' }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        minW="300px"
        fontSize="1rem"
        _active={{ bg: '#e8e8e8' }}
        {...props}
      />
    </Tooltip>
  );
};
