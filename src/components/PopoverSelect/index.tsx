'use client';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Button, ButtonProps, Text, VStack } from '@chakra-ui/react';

import { FC } from 'react';
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '../ui/popover';

export type PopoverSelectOption<T> = {
  value: T;
  label: string;
};

type PopoverSelectProps<T> = {
  options: PopoverSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isOpen?: boolean;
  setIsOpen: (isOpen: boolean) => void;
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
  setIsOpen,
  onClose,
  onOpen,
  disabled,
  tooltipLabelOnDisabled = '',
}) => {
  const currentLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <PopoverRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <PopoverTrigger asChild>
        <Button
          px={8}
          py={4}
          h="60px"
          border="none"
          borderRadius={10}
          bg="#f5f5f5"
          _hover={{ bg: '#e8e8e8' }}
          onClick={onOpen}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          cursor="pointer"
          minW="250px"
          color="black"
        >
          <Text fontSize="1.2rem">{currentLabel}</Text>
          {isOpen ? (
            <ChevronDownIcon boxSize={20} />
          ) : (
            <ChevronUpIcon boxSize={20} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody p={0}>
          <VStack gap={0} p={0}>
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
    </PopoverRoot>
  );
};

const PopoverSelectButton: FC<
  ButtonProps & { isActive: boolean; tooltipLabelOnDisabled: string }
> = (props) => {
  return (
    <Button
      // disable default button styles
      py={4}
      h="60px"
      border="none"
      borderRadius={4}
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
  );
};
