import {
  TOOL_PLANS,
  FORM_TOOL_LABELS,
} from "./pricing";

export interface SubscriptionInput {
  toolId: string;
  plan: string;
  monthlyCost: number;
  seats: number;
}

export interface SavingsRecommendation {
  type: "duplicate" | "downgrade" | "consolidate" | "annual-billing";
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  affectedTools: string[];
}

export interface AuditResult {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  subscriptions: {
    toolId: string;
    name: string;
    monthlyCost: number;
  }[];
  recommendations: SavingsRecommendation[];
  potentialMonthlySavings: number;
}

const CHAT_TOOLS = ["chatgpt", "claude", "gemini"];
const CODE_TOOLS = ["github-copilot", "cursor", "windsurf"];

function detectDuplicateChatTools(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const chatSubs = subscriptions.filter((s) => CHAT_TOOLS.includes(s.toolId));
  if (chatSubs.length < 2) return null;

  const cheapest = chatSubs.reduce((min, sub) =>
    sub.monthlyCost * sub.seats < min.monthlyCost * min.seats ? sub : min
  );

  const redundant = chatSubs.filter((s) => s.toolId !== cheapest.toolId);
  const savings = redundant.reduce(
    (sum, sub) => sum + sub.monthlyCost * sub.seats,
    0
  );

  return {
    type: "duplicate",
    title: "Overlapping chat AI subscriptions",
    description: `You pay for ${chatSubs.length} general-purpose chat tools. Keep ${FORM_TOOL_LABELS[cheapest.toolId] || cheapest.toolId} and cancel the others for similar capability.`,
    estimatedMonthlySavings: savings,
    affectedTools: redundant.map((s) => s.toolId),
  };
}

function detectDuplicateCodeTools(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const codeSubs = subscriptions.filter((s) => CODE_TOOLS.includes(s.toolId));
  if (codeSubs.length < 2) return null;

  const savings = codeSubs
    .slice(1)
    .reduce((sum, sub) => sum + sub.monthlyCost * sub.seats, 0);

  return {
    type: "consolidate",
    title: "Multiple coding assistants",
    description: "Multiple coding assistants overlap. Pick one primary IDE assistant.",
    estimatedMonthlySavings: Math.min(...codeSubs.slice(1).map((s) => s.monthlyCost * s.seats)),
    affectedTools: codeSubs.slice(1).map((s) => s.toolId),
  };
}

function detectMidjourneyDowngrade(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const hasStandard = subscriptions.some(
    (s) => s.toolId === "midjourney" && s.plan === "Standard"
  );
  const hasBasic = subscriptions.some(
    (s) => s.toolId === "midjourney" && s.plan === "Basic"
  );

  if (hasStandard && !hasBasic) {
    return {
      type: "downgrade",
      title: "Midjourney tier review",
      description: "Standard ($30/mo) may be more than you need. Downgrade to Basic ($10/mo) if you use under ~200 images monthly.",
      estimatedMonthlySavings: 20,
      affectedTools: ["midjourney"],
    };
  }
  return null;
}

function detectAnnualBillingOpportunity(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const monthlyOnly = subscriptions.filter((sub) => {
    const plansForTool = TOOL_PLANS[sub.toolId] || [];
    const planInfo = plansForTool.find(p => p.name === sub.plan);
    return planInfo && planInfo.annualPrice != null;
  });

  if (monthlyOnly.length === 0) return null;

  const savings = monthlyOnly.reduce((sum, sub) => {
    const plansForTool = TOOL_PLANS[sub.toolId];
    const planInfo = plansForTool.find(p => p.name === sub.plan)!;
    const monthly = planInfo.price * 12 * sub.seats;
    const annual = planInfo.annualPrice! * sub.seats;
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

function detectTeamAndIndividualOverlap(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const teamPlans = subscriptions.filter((s) => s.plan === "Team" || s.plan === "Teams" || s.plan === "Business" || s.plan === "Enterprise");
  const soloPlans = subscriptions.filter((s) => s.plan === "Plus" || s.plan === "Pro" || s.plan === "Individual");

  if (teamPlans.length === 0 || soloPlans.length === 0) return null;

  const savings = soloPlans.reduce(
    (sum, sub) => sum + sub.monthlyCost * sub.seats,
    0
  );

  return {
    type: "consolidate",
    title: "Team + individual plans",
    description: "You have both team and personal AI plans. Team seats often include individual access—review seat allocation.",
    estimatedMonthlySavings: savings,
    affectedTools: soloPlans.map((s) => s.toolId),
  };
}

function detectSmallTeamOverkill(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const overkillSubs = subscriptions.filter((s) => 
    s.seats <= 2 && (s.plan === "Team" || s.plan === "Teams" || s.plan === "Business" || s.plan === "Enterprise")
  );

  if (overkillSubs.length === 0) return null;

  const savings = overkillSubs.reduce((sum, sub) => {
    const plansForTool = TOOL_PLANS[sub.toolId] || [];
    // Estimate savings by comparing to Pro/Plus if available, or flat 10
    const downgradePlan = plansForTool.find(p => p.name === "Pro" || p.name === "Plus" || p.name === "Individual");
    const downgradePrice = downgradePlan ? downgradePlan.price : 20;
    return sum + Math.max(0, (sub.monthlyCost - downgradePrice) * sub.seats);
  }, 0);

  return {
    type: "downgrade",
    title: "Team plan overkill",
    description: `You are paying for Team features for 2 or fewer seats. Consider downgrading to Pro/Plus.`,
    estimatedMonthlySavings: savings,
    affectedTools: overkillSubs.map(s => s.toolId),
  };
}

function detectApiOptimization(
  subscriptions: SubscriptionInput[]
): SavingsRecommendation | null {
  const heavyApiUsage = subscriptions.filter((s) => 
    (s.toolId === "anthropic-api" || s.toolId === "openai-api") && (s.monthlyCost * s.seats > 50)
  );

  if (heavyApiUsage.length === 0) return null;

  // Approximate savings of moving to a fixed cost subscription if appropriate.
  // For UI sake, just suggest an estimated 20% savings opportunity.
  const savings = heavyApiUsage.reduce((sum, sub) => sum + (sub.monthlyCost * sub.seats * 0.20), 0);

  return {
    type: "consolidate",
    title: "API direct optimization",
    description: "Your direct API usage is over $50/month. Check if fixed-price subscription plans cover your usage.",
    estimatedMonthlySavings: Math.round(savings * 100) / 100,
    affectedTools: heavyApiUsage.map(s => s.toolId),
  };
}

export function runAudit(subscriptions: SubscriptionInput[]): AuditResult {
  const subscriptionBreakdown = subscriptions.map((sub) => {
    return {
      toolId: sub.toolId,
      name: `${FORM_TOOL_LABELS[sub.toolId] || sub.toolId} (${sub.plan})`,
      monthlyCost: sub.monthlyCost * sub.seats,
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
    detectTeamAndIndividualOverlap,
    detectSmallTeamOverkill,
    detectApiOptimization,
  ];

  const recommendations = detectors
    .map((fn) => fn(subscriptions))
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
