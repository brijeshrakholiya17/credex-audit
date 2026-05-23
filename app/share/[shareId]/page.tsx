import Link from "next/link";
import { AuditResults } from "@/components/audit-results";
import { PageContainer } from "@/components/ui/page-container";
import { createAdminClient } from "@/lib/supabase/admin";
import { Metadata } from "next";

type Props = {
  params: { shareId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("audits")
    .select("total_monthly_savings")
    .eq("share_id", params.shareId)
    .single();

  const savings = data?.total_monthly_savings || 0;

  return {
    title: `AI Spend Audit — Saving $${savings}/mo`,
    description: "See the full breakdown",
    openGraph: {
      title: `AI Spend Audit — Saving $${savings}/mo`,
      description: "See the full breakdown",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit — Saving $${savings}/mo`,
      description: "See the full breakdown",
      images: ["/og-image.png"],
    },
  };
}

export default async function SharedAuditPage({ params }: Props) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("audits")
    .select("results")
    .eq("share_id", params.shareId)
    .single();

  if (error || !data) {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="flex flex-col items-center gap-8 w-full">
          <Link href="/" className="text-sm text-[#57534e] hover:text-[#1c1917] transition-colors">
            ← Run your own audit
          </Link>
          <p className="text-center text-[#57534e] py-16">This shared audit could not be found.</p>
        </div>
      </PageContainer>
    );
  }

  // Strip sensitive info from the results before passing to client component
  const resultData = data.results;
  
  if (resultData && typeof resultData === "object") {
    if (resultData.email) delete resultData.email;
    if (resultData.company) delete resultData.company;
    if (resultData.formData) {
      if (resultData.formData.email) delete resultData.formData.email;
      if (resultData.formData.company) delete resultData.formData.company;
    }
  }

  return (
    <PageContainer className="py-12 md:py-16">
      <div className="flex flex-col items-center gap-8 w-full">
        <Link href="/" className="text-sm text-[#57534e] hover:text-[#1c1917] transition-colors">
          ← Run your own audit
        </Link>
        <div className="w-full max-w-4xl">
          <AuditResults result={resultData} isPublicView={true} />
        </div>
      </div>
    </PageContainer>
  );
}
