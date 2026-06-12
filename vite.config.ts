/// <reference types="vitest/config" />
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  /**
   * Keep pre-bundle cache out of the repo tree. Under OneDrive, `.vite/deps` often ends up as a
   * read-only reparse point and Vite fails with EPERM when it tries to `rmdir` before rebuild.
   */
  cacheDir: path.join(os.tmpdir(), 'vite-cache-tower_export'),
  server: {
    host: true,
    watch: {
      // Netlify Dev bundles functions under .netlify/functions-serve; on Windows those
      // files are locked (EBUSY) while Vite's watcher tries to observe them.
      ignored: ['**/.netlify/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'app-icon.svg',
      ],
      manifest: false,
      workbox: {
        // App shell only — research + GOD table JSON are runtime-cached on demand.
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        // Precache the app shell only — public/ art and research JSON are runtime-cached on demand.
        globPatterns: ['index.html', 'assets/**'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'image' || /\.webp$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tower-images-v1',
              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              /\/research\/.+\.json$/i.test(url.pathname) ||
              url.pathname.endsWith('/research/manifest.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tower-research-v1',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              /\/tables\/.+\.json$/i.test(url.pathname) ||
              url.pathname.endsWith('/tables/workshop/manifest.json') ||
              url.pathname.endsWith('/tables/labs/manifest.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tower-god-tables-v1',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test/setup.ts'],
    environmentMatchGlobs: [['src/**/*.test.tsx', 'jsdom']],
  },
})
