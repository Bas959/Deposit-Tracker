# Deposit Tracker — Deploy Guide
University of Sunderland · Aug–Nov 2026 Intake

Estimated time: ~15 minutes

---

## Step 1 — Set up Supabase (your database)

1. Go to https://supabase.com and sign up (free)
2. Click **New Project**, give it a name (e.g. "deposit-tracker"), set a password, choose a region close to the UK
3. Wait ~2 minutes for the project to spin up
4. In the left sidebar, click **SQL Editor**
5. Paste the entire contents of `schema.sql` into the editor and click **Run**
6. You should see "Success. No rows returned"

Now grab your credentials:
- Go to **Project Settings → API**
- Copy **Project URL** → this is your `VITE_SUPABASE_URL`
- Copy **anon / public** key → this is your `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Push to GitHub

1. Go to https://github.com and create a **New Repository** (name it `deposit-tracker`, set to Private)
2. On your computer, open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/deposit-tracker.git
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to https://vercel.com and sign up (free — use your GitHub account)
2. Click **Add New → Project**
3. Import your `deposit-tracker` GitHub repository
4. Before clicking Deploy, expand **Environment Variables** and add these three:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_EDIT_PASSCODE` | OurYear2026@@ |

5. Click **Deploy**

Vercel will build and deploy in ~1 minute. You'll get a URL like:
`https://deposit-tracker.vercel.app`

---

## Step 4 — Share with your team

Send the Vercel URL to everyone. That's it.

- **Viewing**: anyone with the link can see live data, no login needed
- **Editing**: click 🔒 Edit in the top-right and enter the passcode
- **Live updates**: changes made by one editor appear instantly for all viewers

---

## Updating the passcode

Go to Vercel → your project → Settings → Environment Variables → edit `VITE_EDIT_PASSCODE` → Redeploy.

## Adding a custom domain (optional)

Vercel → your project → Settings → Domains → add e.g. `deposits.sunderland.ac.uk`

---

Need help? The project uses:
- **React + Vite** (frontend)
- **Supabase** (database + real-time)
- **Vercel** (hosting)
