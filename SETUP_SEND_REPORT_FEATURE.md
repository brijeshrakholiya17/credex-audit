# Complete Setup Guide - Send My Report Feature

The "Send my report" feature requires **two things** to work:

1. ✅ **Resend API Key** (for sending emails)
2. ✅ **Supabase Database Tables** (for saving leads)

---

## Issue: "Could not find the 'audit_data' column"

This error means **the database tables haven't been created yet**. You need to run the SQL schema in Supabase.

---

## Step-by-Step Setup

### Part 1: Create Database Tables (Required)

**1. Open Supabase SQL Editor**
- Go to https://supabase.com/dashboard
- Select your project
- Click **SQL Editor** (left sidebar)
- Click **+ New Query**

**2. Copy & Paste This SQL**

```sql
-- Create shared_audits table
create table if not exists shared_audits (
  id uuid primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table shared_audits enable row level security;

-- Only create policies if they don't exist
-- Skip if you see "already exists" errors - that's fine!

do $$
begin
  create policy "Allow public insert on shared_audits"
    on shared_audits for insert
    with check (true);
exception when others then
  null;
end $$;

do $$
begin
  create policy "Allow public read on shared_audits"
    on shared_audits for select
    using (true);
exception when others then
  null;
end $$;

-- Create leads table (THIS IS CRITICAL)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size text,
  audit_data jsonb not null,
  created_at timestamptz not null default now()
);

-- If the table already existed without audit_data, ensure the column exists
alter table leads add column if not exists audit_data jsonb;

create index if not exists leads_email_created_at_idx on leads (email, created_at desc);

alter table leads enable row level security;

-- Only create policies if they don't exist
do $$
begin
  create policy "Allow public insert on leads"
    on leads for insert
    with check (true);
exception when others then
  null;
end $$;
```

**✅ Note:** If you see errors like "policy already exists", that's OK! It means the tables are already set up. Just proceed to the next step.

**3. Click "Run"**
- Wait for the success message
- You should see: "2 tables created" or similar

**4. Verify in Supabase**
- Go to **Database** → **Tables**
- You should see `leads` table with columns:
  - `id`
  - `email`
  - `company_name`
  - `role`
  - `team_size`
  - **`audit_data`** ← This is critical

---

### Part 2: Set Up Resend API Key (Required for Emails)

**1. Go to Resend**
- https://resend.com
- Sign up or log in

**2. Get API Key**
- Click **Developers** → **API Keys**
- Click **+ Create API Key**
- Copy the key (starts with `re_`)

**3. Update `.env.local`**
```env
RESEND_API_KEY=re_YOUR_KEY_HERE
RESEND_FROM_EMAIL=AI Spend Audit <noreply@yourdomain.com>
```

---

### Part 3: Set Up Supabase Service Role Key (Optional but Recommended)

This makes saving leads more reliable.

**1. Get Service Role Key**
- Go to https://supabase.com/dashboard
- Select your project
- **Settings** → **API**
- Find **"Service Role Secret"** (the one marked as secret)
- Click eye icon to reveal
- Copy it

**2. Update `.env.local`**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
```

---

### Part 4: Restart Dev Server

```bash
npm run dev
```

---

## Test It

1. Open http://localhost:3001
2. Fill out the audit form
3. Click "Run Audit"
4. Click "Send my report"
5. Enter email
6. Click "Send report"

**Expected flow:**
- ✅ Modal closes
- ✅ Email is sent (or queued)
- ✅ Lead is saved to database

---

## Complete Example `.env.local`

```env
# Supabase URLs (keep as-is)
NEXT_PUBLIC_SUPABASE_URL=https://cdefvsxomfffvtdifrao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZWZ2c3hvbWZmZnZ0ZGlmcmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjQ5OTEsImV4cCI6MjA5NDk0MDk5MX0.2RVBEdSij18n9QhIkGNNXIYJpxtitjfoQYCtBCiX1jE

# Supabase Admin (OPTIONAL but recommended)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_SERVICE_ROLE_KEY

# Resend Email (REQUIRED)
RESEND_API_KEY=re_abc123def456ghi789...YOUR_API_KEY
RESEND_FROM_EMAIL=AI Spend Audit <noreply@yourdomain.com>
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Could not find the 'audit_data' column" | Run the SQL schema (Part 1) |
| "Invalid API key" for emails | Get Resend API key (Part 2) |
| "Server configuration incomplete" | Both Supabase keys need to be set properly |
| Email not sending | Check Resend key is correct, not a placeholder |
| Lead not saving | Check Supabase Service Role key (Part 3) |

---

## What Each API Key Does

| Key | Purpose | Where to Get |
|-----|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Read-only access to public data | Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access to write leads (optional) | Supabase Settings → API |
| `RESEND_API_KEY` | Send audit emails | resend.com → Developers |

---

## Free Tier Limits

- **Resend**: 100 emails/day ✅
- **Supabase**: Unlimited API calls ✅
- **No credit card needed** to start

---

## Need Help?

1. **Check terminal output** when running `npm run dev`
2. **Check browser console** (F12) when clicking "Send my report"
3. **Check Supabase dashboard** → Tables to verify `leads` table exists
4. **Check email** - it might be in spam folder (first time)

The most common issue is **Part 1 not being completed** (SQL schema not run in Supabase).

Make sure the `leads` table exists with the `audit_data` column before testing!
