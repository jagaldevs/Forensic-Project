/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'HRS Digital Forensics Lab',
        short_name: 'Forensics Lab',
        description: 'Investigate fictional digital evidence and reason like a forensic scientist.',
        lang: 'en-AU',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        // Light "case file" look; the splash screen shows the crest on white.
        background_color: '#FFFFFF',
        theme_color: '#FFFFFF',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache everything, including lazy-loaded cases and apps, so the lab works offline.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2}'],
        // App icons are fetched by the device when the lab is installed; no need to precache them.
        globIgnores: ['pwa-*.png', 'apple-touch-icon.png'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
