import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Polyfill IntersectionObserver (utilisé par Motion v12 / whileInView)
// — jsdom 25 ne l'embarque pas. On rend une implémentation no-op qui
// déclenche immédiatement l'entrée dans le viewport pour que les tests
// voient le contenu animé sans dépendre du scroll.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IO {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
    constructor(
      _cb: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = IO;
}

// matchMedia n'est pas implémenté par jsdom — useReducedMotion en a besoin.
if (typeof globalThis.matchMedia === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

// Mock `next/headers` pour permettre aux pages Server Component qui
// font `await headers()` (récupération nonce CSP §10.3) de tester sans
// Next runtime. Renvoie un Headers vide ; les pages tombent sur leur
// fallback `?? undefined`.
vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
  cookies: async () => new Map(),
}));

// Mock `next/navigation` — hors RSC, le router App n'est pas monté en
// jsdom. Les composants client (ex. CommandPalette) appellent
// `useRouter()` au render ; sans mock → « invariant expected app
// router to be mounted ».
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

afterEach(() => {
  cleanup();
});
