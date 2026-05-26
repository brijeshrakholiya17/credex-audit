"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ChevronDown, ChevronUp } from "lucide-react";

import type { AuditResult } from "@/lib/auditEngine";

export interface LeadFormData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: string;
}

export interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: AuditResult | Record<string, any>; // Accept both AuditResult and EnhancedAuditOutput
  totalSavings: number;
  onSuccess?: () => void;
}

const TEAM_SIZES = ["Just me", "2-5", "6-15", "16-50", "51-200", "200+"] as const;
const ROLES = [
  "Founder",
  "Engineering Manager",
  "Developer",
  "Finance",
  "Other",
] as const;

export function EmailCaptureModal({
  isOpen,
  onClose,
  auditResult,
  totalSavings,
  onSuccess,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    console.log('Modal submit — auditResult:', JSON.stringify(auditResult, null, 2));
    console.log('totalSavings:', totalSavings);

    if (!auditResult || Object.keys(auditResult).length === 0) {
      setError('Audit data missing. Please run the audit again and try submitting.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      email,
      companyName: companyName || undefined,
      role: role || undefined,
      teamSize: teamSize || undefined,
      auditData: JSON.parse(JSON.stringify(auditResult)),
      website: honeypot,
    };

    try {
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!leadRes.ok) {
        const data = (await leadRes.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save your report");
      }

      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!emailRes.ok) {
        const data = (await emailRes.json()) as { error?: string };
        throw new Error(
          data.error ?? "Report saved but email could not be sent"
        );
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail("");
        setCompanyName("");
        setRole("");
        setTeamSize("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSavings = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#1c1917]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#e7e5e4] bg-white p-6 sm:p-8 shadow-[0_24px_80px_-12px_rgba(28,25,23,0.25)] animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#57534e] transition-colors hover:bg-[#f5f4f0] hover:text-[#1c1917]"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-5 text-center">
          <div className="space-y-2 pr-6">
            <h2
              id="modal-title"
              className="text-xl font-semibold tracking-tight text-[#1c1917]"
            >
              Save your audit report
            </h2>
            <p className="text-sm leading-relaxed text-[#57534e]">
              Get your full breakdown + savings plan by email. No spam.
              Unsubscribe anytime.
            </p>
          </div>

          {totalSavings > 0 && (
            <div className="rounded-xl bg-[#faf9f7] border border-[#e7e5e4] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-[#78716c]">
                Your potential savings
              </p>
              <p className="text-2xl font-semibold text-[#cc785c] tabular-nums">
                {formatSavings(totalSavings)}
                <span className="text-sm font-normal text-[#57534e]">/mo</span>
              </p>
            </div>
          )}

          {success ? (
            <p className="text-sm text-emerald-600 py-8 font-medium">
              Report sent! Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0 pointer-events-none"
              />

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-[#57534e]">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#78716c] focus:border-[#cc785c] focus:ring-[#cc785c]"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex w-full items-center justify-center gap-2 text-sm text-[#57534e] transition-colors hover:text-[#1c1917]"
              >
                {showOptional ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Add company details (optional)
              </button>

              <div
                className={`grid gap-4 overflow-hidden transition-all duration-300 ${
                  showOptional
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 space-y-4 overflow-hidden">
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm text-[#57534e]">
                      Company name
                    </label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-11 border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#78716c] focus:border-[#cc785c] focus:ring-[#cc785c]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm text-[#57534e]">
                      Your role
                    </label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger
                        id="role"
                        className="h-11 border-[#e7e5e4] bg-white text-[#1c1917]"
                      >
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#e7e5e4] text-[#1c1917]">
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="teamSize"
                      className="text-sm text-[#57534e]"
                    >
                      Team size
                    </label>
                    <Select value={teamSize} onValueChange={setTeamSize}>
                      <SelectTrigger
                        id="teamSize"
                        className="h-11 border-[#e7e5e4] bg-white text-[#1c1917]"
                      >
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#e7e5e4] text-[#1c1917]">
                        {TEAM_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!email || isSubmitting}
                className="h-12 w-full rounded-full bg-[#cc785c] text-white transition-all hover:bg-[#b86a50] disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send my report →"}
              </Button>

              <p className="text-center text-xs text-[#78716c]">
                High-savings audits get a personal note from the Credex team
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
