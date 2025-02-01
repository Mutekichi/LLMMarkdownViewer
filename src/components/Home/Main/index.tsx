import { Center, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useMockOpenai } from '../../../hooks/useMockOpenai';
import { OpenaiModel } from '../../../hooks/useOpenai';
import CustomTextInput from '../../CustomInput';
import { Message } from '../Message';

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

  return (
    <VStack
      w="100%"
      h="100%"
      bg="gray"
      spacing={4}
      justify="space-between"
      position="relative"
    >
      <VStack>
        {messages.map((message, index) => (
          <Message key={index} message={message.content} />
        ))}
      </VStack>
      {isLoading && <Message message={output} />}
      <Center position="absolute" bottom="10" w="100%">
        <CustomTextInput
          onChange={(value) => setInputText(value)}
          onButtonClick={(value) => {
            streamResponse(value, OpenaiModel.GPT4);
          }}
          buttonDisabled={!checkInputLength(inputText)}
          inputDisabled={isLoading}
        />
      </Center>
    </VStack>
  );
};

export default Main;

const checkInputLength = (inputText: string): boolean => {
  return inputText.length > 1;
};

const checkInputIncludesOnlyAvailableCharacters = (
  inputText: string,
): boolean => {
  return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \n]*$/.test(inputText);
};
