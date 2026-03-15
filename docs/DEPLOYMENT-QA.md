# User App – Run & set up on QA

Steps to run and set up the user-app on the QA server (`root@QA:~/user-app`).

---

## 1. Set environment (QA)

The app uses **Vite modes**. For QA, the mode is `qa`, which loads **`.env.qa`**.

- On the QA server, ensure **`.env.qa`** exists in the user-app directory and has the QA API base URL:
  ```bash
  # .env.qa (in ~/user-app/)
  VITE_APP_BASE_URL=http://129.212.226.33/api
  ```
- Replace `http://129.212.226.33` with your QA server host if different.
- **Important:** If this is missing or wrong when you run `npm run build:qa`, the built app may call `http://localhost:3000/api` instead of your QA API. The app will try to fix this at runtime when opened from the QA host, but for correct builds always set `VITE_APP_BASE_URL` in `.env.qa` before building.

---

## 2. Install dependencies (one-time)

```bash
cd ~/user-app
npm install
```

---

## 3. Run on QA

You can either run the **dev server** (for quick testing) or **build and deploy** static files (recommended for a stable QA deployment).

### Option A: Dev server (quick test)

```bash
cd ~/user-app
npm run qa
```

- Runs Vite with `--mode qa` (loads `.env.qa`).
- App is at `http://<QA_HOST>:5174`.
- Stop with `Ctrl+C`. For long-running, use Option B or run under PM2.

### Option B: Build and deploy for nginx (recommended for QA)

Nginx serves the user app from **`/var/www/user-app/`**. After you build, you must **copy the built files** there or nginx will keep serving the old version.

**1. Build for QA**

```bash
cd ~/user-app
git pull
npm install
npm run build:qa
```

- Output is in **`dist/`** (e.g. `dist/index.html`, `dist/assets/`).

**2. Deploy the built files to where nginx serves from**

```bash
# Create target dir if needed, then copy dist contents into it
sudo mkdir -p /var/www/user-app
sudo cp -r dist/* /var/www/user-app/
```

- Nginx is configured with `location /user-app/` and `root /var/www`, so it serves files from `/var/www/user-app/`. Updating this folder is what makes your latest build visible at `http://<QA_HOST>/user-app/`.

**3. Avoid browser cache when testing**

- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac), or open the app in an incognito/private window.

**One-liner after pull (build + deploy):**

```bash
cd ~/user-app && git pull && npm install && npm run build:qa && sudo cp -r dist/* /var/www/user-app/
```

**Or run the dev server under PM2:**

```bash
cd ~/user-app
pm2 start npm --name "user-app-qa" -- run qa
pm2 save
```

- App will be on port 5174. Expose it via nginx or firewall as needed.

---

## 4. Quick reference

| Task | Command |
|------|--------|
| Install deps | `npm install` |
| Run dev server (QA mode) | `npm run qa` |
| Build for QA | `npm run build:qa` |
| **Deploy build to nginx** | `sudo cp -r dist/* /var/www/user-app/` (after build) |
| Full update (pull + build + deploy) | `cd ~/user-app && git pull && npm install && npm run build:qa && sudo cp -r dist/* /var/www/user-app/` |
| Preview built app locally | `npm run preview` (after build) |

**If latest changes don’t show:** Nginx serves from `/var/www/user-app/`, not from `dist/`. After every `npm run build:qa` you must run `sudo cp -r dist/* /var/www/user-app/`. Then hard-refresh the browser (Ctrl+Shift+R) or use a private window to avoid cache.

---

## 5. Env files summary

| File | When used |
|------|-----------|
| `.env` | Base; loaded in all modes |
| `.env.qa` | When running with `--mode qa` (`npm run qa`, `npm run build:qa`) |
| `.env.production` | When running with `--mode production` |

Ensure **`VITE_APP_BASE_URL`** in `.env.qa` points to your QA API (e.g. `http://129.212.226.33/api`).

**Realtime notifications:** For live notifications to work on the server, the backend and nginx must be configured as in `salon-backed/docs/DEPLOYMENT.md` (nginx `location /socket.io/` and backend `CORS_ORIGIN`).
