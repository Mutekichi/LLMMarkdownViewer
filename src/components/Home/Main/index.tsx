import { VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useMockOpenai } from '../../../hooks/useMockOpenai';
import { OpenaiModel } from '../../../hooks/useOpenai';
import CustomTextInput from '../../CustomInput';
import MarkdownViewer from '../../MarkdownViewer';
import { Message } from '../Message';

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
  // const [errorMessages, setErrorMessages] = useState<string>('');
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
    <VStack>
      {false && <MarkdownViewer markdown={complicatedMarkdownText} />}
      <VStack>
        {messages.map((message, index) => (
          <Message key={index} message={message.content} />
        ))}
      </VStack>
      <CustomTextInput
        placeholder="Your imagination is the limit..."
        onChange={(value) => setInputText(value)}
        onButtonClick={(value) => {
          streamResponse(value, OpenaiModel.GPT4);
        }}
      />
    </VStack>
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
