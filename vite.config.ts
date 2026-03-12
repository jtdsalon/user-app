import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getCspImgOrigins(env: Record<string, string>): string {
  const base = env.VITE_APP_BASE_URL?.trim()
  if (!base) return ''

  try {
    const url = new URL(base)
    return url.origin
  } catch {
    return ''
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cspImgOrigins = getCspImgOrigins(env as Record<string, string>)

  return {
  base: '/user-app/',
  plugins: [
    react(),
    {
      name: 'html-csp-env',
      transformIndexHtml(html: string) {
        return html.replace('__CSP_IMG_ORIGINS__', cspImgOrigins)
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@services': path.resolve(__dirname, './src/services'),
      '@state': path.resolve(__dirname, './src/state'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5174,
    strictPort: true,
    open: false, // avoid spawn xdg-open ENOENT on headless/remote (e.g. QA)
  },
  }
})
