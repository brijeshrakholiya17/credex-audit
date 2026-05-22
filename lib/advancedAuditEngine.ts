import type { SpendFormData, TeamSize, UseCase } from "@/components/subscription-form";

/**
 * Advanced Audit Engine - The brain of the operation
 * 
 * This engine evaluates form data against financial heuristics:
 * 1. Redundancy Checks - Overlapping tools solving the same problem
 * 2. Tier Optimization - Large teams on individual licenses
 * 3. API Consolidation - Opportunities to switch to BYOK (Bring Your Own Key)
 */

export interface Insight {
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  savingsPotential?: number;
  affectedTools?: string[];
  actionable?: boolean;
}

export interface AdvancedAuditReport {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  activeToolsCount: number;
  teamSize: TeamSize | null;
  useCases: UseCase[];
  insights: Insight[];
  summary: {
    isOptimized: boolean;
    riskLevel: "low" | "medium" | "high";
    topPriority?: Insight;
  };
}

// Tool categorization for redundancy detection
const CODING_ASSISTANTS = ["cursor", "github-copilot", "windsurf"];
const CHAT_TOOLS = ["chatgpt", "claude", "gemini"];
const API_TOOLS = ["anthropic-api", "openai-api"];

/**
 * Validates form data before running audit
 */
export function validateFormData(formData: SpendFormData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if at least one tool is enabled
  const enabledTools = Object.values(formData.tools).filter((t) => t.enabled);
  if (enabledTools.length === 0) {
    errors.push("Please select at least one AI tool");
  }

  // Check if monthly spend is valid and positive
  enabledTools.forEach((tool) => {
    if (typeof tool.monthlySpend !== "number" || tool.monthlySpend < 0) {
      errors.push("Monthly spend must be a valid positive number");
    }
  });

  // Check if seats is valid and positive
  enabledTools.forEach((tool) => {
    if (typeof tool.seats !== "number" || tool.seats < 1) {
      errors.push("Number of seats must be at least 1");
    }
  });

  // Check if team size is selected
  if (!formData.teamSize) {
    errors.push("Please select your team size");
  }

  // Check if at least one use case is selected
  if (formData.useCases.length === 0) {
    errors.push("Please select at least one use case");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for overlapping coding assistants (Cursor, GitHub Copilot, Windsurf)
 */
function checkCodingAssistantRedundancy(
  formData: SpendFormData
): Insight | null {
  const enabledCodingTools = CODING_ASSISTANTS.filter(
    (tool) => formData.tools[tool]?.enabled
  );

  if (enabledCodingTools.length < 2) {
    return null;
  }

  const totalSpend = enabledCodingTools.reduce(
    (sum, tool) =>
      sum + (formData.tools[tool]?.monthlySpend || 0) * (formData.tools[tool]?.seats || 1),
    0
  );

  // Calculate potential savings by keeping the cheapest
  const perToolCosts = enabledCodingTools.map((tool) => ({
    tool,
    cost: (formData.tools[tool]?.monthlySpend || 0) * (formData.tools[tool]?.seats || 1),
  }));

  const cheapest = perToolCosts.reduce((min, current) =>
    current.cost < min.cost ? current : min
  );

  const savingsPotential = totalSpend - cheapest.cost;

  return {
    type: "warning",
    title: "Overlapping Coding Assistants",
    message: `You're paying for ${enabledCodingTools.join(
      ", "
    )}. Standardizing on ${cheapest.tool} could immediately cut your developer tooling costs.`,
    savingsPotential,
    affectedTools: enabledCodingTools.filter((t) => t !== cheapest.tool),
    actionable: true,
  };
}

/**
 * Check for overlapping chat/LLM tools (ChatGPT, Claude, Gemini)
 */
function checkChatToolRedundancy(formData: SpendFormData): Insight | null {
  const enabledChatTools = CHAT_TOOLS.filter(
    (tool) => formData.tools[tool]?.enabled
  );

  if (enabledChatTools.length < 2) {
    return null;
  }

  const totalSpend = enabledChatTools.reduce(
    (sum, tool) =>
      sum + (formData.tools[tool]?.monthlySpend || 0) * (formData.tools[tool]?.seats || 1),
    0
  );

  const perToolCosts = enabledChatTools.map((tool) => ({
    tool,
    cost: (formData.tools[tool]?.monthlySpend || 0) * (formData.tools[tool]?.seats || 1),
  }));

  const cheapest = perToolCosts.reduce((min, current) =>
    current.cost < min.cost ? current : min
  );

  const savingsPotential = totalSpend - cheapest.cost;

  return {
    type: "warning",
    title: "LLM Subscription Bloat",
    message: `Your team maintains subscriptions across ${enabledChatTools.join(
      ", "
    )}. Consider standardizing on one primary UI (${cheapest.tool}), or moving to API-based usage for better cost control.`,
    savingsPotential,
    affectedTools: enabledChatTools.filter((t) => t !== cheapest.tool),
    actionable: true,
  };
}

/**
 * Check for tier optimization opportunities based on team size
 */
function checkTierOptimization(formData: SpendFormData): Insight | null {
  const isLargeTeam = ["16-50", "51-200", "200+"].includes(
    formData.teamSize || ""
  );

  if (!isLargeTeam) {
    return null;
  }

  // Check if they're on individual plans with a large team
  const hasIndividualChatPlans = CHAT_TOOLS.some(
    (tool) => formData.tools[tool]?.enabled && formData.tools[tool]?.plan === "Hobby"
  );

  if (!hasIndividualChatPlans) {
    return null;
  }

  const enabledChatTools = CHAT_TOOLS.filter(
    (tool) => formData.tools[tool]?.enabled
  );

  const totalIndividualSpend = enabledChatTools.reduce(
    (sum, tool) =>
      sum + (formData.tools[tool]?.monthlySpend || 0) * (formData.tools[tool]?.seats || 1),
    0
  );

  // Team plans typically offer 40-50% discount per seat at scale
  const estimatedTeamSavings = totalIndividualSpend * 0.4;

  return {
    type: "info",
    title: `Upgrade to Team/Enterprise Plans (${formData.teamSize})`,
    message: `With a team of ${formData.teamSize} people, individual licenses pose a data privacy risk and miss volume discounts. Upgrading to Team/Enterprise tiers secures your IP, centralizes billing, and typically saves 40-50% per seat.`,
    savingsPotential: estimatedTeamSavings,
    affectedTools: enabledChatTools,
    actionable: true,
  };
}

/**
 * Check for API consolidation opportunities
 */
function checkAPIConsolidation(formData: SpendFormData): Insight | null {
  const declaredMonthlySpend = Object.entries(formData.tools)
    .filter(([, config]) => config.enabled)
    .reduce((sum, [, config]) => sum + config.monthlySpend * config.seats, 0);

  const hasHeavyIndividualSpend = declaredMonthlySpend > 200;
  const isCodingOrMixed =
    formData.useCases.includes("Coding") || formData.useCases.includes("Mixed");

  if (!isCodingOrMixed || !hasHeavyIndividualSpend) {
    return null;
  }

  // Check if they're using mostly UI subscriptions
  const chatToolsSpend = CHAT_TOOLS.reduce(
    (sum, tool) =>
      sum + (formData.tools[tool]?.monthlySpend || 0) * (formData.tools[tool]?.seats || 1),
    0
  );

  if (chatToolsSpend < 50) {
    return null;
  }

  const estimatedSavings = declaredMonthlySpend * 0.5; // 40-60% savings potential

  return {
    type: "success",
    title: "Switch to BYOK (Bring Your Own Key) Architecture",
    message: `Instead of $20/mo per seat for UI access, deploy an open-source interface like LibreChat and plug in Anthropic/OpenAI APIs with your own keys. Teams typically see a 40-60% drop in monthly spend (potential: $${estimatedSavings.toFixed(0)}/mo).`,
    savingsPotential: estimatedSavings,
    affectedTools: CHAT_TOOLS.filter((t) => formData.tools[t]?.enabled),
    actionable: true,
  };
}

/**
 * Detect if they're paying for both API and UI versions of the same tool
 */
function checkDuplicateAPIandUI(formData: SpendFormData): Insight | null {
  const hasOpenAIUI = formData.tools.chatgpt?.enabled;
  const hasOpenAIAPI = formData.tools["openai-api"]?.enabled;
  const hasAnthropicUI = formData.tools.claude?.enabled;
  const hasAnthropicAPI = formData.tools["anthropic-api"]?.enabled;

  const duplicatePairs: Array<{ ui: string; api: string; uiTool: string; apiTool: string }> = [];

  if (hasOpenAIUI && hasOpenAIAPI) {
    const uiSpend =
      (formData.tools.chatgpt?.monthlySpend || 0) *
      (formData.tools.chatgpt?.seats || 1);
    const apiSpend =
      (formData.tools["openai-api"]?.monthlySpend || 0) *
      (formData.tools["openai-api"]?.seats || 1);
    duplicatePairs.push({
      ui: "ChatGPT",
      api: "OpenAI API",
      uiTool: "chatgpt",
      apiTool: "openai-api",
    });
  }

  if (hasAnthropicUI && hasAnthropicAPI) {
    duplicatePairs.push({
      ui: "Claude",
      api: "Anthropic API",
      uiTool: "claude",
      apiTool: "anthropic-api",
    });
  }

  if (duplicatePairs.length === 0) {
    return null;
  }

  const pair = duplicatePairs[0];
  const totalDuplicateSpend =
    (formData.tools[pair.uiTool]?.monthlySpend || 0) *
      (formData.tools[pair.uiTool]?.seats || 1) +
    (formData.tools[pair.apiTool]?.monthlySpend || 0) *
      (formData.tools[pair.apiTool]?.seats || 1);

  return {
    type: "warning",
    title: `Duplicate ${pair.ui} Subscriptions`,
    message: `You're paying for both ${pair.ui} UI and ${pair.api}. Consolidate to one access method. If you need programmatic access, use the API with a unified interface. If you need the UI, consider the Plus plan which may offer better value.`,
    savingsPotential: totalDuplicateSpend * 0.5,
    affectedTools: [pair.uiTool, pair.apiTool],
    actionable: true,
  };
}

/**
 * Positive reinforcement - detect when they're optimized
 */
function checkOptimizedSetup(
  formData: SpendFormData,
  otherInsights: Insight[]
): Insight | null {
  const actionableWarnings = otherInsights.filter(
    (i) => i.type === "warning" && i.actionable
  );

  if (actionableWarnings.length > 0) {
    return null; // They have issues to address
  }

  const enabledTools = Object.values(formData.tools).filter((t) => t.enabled);

  if (enabledTools.length === 0) {
    return null;
  }

  return {
    type: "success",
    title: "Lean & Optimized Setup",
    message:
      "Your AI stack is highly optimized for your current team size and use case. You're avoiding redundancy and making smart tool choices.",
    actionable: false,
  };
}

/**
 * Generate comprehensive audit report
 */
export function generateAdvancedAuditReport(
  formData: SpendFormData
): AdvancedAuditReport {
  // Calculate totals
  const totalMonthlySpend = Object.entries(formData.tools)
    .filter(([, config]) => config.enabled)
    .reduce((sum, [, config]) => sum + config.monthlySpend * config.seats, 0);

  const totalAnnualSpend = totalMonthlySpend * 12;

  const activeToolsCount = Object.values(formData.tools).filter(
    (t) => t.enabled
  ).length;

  // Collect insights in order of priority
  const collectedInsights: Insight[] = [];

  // 1. Redundancy checks
  const codingRedundancy = checkCodingAssistantRedundancy(formData);
  if (codingRedundancy) collectedInsights.push(codingRedundancy);

  const apiAndUIDuplicate = checkDuplicateAPIandUI(formData);
  if (apiAndUIDuplicate) collectedInsights.push(apiAndUIDuplicate);

  const chatRedundancy = checkChatToolRedundancy(formData);
  if (chatRedundancy) collectedInsights.push(chatRedundancy);

  // 2. Tier optimization
  const tierOptimization = checkTierOptimization(formData);
  if (tierOptimization) collectedInsights.push(tierOptimization);

  // 3. API consolidation
  const apiConsolidation = checkAPIConsolidation(formData);
  if (apiConsolidation) collectedInsights.push(apiConsolidation);

  // 4. Positive reinforcement
  const optimizedSetup = checkOptimizedSetup(formData, collectedInsights);
  if (optimizedSetup) collectedInsights.push(optimizedSetup);

  // Calculate total savings potential
  const totalSavingsPotential = collectedInsights.reduce(
    (sum, insight) => sum + (insight.savingsPotential || 0),
    0
  );

  // Determine risk level
  const warningCount = collectedInsights.filter(
    (i) => i.type === "warning"
  ).length;
  const riskLevel =
    warningCount >= 3 ? "high" : warningCount >= 1 ? "medium" : "low";

  // Find top priority (highest savings potential warning)
  const topPriority = collectedInsights
    .filter((i) => i.type === "warning" && i.savingsPotential)
    .sort((a, b) => (b.savingsPotential || 0) - (a.savingsPotential || 0))[0];

  return {
    totalMonthlySpend,
    totalAnnualSpend,
    activeToolsCount,
    teamSize: formData.teamSize,
    useCases: formData.useCases,
    insights: collectedInsights,
    summary: {
      isOptimized: collectedInsights.some((i) => i.type === "success"),
      riskLevel,
      topPriority,
    },
  };
}
