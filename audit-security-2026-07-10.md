# Security Audit Report: 3D Real Estate Property Viewer

**Audit Date:** July 10, 2026
**Codebase:** `/home/debiano/seed/ai-code/3dviewer`
**Version:** 0.1.0 (Phase 1 MVP — post-Tier-1 fixes)

---

## Executive Summary

**Overall Risk Rating: MEDIUM**

The codebase is a small, well-structured Phase 1 MVP with clean architecture separation. The recently applied **Tier 1 fixes** (URL sanitization, GPU memory cleanup, Page Visibility pause, pixel ratio cap) have addressed the most immediately exploitable attack vectors. However, **6 unresolved vulnerabilities** remain — the most serious being the absence of download-size validation and content-type checking before fetching potentially malicious models from user-supplied URLs.

### Top 3 Actions to Take

| # | Action | Severity | Effort |
|---|--------|----------|--------|
| 1 | Add model size limit — Check `Content-Length` before download; reject files > 50 MB | High | Low (~15 lines) |
| 2 | Add Content-Type validation — Verify response `Content-Type` is `model/gltf-binary` or extension is `.glb`/`.gltf` before parsing | High | Low (~10 lines) |
| 3 | Add rate limiting — Debounce Load button clicks; cap concurrent model fetches to 1 | Medium | Low (~10 lines) |

---

## What Was Fixed by Tier 1 Changes

| Fix | Files Changed | Status |
|-----|--------------|--------|
| URL sanitization — Reject non-http/https URL schemes | `src/ui.ts:14-23`, `src/modelLoader.ts:6-18` | Correctly implemented — validates twice (UI + loader) |
| GPU memory cleanup — Dispose geometries, materials, textures on model swap | `src/main.ts:13-34` (`disposeMaterial` + `disposeModel`) | Correctly implemented |
| Page Visibility API pause — Stop rAF when tab hidden | `src/main.ts:84-92` | Correctly implemented |
| devicePixelRatio cap — `Math.min(devicePixelRatio, 2)` | `src/viewer.ts:19` | Correctly implemented |

---

## Vulnerability Findings

### HIGH SEVERITY

#### [H-01] No model size validation before download

| Field | Detail |
|-------|--------|
| **File:Line** | `src/main.ts:49`, `src/modelLoader.ts:19` |
| **Description** | When the user clicks "Load" with an external URL, the application fetches the URL without checking `Content-Length`. An attacker could provide a URL pointing to a multi-gigabyte file, causing client-side memory exhaustion, browser tab crash, or denial of service. |
| **Planned in ROADMAP?** | Yes — Phase 2 P1: "Model size limit" |
| **Remediation** | Before calling `loader.loadAsync(url)`, perform a HEAD/GET request to check `Content-Length`. Reject files > 50 MB. |

#### [H-02] No Content-Type validation of fetched model

| Field | Detail |
|-------|--------|
| **File:Line** | `src/modelLoader.ts:19` |
| **Description** | The application does not verify the `Content-Type` of the fetched file before passing it to the GLTF parser. An attacker could serve a non-model file (malicious HTML, JavaScript, or crafted binary) disguised at a model URL. |
| **Planned in ROADMAP?** | Yes — Phase 3 P1: "Content-type check" |
| **Remediation** | Use a `fetch` interceptor to check `Content-Type` (or file extension) before passing to `GLTFLoader.loadAsync`. |

#### [H-03] Potential prototype pollution via GLB `extras` / `userData`

| Field | Detail |
|-------|--------|
| **File:Line** | `src/main.ts:27-34` |
| **Description** | Three.js stores GLTF `extras` directly into `Object.userData` on each parsed node. A malicious GLB with keys like `__proto__` or `constructor` could pollute `Object.prototype`. |
| **Planned in ROADMAP?** | Yes — Phase 3 P2: "Model traversal safety" |
| **Remediation** | After loading, traverse the model group and strip `userData` from all nodes, or sanitize keys. |

### MEDIUM SEVERITY

#### [M-01] No rate limiting on Load button / concurrent fetch caps

| Field | Detail |
|-------|--------|
| **File:Line** | `src/ui.ts:11-25`, `src/main.ts:46-56` |
| **Description** | No debouncing or rate limiting on the "Load" button. Rapid clicking triggers multiple simultaneous `loadModel(url)` calls. |
| **Planned in ROADMAP?** | Yes — Phase 3 P1: "Rate limiting" |
| **Remediation** | Disable Load button while loading; add debounce; maintain a loading flag. |

#### [M-02] GLTFLoader parses user-supplied binary data

| Field | Detail |
|-------|--------|
| **File:Line** | `src/modelLoader.ts:19` |
| **Description** | The GLTFLoader is a large codebase implementing a complex binary format parser. Any parser vulnerability is directly exploitable since the model URL is user-controlled. |
| **Planned in ROADMAP?** | Yes — Phase 3 P3: "Model sandboxing" |
| **Remediation** | Keep Three.js updated; implement model sandboxing (Phase 3 P3); add SRI for bundled models. |

#### [M-03] Architecture rule violation: `main.ts` imports Three.js types

| Field | Detail |
|-------|--------|
| **File:Line** | `src/main.ts:1` — `import { Group, Mesh } from 'three'` |
| **Description** | AGENTS.md states "All Three.js code stays inside `src/viewer.ts` and `src/controls.ts`". `main.ts` imports `Group` and `Mesh` and uses `instanceof Mesh`. |
| **Remediation** | Move `disposeModel` and `disposeMaterial` into `viewer.ts` and export a `disposeSceneObject` function. |

#### [M-04] No Content-Security-Policy protection

| Field | Detail |
|-------|--------|
| **File:Line** | `index.html` (no CSP meta tag) |
| **Description** | No Content-Security-Policy header or meta tag. If any DOM-injection vulnerability were found, there is no CSP to limit the damage. |
| **Remediation** | Add CSP meta tag: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; connect-src 'self' https:; img-src 'self' data:;">` |

### LOW SEVERITY

#### [L-01] Information disclosure via model URL requests

| Field | Detail |
|-------|--------|
| **File:Line** | `src/modelLoader.ts:19` |
| **Description** | External model URLs reveal the user's IP address, User-Agent, and browser fingerprint to third-party servers. |
| **Remediation** | Add a UI warning; consider a server-side proxy (Phase 5). |

#### [L-02] No `userData` sanitization on loaded model

| Field | Detail |
|-------|--------|
| **File:Line** | `src/main.ts:36-43` |
| **Description** | GLTF `extras` stored in `Object.userData` could contain large embedded payloads consuming memory. |
| **Planned in ROADMAP?** | Yes — Phase 3 P2 |
| **Remediation** | In `setModel`, traverse and call `child.userData = {}` to strip all extras. |

#### [L-03] Source map generation enabled in `tsconfig.json`

| Field | Detail |
|-------|--------|
| **File:Line** | `tsconfig.json:15` |
| **Description** | `"sourceMap": true` in production config could expose source code if the Vite build step fails. |
| **Remediation** | Set `"sourceMap": false` in `tsconfig.json` or use separate tsconfig files for dev/prod. |

#### [L-04] Missing global error boundary

| Field | Detail |
|-------|--------|
| **File:Line** | `src/main.ts:94` |
| **Description** | No `window.onerror` or `unhandledrejection` handler. A crash in the render loop would leave a blank page. |
| **Planned in ROADMAP?** | Yes — Phase 3 P0 |
| **Remediation** | Add global error handlers that call `setStatus()` with a user-friendly message. |

---

## ROADMAP Phase 3 Security Progress

| Planned Action | Priority | Status | Finding Ref |
|---------------|----------|--------|-------------|
| URL sanitization | P0 | Done (Tier 1) | Fixed |
| Error boundaries (onerror, unhandledrejection) | P0 | Not done | L-04 |
| Content-type check | P1 | Not done | H-02 |
| CORS validation (graceful error) | P1 | Not done | Generic error only |
| Rate limiting (debounce, cap 1) | P1 | Not done | M-01 |
| Model traversal safety (strip userData) | P2 | Not done | H-03, L-02 |
| Subresource Integrity (SRI for bundled model) | P2 | Not done | Suggestion only |
| Model sandboxing (sandboxed iframe) | P3 | Not done | M-02 |

**Progress:** 1/8 Phase 3 actions completed (12.5%)

---

## Files Scan Summary

| File | Lines | Issues Found | Risk Level |
|------|-------|-------------|------------|
| `src/main.ts` | 94 | 4 | Medium |
| `src/viewer.ts` | 46 | 1 | Low |
| `src/controls.ts` | 33 | 0 | None |
| `src/modelLoader.ts` | 21 | 3 | High |
| `src/ui.ts` | 43 | 1 | Medium |
| `index.html` | 73 | 1 | Medium |
| `vite.config.ts` | 9 | 0 | None |
| `tsconfig.json` | 18 | 1 | Low |
| `package.json` | 19 | 0 | None |

**Total unique findings:** 11 (3 High, 4 Medium, 4 Low)
**Already fixed by Tier 1:** 4 issues

---

## Final Recommendations

### Immediate (Fix within 1 sprint)
1. Add model size limit — Check `Content-Length` before downloading (H-01)
2. Add Content-Type validation — Verify response content type (H-02)
3. Strip userData on model load — Prevent prototype pollution and data embedding (H-03)

### Short-term (Fix within 2 sprints)
4. Add rate limiting / debounce on Load button (M-01)
5. Add global error boundary — `window.onerror` + `unhandledrejection` (L-04)
6. Add CSP meta tag to `index.html` (M-04)

### Architecture (Refactor)
7. Move `disposeModel` to `viewer.ts` — Fix architecture violation (M-03)
8. Set `sourceMap: false` in production tsconfig (L-03)

### Long-term (Phase 3 alignment)
9. Add CORS-specific error messaging (Phase 3 P1)
10. Implement model sandboxing via iframe (Phase 3 P3)
11. Add Subresource Integrity for bundled `sample.glb` (Phase 3 P2)

---

*End of Audit Report*
