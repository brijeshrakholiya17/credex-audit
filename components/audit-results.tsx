"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Mail,
  ArrowRight,
  Sparkles,
  TrendingDown,
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";

import { EmailCaptureModal } from "@/components/email-capture-modal";
import { SectionEyebrow } from "@/components/ui/page-container";
import type { AuditResult } from "@/lib/auditEngine";
import type { EnhancedAuditOutput } from "@/lib/auditFromForm";
import { mapAuditResultToToolResults } from "@/lib/auditResultView";

const toolIcons: Record<string, string> = {
  cursor: "⌘",
  "github-copilot": "🐙",
  claude: "◐",
  chatgpt: "◯",
  "anthropic-api": "◐",
  "openai-api": "◯",
  gemini: "✦",
  windsurf: "🌊",
};

export interface AuditResultsProps {
  result: AuditResult | EnhancedAuditOutput;
  formData?: any;
  onEmailCaptureClick?: () => void;
  isPublicView?: boolean;
}

function isEnhancedAudit(result: AuditResult | EnhancedAuditOutput): result is EnhancedAuditOutput {
  return "advancedInsights" in result;
}

function getInsightIcon(type: "warning" | "success" | "info") {
  switch (type) {
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    case "success":
      return <Zap className="w-5 h-5 text-emerald-600" />;
    case "info":
      return <Info className="w-5 h-5 text-blue-600" />;
  }
}

function getInsightBg(type: "warning" | "success" | "info") {
  switch (type) {
    case "warning":
      return "border-orange-200 bg-orange-50/80";
    case "success":
      return "border-emerald-200 bg-emerald-50/80";
    case "info":
      return "border-blue-200 bg-blue-50/80";
  }
}

export function AuditResults({ result, formData, onEmailCaptureClick, isPublicView }: AuditResultsProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{ summary: string; isFallback: boolean } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const payload = {
          teamSize: formData?.teamSize || (isEnhancedAudit(result) ? result.teamSize : "unknown"),
          useCases: formData?.useCases || (isEnhancedAudit(result) ? result.useCases : []),
          enabledTools: formData?.tools 
            ? Object.keys(formData.tools).filter(key => formData.tools[key].enabled) 
            : result.subscriptions.map((s) => s.toolId),
          totalSpend: result.totalMonthlySpend,
          totalSavings: result.potentialMonthlySavings,
          topRecommendations: result.recommendations.map((r) => r.description),
        };

        const res = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to fetch summary");
        
        const data = await res.json();
        setSummaryData(data);
      } catch (err) {
        setSummaryData({
          summary: "Review your subscriptions quarterly to ensure your team is using the most cost-effective tools for your needs.",
          isFallback: true,
        });
      } finally {
        setLoadingSummary(false);
      }
    }
    
    fetchSummary();
  }, [result, formData]);

  const toolResults = useMemo(
    () => mapAuditResultToToolResults(result),
    [result]
  );

  const totalSavings = result.potentialMonthlySavings;
  const annualSavings = totalSavings * 12;
  const showConsultationCTA = totalSavings > 500;
  const showNewsletterOnly = totalSavings < 100;
  const enhanced = isEnhancedAudit(result);

  const openEmailModal = () => {
    if (onEmailCaptureClick) {
      onEmailCaptureClick();
    } else {
      setInternalModalOpen(true);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    setSharing(true);
    setShareError(null);
    const shareId = crypto.randomUUID();

    try {
      const res = await fetch("/api/audits/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: shareId, result }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save share link");
      }

      const shareUrl = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : "Could not create share link"
      );
    } finally {
      setSharing(false);
    }
  };

  const getStatusColor = (status: (typeof toolResults)[0]["status"]) => {
    switch (status) {
      case "save":
        return "border-emerald-200 bg-emerald-50/80";
      case "optimal":
        return "border-sky-200 bg-sky-50/80";
      case "switch":
        return "border-[#cc785c]/30 bg-[#cc785c]/5";
    }
  };

  const getStatusIcon = (status: (typeof toolResults)[0]["status"]) => {
    switch (status) {
      case "save":
        return <TrendingDown className="h-4 w-4 text-emerald-600" />;
      case "optimal":
        return <Check className="h-4 w-4 text-sky-600" />;
      case "switch":
        return <ArrowRightLeft className="h-4 w-4 text-[#cc785c]" />;
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[#e7e5e4] bg-white p-6 sm:p-10 pb-12 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_40px_-12px_rgba(28,25,23,0.1)]">
      <div className="mx-auto max-w-2xl space-y-12">
        <section className="flex flex-col items-center text-center space-y-6 pt-2">
          <SectionEyebrow>Audit complete</SectionEyebrow>

          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest text-[#57534e]">
              Potential savings
            </p>
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-[#1c1917] tabular-nums">
              ${totalSavings.toLocaleString()}
              <span className="text-3xl sm:text-4xl font-medium text-[#78716c]">
                /mo
              </span>
            </h2>
            <p className="text-lg text-[#57534e]">
              That&apos;s{" "}
              <span className="font-medium text-[#cc785c]">
                ${annualSavings.toLocaleString()}/year
              </span>{" "}
              in potential savings
            </p>
            <p className="text-sm text-[#78716c]">
              Current spend: ${result.totalMonthlySpend.toLocaleString()}/mo
            </p>
          </div>

          {showConsultationCTA && (
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#cc785c] hover:bg-[#b86a50] text-white font-medium px-8 h-12 rounded-full shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Book a Credex Consultation
              <ArrowRight className="h-5 w-5" />
            </a>
          )}
        </section>

        {/* Advanced Insights Section */}
        {enhanced && result.advancedInsights.length > 0 && (
          <section className="space-y-5 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-[#78716c]">
                🧠 Financial Insights
              </h3>
              {result.riskLevel && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#57534e]">Risk Level:</span>
                  <span
                    className={`font-medium px-2.5 py-1 rounded-full ${
                      result.riskLevel === "high"
                        ? "bg-orange-100 text-orange-700"
                        : result.riskLevel === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {result.advancedInsights.map((insight, idx) => (
                <Card
                  key={idx}
                  className={`border ${getInsightBg(insight.type)} shadow-none`}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1c1917] mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-[#57534e] leading-relaxed mb-3">
                          {insight.message}
                        </p>
                        {insight.savingsPotential ? (
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <TrendingDown className="w-4 h-4" />
                            Potential savings: ${insight.savingsPotential.toLocaleString()}/month
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Personalized Summary Section */}
        <section className="w-full">
          {loadingSummary ? (
            <Card className="border-[#e7e5e4] bg-[#faf9f7] shadow-none">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="h-4 w-32 bg-[#e7e5e4] rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#e7e5e4] rounded animate-pulse" />
                  <div className="h-4 w-[90%] bg-[#e7e5e4] rounded animate-pulse" />
                  <div className="h-4 w-[80%] bg-[#e7e5e4] rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ) : summaryData ? (
            <Card className="border-[#e7e5e4] bg-[#faf9f7] shadow-none">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#78716c]">
                    Personalized summary
                  </h3>
                  {!summaryData.isFallback && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[#f5f4f0] text-[#57534e] border border-[#e7e5e4]">
                      <Sparkles className="h-3 w-3" />
                      AI-generated
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-[#1c1917] leading-relaxed">
                  {summaryData.summary}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section className="space-y-5 w-full">
          <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-[#78716c]">
            Tool-by-tool breakdown
          </h3>

          <div className="space-y-3">
            {toolResults.length === 0 ? (
              <p className="text-sm text-[#57534e] text-center py-8">
                No subscriptions to analyze. Enable tools in the form and run
                the audit again.
              </p>
            ) : (
              toolResults.map((tool) => (
                <Card
                  key={tool.id}
                  className={`border ${getStatusColor(tool.status)} shadow-none`}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#f5f4f0] border border-[#e7e5e4] flex items-center justify-center text-2xl shrink-0">
                          {toolIcons[tool.id] || "•"}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-[#1c1917]">
                            {tool.name}
                          </h4>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-[#57534e]">
                            <span>${tool.currentSpend}/mo</span>
                            <ArrowRight className="h-3 w-3 hidden sm:block" />
                            <span className="text-[#1c1917]">
                              {tool.recommendedAction}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 shrink-0">
                        {getStatusIcon(tool.status)}
                        <span
                          className={`font-semibold text-sm ${
                            tool.savings > 0
                              ? "text-emerald-600"
                              : tool.status === "optimal"
                                ? "text-sky-600"
                                : "text-[#cc785c]"
                          }`}
                        >
                          {tool.savings > 0
                            ? `-$${tool.savings}/mo`
                            : tool.status === "optimal"
                              ? "Optimal"
                              : "Review"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-[#57534e] text-center sm:text-left sm:pl-16 leading-relaxed">
                      {tool.reason}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {!isPublicView && (
          <section className="w-full">
            {showNewsletterOnly ? (
              <Card className="border-[#e7e5e4] bg-[#faf9f7] shadow-none">
                <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center">
                    <Check className="h-8 w-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1c1917]">
                    You&apos;re already optimized
                  </h3>
                  <p className="text-[#57534e] max-w-sm leading-relaxed">
                    Your AI stack looks lean. We&apos;ll notify you when
                    new savings opportunities appear for your exact
                    tools and team size.
                  </p>
                  <Button
                    onClick={openEmailModal}
                    className="bg-[#cc785c] hover:bg-[#b86a50] text-white gap-2 rounded-full h-11 px-6"
                  >
                    <Mail className="h-4 w-4" />
                    Notify me of future savings
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#e7e5e4] bg-[#faf9f7] shadow-none">
                <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-5">
                  <h3 className="text-xl font-semibold text-[#1c1917]">
                    Capture your report
                  </h3>
                  <p className="text-[#57534e] max-w-sm leading-relaxed">
                    We&apos;ll email a detailed breakdown of your savings
                    opportunities and personalized recommendations.
                  </p>
                  <Button
                    onClick={openEmailModal}
                    className="bg-[#cc785c] hover:bg-[#b86a50] text-white gap-2 rounded-full h-11 px-6"
                  >
                    <Mail className="h-4 w-4" />
                    Send my report
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {shareError && !isPublicView && (
          <p className="text-sm text-red-600 text-center">{shareError}</p>
        )}

        {!isPublicView && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleShare}
              disabled={sharing}
              variant="outline"
              className="rounded-full border-[#e7e5e4] bg-white text-[#1c1917] hover:bg-[#f5f4f0] gap-2 h-11 px-6"
            >
              {sharing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Share results
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {!onEmailCaptureClick && !isPublicView && (
        <EmailCaptureModal
          isOpen={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
          auditResult={result}
          totalSavings={totalSavings}
        />
      )}
    </div>
  );
}
