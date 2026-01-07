import { countTokens } from '@anthropic-ai/tokenizer';

const response = `你好！我是 Claude Code，Anthropic 的官方 CLI 工具。

我可以帮助你：
- 执行命令行操作
- 读取和编辑文件
- 运行代码和脚本
- 进行系统管理任务
- 回答技术问题

你需要什么帮助吗？可以告诉我你想做什么，我会尽力协助你。`;

console.log('响应内容:');
console.log(response);
console.log('\n计算 tokens:');
console.log(`Tokens: ${countTokens(response)}`);
console.log(`\nAPI 报告: 192 tokens`);
console.log(`差异: ${192 - countTokens(response)} tokens`);
