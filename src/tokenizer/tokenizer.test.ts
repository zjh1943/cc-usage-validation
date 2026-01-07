import { describe, it, expect } from 'vitest';
import { countConversationTokens, countTextTokens } from './tokenizer';
import type { Message } from './tokenizer';

describe('Tokenizer', () => {
  it('should count tokens in simple text', () => {
    const text = 'Hello, world!';
    const count = countTextTokens(text);
    expect(count).toBeGreaterThan(0);
  });

  it('should count tokens in conversation', () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is 2+2?' },
    ];
    const response = 'The answer is 4.';

    const result = countConversationTokens(messages, response);

    expect(result.inputTokens).toBeGreaterThan(0);
    expect(result.outputTokens).toBeGreaterThan(0);
    expect(result.totalTokens).toBe(result.inputTokens + result.outputTokens);
  });

  it('should handle multiple messages', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'How are you?' },
    ];
    const response = 'I am doing well, thank you!';

    const result = countConversationTokens(messages, response);

    expect(result.inputTokens).toBeGreaterThan(0);
    expect(result.outputTokens).toBeGreaterThan(0);
  });
});
