import type { SubscriptionInput } from "@/lib/auditEngine";
import type { SpendFormData } from "@/components/subscription-form";
import type { AIToolId, BillingCycle } from "@/lib/pricing";

export const FORM_TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  "github-copilot": "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  "anthropic-api": "Anthropic API",
  "openai-api": "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

function getAuditToolId(formToolId: string, plan: string): AIToolId | null {
  if (formToolId === "chatgpt") {
    return plan === "Team" ? "chatgpt-team" : "chatgpt-plus";
  }
  if (formToolId === "claude") {
    return plan === "Team" ? "claude-team" : "claude-pro";
  }
  if (formToolId === "gemini") {
    return "gemini-advanced";
  }
  if (formToolId === "github-copilot") {
    return "github-copilot";
  }
  if (formToolId === "cursor") {
    return "cursor-pro";
  }
  return null;
}

function planToBillingCycle(plan: string): BillingCycle {
  // Can expand logic here if needed based on plan name
  return "monthly";
}

export function spendFormToSubscriptionInputs(
  formData: SpendFormData
): SubscriptionInput[] {
  const inputs: SubscriptionInput[] = [];

  for (const [toolId, config] of Object.entries(formData.tools)) {
    if (!config.enabled) continue;
    
    // Free tiers usually don't map to a paid subscription input in the legacy engine
    if (config.plan === "Free" || config.plan === "Hobby" || config.monthlySpend === 0) continue;

    const auditToolId = getAuditToolId(toolId, config.plan);
    if (!auditToolId) continue;
    
    inputs.push({
      toolId: auditToolId,
      billingCycle: planToBillingCycle(config.plan),
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
      const mappedId = getAuditToolId(toolId, config.plan);
      return {
        toolId: (mappedId ?? toolId) as AIToolId,
        name: `${FORM_TOOL_LABELS[toolId] ?? toolId} (${config.plan})`,
        monthlyCost: config.monthlySpend * config.seats,
      };
    });
}
