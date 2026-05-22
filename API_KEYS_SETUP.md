# API Keys Setup Guide

## Overview
Your application needs two API keys to function properly:
1. **Resend API Key** - For sending audit emails
2. **Supabase Service Role Key** - For server-side database operations

---

## 1. Resend API Key Setup

### What is Resend?
Resend is a transactional email service. When users click "Send my report", the audit results are emailed to them.

### How to Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** in your dashboard
4. Click **Create API Key**
5. Copy the API key (starts with `re_`)
6. Update `.env.local`:

```env
RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE
RESEND_FROM_EMAIL=your-email@yourdomain.com
```

### Important Notes
- **Free tier**: Up to 100 emails/day (perfect for testing)
- **Custom domain** (optional): You can use a custom domain instead of `onboarding@resend.dev`
- **Keep it secret**: Never commit your API key to git

---

## 2. Supabase Service Role Key

### What is Supabase Service Role Key?
This allows your server-side API routes to write to the database without row-level security (RLS) restrictions. It's used to save user leads/audits.

### How to Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Under "Project API Keys", find **Service Role Key** (labeled "secret")
5. Click the eye icon to reveal it
6. Copy the key
7. Update `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...YOUR_ACTUAL_KEY
```

### Important Notes
- **Keep it secret**: This key has full database access. Never commit to git.
- **Server-only**: This should ONLY be used on your backend (`.ts` files that run on the server)
- The public anon key (already in your `.env.local`) is safe to expose in the browser

---

## Complete .env.local Example

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://cdefvsxomfffvtdifrao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase Service Role (UPDATE THIS)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...YOUR_SERVICE_ROLE_KEY_HERE

# Resend Email Service (UPDATE THIS)
RESEND_API_KEY=re_YOUR_API_KEY_HERE
RESEND_FROM_EMAIL=AI Spend Audit <noreply@yourdomain.com>
```

---

## Troubleshooting

### Error: "Invalid API key" when sending report
**Causes:**
- `RESEND_API_KEY` is not set in `.env.local`
- API key is invalid or expired
- API key doesn't have email sending permissions

**Solution:**
1. Verify you have the correct key from resend.com
2. Check for typos
3. Restart your dev server after updating `.env.local`

### Error: "Failed to save lead"
**Causes:**
- `SUPABASE_SERVICE_ROLE_KEY` is not set
- Service role key is invalid
- Supabase database connection issue

**Solution:**
1. Get the correct service role key from Supabase
2. Check Supabase is accessible (test in dashboard)
3. Verify the `leads` table exists in your database
4. Restart your dev server

### Changes to .env.local not taking effect
**Solution:**
1. Stop your dev server (`Ctrl+C`)
2. Update `.env.local`
3. Restart with `npm run dev`

---

## Security Best Practices

✅ **DO:**
- Keep API keys in `.env.local` (not committed to git)
- Use different keys for dev/staging/production
- Rotate keys regularly
- Use `.gitignore` to exclude `.env.local`

❌ **DON'T:**
- Commit `.env.local` to version control
- Share API keys in Slack/email
- Use production keys in development
- Expose secret keys in client-side code

---

## Free Tier Limits

### Resend (Free)
- 100 emails/day
- Perfect for testing and small-scale usage

### Supabase (Free)
- 500MB database storage
- Unlimited API requests
- Perfect for development

Upgrade plans available when you need more capacity.

---

## Questions?

- **Resend Help**: https://resend.com/docs
- **Supabase Help**: https://supabase.com/docs
- Check server logs: `npm run dev` will show errors in terminal
