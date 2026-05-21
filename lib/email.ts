import type { AuditResult } from "@/lib/auditEngine";

export interface SendAuditEmailInput {
  email: string;
  auditData: AuditResult;
  companyName?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildAuditEmailHtml({
  email,
  auditData,
  companyName,
}: SendAuditEmailInput): string {
  const savings = auditData.potentialMonthlySavings;
  const spend = auditData.totalMonthlySpend;
  const tools = auditData.subscriptions
    .map(
      (s) =>
        `<li><strong>${s.name}</strong>: ${formatCurrency(s.monthlyCost)}/mo</li>`
    )
    .join("");

  const recommendations = auditData.recommendations
    .map(
      (r) =>
        `<li><strong>${r.title}</strong> — save ~${formatCurrency(r.estimatedMonthlySavings)}/mo<br/><span style="color:#666">${r.description}</span></li>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h1 style="color:#cc785c">Your AI Spend Audit</h1>
      <p>Hi${companyName ? ` from ${companyName}` : ""},</p>
      <p>Here is your audit summary for <strong>${email}</strong>:</p>
      <ul>
        <li>Current spend: <strong>${formatCurrency(spend)}/mo</strong></li>
        <li>Potential savings: <strong>${formatCurrency(savings)}/mo</strong></li>
        <li>Annual savings potential: <strong>${formatCurrency(savings * 12)}/yr</strong></li>
      </ul>
      <h2>Subscriptions</h2>
      <ul>${tools || "<li>No tools listed</li>"}</ul>
      <h2>Recommendations</h2>
      <ul>${recommendations || "<li>Your stack looks lean — no major overlaps detected.</li>"}</ul>
      <p style="color:#666;font-size:14px">— Credex AI Spend Audit</p>
    </div>
  `;
}

export async function sendAuditEmail(input: SendAuditEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "AI Spend Audit <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: `Your AI Spend Audit — ${formatCurrency(input.auditData.potentialMonthlySavings)}/mo in potential savings`,
      html: buildAuditEmailHtml(input),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${err}`);
  }
}
