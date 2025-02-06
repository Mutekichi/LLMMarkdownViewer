import { calculateCost, OpenaiModelType } from '../config/llm-models';

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

export async function getMonthlyUsage(period?: { start: string; end: string }) {
  if (period) {
    const monthlyUsage = await fetch(
      `/api/usage-logs/stats?group=monthly&start=${period.start}&end=${period.end}`,
    );
    return monthlyUsage.json();
  } else {
    const monthlyUsage = await fetch(`/api/usage-logs/stats?group=monthly`);
    return monthlyUsage.json();
  }
}
