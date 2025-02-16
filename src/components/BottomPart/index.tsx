'use client';
import { UseOpenaiReturn } from '@/hooks/useOpenai';
import { checkInputLength } from '@/utils/chatUtils';
import { Center, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { OpenaiModelType } from '../../config/llm-models';
import { CustomTextInput } from '../CustomInput';
import { MessageSettingPart } from '../MessageSettingPart/MessageSettingPart';

interface BottomPartProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setInputPrompt: (value: string) => void;
  inputPrompt: string;
  model: OpenaiModelType;
  setModel: (model: OpenaiModelType) => void;
  isModelSelectPopoverOpen: boolean;
  setIsModelSelectPopoverOpen: (isOpen: boolean) => void;
  isTemporaryChatOpen: boolean;
  mainOpenai: UseOpenaiReturn;
  tempOpenai: UseOpenaiReturn;
  setIsTemporaryChatOpen: (isOpen: boolean) => void;
  handleSaveButtonClick: () => void;
  handleResetButtonClick: () => void;
  openContactDialog: () => void;
}

export const BottomPart: FC<BottomPartProps> = (props) => {
  const {
    textareaRef,
    setInputPrompt,
    inputPrompt,
    model,
    setModel,
    isModelSelectPopoverOpen,
    setIsModelSelectPopoverOpen,
    isTemporaryChatOpen,
    mainOpenai,
    tempOpenai,
    setIsTemporaryChatOpen,
    handleSaveButtonClick,
    handleResetButtonClick,
    openContactDialog,
  } = props;

  return (
    <VStack w="100%" gap={2} pt={4} justify="space-between" bgColor="#f5f5f5">
      <Center w="80%">
        <CustomTextInput
          textareaRef={textareaRef}
          onChange={(value) => setInputPrompt(value)}
          onButtonClick={(value) => {
            if (isTemporaryChatOpen) {
              tempOpenai.temporaryStreamResponse(value, model);
              setInputPrompt('');
            } else {
              mainOpenai.streamResponse(value, model);
              mainOpenai.setStopGeneration(false);
              setInputPrompt('');
            }
          }}
          buttonDisabled={!checkInputLength(inputPrompt)}
          inputDisabled={mainOpenai.isLoading}
        />
      </Center>

      <MessageSettingPart
        model={model}
        setModel={setModel}
        isModelSelectPopoverOpen={isModelSelectPopoverOpen}
        setIsModelSelectPopoverOpen={setIsModelSelectPopoverOpen}
        isLoading={mainOpenai.isLoading}
        isTemporaryChatOpen={isTemporaryChatOpen}
        setIsTemporaryChatOpen={setIsTemporaryChatOpen}
        temporaryResetHistory={tempOpenai.resetHistory}
        onSaveButtonClick={handleSaveButtonClick}
        onResetButtonClick={handleResetButtonClick}
        onContactButtonClick={openContactDialog}
      />
    </VStack>
  );
};
