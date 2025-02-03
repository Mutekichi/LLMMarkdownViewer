// OpenAI Pricing
// See https://openai.com/ja-JP/api/pricing/ for more details.

import { OpenaiModelType } from './types';

export interface OpenaiModelPricing {
  perInputToken: number; // Dollars per 1M input tokens
  perOutputToken: number;
}

export const OPENAI_MODEL_PRICING: Record<OpenaiModelType, OpenaiModelPricing> =
  {
    [OpenaiModelType.GPT4o]: {
      perInputToken: 2.5,
      perOutputToken: 10.0,
    },
    [OpenaiModelType.GPT4omini]: {
      perInputToken: 0.15,
      perOutputToken: 0.6,
    },
    [OpenaiModelType.o1]: {
      perInputToken: 15.0,
      perOutputToken: 60.0,
    },
    [OpenaiModelType.o1mini]: {
      perInputToken: 1.1,
      perOutputToken: 4.4,
    },
    [OpenaiModelType.o3mini]: {
      perInputToken: 1.1,
      perOutputToken: 4.4,
    },
  };

/**
 * NOTE: Note: The return value of this function is multiplied by 1,000,000 because the fee is calculated in "dollars per 1M tokens".
 */
export const calculateCost = (
  model: OpenaiModelType,
  inputTokens: number,
  outputTokens: number,
): number => {
  const { perInputToken, perOutputToken } = OPENAI_MODEL_PRICING[model];
  return perInputToken * inputTokens + perOutputToken * outputTokens;
};
