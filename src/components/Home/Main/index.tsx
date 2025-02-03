'use client';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { useOpenai } from '@/hooks/useOpenai';
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FC, useState } from 'react';
import { RxTrash } from 'react-icons/rx';
import {
  OPENAI_MODEL_DISPLAY_NAMES,
  OpenaiMessage,
  OpenaiModelType,
} from '../../../config/llm-models';
import CustomTextInput from '../../CustomInput';
import { PopoverSelect, PopoverSelectOption } from '../../PopoverSelect';
import { MessageHistory } from '../MessageHistory';

const createModelOptions = (): PopoverSelectOption<OpenaiModelType>[] => {
  return Object.entries(OPENAI_MODEL_DISPLAY_NAMES).map(([value, label]) => ({
    value: value as OpenaiModelType,
    label,
  }));
};

const Main: FC = () => {
  const [inputText, setInputText] = useState('');
  const {
    output,
    isLoading,
    error,
    streamResponse,
    clearOutput,
    stopGeneration,
    setStopGeneration,
    messages,
  } = useOpenai();
  // } = useMockOpenai();

  const {
    output: temporaryOutput,
    isLoading: temporaryIsLoading,
    error: temporaryError,
    streamResponse: temporaryStreamResponse,
    clearOutput: temporaryClearOutput,
    stopGeneration: temporaryStopGeneration,
    setStopGeneration: temporarySetStopGeneration,
    messages: temporaryMessages,
    clearAllHistory: temporaryClearAllHistory,
    temporaryStreamResponse: temporaryTemporaryStreamResponse,
    // } = useMockOpenai();
  } = useOpenai();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [model, setModel] = useState<OpenaiModelType>(OpenaiModelType.GPT4o);

  const onTemporaryChatButtonClick = () => {
    if (isChecked) {
      temporaryClearOutput();
    }
    setIsChecked(!isChecked);
  };
  return (
    <VStack
      w="100%"
      h="100%"
      maxH="100%"
      gap={4}
      justify="space-between"
      bgColor="#f5f5f5"
      boxSizing="border-box"
      pb={2}
      position="relative"
    >
      <Box h="50" />
      <VStack flex="1" overflowY="auto" w="100%" pb={4}>
        <MessageHistory
          messages={excludeSystemMessages(messages)}
          // messages={messages}
          streaming={isLoading}
          streamingMessage={output}
        />
        {isChecked && (
          <VStack
            w="80%"
            gap={2}
            justify="space-between"
            bgColor="#eeeeee"
            flex="1"
            borderTopRadius={20}
            border="1"
            justifyContent="start"
          >
            <VStack p={2} gap={0}>
              <Text fontSize="1.5rem" textAlign="center">
                Temporary Chat
              </Text>
              <Text fontSize="1.2rem" textAlign="center">
                This conversation does not include any previous chat history and
                will not be saved.
              </Text>
            </VStack>
            <MessageHistory
              messages={excludeSystemMessages(temporaryMessages)}
              // messages={temporaryMessages}
              streaming={temporaryIsLoading}
              streamingMessage={temporaryOutput}
            />
          </VStack>
        )}
      </VStack>
      <VStack w="100%" gap={2} justify="space-between" bgColor="#f5f5f5">
        <Center w="80%">
          <CustomTextInput
            onChange={(value) => setInputText(value)}
            onButtonClick={(value) => {
              if (isChecked) {
                temporaryTemporaryStreamResponse(value, model);
                // temporarySetStopGeneration(false);
              } else {
                streamResponse(value, model);
                setStopGeneration(false);
              }
              setInputText('');
            }}
            buttonDisabled={!checkInputLength(inputText)}
            inputDisabled={isLoading}
          />
        </Center>
        <HStack w="80%" h="100%" gap={4}>
          <PopoverSelect
            options={createModelOptions()}
            value={model}
            onChange={setModel}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            disabled={isLoading}
            tooltipLabelOnDisabled="You can't change the model while generating."
          />
          <Tooltip
            content="Temporary chat"
            positioning={{ placement: 'right-end' }}
            openDelay={100}
            closeDelay={100}
          >
            <HStack
              h="100%"
              alignItems="flex-end"
              pb={2}
              gap={0}
              onClick={onTemporaryChatButtonClick}
              cursor="pointer"
              borderRadius={10}
              _hover={{ bgColor: 'blackAlpha.50' }}
            >
              <Box
                display="flex"
                alignItems="flex-start"
                h="100%"
                opacity={isChecked ? 1 : 0.5}
              >
                {/* <img src="/icons/vanish.svg" alt="SVG" width={40} height={40} /> */}
                <img
                  src="/icons/temporary_chat.svg"
                  alt="SVG"
                  width={40}
                  height={40}
                />
              </Box>
              <Flex justify="flex-end">
                <Switch size="lg" checked={isChecked} />
              </Flex>
            </HStack>
          </Tooltip>
          <Tooltip
            content="Clear all history"
            positioning={{ placement: 'right-end' }}
            openDelay={100}
            closeDelay={100}
          >
            <Button
              display="flex"
              h="100%"
              w="80px"
              bgColor="transparent"
              opacity={1}
              px={2}
              borderRadius={10}
              _hover={{ bgColor: 'blackAlpha.50' }}
              onClick={() => {
                if (isChecked) {
                  temporaryClearAllHistory();
                } else {
                  clearOutput();
                }
              }}
            >
              {/* <img src="/icons/vanish.svg" alt="SVG" width={60} height={60} /> */}
              <Icon as={RxTrash} boxSize={10} color="blackAlpha.800" />
            </Button>
          </Tooltip>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default Main;

const excludeSystemMessages = (messages: OpenaiMessage[]): OpenaiMessage[] => {
  // first message is always system message
  return messages.slice(1);
  // return messages;
  // return messages.filter((message) => message.role !== 'system');
};

const checkInputLength = (inputText: string): boolean => {
  return inputText.length > 1;
};

const checkInputIncludesOnlyAvailableCharacters = (
  inputText: string,
): boolean => {
  return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \n]*$/.test(inputText);
};
