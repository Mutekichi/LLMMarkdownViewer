import { Box, Center, HStack, Switch, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import {
  OPENAI_MODEL_DISPLAY_NAMES,
  OpenaiMessage,
  OpenaiModelType,
} from '../../../config/llm-models';
import { useMockOpenai } from '../../../hooks/useMockOpenai';
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
    // } = useOpenai();
  } = useMockOpenai();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [model, setModel] = useState<OpenaiModelType>(OpenaiModelType.GPT4o);

  return (
    <VStack
      w="100%"
      h="100%"
      maxH="100%"
      spacing={4}
      justify="space-between"
      bgColor="#f5f5f5"
      boxSizing="border-box"
      pb={2}
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
      <VStack w="100%" spacing={2} justify="space-between" bgColor="#f5f5f5">
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
            options={createModelOptions()}
            value={model}
            onChange={setModel}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            disabled={isLoading}
            tooltipLabelOnDisabled="You can't change the model while generating."
          />
          <Switch
            isChecked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            size="lg"
          >
            temporary chat
          </Switch>
          {/* <div>{error}</div> */}
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
