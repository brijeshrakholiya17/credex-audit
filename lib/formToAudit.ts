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

const FORM_TOOL_TO_AUDIT: Partial<Record<string, AIToolId>> = {
  cursor: "cursor-pro",
  "github-copilot": "github-copilot",
  claude: "claude-pro",
  chatgpt: "chatgpt-plus",
  gemini: "gemini-advanced",
};

function planToBillingCycle(plan: string): BillingCycle {
  return plan === "Hobby" ? "monthly" : "monthly";
}

export function spendFormToSubscriptionInputs(
  formData: SpendFormData
): SubscriptionInput[] {
  const inputs: SubscriptionInput[] = [];

  for (const [toolId, config] of Object.entries(formData.tools)) {
    if (!config.enabled) continue;
    const auditToolId = FORM_TOOL_TO_AUDIT[toolId];
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
    .map(([toolId, config]) => ({
      toolId: (FORM_TOOL_TO_AUDIT[toolId] ?? toolId) as AIToolId,
      name: FORM_TOOL_LABELS[toolId] ?? toolId,
      monthlyCost: config.monthlySpend * config.seats,
    }));
}
