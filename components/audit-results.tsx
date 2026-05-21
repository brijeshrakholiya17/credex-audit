"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";

import { EmailCaptureModal } from "@/components/email-capture-modal";
import { SectionEyebrow } from "@/components/ui/page-container";
import type { AuditResult } from "@/lib/auditEngine";
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
  result: AuditResult;
  onEmailCaptureClick?: () => void;
}

export function AuditResults({ result, onEmailCaptureClick }: AuditResultsProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const toolResults = useMemo(
    () => mapAuditResultToToolResults(result),
    [result]
  );

  const totalSavings = result.potentialMonthlySavings;
  const annualSavings = totalSavings * 12;
  const showConsultationCTA = totalSavings > 500;
  const showNewsletterOnly = totalSavings < 100;

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
              <span className="text-3xl sm:text-4xl font-medium text-[#a8a29e]">
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
            <p className="text-sm text-[#a8a29e]">
              Current spend: ${result.totalMonthlySpend.toLocaleString()}/mo
            </p>
          </div>

          {showConsultationCTA && (
            <Button
              size="lg"
              className="bg-[#cc785c] hover:bg-[#b86a50] text-white font-medium px-8 h-12 gap-2 rounded-full shadow-md"
            >
              <Sparkles className="h-5 w-5" />
              Book a Credex Consultation
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </section>

        <section className="space-y-5 w-full">
          <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-[#a8a29e]">
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

        <section className="w-full">
          {showNewsletterOnly ? (
            <Card className="border-[#e7e5e4] bg-[#faf9f7] shadow-none">
              <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center">
                  <Check className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-[#1c1917]">
                  You&apos;re spending well
                </h3>
                <p className="text-[#57534e] max-w-sm leading-relaxed">
                  Your AI stack is already optimized. Get tips by email for
                  future savings opportunities.
                </p>
                <Button
                  onClick={openEmailModal}
                  className="bg-[#cc785c] hover:bg-[#b86a50] text-white gap-2 rounded-full h-11 px-6"
                >
                  <Mail className="h-4 w-4" />
                  Get tips by email
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

        {shareError && (
          <p className="text-sm text-red-600 text-center">{shareError}</p>
        )}

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
      </div>

      {!onEmailCaptureClick && (
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
