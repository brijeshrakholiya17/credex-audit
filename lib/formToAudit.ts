import type { SubscriptionInput } from "@/lib/auditEngine";
import type { SpendFormData } from "@/components/subscription-form";
import { FORM_TOOL_LABELS } from "@/lib/pricing";

export function spendFormToSubscriptionInputs(
  formData: SpendFormData
): SubscriptionInput[] {
  const inputs: SubscriptionInput[] = [];

  for (const [toolId, config] of Object.entries(formData.tools)) {
    if (!config.enabled) continue;
    
    // Free tiers usually don't map to a paid subscription input in the legacy engine, but let's pass them all so the engine has full context
    // if (config.plan === "Free" || config.plan === "Hobby" || config.monthlySpend === 0) continue;

    inputs.push({
      toolId: toolId,
      plan: config.plan,
      monthlyCost: config.monthlySpend,
      seats: config.seats,
    });
  }

  return inputs;
}

export function getDeclaredMonthlySpend(formData: SpendFormData): number {
  return Object.values(formData.tools)
    .filter((config) => config.enabled)
    .reduce((sum, config) => sum + config.monthlySpend * config.seats, 0);
}

export function spendFormToDisplaySubscriptions(formData: SpendFormData) {
  return Object.entries(formData.tools)
    .filter(([, config]) => config.enabled)
    .map(([toolId, config]) => {
      return {
        toolId: toolId,
        name: `${FORM_TOOL_LABELS[toolId] ?? toolId} (${config.plan})`,
        monthlyCost: config.monthlySpend * config.seats,
      };
    });
}
