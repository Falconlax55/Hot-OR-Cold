[README.md](https://github.com/user-attachments/files/30434790/README.md)
# Hot or Cold — deploy guide

This folder is a ready-to-deploy Vercel project:

```
hot-or-cold-site/
  public/index.html   ← the website itself
  api/weather.js       ← serverless function that holds the API key and calls Anthropic
  package.json
```

## 1. Get an Anthropic API key

1. Go to https://console.anthropic.com and sign in (or create an account).
2. Add a small amount of billing credit — this app uses the Claude API with
   web search, which costs a small amount per click (a fraction of a cent
   to a few cents depending on how much searching Claude does).
3. Go to **API Keys** and create a new key. Copy it — you won't be able to
   see it again.

## 2. Deploy to Vercel (free tier is enough)

**Easiest path — no command line needed:**

1. Go to https://vercel.com and sign up / log in (GitHub login is easiest).
2. Put this `hot-or-cold-site` folder in its own GitHub repository
   (drag-and-drop upload works on github.com if you don't want to use git
   commands — create a new repo, then "uploading an existing file").
3. In Vercel, click **Add New → Project**, and import that GitHub repo.
4. Before deploying, open **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: the key you copied in step 1
5. Click **Deploy**.

Vercel will give you a live URL like `hot-or-cold-yourname.vercel.app`
within about a minute. That's it — the site is live.

**Command-line path (if you're comfortable with a terminal):**

```bash
npm install -g vercel
cd hot-or-cold-site
vercel login
vercel
# follow the prompts, accept defaults
vercel env add ANTHROPIC_API_KEY
# paste your key when prompted
vercel --prod
```

## 3. Custom domain (optional)

In the Vercel dashboard for your project, go to **Settings → Domains** and
add your own domain if you have one — Vercel walks you through the DNS
changes.

## Notes

- The API key is only ever read on the server (`api/weather.js`), never
  sent to the browser, so it's safe to deploy publicly.
- Each button click makes one Claude API call with web search enabled —
  expect it to take up to ~15 seconds and cost a small amount of API
  credit.
- If you want to swap hosts (Netlify, Cloudflare Pages, etc.), the same
  two files work with minor adjustments to how the serverless function is
  wired up — ask and I can adapt it.
