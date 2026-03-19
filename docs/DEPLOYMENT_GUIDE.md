# 4Zone — Complete Deployment Guide
# From zero to live SaaS at 4zone.store

## ═══════════════════════════════════════════
## OVERVIEW: What We're Building
## ═══════════════════════════════════════════

  4zone.store        → Landing page (static HTML)
  app.4zone.store    → React App (AI tools dashboard)
  api.4zone.store    → Node.js/Express API (Railway)

  DNS: .store domain panel → Cloudflare (free) → Railway / static host


## ═══════════════════════════════════════════
## STEP 1: PREPARE YOUR LOCAL MACHINE
## ═══════════════════════════════════════════

Install required tools:
  - Node.js 20+  → https://nodejs.org
  - Git          → https://git-scm.com
  - VS Code      → https://code.visualstudio.com

Verify installs:
  node --version   # should show v20.x
  npm --version    # should show 10.x
  git --version    # should show 2.x


## ═══════════════════════════════════════════
## STEP 2: SET UP GITHUB REPOSITORY
## ═══════════════════════════════════════════

1. Go to https://github.com → New Repository
2. Name it: 4zone-saas
3. Set to Public (required for free GitHub Pages)
4. Don't initialize (we'll push our code)

In your project folder, run:
  git init
  git add .
  git commit -m "Initial 4Zone SaaS commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/4zone-saas.git
  git push -u origin main


## ═══════════════════════════════════════════
## STEP 3: GET GOOGLE API KEYS
## ═══════════════════════════════════════════

You have $300 Google Cloud credit — use it!

─── 3A: Google AI Studio API Key (Gemini + Imagen) ───

1. Go to https://aistudio.google.com
2. Click "Get API Key" → Create API Key
3. Copy the key (starts with "AIza...")
4. This handles: Gemini chat, Imagen image generation

─── 3B: Enable Google Cloud APIs ───

1. Go to https://console.cloud.google.com
2. Create a new project: "4zone-production"
3. Go to "APIs & Services" → "Enable APIs"
4. Enable these APIs:
   ✓ Cloud Text-to-Speech API
   ✓ Generative Language API (Gemini)
   ✓ Vertex AI API (for Imagen/Veo)
   ✓ Cloud Storage API (for file uploads)

─── 3C: Create Service Account (for TTS) ───

1. IAM & Admin → Service Accounts → Create
2. Name: "4zone-app"
3. Role: "AI Platform User" + "Cloud Text-to-Speech User"
4. Keys tab → Add Key → JSON → Download
5. Open the JSON file — copy its ENTIRE contents
6. This goes in your GOOGLE_SERVICE_ACCOUNT_JSON env var

─── 3D: Google Veo (Video) ───

Currently Veo requires Vertex AI access:
1. Console → Vertex AI → Enable API
2. May need to request access at:
   https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos
3. Use your $300 credit for this


## ═══════════════════════════════════════════
## STEP 4: DEPLOY BACKEND TO RAILWAY
## ═══════════════════════════════════════════

You have Railway Pro (1 year) — perfect!

─── 4A: Create Railway Project ───

1. Go to https://railway.app → Login with GitHub
2. New Project → Deploy from GitHub repo → Select "4zone-saas"
3. Railway detects Node.js automatically

─── 4B: Set Root Directory ───

In Railway project settings:
  Root Directory: /backend
  Build Command: npm install
  Start Command: npm start

─── 4C: Add Environment Variables ───

In Railway → Your service → Variables tab, add:

  GOOGLE_API_KEY          = AIza... (from Step 3A)
  GOOGLE_CLOUD_PROJECT_ID = your-project-id
  GOOGLE_SERVICE_ACCOUNT_JSON = {"type":"service_account",...} (full JSON)
  JWT_SECRET              = (generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  NODE_ENV                = production
  PORT                    = 3001

─── 4D: Add Custom Domain to Railway ───

1. Railway → Your service → Settings → Domains
2. Click "Add Custom Domain"
3. Type: api.4zone.store
4. Railway shows you a CNAME value like:
   xxx.up.railway.app
5. SAVE THIS — you'll use it in Step 6


## ═══════════════════════════════════════════
## STEP 5: DEPLOY FRONTEND
## ═══════════════════════════════════════════

Option A: GitHub Pages (FREE, easiest)

1. In GitHub repo → Settings → Pages
2. Source: Deploy from branch → main → /frontend/public
3. Your site lives at: https://YOUR_USERNAME.github.io/4zone-saas
4. We'll point 4zone.store to it via DNS in Step 6

Option B: Cloudflare Pages (RECOMMENDED — faster, free)

1. Go to https://pages.cloudflare.com
2. Connect GitHub → Select 4zone-saas repo
3. Build settings:
   Build command: (leave empty for static)
   Build output: frontend/public
4. Deploy → Gets URL like: 4zone-saas.pages.dev
5. Add custom domain 4zone.store in Cloudflare Pages settings

Option C: Railway (serve static from same Railway project)

Add a second Railway service:
  Root Directory: /frontend/public
  Add a simple static server (nginx or serve package)

For app.4zone.store (React app) — also Cloudflare Pages:
  Build command: npm run build
  Build output: dist (or build)
  Custom domain: app.4zone.store


## ═══════════════════════════════════════════
## STEP 6: CONNECT YOUR .STORE DOMAIN
## ═══════════════════════════════════════════

Your domain is at a .store registrar panel.
We'll use Cloudflare as DNS (free, fast, protects server IP).

─── 6A: Add Site to Cloudflare ───

1. Go to https://cloudflare.com → Add a Site
2. Enter: 4zone.store
3. Choose FREE plan
4. Cloudflare scans existing DNS records

─── 6B: Update Nameservers at Your .store Registrar ───

1. Cloudflare gives you 2 nameservers like:
   ada.ns.cloudflare.com
   bob.ns.cloudflare.com

2. Log in to your domain registrar (where you bought 4zone.store)
3. Find "Nameservers" or "DNS" settings
4. Replace existing nameservers with Cloudflare's two
5. Save — takes 5–60 minutes to propagate

─── 6C: Add DNS Records in Cloudflare ───

Go to Cloudflare → 4zone.store → DNS → Add Records:

For 4zone.store (landing page on Cloudflare Pages):
  Type: CNAME
  Name: @
  Target: 4zone-saas.pages.dev   ← your Cloudflare Pages URL
  Proxy: ON (orange cloud)

For www.4zone.store:
  Type: CNAME
  Name: www
  Target: 4zone-saas.pages.dev
  Proxy: ON

For app.4zone.store (React app):
  Type: CNAME
  Name: app
  Target: 4zone-app.pages.dev    ← your app Cloudflare Pages URL
  Proxy: ON

For api.4zone.store (Railway backend):
  Type: CNAME
  Name: api
  Target: xxx.up.railway.app     ← from Step 4D
  Proxy: ON  (or OFF if Railway SSL issues)

─── 6D: Enable HTTPS ───

In Cloudflare → SSL/TLS → Overview:
  Mode: Full (strict)

Cloudflare auto-provisions SSL certificates for all subdomains.
Your site will be HTTPS automatically!

─── 6E: Verify Everything Works ───

After DNS propagation (5–60 min):
  https://4zone.store          → Landing page ✓
  https://app.4zone.store      → React app ✓
  https://api.4zone.store/health → {"status":"ok"} ✓


## ═══════════════════════════════════════════
## STEP 7: CONFIGURE BACKEND ENV ON RAILWAY
## ═══════════════════════════════════════════

Update CORS in Railway env vars to match your real domains:
  FRONTEND_URL = https://4zone.store
  APP_URL = https://app.4zone.store

Redeploy Railway service after adding env vars.
Railway auto-redeploys when you push to main branch.


## ═══════════════════════════════════════════
## STEP 8: TEST ALL AI TOOLS
## ═══════════════════════════════════════════

Test each API endpoint:

  # Chat (Gemini)
  curl -X POST https://api.4zone.store/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello! Who are you?"}'

  # Image Generation
  curl -X POST https://api.4zone.store/api/image/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt":"a beautiful sunset over Phnom Penh"}'

  # Voice TTS
  curl -X POST https://api.4zone.store/api/voice/tts \
    -H "Content-Type: application/json" \
    -d '{"text":"Welcome to 4Zone AI platform","voice":"en-US-Neural2-F"}'


## ═══════════════════════════════════════════
## STEP 9: DAILY DEVELOPMENT WORKFLOW
## ═══════════════════════════════════════════

Make changes locally:
  cd backend && npm run dev     # starts nodemon for hot-reload
  
Push to GitHub:
  git add .
  git commit -m "feat: add new feature"
  git push origin main

Railway auto-deploys backend within ~2 minutes.
Cloudflare Pages auto-deploys frontend within ~1 minute.


## ═══════════════════════════════════════════
## STEP 10: FUTURE UPGRADES ROADMAP
## ═══════════════════════════════════════════

Phase 2 (When startup programs approved):
  □ ElevenLabs API → Replace Google TTS with premium voices
  □ OpenAI GPT-4o → Add as alternative chat model
  □ Stripe → Add real payment processing for Pro plan

Phase 3:
  □ PostgreSQL database (Railway add-on) → Real user accounts
  □ Redis → Session management & rate limiting per user
  □ Cloudflare R2 → Store generated images/videos for users

Phase 4:
  □ Mobile app (React Native)
  □ API access for developers
  □ Team/Enterprise plans


## ═══════════════════════════════════════════
## QUICK REFERENCE — IMPORTANT URLS
## ═══════════════════════════════════════════

  Google AI Studio:     https://aistudio.google.com
  Google Cloud Console: https://console.cloud.google.com
  Railway Dashboard:    https://railway.app/dashboard
  Cloudflare DNS:       https://dash.cloudflare.com
  GitHub Repo:          https://github.com/YOUR_USERNAME/4zone-saas
  Your API Health:      https://api.4zone.store/health


## ═══════════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════════

DNS not working?
  → Wait 30 min after nameserver change
  → Check at: https://dnschecker.org/#A/4zone.store

Railway deploy failed?
  → Check Logs tab in Railway dashboard
  → Most common: missing env variables

Gemini API error?
  → Verify API key in Google AI Studio
  → Check "Generative Language API" is enabled in Cloud Console

CORS error in browser?
  → Add your exact domain to CORS list in server.js
  → Redeploy after change

Image generation fails?
  → Imagen 3 may need Vertex AI (not just AI Studio)
  → Enable Vertex AI API in Cloud Console
  → Use your $300 credit
