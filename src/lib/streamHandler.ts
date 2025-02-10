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
