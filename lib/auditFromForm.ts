import { runAudit, type AuditResult } from "@/lib/auditEngine";
import { generateAdvancedAuditReport, type AdvancedAuditReport } from "@/lib/advancedAuditEngine";
import type { SpendFormData } from "@/components/subscription-form";
import {
  getDeclaredMonthlySpend,
  spendFormToDisplaySubscriptions,
  spendFormToSubscriptionInputs,
} from "@/lib/formToAudit";

/**
 * Extended audit output that combines legacy audit results with advanced insights
 */
export interface EnhancedAuditOutput extends AuditResult {
  advancedInsights: AdvancedAuditReport["insights"];
  teamSize: AdvancedAuditReport["teamSize"];
  useCases: AdvancedAuditReport["useCases"];
  riskLevel: AdvancedAuditReport["summary"]["riskLevel"];
  topPriority: AdvancedAuditReport["summary"]["topPriority"];
}

export type AuditOutput = EnhancedAuditOutput;

/**
 * Build enhanced audit from form data with both legacy and advanced analysis
 */
export function buildAuditFromForm(formData: SpendFormData): AuditOutput {
  const declaredMonthly = getDeclaredMonthlySpend(formData);
  const subscriptions = spendFormToSubscriptionInputs(formData);
  
  // Generate advanced audit report
  const advancedReport = generateAdvancedAuditReport(formData);

  // Calculate total savings from advanced insights
  const totalAdvancedSavings = advancedReport.insights.reduce(
    (sum, insight) => sum + (insight.savingsPotential || 0),
    0
  );

  let baseAudit: AuditResult;

  if (subscriptions.length > 0) {
    const legacyAudit = runAudit(subscriptions);
    baseAudit = {
      ...legacyAudit,
      totalMonthlySpend: declaredMonthly,
      totalAnnualSpend: Math.round(declaredMonthly * 12 * 100) / 100,
    };
  } else {
    baseAudit = {
      totalMonthlySpend: declaredMonthly,
      totalAnnualSpend: Math.round(declaredMonthly * 12 * 100) / 100,
      subscriptions: spendFormToDisplaySubscriptions(formData),
      recommendations: [],
      potentialMonthlySavings: 0,
    };
  }

  // Combine legacy and advanced analysis
  const enhancedOutput: EnhancedAuditOutput = {
    ...baseAudit,
    // Use advanced insights' savings calculation
    potentialMonthlySavings: Math.max(baseAudit.potentialMonthlySavings, totalAdvancedSavings),
    advancedInsights: advancedReport.insights,
    teamSize: formData.teamSize,
    useCases: formData.useCases,
    riskLevel: advancedReport.summary.riskLevel,
    topPriority: advancedReport.summary.topPriority,
  };

  return enhancedOutput;
}
