# AGENTS.md — 3D Real Estate Property Viewer

## Project Overview
A web-based 3D viewer for real estate properties, built with Three.js. Allows users to view and inspect 3D models of properties in the browser with standard orbit controls.

## Tech Stack
- **Runtime:** Node.js (LTS)
- **Package Manager:** pnpm (not npm)
- **Bundler:** Vite
- **Language:** TypeScript (strict mode)
- **3D Engine:** Three.js (via npm)
- **Camera Controls:** Three.js OrbitControls
- **Animation (optional):** GSAP (pre-approved if needed)

## Project Structure
```
src/
├── main.ts           # Entry point, wires everything together
├── viewer.ts         # Scene, camera, renderer, lighting
├── controls.ts       # OrbitControls + reset camera logic
├── modelLoader.ts    # GLTF/GLB loading (bundled)
└── ui.ts             # DOM element creation & event binding

public/
└── models/           # Bundled sample models
```

## Coding Conventions
- **No comments in source code** unless explaining a non-obvious workaround or business rule.
- Use named exports, no default exports.
- Prefer interfaces over types for object shapes.
- Filenames are camelCase.
- Every file has a single responsibility.
- Errors are thrown, not swallowed silently. Use `console.error` in UI handlers, not in library logic.

## Package Discipline
- **Prefer zero-dependency solutions.** If a problem can be solved with a single file or <50 lines of custom code, write it — don't install a package.
- Only `three`, `@types/three`, and `gsap` (if needed) are pre-approved.
- **Any other package must be explicitly approved by me first.** This includes loaders, UI libraries, CSS frameworks, state management, etc.
- During development, `vite` and `typescript` are dev dependencies — this does not require approval.

## MVP Scope (Phase 1)
- 3D scene with perspective camera, ambient + directional lighting.
- OrbitControls for drag-to-rotate, scroll-to-zoom, right-click-to-pan.
- Load a demo `.gltf`/`.glb` model from `public/models/` on startup.
- Fallback procedural model if demo load fails.
- Reset Camera button that returns the view to the default position.
- Toggleable grid / ground plane for spatial reference.
- Auto-rotation toggle (button + Space key).
- Model info overlay (triangle, vertex, material count).
- Keyboard shortcuts: R (reset), G (grid), Space (auto-rotate).
- Responsive canvas (fills viewport, handles window resize).

## Explicitly Out of Scope (Phase 1)
- Floor plans or 2D view toggle.
- Multi-model or multi-floor navigation.
- Hotspots, room-by-room tours.
- Measurement tools.
- PDF/image export.
- Server-side rendering or SSR.
- State management library (Redux, Zustand, etc.).
- CSS framework or component library.
- Authentication or user accounts.

## Architecture Rules & Limitations
- All Three.js code stays inside `src/viewer.ts` and `src/controls.ts` — no leaking Three.js imports into UI or entry-point code.
- `modelLoader.ts` returns a Three.js `Group`; it never touches the scene directly.
- `ui.ts` never imports Three.js — it only calls callbacks provided by `main.ts`.
- Only one model loaded at a time. Loading a new model replaces the current one.
- The render loop uses `requestAnimationFrame` inside a single `animate()` in `main.ts`.
- No external model hosting — sample models are bundled in `public/models/`.

## Scaling Path (Future Phases)
- Phase 2 (ongoing): Performance — DRACO decompression, LOD, object pooling, CDN caching.
- Phase 3 (ongoing): Security — Subresource Integrity, model sandboxing.
- Phase 4 (ongoing): Features & Polish — measurement tool, floor plan sync, multi-floor navigation, room hotspots.
- Phase 5: Backend integration for model catalog, user accounts, saved tours.

## Testing
- Not in MVP scope. When added, use Vitest (native Vite integration).
- Tests live in `src/**/*.test.ts` colocated with source files.
