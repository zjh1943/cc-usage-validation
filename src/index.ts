#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { callClaudeApi } from './api/client.js';
import { countConversationTokens } from './tokenizer/tokenizer.js';
import { validateTokenUsage } from './validator/validator.js';
import { formatConsoleReport, exportToJson } from './reporter/reporter.js';
import type { Message } from './tokenizer/tokenizer.js';
import type { ValidationResult } from './validator/validator.js';

config();

const program = new Command();

program
  .name('cc-usage-validation')
  .description('Validate Claude API token usage accuracy')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'Claude API key or auth token', process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY)
  .option('-b, --base-url <url>', 'API base URL to test', process.env.ANTHROPIC_BASE_URL || process.env.CUSTOM_BASE_URL || 'https://api.anthropic.com')
  .option('-m, --model <model>', 'Model to use', 'claude-sonnet-4-5-20250929')
  .option('-p, --prompt <text>', 'Test prompt', 'Hello, how are you?')
  .option('-o, --output <path>', 'Export results to JSON file')
  .option('--auth-type <type>', 'Auth type: api-key or auth-token (auto-detected if not specified)')
  .option('--compare', 'Compare custom base URL with official API')
  .option('--debug', 'Enable debug mode to see request payload')
  .parse();

const opts = program.opts();

// Auto-detect auth type if not specified
function detectAuthType(apiKey: string, authType?: string): 'api-key' | 'auth-token' {
  if (authType) {
    return authType as 'api-key' | 'auth-token';
  }
  // Auth tokens typically start with 'cr_' or similar prefixes
  // API keys start with 'sk-ant-'
  return apiKey.startsWith('sk-ant-') ? 'api-key' : 'auth-token';
}

async function runValidation(baseUrl: string): Promise<ValidationResult> {
  console.log(`\nTesting provider: ${baseUrl}`);

  if (!opts.apiKey) {
    throw new Error('API key is required. Set ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY environment variable, or use -k flag.');
  }

  const authType = detectAuthType(opts.apiKey, opts.authType);
  console.log(`Using auth type: ${authType}`);

  const messages: Message[] = [
    { role: 'user', content: opts.prompt },
  ];

  // Call API
  console.log('Calling API...');
  const apiResponse = await callClaudeApi(
    {
      apiKey: opts.apiKey,
      baseUrl,
      model: opts.model,
      authType,
      debug: opts.debug,
    },
    messages
  );

  const responseText = apiResponse.content[0]?.text || '';
  console.log(`Response: ${responseText.substring(0, 100)}...`);

  // Count tokens locally (raw text only)
  console.log('Counting tokens locally (raw text only)...');
  const localCount = countConversationTokens(messages, responseText);

  // Validate
  const result = validateTokenUsage(baseUrl, localCount, apiResponse.usage);

  return result;
}

async function main() {
  try {
    const results: ValidationResult[] = [];

    if (opts.compare) {
      // Test both official and custom endpoints
      const officialUrl = 'https://api.anthropic.com';
      const customUrl = opts.baseUrl;

      console.log('\n--- Testing Official Anthropic API ---');
      const officialResult = await runValidation(officialUrl);
      results.push(officialResult);

      if (customUrl !== officialUrl) {
        console.log('\n--- Testing Custom Provider ---');
        const customResult = await runValidation(customUrl);
        results.push(customResult);
      }
    } else {
      // Test single endpoint
      const result = await runValidation(opts.baseUrl);
      results.push(result);
    }

    // Display results
    for (const result of results) {
      console.log(formatConsoleReport(result));

      if (result.severity === 'critical') {
        console.log('⚠️  CRITICAL: Significant token usage discrepancy detected!');
      } else if (result.severity === 'moderate') {
        console.log('⚠️  WARNING: Moderate token usage discrepancy detected.');
      } else if (result.severity === 'minor') {
        console.log('ℹ️  INFO: Minor variance detected (within acceptable range).');
      } else {
        console.log('✓ Token counts match expected values.');
      }
    }

    // Export if requested
    if (opts.output) {
      exportToJson(results, opts.output);
    }

    // Exit with error code if critical issues found
    const hasCritical = results.some((r) => r.severity === 'critical');
    if (hasCritical) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
