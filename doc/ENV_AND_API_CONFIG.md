# Environment and API / Image URL Configuration

This document describes how the user-app is configured **only via environment variables**: API base URL, image URLs, and Content-Security-Policy (CSP) for images. No hardcoded API or image URLs; update your `.env` files per environment.

---

## Overview

- **Single source:** `VITE_APP_BASE_URL` in `.env` (or `.env.development`, `.env.qa`, `.env.production`) drives both API calls and image origin.
- **CSP:** Image origins for CSP are injected at **build time** from `VITE_APP_BASE_URL` (via `vite.config.ts`), so the first CSP the browser sees already allows your API/image server.
- **Optional:** `VITE_CSP_IMG_SRC` can override image origins for CSP when needed (e.g. separate S3/CDN).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| **VITE_APP_BASE_URL** | Yes | Full API base URL (e.g. `http://localhost:3000/api` or `https://api.example.com/api`). Used for all API requests and to derive the image server origin for CSP. Must be an **absolute URL** for CSP image origins to be injected. |
| **VITE_CSP_IMG_SRC** | No | Space-separated list of origins allowed for `img-src` in CSP. If unset, the origin is derived from `VITE_APP_BASE_URL` (see Vite plugin below). Set only when you need to allow extra origins (e.g. S3 bucket) or when using a relative `VITE_APP_BASE_URL` (e.g. `/api`). |
| VITE_APP_API_KEY | No | API key if your backend requires it. |
| VITE_GOOGLE_CLIENT_ID, VITE_APPLE_CLIENT_ID, VITE_USE_COOKIE_AUTH | No | Auth-related; see `.env.example`. |

**Vite loads env in order:** `.env` → `.env.[mode]` (e.g. `.env.development`) → `.env.local` (overrides). Restart the dev server after changing any env file.

---

## How the API Base URL Is Used

- **Config:** `src/config/api.ts` reads `VITE_APP_BASE_URL` and exports `baseApiUrl` and `getServerOrigin()`.
- **API calls:** `src/services/api/networkClient.ts` uses `baseApiUrl` as Axios `baseURL`, so all API requests go to the configured server (e.g. `GET ${baseApiUrl}/users/profile`).
- **Development fallback:** If `VITE_APP_BASE_URL` is not set in development, the config uses `http://localhost:3000/api` so API calls don’t hit the app origin (e.g. port 5174). A console warning is shown; set the env var and restart the dev server to use your intended API.

---

## How Image URLs Work

- **Relative paths from API:** When the backend returns a path (e.g. `/uploads/posts/.../file.jpg`), the app uses `getFullImageUrl(path)` from `@/lib/util/imageUrl`, which prepends the **server origin** derived from `VITE_APP_BASE_URL` (e.g. `http://localhost:3000`).
- **Full URLs from API:** If the backend returns a full URL (e.g. `https://salon-development.s3.amazonaws.com/...`), `getFullImageUrl()` returns it unchanged. CSP allows all `https:` origins for images, so S3/CDN URLs work without extra config.

**Usage in code:**

```ts
import { getFullImageUrl } from '@/lib/util/imageUrl'

<Avatar src={getFullImageUrl(user.avatar)} />
<img src={getFullImageUrl(post.image)} />
```

---

## CSP and the Vite Plugin

- **Problem:** The browser applies the first CSP it sees (from `index.html`). Changing the CSP meta tag later in JavaScript does not re-apply the policy, so image origins must be in the **initial** HTML.
- **Solution:** `vite.config.ts` uses a small plugin that:
  1. Reads env via `loadEnv(mode, process.cwd(), '')`.
  2. Computes image origins with `getCspImgOrigins(env)`: if `VITE_APP_BASE_URL` is set and is an absolute URL, it returns `new URL(base).origin` (e.g. `http://localhost:3000`).
  3. Replaces the placeholder `__CSP_IMG_ORIGINS__` in `index.html` with that value, so the served HTML already has the correct `img-src` (e.g. `'self' data: https: blob: http://localhost:3000`).

**Note:** `getCspImgOrigins` only supports **absolute** `VITE_APP_BASE_URL`. If you use a relative URL (e.g. `/api`), the function returns `''` and no extra image origin is injected; set `VITE_CSP_IMG_SRC` in env if you need specific image origins in that case.

---

## Per-Environment Examples

**Local (development)**

```env
VITE_APP_BASE_URL=http://localhost:3000/api
```

**QA / staging**

```env
VITE_APP_BASE_URL=https://api-qa.yourdomain.com/api
```

**Production**

```env
VITE_APP_BASE_URL=https://api.yourdomain.com/api
```

**AWS dev API (and S3 images)**

```env
VITE_APP_BASE_URL=https://your-aws-dev-api-url.com/api
```

S3 full URLs (e.g. `https://salon-development.s3.amazonaws.com/...`) work without `VITE_CSP_IMG_SRC` because CSP allows `https:` for images.

**Optional: restrict image origins**

```env
VITE_CSP_IMG_SRC=https://salon-development.s3.amazonaws.com https://cdn.example.com
```

(Requires adding `VITE_CSP_IMG_SRC` support back into the Vite plugin if you removed it; otherwise use only `VITE_APP_BASE_URL` and rely on `https:` for S3.)

---

## Files Involved

| File | Role |
|------|------|
| `.env`, `.env.development`, `.env.qa`, `.env.production` | Define `VITE_APP_BASE_URL` (and optional `VITE_CSP_IMG_SRC`) per environment. |
| `.env.example` | Template and examples; copy to `.env` or `.env.local`. |
| `src/config/api.ts` | Reads env, exports `baseApiUrl`, `getServerOrigin()`, `getCspImgSrc()`, `getCspContent()`. |
| `src/lib/util/imageUrl.ts` | `getFullImageUrl(path)` — builds full image URL from path or returns full URL as-is. |
| `vite.config.ts` | `getCspImgOrigins(env)` and HTML transform plugin replace `__CSP_IMG_ORIGINS__` in `index.html`. |
| `index.html` | CSP meta tag contains `img-src ... __CSP_IMG_ORIGINS__`; replaced at build/dev server start. |

---

## Checklist

1. Set **VITE_APP_BASE_URL** to your API base URL (absolute) in the appropriate `.env` file.
2. Restart the dev server after changing env.
3. For relative `VITE_APP_BASE_URL` (e.g. `/api`), configure **VITE_CSP_IMG_SRC** if you need specific image origins in CSP; otherwise images may be blocked until you set it.
