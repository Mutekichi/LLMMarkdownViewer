import { Box, Center, HStack, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useMockOpenai } from '../../../hooks/useMockOpenai';
import { OpenaiMessage, OpenaiModel } from '../../../hooks/useOpenai';
import CustomTextInput from '../../CustomInput';
import { PopoverSelect, PopoverSelectOption } from '../../PopoverSelect';
import { MessageHistory } from '../MessageHistory';

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
    // } = useOpenai();
  } = useMockOpenai();
  // } = useClaude();

  const [isOpen, setIsOpen] = useState(false);

  const [model, setModel] = useState<OpenaiModel>(OpenaiModel.GPT4o);

  const modelOptions: PopoverSelectOption<OpenaiModel>[] = [
    { value: OpenaiModel.GPT4o, label: 'GPT-4o' },
    { value: OpenaiModel.o1, label: 'o1' },
    { value: OpenaiModel.o1mini, label: 'o1-mini' },
    { value: OpenaiModel.o3mini, label: 'o3-mini' },
  ];

  return (
    <VStack
      w="100%"
      h="100%"
      maxH="100%"
      spacing={8}
      justify="space-between"
      bgColor="#f5f5f5"
      boxSizing="border-box"
      py={8}
    >
      <Box h="50" />
      <VStack flex="1" overflowY="auto" w="100%" pb="40">
        <MessageHistory
          messages={excludeSystemMessages(messages)}
          // messages={messages}
          streaming={isLoading}
          streamingMessage={output}
        />
      </VStack>
      <VStack w="100%" spacing={8} justify="space-between" bgColor="#f5f5f5">
        <Center w="80%">
          <CustomTextInput
            onChange={(value) => setInputText(value)}
            onButtonClick={(value) => {
              streamResponse(value, model);
              // streamResponse(value, ClaudeModel.OPUS);
              setInputText('');
            }}
            buttonDisabled={!checkInputLength(inputText)}
            inputDisabled={isLoading}
          />
        </Center>
        <HStack w="80%">
          <PopoverSelect
            options={modelOptions}
            value={model}
            onChange={setModel}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            disabled={isLoading}
            tooltipLabelOnDisabled="You can't change the model while generating."
          />
          <div>{error}</div>
          {/* <div>{output}</div> */}
        </HStack>
      </VStack>
    </VStack>
  );
};

export default Main;

const excludeSystemMessages = (messages: OpenaiMessage[]): OpenaiMessage[] => {
  // first message is always system message
  return messages.slice(1);
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
