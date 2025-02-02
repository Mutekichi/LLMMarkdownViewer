import { Box, Center, Text, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useMockOpenai } from '../../../hooks/useMockOpenai';
import { OpenaiModel } from '../../../hooks/useOpenai';
import CustomTextInput from '../../CustomInput';
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

  return (
    <VStack
      w="100%"
      h="100%"
      maxH="100%"
      spacing={8}
      justify="space-between"
      bgColor="#f5f5f5"
    >
      <Box h="50" />
      <VStack flex="1" overflowY="auto" w="100%" pb="40">
        <MessageHistory
          messages={messages}
          streaming={isLoading}
          streamingMessage={output}
        />
      </VStack>
      <VStack w="100%" spacing={0} justify="space-between" bgColor="#f5f5f5">
        <Center w="80%">
          <CustomTextInput
            onChange={(value) => setInputText(value)}
            onButtonClick={(value) => {
              streamResponse(value, OpenaiModel.o1mini);
            }}
            buttonDisabled={!checkInputLength(inputText)}
            inputDisabled={isLoading}
          />
        </Center>
        <Text> hogehoge </Text>
      </VStack>
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
