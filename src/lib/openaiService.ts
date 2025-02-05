import { convertFileToBase64 } from '@/utils/fileUtils';
import OpenAI from 'openai';
import { OPENAI_MODEL_API_NAMES, OpenaiModelType } from '../config/llm-models';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface StreamUsage {
  prompt_tokens: number;
  completion_tokens: number;
}

export async function createChatStream(
  messages: any,
  model: OpenaiModelType,
  image?: File,
): Promise<any> {
  const payload: any = {
    model: OPENAI_MODEL_API_NAMES[model],
    messages,
    stream: true,
    stream_options: { include_usage: true },
  };

  if (image && convertFileToBase64) {
    const base64Image = await convertFileToBase64(image);
    payload.messages[payload.messages.length - 1].content = [
      { type: 'text', text: messages[messages.length - 1].content },
      { type: 'image_url', image_url: { url: base64Image } },
    ];
  }

  return openai.chat.completions.create(payload);
}
