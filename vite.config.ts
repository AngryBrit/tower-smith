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
