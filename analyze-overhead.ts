import { countTokens } from '@anthropic-ai/tokenizer';

console.log('=== 精确 Token 计算 ===\n');

const inputs = [
  '测试',
  '1+1等于几？',
  '你好，请介绍一下你自己',
  '请解释一下量子计算的基本原理，用简单的语言',
];

for (const input of inputs) {
  const baseTokens = countTokens(input);
  const withOverhead4 = baseTokens + 4;
  const withOverhead10 = baseTokens + 10;
  const withOverhead20 = baseTokens + 20;

  console.log(`输入: "${input}"`);
  console.log(`  纯文本: ${baseTokens} tokens`);
  console.log(`  +4 开销: ${withOverhead4} tokens`);
  console.log(`  +10 开销: ${withOverhead10} tokens`);
  console.log(`  +20 开销: ${withOverhead20} tokens\n`);
}

// 测试可能的系统提示词长度
console.log('=== 可能的系统提示词 ===\n');

const possiblePrompts = [
  'You are Claude Code.',
  'You are Claude Code, an AI assistant.',
  'You are Claude Code, Anthropic\'s official CLI for Claude. You help users with software engineering tasks.',
  'You are Claude Code, Anthropic\'s official CLI for Claude. You are an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.',
];

for (const prompt of possiblePrompts) {
  console.log(`"${prompt.substring(0, 80)}..."`);
  console.log(`  Tokens: ${countTokens(prompt)}\n`);
}
