# DEVLOG

## Day 1 — 2026-05-20
**Hours worked:** 3
**What I did:** Scaffolded Next.js 14 project with TypeScript, Tailwind CSS, 
shadcn/ui. Set up Supabase project, created audits and leads tables. 
Created all required markdown files. Set up GitHub Actions CI pipeline.
**What I learned:** Supabase's SQL editor makes schema setup much faster 
than MongoDB Atlas. The gen_random_uuid() function handles share IDs cleanly.
**Blockers / what I'm stuck on:** Deciding between App Router and Pages 
Router — went with App Router as it's the Next.js 14 standard.
**Plan for tomorrow:** Build SpendInputForm component, wire localStorage 
persistence, deploy first version to Vercel.