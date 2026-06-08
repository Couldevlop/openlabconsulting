import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';

describe('app/robots', () => {
  const result = robots();

  it('autorise tous les bots sur /', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule?.allow).toBe('/');
  });

  it('interdit /admin et /api aux bots', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    const disallow = Array.isArray(wildcardRule?.disallow)
      ? wildcardRule!.disallow
      : [wildcardRule?.disallow ?? ''];
    expect(disallow.some((d) => d.startsWith('/admin'))).toBe(true);
    expect(disallow.some((d) => d.startsWith('/api'))).toBe(true);
  });

  it('autorise les bots LLM (GPTBot, ClaudeBot, PerplexityBot)', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const llmBots = ['GPTBot', 'ClaudeBot', 'PerplexityBot'];
    for (const bot of llmBots) {
      expect(rules.find((r) => r.userAgent === bot)).toBeDefined();
    }
  });

  it('refuse les crawlers commerciaux agressifs sur tout le site', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    for (const bot of ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'Bytespider']) {
      const rule = rules.find((r) => r.userAgent === bot);
      expect(rule, `règle attendue pour ${bot}`).toBeDefined();
      expect(rule?.disallow).toBe('/');
      // Ne doit surtout pas leur ouvrir l’accès par ailleurs.
      expect(rule?.allow).toBeUndefined();
    }
  });

  it('n’interdit PAS les moteurs/crawlers IA gardés pour le GEO', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot']) {
      const rule = rules.find((r) => r.userAgent === bot);
      expect(rule?.disallow).not.toBe('/');
    }
  });

  it('expose le sitemap absolu', () => {
    expect(result.sitemap).toMatch(/^https?:\/\//);
    expect(result.sitemap).toContain('/sitemap.xml');
  });
});
