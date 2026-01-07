import type { TokenCount } from '../tokenizer/tokenizer.js';
import type { ApiUsage } from '../api/client.js';

export interface ValidationResult {
  providerUrl: string;
  localCount: TokenCount;
  apiReportedUsage: ApiUsage;
  inputDiscrepancy: {
    absolute: number;
    percentage: number;
  };
  outputDiscrepancy: {
    absolute: number;
    percentage: number;
  };
  totalDiscrepancy: {
    absolute: number;
    percentage: number;
  };
  severity: 'ok' | 'minor' | 'moderate' | 'critical';
}

/**
 * Compare local token counts with API-reported usage
 * Raw comparison, no adjustments or assumptions
 */
export function validateTokenUsage(
  providerUrl: string,
  localCount: TokenCount,
  apiUsage: ApiUsage
): ValidationResult {
  const inputDiff = apiUsage.input_tokens - localCount.inputTokens;
  const outputDiff = apiUsage.output_tokens - localCount.outputTokens;
  const totalReported = apiUsage.input_tokens + apiUsage.output_tokens;
  const totalDiff = totalReported - localCount.totalTokens;

  const inputPercentage = (inputDiff / localCount.inputTokens) * 100;
  const outputPercentage = (outputDiff / localCount.outputTokens) * 100;
  const totalPercentage = (totalDiff / localCount.totalTokens) * 100;

  // Simple severity based on total percentage discrepancy
  let severity: ValidationResult['severity'] = 'ok';
  const absPercentage = Math.abs(totalPercentage);

  if (absPercentage > 15) {
    severity = 'critical';
  } else if (absPercentage > 5) {
    severity = 'moderate';
  } else if (absPercentage > 1) {
    severity = 'minor';
  }

  return {
    providerUrl,
    localCount,
    apiReportedUsage: apiUsage,
    inputDiscrepancy: {
      absolute: inputDiff,
      percentage: inputPercentage,
    },
    outputDiscrepancy: {
      absolute: outputDiff,
      percentage: outputPercentage,
    },
    totalDiscrepancy: {
      absolute: totalDiff,
      percentage: totalPercentage,
    },
    severity,
  };
}
