# Hot or Cold — deploy guide

This folder is a ready-to-deploy Vercel project. No API key needed —
weather data comes from Open-Meteo, a free public weather API, called
server-side from `api/weather.js`.

```
hot-or-cold-site/
  public/index.html   <- the website itself
  api/weather.js       <- serverless function that fetches live weather (free, no key)
  vercel.json          <- routing config
  package.json
```

## Deploy to Vercel (free tier is enough)

**Easiest path - no command line needed:**

1. Go to https://vercel.com and sign up / log in (GitHub login is easiest).
2. Put this `hot-or-cold-site` folder in its own GitHub repository.
3. In Vercel, click **Add New -> Project**, and import that GitHub repo.
4. If Vercel doesn't auto-detect the project root, go to
   **Settings -> General -> Root Directory** and set it to
   `hot-or-cold-site` (only needed if the folder is nested in your repo).
5. Click **Deploy**.

You'll get a live URL like `hot-or-cold-yourname.vercel.app` within about
a minute - no environment variables or billing setup required.

**Command-line path (if you're comfortable with a terminal):**

```bash
npm install -g vercel
cd hot-or-cold-site
vercel login
vercel
vercel --prod
```

## Custom domain (optional)

In the Vercel dashboard for your project, go to **Settings -> Domains** and
add your own domain if you have one - Vercel walks you through the DNS
changes.

## Notes

- This runs entirely on Open-Meteo's free tier - no API key, no per-click
  cost, no rate-limit surprises for normal traffic.
- Each button click makes one fetch to Open-Meteo covering every city in
  the selected list (US or World) and returns almost instantly.
- Want more cities, different regions, or different fun facts? Edit the
  `CITIES` object near the top of the `<script>` tag in
  `public/index.html` - each entry needs `name`, `region`, `lat`, `lon`,
  and a `facts` array.
