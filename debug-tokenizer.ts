import { countTokens } from '@anthropic-ai/tokenizer';

// 测试实际的 token 计数
const testCases = [
  {
    name: '纯文本',
    text: '1+1等于几？',
  },
  {
    name: 'JSON 消息格式',
    text: JSON.stringify({ role: 'user', content: '1+1等于几？' }),
  },
  {
    name: '完整 API payload',
    text: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: '1+1等于几？' }],
    }),
  },
];

console.log('=== Token Count Analysis ===\n');

for (const testCase of testCases) {
  const tokens = countTokens(testCase.text);
  console.log(`${testCase.name}:`);
  console.log(`  Text: ${testCase.text.substring(0, 100)}`);
  console.log(`  Tokens: ${tokens}\n`);
}

// 测试 Claude Code 可能添加的内容
const possibleSystemPrompts = [
  'You are Claude Code, an AI assistant.',
  'You are a helpful AI assistant that answers questions accurately.',
  'You are Claude, created by Anthropic.',
];

console.log('=== Possible System Prompts ===\n');
for (const prompt of possibleSystemPrompts) {
  const tokens = countTokens(prompt);
  console.log(`"${prompt}"`);
  console.log(`  Tokens: ${tokens}\n`);
}
