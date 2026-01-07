import { countTokens } from '@anthropic-ai/tokenizer';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TokenCount {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Count tokens in a conversation using the official Anthropic tokenizer
 * Only counts the raw text content, no assumptions about overhead
 */
export function countConversationTokens(
  messages: Message[],
  response: string
): TokenCount {
  // Count input tokens (raw message content only)
  let inputTokens = 0;
  for (const msg of messages) {
    inputTokens += countTokens(msg.content);
  }

  // Count output tokens (raw response content only)
  const outputTokens = countTokens(response);

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

/**
 * Count tokens in a single text string
 */
export function countTextTokens(text: string): number {
  return countTokens(text);
}
