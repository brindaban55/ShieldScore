# ShieldScore — Three.js Holographic Shield Visualizer & WebGL Terminal Styling

> **Visual Paradigm**: Cyberpunk Fintech Terminal with Avant-Garde Holographic Geometry  
> **Rendering Technology**: WebGL via Three.js (`@react-three/fiber` / Vanilla Three.js)  
> **Component**: `Shield3D.tsx` & Framer Motion Transitions

---

## 1. Visual Design Language

ShieldScore rejects conventional, sterile DeFi dashboards in favor of an institutional cybersecurity terminal:
- **Primary Accent**: Electric Cyan (`#00F0FF`) signifying cryptographic integrity.
- **Secondary Glow**: Neon Violet (`#792EE5`) representing Midnight Network zero-knowledge computation.
- **Background**: Deep Obsidian (`#060813`) with full-bleed atmospheric textures.
- **Typography**: Syne avant-garde geometric headers paired with Inter tabular numeric data.

---

## 2. Three.js Particle Geometry & Shader Loop

In `Shield3D.tsx`, the holographic shield is generated using 1,200 floating vertices arranged in a dual-layer parabolic shield shape:

```typescript
// Particle generation loop
const particleCount = 1200;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const v = Math.random();
  // Curvature formula for parabolic shield contour
  const x = Math.sin(theta) * (1 - v * 0.3) * 1.8;
  const y = (v - 0.5) * 2.8 - (x * x) * 0.15;
  const z = Math.cos(theta) * 0.4 * (1 - v * 0.5);

  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
}
```

---

## 3. Reactive State Micro-Interactions

The 3D shield dynamically reacts to user actions:
- **Idle State**: Slow 0.005 rad/frame continuous axial rotation.
- **Proving State**: Rotation velocity triples to 0.025 rad/frame; particle colors pulse between cyan and midnight purple.
- **Verified State**: Particles converge inward, releasing a brief holographic shockwave pulse across the canvas.
