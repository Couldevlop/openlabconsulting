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

  it('expose le sitemap absolu', () => {
    expect(result.sitemap).toMatch(/^https?:\/\//);
    expect(result.sitemap).toContain('/sitemap.xml');
  });
});
