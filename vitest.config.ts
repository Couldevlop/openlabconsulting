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
    // Perf : pool 'vmThreads' (Vitest 2.x). Chaque worker partage
    // une VM Node unique → boot ~3× plus rapide que `threads`/`forks`
    // (qui spawn un runtime complet). Le contexte module est cloné
    // par fichier de test grâce à `node:vm` → isolation préservée.
    //
    // Cap maxThreads à 6 : Motion v12 + jsdom = ~150 Mo / worker ;
    // au-delà on swap sur SSD. minThreads=2 garde du parallélisme
    // même en local sur petites machines.
    pool: 'vmThreads',
    poolOptions: {
      vmThreads: {
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
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx',
        // WebGL / Three.js : non testable en jsdom (pas de WebGL context).
        // Couvert par E2E Playwright (chromium réel) à partir de P2.
        'components/sections/HeroCanvas.tsx',
        'components/sections/HeroBackground.tsx',
        // Routes Payload (groupe (payload)) : nécessitent Postgres au
        // runtime, non testables en unit. Couvertes par tests d'intégration
        // contre une DB éphémère en P6 raffinement.
        'app/(payload)/**/*.{ts,tsx}',
        // Pages "markup" légales / contact / audit landing : du JSX
        // statique sans logique. Tests E2E Playwright à activer pour ces
        // pages (P2+ progress). Pas pertinent en couverture unit.
        'app/contact/page.tsx',
        'app/mentions-legales/page.tsx',
        'app/politique-confidentialite/page.tsx',
        'app/audit-ia/page.tsx',
        // Page racine de l'OG image (génère un PNG, pas de logique testable
        // en jsdom — testée par Playwright qui hit l'URL réelle).
        'app/opengraph-image.tsx',
        // sitemap / robots déjà couverts par leurs tests dédiés via
        // l'import direct, mais Next les compile aussi en routes.
        'app/sitemap.ts',
        'app/robots.ts',
        // Server Components qui interrogent Payload : le fetch est
        // testé via le helper server-only (chemin fallback). Le
        // wrapper Server n'a aucune logique à part `await`. Tests
        // d'intégration en P6 raffinement (DB éphémère).
        'components/sections/CasesCarouselServer.tsx',
        'components/sections/InsightsServer.tsx',
        // Helpers server-only (fetch Payload) : la branche fallback
        // est testée via les helpers tests. Le parsing/normalisation
        // des docs Payload est couvert en intégration P6 (DB réelle).
        'lib/case-studies-server.ts',
        'lib/articles-server.ts',
        // Page détail insight : markup statique + appel server helper
        // déjà testé. Couvert par Playwright en P9.
        'app/insights/[slug]/page.tsx',
        // Pages hub (insights, livre, etc.) qui fetch Payload : la
        // logique est dans les helpers server-only (testés). Le markup
        // est couvert par les tests de page hub existants.
        'app/insights/page.tsx',
        // Pages purement markup (à-propos, laboratoire) : couvertes par
        // Playwright en P9, pas pertinent en unit.
        'app/a-propos/page.tsx',
        'app/laboratoire/page.tsx',
        // Widgets client qui dépendent du DOM Cloudflare (Turnstile) ou
        // de fetch (ContactForm) : couverts par E2E Playwright + tests
        // d'intégration API (routes déjà testées).
        'components/atoms/Turnstile.tsx',
        'components/forms/ContactForm.tsx',
        // Démos interactives produits (`use client`, manipulation DOM
        // via SVG/setInterval) : couvertes par tests E2E Playwright.
        // La logique métier critique (calcul paie NexusRH) est dans
        // lib/demos/nexusrh-paie.ts qui reste testée.
        'components/demos/**/*.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
