# ROADMAP.md — 3D Real Estate Property Viewer

## Current State (Phase 1 — MVP) ✓

Lean, single-responsibility architecture with clean separation:
- Three.js scene, camera, renderer with 3-point lighting
- OrbitControls with damping + Reset Camera
- GLTF/GLB async loader (URL + bundled demo model)
- All Three.js code isolated in `viewer.ts` + `controls.ts`
- `ui.ts` imports zero Three.js — pure DOM callbacks
- `modelLoader.ts` returns `Group`, never touches scene
- Single `requestAnimationFrame` loop
- No extra npm packages beyond `three` + `@types/three`

### Files delivered
| File | Purpose |
|---|---|
| `AGENTS.md` | Project rules, conventions, scope, scaling path |
| `package.json` | pnpm, Vite, TypeScript, Three.js deps |
| `tsconfig.json` | Strict TypeScript config |
| `vite.config.ts` | Vite config |
| `index.html` | Host page with styled UI overlay |
| `src/viewer.ts` | Scene, camera, renderer, lighting |
| `src/controls.ts` | OrbitControls + reset camera |
| `src/modelLoader.ts` | GLTF/GLB async loader |
| `src/ui.ts` | URL input, Load/Reset buttons, status bar |
| `src/main.ts` | Entry point, wiring, animate loop, model tracking |
| `public/models/sample.glb` | Demo model (Khronos DamagedHelmet) |

---

## Phase 2 — Performance

| Priority | Area | Action | Rationale |
|---|---|---|---|
| P0 | **Canvas throttling** | Pause `requestAnimationFrame` via Page Visibility API | 0% CPU when tab is hidden |
| P0 | **Memory cleanup** | Dispose geometries, materials, textures on model swap | Three.js does not GC GPU resources automatically |
| P1 | **Pixel ratio cap** | `Math.min(devicePixelRatio, 2)` | 3× ratio on retina phones costs battery with negligible visual gain |
| P1 | **Model size limit** | Warn/block models > 50 MB; check `Content-Length` before download | Prevent memory exhaustion on low-end devices |
| P1 | **Loading progress** | Track `onProgress` in GLTFLoader, show percentage | User sees download progress instead of infinite spinner |
| P2 | **DRACO decompression** | Bundle DRACO loader for compressed `.glb` | Compressed models are 10-20× smaller on wire |
| P2 | **Texture downscaling** | Downscale textures > 2048² on load | Mobile GPU memory is limited |
| P2 | **LOD** | `THREE.LOD` for distant models (future multi-model) | Skip rendering high-poly at distance |
| P3 | **Object pooling** | Reuse geometries/materials across model swaps | Prevent GC pauses |
| P3 | **CDN caching** | `Cache-Control: public, max-age=31536000` for bundled models | Skip re-download on repeat visits |

---

## Phase 3 — Security

| Priority | Area | Action | Rationale |
|---|---|---|---|
| P0 | **URL sanitization** | Strip `javascript:`, `data:`, `file:` schemes from model URL | Prevent XSS through malicious URLs |
| P0 | **Error boundaries** | Catch `onerror`, `unhandledrejection`, render crashes | Prevent blank white page |
| P1 | **Content-type check** | Verify `Content-Type` is `model/gltf-binary` (or extension is `.glb`) | Prevent HTML/JS disguised as model |
| P1 | **CORS validation** | Graceful error message on CORS block instead of silent failure | Informative feedback to user |
| P1 | **Rate limiting** | Debounce rapid Load clicks; cap concurrent fetches to 1 | Prevent request storms |
| P2 | **Model traversal safety** | Recursively strip `userData`, event handlers from imported group | Malicious models could embed scripts in extras |
| P2 | **Subresource Integrity** | Optional SRI hash for bundled demo model | Tamper detection |
| P3 | **Model sandboxing** | Load model in sandboxed iframe (future feature) | Isolate model processing from main page |

---

## Phase 4 — Features & Polish

| Priority | Area | Action |
|---|---|---|
| P0 | **Accessibility** | `aria-label` on canvas, keyboard shortcuts for zoom/rotate |
| P0 | **Fallback model** | Show placeholder geometry (simple box) if demo model fails to load |
| P1 | **Grid / ground plane** | Toggleable grid helper for spatial reference |
| P1 | **Auto-rotation** | Toggle button for slow model auto-rotation |
| P1 | **Model info** | Display model triangle count, material count, file size after load |
| P2 | **Measurement tool** | Click-to-measure distance between two points on model |
| P2 | **Property info overlay** | Side panel with property metadata bound to model |
| P3 | **Floor plan sync** | 2D floor plan overlay that highlights rooms in 3D view |
| P3 | **Multi-floor navigation** | Floor switcher with cross-section view |
| P4 | **Multi-room hotspots** | Clickable rooms with orbit-to animation |
| P4 | **Backend integration** | Model catalog, user accounts, saved tours |

---

## Security Threat Model

| Threat | Risk | Mitigation | Phase |
|---|---|---|---|
| Malicious GLB with embedded JS | Medium | Content-type check + script removal | P3 |
| XSS through model URL | High | URL sanitization | P3 |
| CORS proxy abuse | Low | Rate limiting + origin validation | P3 |
| Memory exhaustion | Medium | Size caps + DRACO + proper disposal | P2 |
| GPU timer side-channel | Low | Out of scope for MVP | — |
| Model data exfiltration | Low | CORS prevents reading response in most cases | P3 |

---

## Key Architecture Invariants

These must hold across all phases:
- Three.js imports stay in `viewer.ts` / `controls.ts` / `modelLoader.ts`
- `ui.ts` never imports Three.js
- Single `requestAnimationFrame` loop in `main.ts`
- One model loaded at a time; loading a new model replaces the current one
- No npm packages beyond `three`, `@types/three`, and `gsap` without explicit approval
