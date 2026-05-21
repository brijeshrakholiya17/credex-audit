import Link from "next/link";
import { Sparkles } from "lucide-react";

import { PageContainer } from "@/components/ui/page-container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e7e5e4]/80 bg-[#faf9f7]/90 backdrop-blur-md">
      <PageContainer className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-[#1c1917] transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cc785c]/10 border border-[#cc785c]/20">
            <Sparkles className="h-4 w-4 text-[#cc785c]" />
          </span>
          <span className="tracking-tight">AI Spend Audit</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[#57534e]">
          <Link
            href="/"
            className="transition-colors hover:text-[#1c1917]"
          >
            Audit
          </Link>
        </nav>
      </PageContainer>
    </header>
  );
}
