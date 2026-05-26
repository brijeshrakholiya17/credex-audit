import { NextResponse, NextRequest } from "next/server";

import type { AuditResult } from "@/lib/auditEngine";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = 'nodejs';

export interface LeadPayload {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: string;
  auditData: AuditResult | Record<string, any>;
  website?: string;
}

export async function POST(request: NextRequest) {
  console.log('LEADS API HIT — env check:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY,
  });

  try {
    const { createClient } = await import('@supabase/supabase-js');
    
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
      console.error("Missing Supabase configuration:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        hasAnonKey: !!anonKey,
      });
      return NextResponse.json(
        { error: "Server configuration incomplete. Please check environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, (serviceRoleKey || anonKey)!);

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          email: email.toLowerCase().trim(),
          company_name: companyName ?? null,
          role: role ?? null,
          team_size: teamSize ?? null,
          audit_data: auditData,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase leads insert error:", error);
      return NextResponse.json(
        { 
          error: error.message,
          details: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      leadId: data.id,
      email: email.toLowerCase().trim(),
      companyName,
      auditData,
    });
  } catch (err) {
    console.error('LEADS API ERROR:', JSON.stringify(err, null, 2));
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}
