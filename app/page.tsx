"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AuditResults } from "@/components/audit-results";
import { AuditResultsSkeleton } from "@/components/audit-results-skeleton";
import { EmailCaptureModal } from "@/components/email-capture-modal";
import HeroSection from "@/components/landing-hero";
import {
  SpendInputForm,
  type SpendFormData,
} from "@/components/subscription-form";
import { PageContainer } from "@/components/ui/page-container";
import {
  buildAuditFromForm,
  type AuditOutput,
} from "@/lib/auditFromForm";

export type PageView = "landing" | "form" | "results";

function scrollToRef(ref: React.RefObject<HTMLElement | null>) {
  ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<PageView>("landing");
  const [auditResults, setAuditResults] = useState<AuditOutput | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartAudit = useCallback(() => {
    setCurrentView("form");
    requestAnimationFrame(() => scrollToRef(formRef));
  }, []);

  const handleFormSubmit = useCallback(async (formData: SpendFormData) => {
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    setIsAuditing(true);
    setModalOpen(false);
    setAuditResults(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const output = buildAuditFromForm(formData);
      setAuditResults(output);
      setCurrentView("results");

      requestAnimationFrame(() => scrollToRef(resultsRef));

      modalTimerRef.current = setTimeout(() => {
        setModalOpen(true);
      }, 2000);
    } finally {
      setIsAuditing(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    };
  }, []);

  const showResults = currentView === "results";

  return (
    <div className="w-full">
      <HeroSection onStartAudit={handleStartAudit} />

      <section
        ref={formRef}
        id="audit-form"
        className="w-full bg-[#faf9f7] py-12 md:py-16 scroll-mt-16"
      >
        <PageContainer>
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
            <SpendInputForm onSubmit={handleFormSubmit} />
          </div>
        </PageContainer>
      </section>

      {showResults && (
        <section
          ref={resultsRef}
          id="audit-results"
          className="w-full bg-[#faf9f7] pb-16 scroll-mt-16"
        >
          <PageContainer>
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
              {isAuditing && <AuditResultsSkeleton />}
              {!isAuditing && auditResults && (
                <AuditResults
                  result={auditResults}
                  onEmailCaptureClick={() => setModalOpen(true)}
                />
              )}
            </div>
          </PageContainer>
        </section>
      )}

      {auditResults && (
        <EmailCaptureModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          auditResult={auditResults}
          totalSavings={auditResults.potentialMonthlySavings}
        />
      )}
    </div>
  );
}


