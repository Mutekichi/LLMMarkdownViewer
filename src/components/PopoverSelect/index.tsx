import { Button } from '@chakra-ui/button';
import { VStack } from '@chakra-ui/layout';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/popover';
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
};

export const PopoverSelect: FC<PopoverSelectProps<any>> = ({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  onOpen,
}) => {
  const currentLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Button onClick={onOpen}>{currentLabel}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          <VStack spacing={2}>
            {options.map((option) => (
              <Button
                key={option.value}
                w="full"
                variant="ghost"
                onClick={() => {
                  onChange(option.value);
                  onClose?.();
                }}
                isActive={value === option.value}
              >
                {option.label}
              </Button>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
