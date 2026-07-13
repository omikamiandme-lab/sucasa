# ROADMAP.md — 3D Real Estate Property Viewer

## Current State (Phase 1 + Phase 4 P0/P1) ✓

Lean, single-responsibility architecture with clean separation:
- Three.js scene, camera, renderer with 3-point lighting
- OrbitControls with damping, Reset Camera, and auto-rotation toggle
- Bundled demo GLTF model loaded on startup (Tiny Treats House, 215 KB)
- Fallback procedural model if GLTF load fails
- Toggleable grid / ground plane
- Model info overlay (tris/verts/materials)
- Loading progress indicator
- Keyboard shortcuts (R=reset, G=grid, Space=auto-rotate)
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
| `index.html` | Host page with styled toolbar + status overlays |
| `src/viewer.ts` | Scene, camera, renderer, lighting, grid toggle, fallback model, texture downscaling |
| `src/controls.ts` | OrbitControls + reset + auto-rotate |
| `src/modelLoader.ts` | GLTF/GLB async loader with progress |
| `src/ui.ts` | Reset/Grid/AutoRotate buttons, status bar, model info |
| `src/main.ts` | Entry point, wiring, animate loop, model tracking, keyboard shortcuts |
| `public/models/sample.gltf` | Demo model (Tiny Treats Homely House, CC0) |
| `public/models/sample.bin` | Buffer data for demo model |
| `public/models/tiny_treats_texture_1.png` | Texture for demo model |

### Session History
| Session | Highlights |
|---|---|
| Phase 1 (initial) | MVP: scene, camera, OrbitControls, GLTF loader, URL input, reset |
| 2026-07-10 | Replaced model (3.6 MB → 215 KB), fallback model, grid toggle, auto-rotate, model info, a11y, texture downscaling, loading progress, Page Visibility, disposal, removed URL input |
| 2026-07-13 | Docs cleanup; property info overlay |

---

## Phase 2 — Performance

| Priority | Area | Action | Rationale | Status |
|---|---|---|---|---|
| P0 | **Canvas throttling** | Pause `requestAnimationFrame` via Page Visibility API | 0% CPU when tab is hidden | ✅ Done |
| P0 | **Memory cleanup** | Dispose geometries, materials, textures on model swap | Three.js does not GC GPU resources automatically | ✅ Done |
| P1 | **Pixel ratio cap** | `Math.min(devicePixelRatio, 2)` | 3× ratio on retina phones costs battery with negligible visual gain | ✅ Done |
| P1 | **Loading progress** | Track `onProgress` in GLTFLoader, show percentage | User sees download progress instead of infinite spinner | ✅ Done |
| P2 | **Texture downscaling** | Downscale textures > 2048² on load | Mobile GPU memory is limited | ✅ Done |
| P2 | **DRACO decompression** | Bundle DRACO loader for compressed `.glb` | Compressed models are 10-20× smaller on wire | ❌ |
| P2 | **LOD** | `THREE.LOD` for distant models (future multi-model) | Skip rendering high-poly at distance | ❌ |
| P3 | **Object pooling** | Reuse geometries/materials across model swaps | Prevent GC pauses | ❌ |
| P3 | **CDN caching** | `Cache-Control: public, max-age=31536000` for bundled models | Skip re-download on repeat visits | ❌ |

**Note:** P1 Model size limit, Content-type check, CORS validation, Rate limiting — all skipped as moot (URL input was removed in session 2026-07-10; viewer now loads a single bundled model).

---

## Phase 3 — Security

| Priority | Area | Action | Rationale | Status |
|---|---|---|---|---|
| P0 | **Error boundaries** | Catch `onerror`, `unhandledrejection`, render crashes | Prevent blank white page | ✅ Done |
| P2 | **Model traversal safety** | Recursively strip `userData`, event handlers from imported group | Malicious models could embed scripts in extras | ✅ Done |
| P2 | **Subresource Integrity** | Optional SRI hash for bundled demo model | Tamper detection | ❌ |
| P3 | **Model sandboxing** | Load model in sandboxed iframe (future feature) | Isolate model processing from main page | ❌ |

**Note:** URL sanitization, Content-type check, CORS validation, Rate limiting — all moot (URL input removed).

---

## Phase 4 — Features & Polish

| Priority | Area | Action | Status |
|---|---|---|---|
| P0 | **Accessibility** | `aria-label` on canvas, keyboard shortcuts (R/G/Space) | ✅ Done |
| P0 | **Fallback model** | Show procedural house geometry if demo model fails to load | ✅ Done |
| P1 | **Grid / ground plane** | Toggleable grid helper + semi-transparent ground plane | ✅ Done |
| P1 | **Auto-rotation** | Toggle button + Space key for slow model auto-rotation | ✅ Done |
| P1 | **Model info** | Display triangle count, vertex count, material count | ✅ Done |
| P2 | **Property info overlay** | Side panel with property metadata bound to model | ✅ Done |
| P2 | **Measurement tool** | Click-to-measure distance between two points on model | ❌ |
| P3 | **Floor plan sync** | 2D floor plan overlay that highlights rooms in 3D view | ❌ |
| P3 | **Multi-floor navigation** | Floor switcher with cross-section view | ❌ |
| P4 | **Multi-room hotspots** | Clickable rooms with orbit-to animation | ❌ |
| P4 | **Backend integration** | Model catalog, user accounts, saved tours | ❌ |

---

## Security Threat Model

| Threat | Risk | Mitigation | Phase |
|---|---|---|---|
| Malicious GLB with embedded JS | Medium | Strip userData on load | P3 ✅ |
| XSS through model URL | High | Moot (URL input removed) | — |
| CORS proxy abuse | Low | Moot (no external loading) | — |
| Memory exhaustion | Medium | Proper disposal + texture downscaling | P2 ✅ |
| GPU timer side-channel | Low | Out of scope for MVP | — |
| Model data exfiltration | Low | CORS prevents reading response | P3 |

---

## Key Architecture Invariants

These must hold across all phases:
- Three.js imports stay in `viewer.ts` / `controls.ts` / `modelLoader.ts`
- `ui.ts` never imports Three.js
- Single `requestAnimationFrame` loop in `main.ts`
- One model loaded at a time; loading a new model replaces the current one
- No npm packages beyond `three`, `@types/three`, and `gsap` without explicit approval
