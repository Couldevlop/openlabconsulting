import { describe, it, expect } from 'vitest';
import { AboutSettings } from '@/globals/AboutSettings';
import { ABOUT_FALLBACK } from '@/lib/cms/site-settings';

type AccessFn = (args: { req: { user: unknown } }) => unknown;

describe('Global AboutSettings (page /a-propos pilotable)', () => {
  it('a le slug "about-settings"', () => {
    expect(AboutSettings.slug).toBe('about-settings');
  });

  it('lecture publique, écriture éditeur+ (OWASP A01)', () => {
    const read = AboutSettings.access?.read as AccessFn;
    const update = AboutSettings.access?.update as AccessFn;
    expect(read({ req: { user: null } })).toBe(true);
    expect(update({ req: { user: { role: 'editor' } } })).toBe(true);
    expect(update({ req: { user: { role: 'viewer' } } })).toBe(false);
    expect(update({ req: { user: null } })).toBe(false);
  });

  it('expose les champs hero + piliers', () => {
    const names = (AboutSettings.fields ?? []).flatMap((f) =>
      'name' in f ? [f.name] : [],
    );
    expect(names).toEqual(
      expect.arrayContaining([
        'eyebrow',
        'headlineLead',
        'headlineHighlight',
        'intro',
        'pillarsEyebrow',
        'pillarsHeadline',
        'pillars',
      ]),
    );
  });

  it('le fallback fournit 3 piliers non vides', () => {
    expect(ABOUT_FALLBACK.pillars.length).toBe(3);
    for (const p of ABOUT_FALLBACK.pillars) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.body.length).toBeGreaterThan(0);
    }
  });
});
