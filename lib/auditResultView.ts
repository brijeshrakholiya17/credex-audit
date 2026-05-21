import type { AuditResult, SavingsRecommendation } from "@/lib/auditEngine";
import type { AIToolId } from "@/lib/pricing";

export type ToolStatus = "save" | "optimal" | "switch";

export interface ToolResult {
  id: string;
  name: string;
  currentSpend: number;
  recommendedAction: string;
  savings: number;
  reason: string;
  status: ToolStatus;
}

const AUDIT_ID_TO_FORM_ID: Partial<Record<AIToolId, string>> = {
  "cursor-pro": "cursor",
  "github-copilot": "github-copilot",
  "claude-pro": "claude",
  "claude-team": "claude",
  "chatgpt-plus": "chatgpt",
  "chatgpt-team": "chatgpt",
  "gemini-advanced": "gemini",
  "copilot-pro": "chatgpt",
  "midjourney-basic": "midjourney-basic",
  "midjourney-standard": "midjourney-standard",
  "notion-ai": "notion-ai",
  "perplexity-pro": "perplexity-pro",
};

function recommendationStatus(
  type: SavingsRecommendation["type"]
): ToolStatus {
  if (type === "consolidate") return "switch";
  return "save";
}

export function mapAuditResultToToolResults(result: AuditResult): ToolResult[] {
  const toolRecs = new Map<
    string,
    { rec: SavingsRecommendation; savingsShare: number }
  >();

  for (const rec of result.recommendations) {
    const perTool =
      rec.estimatedMonthlySavings / Math.max(rec.affectedTools.length, 1);
    for (const toolId of rec.affectedTools) {
      const existing = toolRecs.get(toolId);
      if (!existing || perTool > existing.savingsShare) {
        toolRecs.set(toolId, { rec, savingsShare: perTool });
      }
    }
  }

  return result.subscriptions.map((sub) => {
    const formId = AUDIT_ID_TO_FORM_ID[sub.toolId] ?? sub.toolId;
    const entry = toolRecs.get(sub.toolId);

    if (entry) {
      return {
        id: formId,
        name: sub.name,
        currentSpend: sub.monthlyCost,
        recommendedAction: entry.rec.title,
        savings: Math.round(entry.savingsShare * 100) / 100,
        reason: entry.rec.description,
        status: recommendationStatus(entry.rec.type),
      };
    }

    return {
      id: formId,
      name: sub.name,
      currentSpend: sub.monthlyCost,
      recommendedAction: "Keep current plan",
      savings: 0,
      reason: "No overlap detected for this tool.",
      status: "optimal",
    };
  });
}
