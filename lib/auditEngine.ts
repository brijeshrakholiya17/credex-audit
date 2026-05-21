import {
  AI_TOOL_PLANS,
  type AIToolId,
  type BillingCycle,
  getMonthlyCost,
} from "./pricing";

export interface SubscriptionInput {
  toolId: AIToolId;
  billingCycle: BillingCycle;
  seats?: number;
}

export interface SavingsRecommendation {
  type: "duplicate" | "downgrade" | "consolidate" | "annual-billing";
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  affectedTools: AIToolId[];
}

export interface AuditResult {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  subscriptions: {
    toolId: AIToolId;
    name: string;
    monthlyCost: number;
  }[];
  recommendations: SavingsRecommendation[];
  potentialMonthlySavings: number;
}

const CHAT_TOOLS: AIToolId[] = [
  "chatgpt-plus",
  "chatgpt-team",
  "claude-pro",
  "claude-team",
  "gemini-advanced",
  "copilot-pro",
];

const CODE_TOOLS: AIToolId[] = ["github-copilot", "cursor-pro"];

function detectDuplicateChatTools(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const chatSubs = subscriptions.filter((s) =>
    CHAT_TOOLS.includes(s.toolId)
  );
  if (chatSubs.length < 2) return null;

  const cheapest = chatSubs.reduce((min, sub) =>
    getMonthlyCost(sub.toolId, sub.billingCycle) <
    getMonthlyCost(min.toolId, min.billingCycle)
      ? sub
      : min
  );

  const redundant = chatSubs.filter((s) => s.toolId !== cheapest.toolId);
  const savings = redundant.reduce(
    (sum, sub) => sum + getMonthlyCost(sub.toolId, sub.billingCycle),
    0
  );

  return {
    type: "duplicate",
    title: "Overlapping chat AI subscriptions",
    description: `You pay for ${chatSubs.length} general-purpose chat tools. Keep ${AI_TOOL_PLANS[cheapest.toolId].name} and cancel the others for similar capability.`,
    estimatedMonthlySavings: savings,
    affectedTools: redundant.map((s) => s.toolId),
  };
}

function detectDuplicateCodeTools(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const codeSubs = subscriptions.filter((s) =>
    CODE_TOOLS.includes(s.toolId)
  );
  if (codeSubs.length < 2) return null;

  const savings = codeSubs
    .slice(1)
    .reduce(
      (sum, sub) => sum + getMonthlyCost(sub.toolId, sub.billingCycle),
      0
    );

  return {
    type: "consolidate",
    title: "Multiple coding assistants",
    description:
      "GitHub Copilot and Cursor Pro overlap for code completion. Pick one primary IDE assistant.",
    estimatedMonthlySavings: Math.min(
      ...codeSubs.slice(1).map((s) => getMonthlyCost(s.toolId, s.billingCycle))
    ),
    affectedTools: codeSubs.slice(1).map((s) => s.toolId),
  };
}

function detectMidjourneyDowngrade(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const hasStandard = subscriptions.some(
    (s) => s.toolId === "midjourney-standard"
  );
  const hasBasic = subscriptions.some((s) => s.toolId === "midjourney-basic");

  if (hasStandard && !hasBasic) {
    return {
      type: "downgrade",
      title: "Midjourney tier review",
      description:
        "Standard ($30/mo) may be more than you need. Downgrade to Basic ($10/mo) if you use under ~200 images monthly.",
      estimatedMonthlySavings: 20,
      affectedTools: ["midjourney-standard"],
    };
  }
  return null;
}

function detectAnnualBillingOpportunity(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const monthlyOnly = subscriptions.filter((sub) => {
    const plan = AI_TOOL_PLANS[sub.toolId];
    return sub.billingCycle === "monthly" && plan.annualPrice != null;
  });

  if (monthlyOnly.length === 0) return null;

  const savings = monthlyOnly.reduce((sum, sub) => {
    const plan = AI_TOOL_PLANS[sub.toolId];
    const monthly = plan.monthlyPrice * 12;
    const annual = plan.annualPrice!;
    return sum + (monthly - annual) / 12;
  }, 0);

  return {
    type: "annual-billing",
    title: "Switch to annual billing",
    description: `${monthlyOnly.length} subscription(s) offer annual plans with ~2 months free.`,
    estimatedMonthlySavings: Math.round(savings * 100) / 100,
    affectedTools: monthlyOnly.map((s) => s.toolId),
  };
}

function detectTeamPlanOverkill(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const teamPlans = subscriptions.filter((s) =>
    ["chatgpt-team", "claude-team"].includes(s.toolId)
  );
  const soloPlans = subscriptions.filter((s) =>
    ["chatgpt-plus", "claude-pro"].includes(s.toolId)
  );

  if (teamPlans.length === 0 || soloPlans.length === 0) return null;

  const savings = soloPlans.reduce(
    (sum, sub) => sum + getMonthlyCost(sub.toolId, sub.billingCycle),
    0
  );

  return {
    type: "consolidate",
    title: "Team + individual plans",
    description:
      "You have both team and personal AI plans. Team seats often include individual access—review seat allocation.",
    estimatedMonthlySavings: savings,
    affectedTools: soloPlans.map((s) => s.toolId),
  };
}

export function runAudit(subscriptions: SubscriptionInput[]): AuditResult {
  const normalized = subscriptions.map((sub) => ({
    ...sub,
    seats: sub.seats ?? 1,
  }));

  const subscriptionBreakdown = normalized.map((sub) => {
    const monthlyCost =
      getMonthlyCost(sub.toolId, sub.billingCycle) * sub.seats!;
    return {
      toolId: sub.toolId,
      name: AI_TOOL_PLANS[sub.toolId].name,
      monthlyCost,
    };
  });

  const totalMonthlySpend = subscriptionBreakdown.reduce(
    (sum, s) => sum + s.monthlyCost,
    0
  );

  const detectors = [
    detectDuplicateChatTools,
    detectDuplicateCodeTools,
    detectMidjourneyDowngrade,
    detectAnnualBillingOpportunity,
    detectTeamPlanOverkill,
  ];

  const recommendations = detectors
    .map((fn) => fn(normalized))
    .filter((r): r is SavingsRecommendation => r !== null);

  const potentialMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedMonthlySavings,
    0
  );

  return {
    totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
    totalAnnualSpend: Math.round(totalMonthlySpend * 12 * 100) / 100,
    subscriptions: subscriptionBreakdown,
    recommendations,
    potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
  };
}
