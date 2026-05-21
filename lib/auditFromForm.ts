import { runAudit, type AuditResult } from "@/lib/auditEngine";
import type { SpendFormData } from "@/components/subscription-form";
import {
  getDeclaredMonthlySpend,
  spendFormToDisplaySubscriptions,
  spendFormToSubscriptionInputs,
} from "@/lib/formToAudit";

export type AuditOutput = AuditResult;

export function buildAuditFromForm(formData: SpendFormData): AuditOutput {
  const declaredMonthly = getDeclaredMonthlySpend(formData);
  const subscriptions = spendFormToSubscriptionInputs(formData);

  if (subscriptions.length > 0) {
    const audit = runAudit(subscriptions);
    return {
      ...audit,
      totalMonthlySpend: declaredMonthly,
      totalAnnualSpend: Math.round(declaredMonthly * 12 * 100) / 100,
    };
  }

  return {
    totalMonthlySpend: declaredMonthly,
    totalAnnualSpend: Math.round(declaredMonthly * 12 * 100) / 100,
    subscriptions: spendFormToDisplaySubscriptions(formData),
    recommendations: [],
    potentialMonthlySavings: 0,
  };
}
