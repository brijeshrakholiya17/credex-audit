export type BillingCycle = "monthly" | "annual";

export type AIToolId =
  | "chatgpt-plus"
  | "chatgpt-team"
  | "claude-pro"
  | "claude-team"
  | "gemini-advanced"
  | "copilot-pro"
  | "midjourney-basic"
  | "midjourney-standard"
  | "notion-ai"
  | "perplexity-pro"
  | "github-copilot"
  | "cursor-pro";

export interface AIToolPlan {
  id: AIToolId;
  name: string;
  vendor: string;
  monthlyPrice: number;
  annualPrice?: number;
  category: "chat" | "image" | "code" | "productivity" | "search";
  features: string[];
}

export const AI_TOOL_PLANS: Record<AIToolId, AIToolPlan> = {
  "chatgpt-plus": {
    id: "chatgpt-plus",
    name: "ChatGPT Plus",
    vendor: "OpenAI",
    monthlyPrice: 20,
    annualPrice: 200,
    category: "chat",
    features: ["GPT-4o", "DALL·E", "Advanced voice"],
  },
  "chatgpt-team": {
    id: "chatgpt-team",
    name: "ChatGPT Team",
    vendor: "OpenAI",
    monthlyPrice: 25,
    category: "chat",
    features: ["Team workspace", "Higher limits"],
  },
  "claude-pro": {
    id: "claude-pro",
    name: "Claude Pro",
    vendor: "Anthropic",
    monthlyPrice: 20,
    category: "chat",
    features: ["Claude Opus", "Priority access"],
  },
  "claude-team": {
    id: "claude-team",
    name: "Claude Team",
    vendor: "Anthropic",
    monthlyPrice: 30,
    category: "chat",
    features: ["Team admin", "Shared projects"],
  },
  "gemini-advanced": {
    id: "gemini-advanced",
    name: "Gemini Advanced",
    vendor: "Google",
    monthlyPrice: 19.99,
    category: "chat",
    features: ["Gemini Ultra", "2TB storage"],
  },
  "copilot-pro": {
    id: "copilot-pro",
    name: "Microsoft Copilot Pro",
    vendor: "Microsoft",
    monthlyPrice: 20,
    category: "chat",
    features: ["GPT-4 in Office", "Designer"],
  },
  "midjourney-basic": {
    id: "midjourney-basic",
    name: "Midjourney Basic",
    vendor: "Midjourney",
    monthlyPrice: 10,
    category: "image",
    features: ["~200 images/mo"],
  },
  "midjourney-standard": {
    id: "midjourney-standard",
    name: "Midjourney Standard",
    vendor: "Midjourney",
    monthlyPrice: 30,
    category: "image",
    features: ["Unlimited relaxed", "15h fast"],
  },
  "notion-ai": {
    id: "notion-ai",
    name: "Notion AI",
    vendor: "Notion",
    monthlyPrice: 10,
    category: "productivity",
    features: ["AI writing", "Q&A on docs"],
  },
  "perplexity-pro": {
    id: "perplexity-pro",
    name: "Perplexity Pro",
    vendor: "Perplexity",
    monthlyPrice: 20,
    category: "search",
    features: ["Pro search", "File uploads"],
  },
  "github-copilot": {
    id: "github-copilot",
    name: "GitHub Copilot",
    vendor: "GitHub",
    monthlyPrice: 10,
    category: "code",
    features: ["IDE completions", "Chat"],
  },
  "cursor-pro": {
    id: "cursor-pro",
    name: "Cursor Pro",
    vendor: "Cursor",
    monthlyPrice: 20,
    category: "code",
    features: ["Agent mode", "Premium models"],
  },
};

export function getMonthlyCost(
  toolId: AIToolId,
  billingCycle: BillingCycle = "monthly"
): number {
  const plan = AI_TOOL_PLANS[toolId];
  if (billingCycle === "annual" && plan.annualPrice) {
    return Math.round((plan.annualPrice / 12) * 100) / 100;
  }
  return plan.monthlyPrice;
}

export function getToolOptions(): { id: AIToolId; label: string }[] {
  return Object.values(AI_TOOL_PLANS).map((plan) => ({
    id: plan.id,
    label: `${plan.name} ($${plan.monthlyPrice}/mo)`,
  }));
}
