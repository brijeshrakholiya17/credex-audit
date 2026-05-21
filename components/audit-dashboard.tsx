"use client";

import { useState } from "react";

import { AuditResults } from "@/components/audit-results";
import { AuditResultsSkeleton } from "@/components/audit-results-skeleton";
import {
  SubscriptionForm,
  type SpendFormData,
} from "@/components/subscription-form";
import { buildAuditFromForm } from "@/lib/auditFromForm";
import type { AuditResult } from "@/lib/auditEngine";

export function AuditDashboard() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: SpendFormData) {
    setLoading(true);
    setResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setResult(buildAuditFromForm(formData));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10">
      <SubscriptionForm onSubmit={handleSubmit} />
      {loading && <AuditResultsSkeleton />}
      {result && !loading && <AuditResults result={result} />}
    </div>
  );
}
