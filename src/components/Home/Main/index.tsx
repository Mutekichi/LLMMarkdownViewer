import { HStack, Textarea } from '@chakra-ui/react';
import { FC, useState } from 'react';
import MarkdownViewer from '../../MarkdownViewer';
import styles from './Main.module.scss';

const complicatedMarkdownText = `
# Markdown記法サンプル

## テキストスタイル
**太字テキスト**
*イタリック*
~~打ち消し線~~
\`インラインコード\`

## リンク
[Google](https://www.google.com)

## リスト
- 項目1
  - ネスト項目1-1
  - ネスト項目1-2

## Math
$\\frac{1}{2}$ + $\\frac{1}{3}$ = $\\frac{5}{6}$ のように、数式を記述できます。

## コードブロック
\`\`\`python
def hello():
   print("Hello, World!")
\`\`\`

## テーブル
| Left | Center | Right |
|:-----|:------:|------:|
| 1    | 2      | 3     |
| 4    | 5      | 6     |


`;

const Main: FC = () => {
  const [inputText, setInputText] = useState('');
  const [errorMessages, setErrorMessages] = useState<string>('');

  return (
    <div className={styles.content}>
      {/* <div className={styles.model}>
        <Icosahedron isActivated />
      </div>
      <div className={styles.input}>
        <CustomTextInput
          placeholder="Your imagination is the limit..."
          onChange={(value) => setInputText(value)}
          onButtonClick={(value) => {}}
        />
      </div> */}
      <HStack>
        <MarkdownViewer markdown={complicatedMarkdownText} />
      </HStack>
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
