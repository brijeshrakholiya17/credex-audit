import type { AuditResult, SavingsRecommendation } from "@/lib/auditEngine";

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

function recommendationStatus(
  type: SavingsRecommendation["type"]
): ToolStatus {
  if (type === "consolidate") return "switch";
  return "save";
}

export function mapAuditResultToToolResults(result: AuditResult & { advancedInsights?: any[] }): ToolResult[] {
  const toolRecs = new Map<
    string,
    { title: string; description: string; type: ToolStatus; savingsShare: number }
  >();

  // 1. Map legacy recommendations
  for (const rec of result.recommendations) {
    const perTool =
      rec.estimatedMonthlySavings / Math.max(rec.affectedTools.length, 1);
    for (const toolId of rec.affectedTools) {
      const formId = toolId;
      const existing = toolRecs.get(formId);
      if (!existing || perTool > existing.savingsShare) {
        toolRecs.set(formId, { 
          title: rec.title, 
          description: rec.description, 
          type: recommendationStatus(rec.type), 
          savingsShare: perTool 
        });
      }
    }
  }

  // 2. Map advanced insights
  if (result.advancedInsights) {
    for (const insight of result.advancedInsights) {
      if (!insight.affectedTools || insight.type === "success") continue;
      const perTool = (insight.savingsPotential || 0) / Math.max(insight.affectedTools.length, 1);
      for (const formId of insight.affectedTools) {
        const existing = toolRecs.get(formId);
        if (!existing || perTool > existing.savingsShare) {
          toolRecs.set(formId, {
            title: insight.title,
            description: insight.message,
            type: insight.type === "warning" ? "switch" : "save", 
            savingsShare: perTool
          });
        }
      }
    }
  }

  return result.subscriptions.map((sub) => {
    const formId = sub.toolId;
    const entry = toolRecs.get(formId);

    if (entry) {
      return {
        id: formId,
        name: sub.name,
        currentSpend: sub.monthlyCost,
        recommendedAction: entry.title,
        savings: Math.round(entry.savingsShare * 100) / 100,
        reason: entry.description,
        status: entry.type,
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
