# AI Spend Audit

Next.js 14 app for auditing AI tool subscriptions and surfacing savings recommendations.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (New York style)
- **Supabase** (client ready for auth/data)

## Project structure

```
app/                 # App Router pages & layout
components/          # UI and feature components
  ui/                # shadcn/ui primitives
lib/
  auditEngine.ts     # Savings detection logic
  pricing.ts         # Tool catalog & pricing
  supabase/          # Browser & server Supabase clients
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

   Add your [Supabase](https://supabase.com) project URL and anon key.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Supabase

Clients live in `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server). Share links use `shared_audits` — run `supabase/schema.sql` in the Supabase SQL editor before using **Share Results**.

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # optional, recommended for API writes
RESEND_API_KEY=              # for audit report emails
RESEND_FROM_EMAIL=AI Spend Audit <onboarding@resend.dev>
```

Run the full `supabase/schema.sql` (includes `leads` table) before using email capture.

## Audit engine

`lib/auditEngine.ts` analyzes subscriptions for:

- Overlapping chat AI tools
- Duplicate coding assistants
- Midjourney tier optimization
- Annual billing discounts
- Team vs individual plan overlap

Pricing data is maintained in `lib/pricing.ts`.
