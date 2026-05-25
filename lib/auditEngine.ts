import { TOOL_PLANS, FORM_TOOL_LABELS } from "./pricing";

export interface SubscriptionInput {
  toolId: string; // e.g. "chatgpt", "claude", "cursor", "github-copilot"
  plan: string;
  monthlyCost: number; // per-seat monthly cost
  seats: number;
}

export interface SavingsRecommendation {
  type: "duplicate" | "downgrade" | "consolidate" | "annual-billing" | "suggestion";
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  affectedTools: string[];
}

export interface AuditResult {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  subscriptions: { toolId: string; name: string; monthlyCost: number }[];
  recommendations: SavingsRecommendation[];
  potentialMonthlySavings: number;
}

// Tools present in the subscription form
const CHAT_TOOLS = ["chatgpt", "claude", "gemini"];
const CODE_TOOLS = ["github-copilot", "cursor", "windsurf"];

function detectDuplicateChatTools(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  const chatSubs = subscriptions.filter((s) => CHAT_TOOLS.includes(s.toolId));
  if (chatSubs.length < 2) return null;

  // Choose the tool with the lowest effective per-seat price
  const cheapest = chatSubs.reduce((min, sub) => (sub.monthlyCost < min.monthlyCost ? sub : min));

  const redundant = chatSubs.filter((s) => s.toolId !== cheapest.toolId);
  const savings = redundant.reduce((sum, sub) => sum + sub.monthlyCost * sub.seats, 0);

  return {
    type: "duplicate",
    title: "Overlapping chat AI subscriptions",
    description: `You subscribe to ${chatSubs.length} chat models. Keep ${FORM_TOOL_LABELS[cheapest.toolId] || cheapest.toolId} and cancel others if features overlap.`,
    estimatedMonthlySavings: Math.round(savings * 100) / 100,
    affectedTools: redundant.map((s) => s.toolId),
  };
}

function detectDuplicateCodeTools(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  const codeSubs = subscriptions.filter((s) => CODE_TOOLS.includes(s.toolId));
  if (codeSubs.length < 2) return null;

  // Recommend consolidating to the single most-used / cheapest option
  const primary = codeSubs.reduce((min, sub) => (sub.monthlyCost < min.monthlyCost ? sub : min));
  const redundant = codeSubs.filter((s) => s.toolId !== primary.toolId);
  const savings = redundant.reduce((sum, sub) => sum + sub.monthlyCost * sub.seats, 0);

  return {
    type: "consolidate",
    title: "Multiple coding assistants",
    description: `You have ${codeSubs.length} coding assistants. Consolidate to ${FORM_TOOL_LABELS[primary.toolId] || primary.toolId}.`,
    estimatedMonthlySavings: Math.round(savings * 100) / 100,
    affectedTools: redundant.map((s) => s.toolId),
  };
}

function detectMidjourneyDowngrade(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  // Keep this legacy detector in case midjourney is present
  const standard = subscriptions.find((s) => s.toolId === "midjourney" && s.plan === "Standard");
  const basic = subscriptions.find((s) => s.toolId === "midjourney" && s.plan === "Basic");
  if (standard && !basic) {
    return {
      type: "downgrade",
      title: "Midjourney tier review",
      description: "Standard may be more than you need. Consider Basic if usage is low.",
      estimatedMonthlySavings: Math.round((standard.monthlyCost - 10) * standard.seats * 100) / 100,
      affectedTools: ["midjourney"],
    };
  }
  return null;
}

function detectAnnualBillingOpportunity(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  const withAnnual = subscriptions
    .map((sub) => {
      const plansForTool = TOOL_PLANS[sub.toolId] || [];
      const planInfo = plansForTool.find((p) => p.name === sub.plan);
      return planInfo && planInfo.annualPrice != null ? { sub, planInfo } : null;
    })
    .filter(Boolean) as { sub: SubscriptionInput; planInfo: any }[];

  if (withAnnual.length === 0) return null;

  const monthlySavings = withAnnual.reduce((sum, item) => {
    const monthly = item.planInfo.price * 12 * item.sub.seats;
    const annual = item.planInfo.annualPrice * item.sub.seats;
    return sum + (monthly - annual) / 12;
  }, 0);

  return {
    type: "annual-billing",
    title: "Switch to annual billing",
    description: `${withAnnual.length} subscription(s) offer an annual option that can save ~2 months/year.`,
    estimatedMonthlySavings: Math.round(monthlySavings * 100) / 100,
    affectedTools: withAnnual.map((w) => w.sub.toolId),
  };
}

function detectTeamAndIndividualOverlap(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  const teamPlans = subscriptions.filter((s) => ["Team", "Teams", "Business", "Enterprise"].includes(s.plan));
  const soloPlans = subscriptions.filter((s) => ["Plus", "Pro", "Individual", "Hobby", "Free"].includes(s.plan));

  if (teamPlans.length === 0 || soloPlans.length === 0) return null;

  const savings = soloPlans.reduce((sum, s) => sum + s.monthlyCost * s.seats, 0);

  return {
    type: "consolidate",
    title: "Team + individual plans",
    description: "You have both team and personal plans. Team seats often include individual access—review allocations.",
    estimatedMonthlySavings: Math.round(savings * 100) / 100,
    affectedTools: soloPlans.map((s) => s.toolId),
  };
}

// New detector 1: If seats <= 2 AND plan is "Team" on claude or chatgpt: recommend downgrading
function detectSmallTeamSeatsDowngrade(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  const targets = subscriptions.filter((s) => (s.toolId === "claude" || s.toolId === "chatgpt") && s.plan === "Team" && s.seats <= 2);
  if (targets.length === 0) return null;

  // Recommend downgrading to Pro (claude) or Plus (chatgpt) and estimate $10/seat savings
  const savings = targets.reduce((sum, s) => sum + 10 * s.seats, 0);

  return {
    type: "downgrade",
    title: "Small team on Team plan",
    description: "You have 2 or fewer seats on a Team plan for Claude/ChatGPT. Consider downgrading to Pro/Plus to save ~$10/seat/month.",
    estimatedMonthlySavings: savings,
    affectedTools: targets.map((t) => t.toolId),
  };
}

// New detector 2: If monthlySpend > 50 on anthropic-api or openai-api: suggest checking subscription plans
function detectApiSubscriptionSuggestion(subscriptions: SubscriptionInput[]): SavingsRecommendation | null {
  const heavyApi = subscriptions.filter((s) => (s.toolId === "anthropic-api" || s.toolId === "openai-api") && (s.monthlyCost * s.seats > 50));
  if (heavyApi.length === 0) return null;

  const spend = heavyApi.reduce((sum, s) => sum + s.monthlyCost * s.seats, 0);

  return {
    type: "suggestion",
    title: "High API spend",
    description: "Your direct API spend exceeds $50/month. Check whether a subscription or committed plan could reduce costs compared to pay-as-you-go.",
    estimatedMonthlySavings: Math.round(spend * 0.15 * 100) / 100,
    affectedTools: heavyApi.map((s) => s.toolId),
  };
}

export function runAudit(subscriptions: SubscriptionInput[]): AuditResult {
  const subscriptionBreakdown = subscriptions.map((sub) => ({
    toolId: sub.toolId,
    name: `${FORM_TOOL_LABELS[sub.toolId] || sub.toolId} (${sub.plan})`,
    monthlyCost: Math.round(sub.monthlyCost * sub.seats * 100) / 100,
  }));

  const totalMonthlySpend = subscriptionBreakdown.reduce((sum, s) => sum + s.monthlyCost, 0);

  const expertDetectors = [
    detectTeamAndIndividualOverlap,
    detectDuplicateChatTools,
    detectDuplicateCodeTools,
    detectMidjourneyDowngrade,
    detectAnnualBillingOpportunity,
    detectSmallTeamSeatsDowngrade,
    detectApiSubscriptionSuggestion,
  ];

  let activeSubscriptions = [...subscriptions];
  const recommendations: SavingsRecommendation[] = [];

  for (const detector of expertDetectors) {
    const rec = detector(activeSubscriptions);
    if (rec) {
      recommendations.push(rec);
      // If the recommendation is to completely cancel/consolidate, we must remove
      // those affected tools from activeSubscriptions so subsequent detectors
      // (like downgrades or other consolidations) don't try to double-count them.
      if (rec.type === "duplicate" || rec.type === "consolidate") {
        activeSubscriptions = activeSubscriptions.filter(
          (s) => !rec.affectedTools.includes(s.toolId)
        );
      }
    }
  }

  let potentialMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedMonthlySavings,
    0
  );

  // 5. Cap savings so they never exceed the total spend
  potentialMonthlySavings = Math.min(potentialMonthlySavings, totalMonthlySpend);

  return {
    totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
    totalAnnualSpend: Math.round(totalMonthlySpend * 12 * 100) / 100,
    subscriptions: subscriptionBreakdown,
    recommendations,
    potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
  };
}
