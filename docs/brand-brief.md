# ShieldScore — Brand Identity & Visual Design Brief

> **Document Type:** Production Design Brief & Asset Specification  
> **Target Audience:** UI/UX Engineers, Hackathon Evaluators, Midnight Ecosystem Builders  
> **Brand Atmosphere:** Institutional Dark Cyberpunk Fintech • Zero-Knowledge Cryptography • Obsidian Depth

---

## 1. Brand Mission & Core Identity

**ShieldScore** is an institutional-grade, zero-knowledge financial eligibility and credit passport protocol. Our visual identity rejects generic "AI-generated" purplish templates in favor of a bespoke, tactile, and highly authoritative dark fintech design language. 

Every design decision reinforces the dual-state architectural truth of Midnight:
1. **The Dark Vault (Client Privacy):** Deep obsidian tones (`#070B12`, `#0D131F`) representing confidential, unexposed client memory.
2. **The Cryptographic Bridge (SNARKs):** High-frequency luminous cyan (`#06B6D4`) and neural violet (`#8B5CF6`) depicting mathematical zero-knowledge proof generation.
3. **The Settlement Ledger (Public Truth):** Sharp, verified emerald green (`#10B981`) and tabular monospace figures symbolizing immutable on-chain consensus.

---

## 2. Core Visual Assets

### A. Bespoke 3D AI-Generated Assets
* **Logo (`frontend/public/shieldscore_logo.jpg`)**: A 3D iridescent cyan shield with embedded cryptographic circuit traces and an internal zero-knowledge light core.
* **Hero Banner (`frontend/public/hero_banner.jpg`)**: An isometric spatial visualization displaying the dual-state model: Client Vault on the left, Proving Ring in the center, and Midnight Public Ledger on the right.
* **Fintech Background (`frontend/public/app_background.jpg`)**: A cinematic 16:9 8K dark neural circuit texture with obsidian depth and volumetric cyan-violet ambient glows.

### B. Interactive 3D Holographic Shield
Rendered client-side via **React Three Fiber** and **Three.js** in [`HolographicShield.tsx`](../frontend/src/components/HolographicShield.tsx):
* Real-time vertex wobble and rotation driven by user mouse / touch gestures.
* Procedural Fresnel shader simulating a zero-knowledge containment field.

---

## 3. Color Palette & Design Tokens

```css
/* Core Palette Tokens */
--color-obsidian-950: #070B12;  /* Deepest viewport canvas */
--color-obsidian-900: #0D131F;  /* Card and panel backgrounds */
--color-obsidian-800: #141C2E;  /* Elevated dropdowns and modals */

--color-cyan-glow:    #06B6D4;  /* Active circuits, highlights, primary CTAs */
--color-cyan-dim:     #0891B2;  /* Secondary states and borders */
--color-violet-core:  #8B5CF6;  /* ZK SNARK provers and commitment hashes */
--color-emerald-pass: #10B981;  /* On-chain verified states, Tier A badge */
--color-amber-warn:   #F59E0B;  /* Near-prime Tier C cautions */
```

### Specular Glass Borders
All interactive cards use 1px specular gradient borders (`from-white/15 via-white/[0.04] to-transparent`) coupled with subtle backdrop blur (`backdrop-blur-md`), producing physical depth without visual clutter.

---

## 4. Typographic Hierarchy

| Role | Font Family | Weights | Intended Use |
| :--- | :--- | :---: | :--- |
| **Display Headings** | **Syne** / **Space Grotesk** | 700, 800 | Hero titles, modal titles, brand logos, primary button CTAs. Stark geometric authority. |
| **Interface Body** | **Inter** | 400, 500, 600 | Informational copy, policy thresholds, witness explanations, privacy guarantees. |
| **Cryptographic & Financial Figures** | **JetBrains Mono** | 500, 700 | Hex addresses, Pedersen commitments, APR percentages, and tabular loan calculations (`tabular-nums`). |
| **Micro-Kickers & Overlines** | **Space Grotesk** | 600 | Tracked-out uppercase kickers (`tracking-widest text-[10px] uppercase text-cyan-400`). |

---

## 5. Motion & Tactile Physics (Framer Motion)

* **Sliding Pill Indicator (`layoutId="activeTabPill"`)**: Fluid spring-physics tab indicator (`stiffness: 400, damping: 30`) that glides seamlessly under the active navigation item.
* **Spring-Physics Tactile Feedback**:
  * Micro-hover scale: `whileHover={{ scale: 1.02 }}`
  * Micro-tap compression: `whileTap={{ scale: 0.96 }}`
* **Page Transitions (`AnimatePresence mode="wait"`)**: Smooth directional cross-fade (`opacity: 0, y: 8` ➔ `opacity: 1, y: 0`) when switching tabs.

---

## 6. Hardware & Mobile Responsiveness

ShieldScore adheres to the **Mobile-First Responsive Protocol**:
* **Touch Device Detection**: Dynamically inspects `navigator.maxTouchPoints > 0` and CSS `pointer: coarse`.
* **Adaptive Navigation**: Switches automatically from top desktop tabs to a tactile bottom drawer on mobile viewport widths (`< 768px`).
* **Mobile Wallet Routing**: Detects iOS / Android operating systems and provides one-tap deep linking to **1AM Wallet App** or Google Play / Apple App Store downloads.
