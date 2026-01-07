import type { ValidationResult } from '../validator/validator.js';
import { writeFileSync } from 'fs';

/**
 * Format validation result for console output
 */
export function formatConsoleReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`Provider: ${result.providerUrl}`);
  lines.push(`Severity: ${result.severity.toUpperCase()}`);
  lines.push(`${'='.repeat(60)}\n`);

  lines.push('Local Token Count (via @anthropic-ai/tokenizer):');
  lines.push(`  Input:  ${result.localCount.inputTokens}`);
  lines.push(`  Output: ${result.localCount.outputTokens}`);
  lines.push(`  Total:  ${result.localCount.totalTokens}\n`);

  lines.push('API Reported Usage:');
  lines.push(`  Input:  ${result.apiReportedUsage.input_tokens}`);
  lines.push(`  Output: ${result.apiReportedUsage.output_tokens}`);
  lines.push(`  Total:  ${result.apiReportedUsage.input_tokens + result.apiReportedUsage.output_tokens}\n`);

  lines.push('Discrepancies (RAW):');
  lines.push(`  Input:  ${formatDiscrepancy(result.inputDiscrepancy)}`);
  lines.push(`  Output: ${formatDiscrepancy(result.outputDiscrepancy)}`);
  lines.push(`  Total:  ${formatDiscrepancy(result.totalDiscrepancy)}\n`);

  return lines.join('\n');
}

function formatDiscrepancy(disc: { absolute: number; percentage: number }): string {
  const sign = disc.absolute >= 0 ? '+' : '';
  return `${sign}${disc.absolute} tokens (${sign}${disc.percentage.toFixed(2)}%)`;
}

/**
 * Export validation results to JSON file
 */
export function exportToJson(results: ValidationResult[], outputPath: string): void {
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults exported to: ${outputPath}`);
}
