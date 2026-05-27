/// <reference types="vitest/config" />
import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
