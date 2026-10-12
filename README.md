# Chuy's Tires & Brake Service - Peak Performance Cloudflare Website

Welcome to the production repository for **Chuy's Tires & Brake Service**, designed with the unstoppable "Massive Action" mindset of Tony Robbins and engineered for blistering sub-second response times on **Cloudflare Pages**.

---

## 🏎️ Core Features
1. **Four Conversion-Focused Pages:**
   - `index.html`: High-impact hero, animated urgency countdown, live proof counters, instant quote trigger.
   - `services.html`: Tires, Brakes, and 3D Laser Alignment breakdown with interactive diagnostic tools.
   - `about.html`: Chuy's origin story, ASE Master Technicians, and the 100% Zero-Hesitation Guarantee.
   - `subscriptions.html`: Free, $35/mo Peak Performer (10% off brakes), and $50/mo Fleet Dominator tiers with live credit tracking.
2. **Dual TreadAI API Instant Quote Engine:**
   - Queries vehicle Year/Make/Model and Tire Size.
   - Runs a 4.5-second high-energy simulated/live diagnostic scan across TreadAI Pricing and TreadAI Compatibility endpoints.
   - Displays Good, Better, and Best options with real-time labor and brake add-ons.
3. **Cloudflare Serverless Edge Architecture:**
   - Serverless Function at `/functions/api/quote.js`.
   - Rate limiting and monthly quote credit tracking backed by Cloudflare KV.
   - Zero framework bloat (pure semantic HTML5 + Tailwind CSS CDN + vanilla ES6+ JavaScript).

---

## 🚀 Cloudflare Pages Deployment Guide

### Option 1: Deploy with Wrangler CLI (Fastest)
```bash
# 1. Install Wrangler if needed
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create your KV Namespace for quote credits
wrangler kv:namespace create QUOTE_CREDITS

# 4. Set your TreadAI Secret API Keys
wrangler pages secret put TREAD_AI_PRICING_API_KEY
wrangler pages secret put TREAD_AI_COMPAT_API_KEY

# 5. Deploy directly to Cloudflare Pages
wrangler pages deploy . --project-name chuys-tires-brakes
```

### Option 2: Deploy via GitHub / GitLab Integration
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Chuy's Tires & Brake Service"
   git branch -M main
   git remote add origin https://github.com/your-username/chuys-tires-brakes.git
   git push -u origin main
   ```
2. Open the [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your repository.
4. Set **Build command**: *(Leave blank)*
5. Set **Build output directory**: `/`
6. Under **Settings > Functions > KV namespace bindings**, bind `QUOTE_CREDITS` to your created KV namespace.
7. Under **Settings > Environment variables**, add:
   - `TREAD_AI_PRICING_API_KEY`
   - `TREAD_AI_COMPAT_API_KEY`
8. Click **Save and Deploy**!

---

## 🛠️ Local Development & Testing
Run locally using Wrangler:
```bash
wrangler pages dev .
```
Open `http://localhost:8788` in your browser. All pages, modals, and edge functions are fully live.
