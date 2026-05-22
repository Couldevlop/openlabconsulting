/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // 'server-only' n'a aucun export concret (juste un throw côté
      // client en build). En tests Vitest jsdom on remplace par un
      // module vide pour permettre l'import sans erreur runtime.
      'server-only': fileURLToPath(
        new URL('./tests/stubs/server-only.ts', import.meta.url),
      ),
      // @payload-config est un alias Next/Payload (importmap). Stub
      // en tests : on s'assure juste que l'import dynamique ne casse
      // pas la résolution Vite. Le runtime Payload n'est pas exécuté
      // en tests (couvert par les tests d'intégration).
      '@payload-config': fileURLToPath(
        new URL('./tests/stubs/payload-config.ts', import.meta.url),
      ),
      // `payload` lui-même est lourd à charger (Postgres adapter,
      // sharp, etc.). En tests on stub aussi pour éviter le boot
      // complet (10-15 s sous Windows). Le helper attrape ce throw
      // et retombe sur FALLBACK_CASE_STUDIES — comportement attendu.
      payload: fileURLToPath(
        new URL('./tests/stubs/payload.ts', import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      '.next',
      'tests/e2e/**',
      'playwright-report',
      'test-results',
    ],
    // Pool 'threads' — stable sous Windows + Motion v12 + imports
    // dynamiques (payload, @anthropic-ai/sdk). `vmThreads` testé en P11
    // donne un gain perf ~50% mais crash segfault intermittent quand
    // plusieurs imports dynamiques se chevauchent. On préfère la
    // stabilité.
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 8,
        minThreads: 4,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        // Fichiers Next « shells » : layout, loading, error, not-found
        // root sont des renderers — pas de logique métier à tester.
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        // Routes Payload (groupe (payload)) : nécessitent Postgres au
        // runtime. Couvertes par tests d'intégration P6 (DB éphémère).
        'app/(payload)/**/*.{ts,tsx}',
        // WebGL Three.js : exige chromium réel (E2E Playwright).
        'components/sections/HeroCanvas.tsx',
        'components/sections/HeroBackground.tsx',
        // OG images : ImageResponse (@vercel/og) exige edge runtime +
        // génère PNG binaire. Testées en E2E (curl /opengraph-image).
        // NB : glob `app/**/opengraph-image.tsx` couvre le déplacement
        // dans le route group `(site)/` (cf. PR fix/payload-route-group).
        'app/**/opengraph-image.tsx',
        // Template OG partagé — réutilisé par les opengraph-image.tsx.
        // Idem ImageResponse PNG binaire, non testable en jsdom.
        'lib/seo/og-image-template.tsx',
        // sitemap / robots : compilés par Next en routes spéciales
        // (testés en E2E via curl /sitemap.xml /robots.txt).
        // Les helpers sont testés via les tests dédiés.
        'app/sitemap.ts',
        'app/robots.ts',
        // app/fonts.ts : import next/font, pas de logique testable.
        'app/fonts.ts',
      ],
      thresholds: {
        // Seuils relevés après PR feat/coverage-100 (570 tests, +157 vs base).
        // Lignes/statements ≥ 95% atteignable car alias stubs Payload
        // bloquent les paths "service externe up" (testés en intégration).
        // Branches plus basses car beaucoup de helpers ont des fallback
        // paths conditionnels (env absent, Payload down, etc.).
        lines: 95,
        functions: 85,
        branches: 85,
        statements: 95,
      },
    },
  },
});
