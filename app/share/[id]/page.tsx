"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AuditResults } from "@/components/audit-results";
import { AuditResultsSkeleton } from "@/components/audit-results-skeleton";
import { PageContainer } from "@/components/ui/page-container";
import type { AuditResult } from "@/lib/auditEngine";

export default function SharedAuditPage({
  params,
}: {
  params: { id: string };
}) {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/audits/${params.id}`);
        if (!res.ok) {
          setError("This shared audit could not be found.");
          return;
        }
        const data = (await res.json()) as { result: AuditResult };
        setResult(data.result);
      } catch {
        setError("Failed to load shared audit.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  return (
    <PageContainer className="py-12 md:py-16">
      <div className="flex flex-col items-center gap-8 w-full">
        <Link
          href="/"
          className="text-sm text-[#57534e] hover:text-[#1c1917] transition-colors"
        >
          ← Run your own audit
        </Link>

        {loading && <AuditResultsSkeleton />}
        {error && (
          <p className="text-center text-[#57534e] py-16">{error}</p>
        )}
        {result && !loading && (
          <div className="w-full max-w-4xl">
            <AuditResults result={result} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
