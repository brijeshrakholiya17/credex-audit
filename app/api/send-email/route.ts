import { NextResponse } from "next/server";

import type { AuditResult } from "@/lib/auditEngine";
import { sendAuditEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      auditData?: AuditResult;
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

    await sendAuditEmail({ email, auditData, companyName });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Send email error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
