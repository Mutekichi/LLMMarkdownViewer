import { calculateCost, OpenaiModelType } from '../config/llm-models';

export async function handleStreamResponse(
  stream: AsyncIterable<any>,
  stopGeneration: () => boolean,
  onChunk: (content: string) => void,
): Promise<{ fullResponse: string; usageDetail?: any }> {
  let fullResponse = '';
  let usageDetail: any = undefined;

  for await (const chunk of stream) {
    if (stopGeneration()) break;
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    onChunk(content);
    if (chunk.usage) usageDetail = chunk.usage;
  }

  return { fullResponse, usageDetail };
}

export async function logUsage(
  model: OpenaiModelType,
  usageDetail: { prompt_tokens: number; completion_tokens: number },
) {
  const { prompt_tokens, completion_tokens } = usageDetail;
  const cost = calculateCost(model, prompt_tokens, completion_tokens);
  try {
    await fetch('/api/usage-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptTokens: prompt_tokens,
        completionTokens: completion_tokens,
        model,
        cost,
      }),
    });
  } catch (error) {
    console.error('Failed to log usage', error);
  }
}
