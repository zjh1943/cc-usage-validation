import { describe, it, expect } from 'vitest';
import { validateTokenUsage } from './validator';
import type { TokenCount } from '../tokenizer/tokenizer';
import type { ApiUsage } from '../api/client';

describe('Validator', () => {
  it('should detect no discrepancy when counts match', () => {
    const localCount: TokenCount = {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    };

    const apiUsage: ApiUsage = {
      input_tokens: 100,
      output_tokens: 50,
    };

    const result = validateTokenUsage('https://api.example.com', localCount, apiUsage);

    expect(result.severity).toBe('ok');
    expect(result.totalDiscrepancy.absolute).toBe(0);
    expect(result.totalDiscrepancy.percentage).toBe(0);
  });

  it('should detect minor discrepancy (1-5%)', () => {
    const localCount: TokenCount = {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    };

    const apiUsage: ApiUsage = {
      input_tokens: 103, // +3%
      output_tokens: 51,  // +2%
    };

    const result = validateTokenUsage('https://api.example.com', localCount, apiUsage);

    expect(result.severity).toBe('minor');
    expect(result.totalDiscrepancy.absolute).toBeGreaterThan(0);
  });

  it('should detect moderate discrepancy (5-15%)', () => {
    const localCount: TokenCount = {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    };

    const apiUsage: ApiUsage = {
      input_tokens: 110, // +10%
      output_tokens: 55,  // +10%
    };

    const result = validateTokenUsage('https://api.example.com', localCount, apiUsage);

    expect(result.severity).toBe('moderate');
  });

  it('should detect critical discrepancy (>15%)', () => {
    const localCount: TokenCount = {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    };

    const apiUsage: ApiUsage = {
      input_tokens: 150, // +50%
      output_tokens: 75,  // +50%
    };

    const result = validateTokenUsage('https://api.example.com', localCount, apiUsage);

    expect(result.severity).toBe('critical');
  });

  it('should calculate correct percentages', () => {
    const localCount: TokenCount = {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
    };

    const apiUsage: ApiUsage = {
      input_tokens: 120, // +20%
      output_tokens: 60,  // +20%
    };

    const result = validateTokenUsage('https://api.example.com', localCount, apiUsage);

    expect(result.inputDiscrepancy.percentage).toBe(20);
    expect(result.outputDiscrepancy.percentage).toBe(20);
    expect(result.totalDiscrepancy.percentage).toBe(20);
  });
});
