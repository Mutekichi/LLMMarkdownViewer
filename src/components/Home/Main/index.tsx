import { Textarea } from '@chakra-ui/react';
import { FC, useState } from 'react';
import CustomTextInput from '../../CustomInput';
import Icosahedron from '../../Icosahedron';
import styles from './Main.module.scss';

const abled_status = ['not_started', 'requesting', 'completed', 'error'];

const Main: FC = () => {
  const [inputText, setInputText] = useState('');
  const [errorMessages, setErrorMessages] = useState<string>('');

  return (
    <div className={styles.content}>
      <div className={styles.model}>
        <Icosahedron isActivated />
      </div>
      <div className={styles.input}>
        <CustomTextInput
          placeholder="Your imagination is the limit..."
          onChange={(value) => setInputText(value)}
          onButtonClick={(value) => {}}
        />
      </div>
    </div>
  );
};

export default Main;

const checkInputLength = (inputText: string): boolean => {
  return inputText.length > 2;
};

const checkInputIncludesOnlyAvailableCharacters = (
  inputText: string,
): boolean => {
  return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \n]*$/.test(inputText);
};

const Message: FC<{ message: string }> = ({ message }) => {
  return (
    <Textarea
      value={message}
      marginLeft="20px"
      width="100%"
      border="none"
      backgroundColor="transparent"
      fontSize="1.5rem"
      fontFamily="'Roboto Mono', monospace"
      resize="none"
      overflow="hidden"
      color="#ff0000"
      _placeholder={{ color: 'gray.500' }}
      _focus={{ outline: 'none' }}
      sx={{
        '&::-webkit-scrollbar': {
          width: '0px',
        },
        lineHeight: '32px',
        letterSpacing: '0.02em',
      }}
    />
  );
};

const ErrorMessages: FC = () => {
  return <div>Failed to generate model.</div>;
};
