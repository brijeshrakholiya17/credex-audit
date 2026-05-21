import { PageContainer } from "@/components/ui/page-container";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-[#e7e5e4] py-10">
      <PageContainer>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-[#57534e] max-w-md">
            AI Spend Audit — find overlap and savings across your AI
            subscriptions.
          </p>
          <p className="text-xs text-[#a8a29e]">
            Pricing estimates for planning only; verify with vendors.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
