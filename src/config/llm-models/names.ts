import { OpenaiModelType } from './types';

export const OPENAI_MODEL_DISPLAY_NAMES: Record<OpenaiModelType, string> = {
  [OpenaiModelType.GPT4o]: 'GPT-4o',
  [OpenaiModelType.GPT4omini]: 'GPT-4o mini',
  [OpenaiModelType.o1]: 'o1',
  [OpenaiModelType.o1mini]: 'o1 mini',
  [OpenaiModelType.o3mini]: 'o3 mini',
};

export const OPENAI_MODEL_API_NAMES: Record<OpenaiModelType, string> = {
  [OpenaiModelType.GPT4o]: 'gpt-4o',
  [OpenaiModelType.GPT4omini]: 'gpt-4o-mini',
  [OpenaiModelType.o1]: 'o1',
  [OpenaiModelType.o1mini]: 'o1-mini',
  [OpenaiModelType.o3mini]: 'o3-mini',
};
