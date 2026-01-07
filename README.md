# Claude Code Usage Validation Tool

一个用于验证 Claude API token 使用量准确性的工具。通过对比本地 tokenizer 计算结果与 API 返回的 token 数量，可以检测出 API 供应商是否在 token 计数上作假。

## 功能特点

- 使用官方 `@anthropic-ai/tokenizer` 进行本地 token 计数
- 对比本地计数与 API 返回的使用量
- 支持测试自定义 API 端点（如第三方代理）
- 支持同时对比官方 API 和自定义端点
- 自动计算差异百分比并评估严重程度
- 导出详细的验证报告（JSON 格式）

## 安装

```bash
npm install
```

## 配置

创建 `.env` 文件：

```bash
# 必需
ANTHROPIC_API_KEY=sk-ant-your-key-here

# 可选：测试自定义 API 端点
CUSTOM_BASE_URL=https://your-custom-endpoint.com
```

## 使用方法

### 基本用法

测试默认端点（官方 API）：

```bash
npm run dev -- -k sk-ant-your-key
```

### 测试自定义端点

```bash
npm run dev -- -k sk-ant-your-key -b https://custom-api.example.com
```

### 对比官方 API 和自定义端点

```bash
npm run dev -- -k sk-ant-your-key -b https://custom-api.example.com --compare
```

### 自定义测试提示词

```bash
npm run dev -- -k sk-ant-your-key -p "请写一首关于春天的诗"
```

### 导出结果

```bash
npm run dev -- -k sk-ant-your-key -o results.json
```

### 完整示例

```bash
npm run dev -- \
  --api-key sk-ant-your-key \
  --base-url https://custom-api.example.com \
  --prompt "解释量子计算的基本原理" \
  --model claude-sonnet-4-5-20250929 \
  --output validation-results/test-$(date +%Y%m%d-%H%M%S).json \
  --compare
```

## 输出说明

工具会显示：

1. **本地 Token 计数**：使用官方 tokenizer 计算的结果
2. **API 报告的使用量**：API 返回的 token 数量
3. **差异分析**：
   - 绝对差异（token 数量）
   - 相对差异（百分比）
   - 严重程度评级

### 严重程度级别

- **OK**: 差异 ≤ 1%（正常）
- **Minor**: 1% < 差异 ≤ 5%（轻微，可能由编码差异导致）
- **Moderate**: 5% < 差异 ≤ 15%（可疑）
- **Critical**: 差异 > 15%（极可能存在虚假报告）

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行构建后的版本
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目结构

```
src/
├── tokenizer/     # 本地 token 计数
├── api/           # API 客户端
├── validator/     # 验证逻辑（对比计数）
├── reporter/      # 结果报告生成
└── index.ts       # CLI 入口
```

## 工作原理

1. 发送测试请求到指定的 API 端点
2. 使用官方 `@anthropic-ai/tokenizer` 独立计算相同请求和响应的 token 数量
3. 对比两个结果，计算差异
4. 生成详细报告并标注可疑情况

## 注意事项

- 确保使用的 API key 有效且有足够的配额
- 本工具会产生真实的 API 调用费用
- 建议使用简短的测试提示词以降低成本
- 如果发现显著差异（>15%），建议多次测试确认

## License

MIT
