import { NextResponse, NextRequest } from "next/server";
import type { AuditResult } from "@/lib/auditEngine";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { buildAuditEmailHtml } from "@/lib/email";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('SEND-EMAIL API HIT — env check:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasResendKey: !!process.env.RESEND_API_KEY,
  });

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = (await request.json()) as {
      email?: string;
      auditData?: AuditResult | Record<string, any>;
      companyName?: string;
      website?: string;
    };

    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const { email, auditData, companyName } = body;

    if (!email || !auditData) {
      return NextResponse.json(
        { error: "Email and audit data are required" },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`email:${clientIp}`);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many email requests. Please try again later." },
        { status: 429 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || resendKey.includes("your_api_key")) {
      return NextResponse.json(
        { 
          error: "Email service not configured. Please set RESEND_API_KEY in environment variables.",
          configured: !!resendKey
        },
        { status: 500 }
      );
    }

    const toEmail = email || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "AI Spend Audit <onboarding@resend.dev>";
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const savings = auditData.potentialMonthlySavings || 0;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [
        process.env.RESEND_VERIFIED_EMAIL ?? toEmail
      ],
      replyTo: email,
      subject: `Your AI Spend Audit — ${formatCurrency(savings)}/mo in potential savings`,
      html: buildAuditEmailHtml({ email, auditData, companyName }),
    });

    console.log('RESEND RESPONSE:', JSON.stringify(data, null, 2));
    console.log('RESEND ERROR:', JSON.stringify(error, null, 2));

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      debug: { data, error, toEmail }
    });
  } catch (err) {
    console.error('SEND-EMAIL API ERROR:', JSON.stringify(err, null, 2));
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    );
  }
}
