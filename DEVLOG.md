# DEVLOG — AI Spend Audit Tool
### Credex Web Dev Intern Assignment — Round 1
### Brijesh Rakholiya | May 20–26, 2026
 
---
 
## Day 1 — 2026-05-20
 
**Hours worked:** 3
 
**What I did:**
Received the assignment from Credex via Internshala. Read the full PDF brief twice carefully before writing a single line of code. Decided on the tech stack: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Resend. Scaffolded the project using `create-next-app` with TypeScript and Tailwind flags. Set up the full folder structure: `/app`, `/components`, `/lib/auditEngine.ts`, `/lib/pricing.ts`, `/lib/supabase/client.ts`, `/lib/supabase/server.ts`. Created the Supabase project on the dashboard, ran the SQL to create the `audits` and `leads` tables with proper indexes. Created the GitHub repo (public), pushed the initial commit. Scaffolded all 12 required markdown files so they exist in git history from Day 1. Set up `.github/workflows/ci.yml` for lint + test on every push to main. Verified CI shows green on GitHub Actions. Deployed an empty shell to Vercel to confirm the pipeline works end-to-end.
 
**What I learned:**
Next.js 14 App Router handles environment variables differently from Pages Router — `NEXT_PUBLIC_` prefix is required for client-side access but server-only keys must not have that prefix. Supabase's `gen_random_uuid()` is cleaner than generating UUIDs in application code. Creating all markdown files on Day 1 is important because git history is checked programmatically — backdating is obvious.
 
**Blockers / what I'm stuck on:**
Had to decide between App Router and Pages Router. Went with App Router because server components make the shareable audit URL page (with OG meta tags) much simpler to implement — no need for `getServerSideProps`. Documented this decision in ARCHITECTURE.md draft.
 
**Plan for tomorrow:**
Build the complete SpendInputForm component with all 8 required tools, toggle UI, plan dropdowns, monthly spend inputs, seat counters, and localStorage persistence. Deploy to Vercel and verify form renders correctly on mobile.
 
---

## Day 2 — 2026-05-21
 
**Hours worked:** 4
 
**What I did:**
Built the complete `SpendInputForm` component. Implemented two-step flow: Step 1 is tool selection (8 tools with toggles that expand to show plan/spend/seats), Step 2 is team context (team size chips + use case selector). All 8 required tools included: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf. Wired localStorage persistence so form state survives page reloads — used a `useEffect` to load on mount and another to save on every state change. Added a floating summary bar at the bottom showing live tool count and total declared spend. Integrated the form into `app/page.tsx` with a hero landing section above it. Ran the app on mobile viewport (375px in Chrome DevTools) and fixed spacing issues. Pushed to Vercel, confirmed it works on the live URL.
 
**What I learned:**
localStorage reads must be inside `useEffect` in Next.js App Router, not at the top level, because the server doesn't have access to `window`. Tried reading it outside `useEffect` first and got a hydration mismatch error. Also learned that shadcn/ui `Select` components need a `Portal` wrapper to prevent z-index issues when inside cards with `overflow: hidden`.
 
**Blockers / what I'm stuck on:**
The toggle animation for expanding tool cards was janky at first — CSS `height: auto` doesn't animate. Solved it using `max-height` transition with a generous max value instead of `height`. Not perfect but smooth enough for the MVP.
 
**Plan for tomorrow:**
Build the core audit engine in `lib/auditEngine.ts` and pricing rules in `lib/pricing.ts`. This is the most important logic in the entire project. Will verify every pricing number against official vendor pages and document sources in PRICING_DATA.md simultaneously.
 
---