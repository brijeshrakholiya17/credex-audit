# Unit Economics

This document outlines the financial viability of the AI Spend Audit tool as an acquisition channel for Credex's core consulting services.

## 1. Cost of Goods Sold (COGS)
The operating costs for the application are incredibly lean due to the modern serverless stack.

- **Hosting (Vercel):** $20/mo (Pro tier for higher bandwidth, though currently easily fits in Free tier).
- **Database (Supabase):** $25/mo (Pro tier to ensure no sleeping instances and high availability).
- **AI Processing (Gemini 2.5 Flash):** ~$0.00015 per 1,000 characters. For 5,000 audits/month, the API cost is effectively < $5.00/mo.
- **Transactional Emails (Resend):** Free tier (up to 3,000 emails/mo) / $20 for Pro tier.
- **Total COGS:** ~$70.00 / month.

*With 5,000 MAUs, the marginal cost per audit is $0.014.*

## 2. Customer Acquisition Cost (CAC)
- **Paid Ads Budget:** $1,000/mo
- **Content / Organic Time Cost:** $1,000/mo (Allocated value of internal time)
- **Total Marketing Spend:** $2,000/mo
- **Total Qualified Leads Generated:** 100/mo
- **Blended CAC:** $20.00 per qualified lead.

## 3. Lifetime Value (LTV)
The AI Spend Audit tool is a top-of-funnel lead magnet. The true LTV comes from converting these leads into paying Credex clients.

- **Consulting Contract Average Value (ACV):** $5,000
- **Lead to Customer Conversion Rate:** 4% (Conservative estimate for B2B consulting)
- **Expected Value per Qualified Lead:** $5,000 * 0.04 = $200.00

## 4. ROI and Margins
- **LTV : CAC Ratio:** $200.00 / $20.00 = **10x**
- **Net Profit per Lead:** $180.00

**Conclusion:** The unit economics are highly favorable. Because the marginal cost of running the audit engine is near zero, investing heavily in top-of-funnel paid acquisition (even driving the CAC up to $50/lead) will still yield a highly profitable 4x LTV:CAC ratio.
