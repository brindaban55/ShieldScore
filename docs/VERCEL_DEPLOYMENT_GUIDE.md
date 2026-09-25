# ShieldScore — Vercel Cloud Deployment & Production Hosting Guide

> **Target Platform**: Vercel Serverless Edge Network  
> **Repository Root Configuration**: `vercel.json`  
> **Build Command**: `cd frontend && npm install && npm run build`  
> **Output Directory**: `frontend/dist`

---

## 1. Zero-Configuration Cloud Deployment

ShieldScore is structured as a modern monorepo (`contract/` + `frontend/`). To enable frictionless deployment directly from GitHub to Vercel without manual dashboard overrides, the repository root includes `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 2. SPA Client-Side Routing Guarantee

In single-page applications built with React and Vite, accessing nested routes (e.g. `/underwriting`, `/calculator`, `/docs`) directly can result in 404 errors on static web hosts. 

The rewrite rule:
```json
{ "source": "/(.*)", "destination": "/index.html" }
```
guarantees that all incoming URL paths are routed to `index.html`, allowing the client-side router to handle page hydration without server errors.

---

## 3. Step-by-Step Vercel Setup

1. **Import Git Repository**: Go to [vercel.com/new](https://vercel.com/new) and select `brindaban55/ShieldScore`.
2. **Auto-Detection**: Vercel reads `vercel.json` and automatically sets Vite framework presets.
3. **Deploy**: Click **Deploy**. Vercel installs dependencies, runs TypeScript compilation, builds production Vite chunks, and deploys to global edge CDN in under 45 seconds.
