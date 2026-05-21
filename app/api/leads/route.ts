import { NextResponse } from "next/server";

import type { AuditResult } from "@/lib/auditEngine";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";

export interface LeadPayload {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: string;
  auditData: AuditResult;
  website?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;
    const { email, companyName, role, teamSize, auditData, website } = body;

    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!auditData) {
      return NextResponse.json({ error: "Audit data is required" }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`leads:${clientIp}`);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        email: email.toLowerCase().trim(),
        company_name: companyName ?? null,
        role: role ?? null,
        team_size: teamSize ?? null,
        audit_data: auditData,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase leads insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      leadId: data.id,
      email: email.toLowerCase().trim(),
      companyName,
      auditData,
    });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
