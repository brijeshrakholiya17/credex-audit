# "Invalid API Key" Error - Solution

## The Problem
You're seeing "Invalid API key" when clicking "Send my report" because your `.env.local` file has placeholder values instead of real API keys.

## Current Status (from `.env.local`)
```env
RESEND_API_KEY=re_your_api_key          ❌ PLACEHOLDER
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  ❌ PLACEHOLDER
```

## The Fix - 3 Simple Steps

### Step 1: Get Resend API Key
1. Go to https://resend.com
2. Click "Sign up" (or "Sign in" if you have an account)
3. Go to **Developers** → **API Keys**
4. Click **+ Create API Key**
5. Copy the key (looks like `re_abc123...`)
6. Update `.env.local`:
   ```env
   RESEND_API_KEY=re_abc123def456...
   ```

### Step 2: Get Supabase Service Role Key
1. Go to https://supabase.com/dashboard
2. Select your project (credex)
3. Click **Settings** (bottom left)
4. Click **API** tab
5. Find **"Service Role Secret"** (it's the secret key, not the anon key)
6. Click the eye icon to reveal it
7. Copy it
8. Update `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### Step 3: Restart Your Dev Server
```bash
# Stop your server (Ctrl+C)
# Then restart:
npm run dev
```

## Verify It's Working
1. Open your app at http://localhost:3001
2. Fill out the audit form
3. Click "Run Audit"
4. Click "Send my report"
5. Enter email
6. Click "Send report"
7. You should see "✓ Copied!" and the email will be queued

---

## What These Keys Do

| Key | Purpose | Where to Find |
|-----|---------|---------------|
| `RESEND_API_KEY` | Sends audit emails | resend.com → API Keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Saves leads to database | supabase.com → Settings → API |

---

## If You Still Get Errors

**Check these things:**

1. ✅ Did you copy the FULL key? (It's long, like 100+ characters)
2. ✅ No extra spaces? Check there's nothing before/after the key
3. ✅ Did you restart your dev server after updating `.env.local`?
4. ✅ Is the `leads` table in your Supabase database?

**To debug:**
1. Open the browser console (F12)
2. Look at the **Network** tab when you click "Send my report"
3. Find the `/api/send-email` request
4. Check the **Response** tab for the exact error

---

## Free Tier Limits (Perfect for Testing)

- **Resend**: 100 emails/day
- **Supabase**: Unlimited API requests

No credit card needed to start!

---

## Complete Example (Safe to Share)
Here's what your `.env.local` should look like after updating:

```env
# Supabase (keep these as-is)
NEXT_PUBLIC_SUPABASE_URL=https://cdefvsxomfffvtdifrao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZWZ2c3hvbWZmZnZ0ZGlmcmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjQ5OTEsImV4cCI6MjA5NDk0MDk5MX0.2RVBEdSij18n9QhIkGNNXIYJpxtitjfoQYCtBCiX1jE

# UPDATE THIS - Get from Supabase Settings > API > Service Role Secret
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# UPDATE THIS - Get from resend.com > Developers > API Keys
RESEND_API_KEY=re_abc123def456ghi789...

# Optional - Use your own domain (optional)
RESEND_FROM_EMAIL=AI Spend Audit <noreply@yourdomain.com>
```

That's it! After these 3 steps, email sending should work. 🎉

---

## Need Help?

- **Resend docs**: https://resend.com/docs
- **Supabase docs**: https://supabase.com/docs
- **Questions in terminal?** Run `npm run dev` and check the console output when errors occur
