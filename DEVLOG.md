# DEVLOG — AI Spend Audit Tool
### Credex Web Dev Intern Assignment — Round 1
### Brijesh Rakholiya | May 20–26, 2026

---

## Day 1 — 2026-05-21 (3 Hours)
**What I did:** Scaffolded the project using Next.js 14 (App Router), TypeScript, Tailwind, Supabase, and Resend. Set up the database schema with indexes and created all 12 required markdown files to establish day-one git history. Configured the GitHub repo, automated CI/CD pipeline, and deployed an initial shell to Vercel.
**What I learned:** Next.js App Router environment variable strictness; Supabase's native UUID generation efficiency; the programmatic importance of early git history.
**Blockers:** Deciding between App vs. Pages router. Chose App Router to simplify shareable URL meta tag rendering (documented in ARCHITECTURE.md).

---

## Day 2 — 2026-05-22 (8 Hours)
**What I did:** Engineered the Advanced Financial Audit Engine with startup-focused heuristics and overkill detection. Integrated real-world vendor pricing for dynamic dropdowns and auto-calculated costs. Built strict form validation and API routes (`/api/audits/share`, `/api/leads`, `/api/send-email`). Created a mapping function to bridge granular inputs with legacy audit code.
**What I learned:** Auto-populating known vendor prices dramatically reduces user friction and ensures defensible financial math.
**Blockers:** Bridging dynamic form inputs with strict legacy type strings. Solved by building a precise translation mapping function to prevent data loss.

---

## Day 3 — 2026-05-23 (6 Hours)
**What I did:** Refactored `auditEngine.ts` to directly use UI form IDs, centralizing all pricing data into `lib/pricing.ts`. Added two new cost-saving detectors (Team overkill, API direct). Built the `/share/[shareId]` Server Component with dynamic OpenGraph metadata for exact savings previews. Added a PII-stripping `isPublicView` mode.
**What I learned:** Next.js Server Components excel at dynamic OpenGraph generation. Centralized configuration drastically reduces frontend/backend complexity.
**Blockers:** 500 error on the share route due to an outdated Supabase schema. Resolved by executing direct SQL to add the missing `share_id` and `results` columns.

---

## Day 4 — 2026-05-24 (0 Hours)
**What I did:** Away for personal commitments. Pushed a minimal DEVLOG commit to maintain the required continuous daily git history. Pushed all planned API and testing tasks to May 25.
**What I learned:** Shipping under real-world constraints requires honesty and aggressive replanning, not backdated fake entries.
**Blockers:** Pure time constraint. Acknowledged the risk of a double workload for the following day.

---

## Day 5 — 2026-05-25 (7 Hours)
**What I did:** Executed a massive build day. Overhauled the audit engine to natively use specific plan names. Built the Supabase share route and public-facing URL components. Integrated Google Gemini (gemini-2.5-flash) as a CFO-style AI advisor for audit summaries. Configured Vitest, wrote 5 core unit tests, and finalized GitHub Actions CI.
**What I learned:** Exact precision is required for LLM API model registries. Strict unit testing requires mock data to perfectly mirror production shapes.
**Blockers:** Gemini 404 errors (fixed by switching model versions to match API key provisioning) and a Vitest NaN bug (fixed by correcting a mocked object key).

---

## Day 6 — 2026-05-26 (7 Hours)
**What I did:** Conducted intense debugging. Linked the Credex consultation button and updated UI copy to match exact PDF requirements. Fixed Vercel API routing by forcing the Node.js runtime for Supabase/Resend clients. Fixed incognito mode bugs by shifting data handling entirely from `localStorage` to React state. Hardened the Gemini fallback template to return 200 OK summaries during 503 load spikes. 
**What I learned:** Resend's 200 OK response hides silent email drops for unverified domains. Incognito mode exposes fundamental bugs if relying too heavily on local storage.
**Blockers:** Intermittent Gemini 503s (mitigated with robust fallback) and Resend free-tier domain limits (routed test emails to a verified address).

---

## Day 7 — 2026-05-27 (5 Hours)
**What I did:** Final submission push. Completed all 12 markdown files including strategic documents (GTM, ECONOMICS, USER_INTERVIEWS) and technical files (ARCHITECTURE with Mermaid diagrams, TESTS, METRICS). Ran a final Lighthouse audit, securing >90 scores across Performance, Accessibility, and Best Practices. Verified a 6-day git commit history and submitted the assignment.
**What I learned:** Strategic documentation (Economics, GTM) takes heavy conceptual lifting and clarifies the entire product scope; these should ideally be drafted on Day 1.
**Blockers:** No technical blockers, only the time required for high-quality, thoughtful writing.