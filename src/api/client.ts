import type { Message } from '../tokenizer/tokenizer.js';

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model?: string;
  authType?: 'api-key' | 'auth-token'; // Support different auth methods
  debug?: boolean; // Enable debug logging
}

export interface ApiUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface ApiResponse {
  id: string;
  content: Array<{ type: string; text: string }>;
  usage: ApiUsage;
  model: string;
  requestPayload?: any; // For debugging
}

/**
 * Call Claude API and return both the response and usage metadata
 */
export async function callClaudeApi(
  config: ApiConfig,
  messages: Message[],
  systemMessage?: string
): Promise<ApiResponse> {
  const url = `${config.baseUrl}/v1/messages`;

  const payload = {
    model: config.model || 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: messages.map((msg) => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      content: msg.content,
    })),
    ...(systemMessage && { system: systemMessage }),
  };

  if (config.debug) {
    console.log('\n=== DEBUG: Request Payload ===');
    console.log(JSON.stringify(payload, null, 2));
    console.log('==============================\n');
  }

  // Build headers with proper auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  };

  if (config.authType === 'auth-token') {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  } else {
    headers['x-api-key'] = config.apiKey;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${response.status} ${error}`);
  }

  const result = (await response.json()) as ApiResponse;

  if (config.debug) {
    result.requestPayload = payload;
    console.log('\n=== DEBUG: API Response ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('===========================\n');
  }

  return result;
}
