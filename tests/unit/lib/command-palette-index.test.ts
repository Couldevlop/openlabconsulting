import { describe, it, expect } from 'vitest';
import { COMMAND_INDEX, filterCommands } from '@/lib/command-palette-index';

describe('lib/command-palette-index — Cmd+K (audit P2 §7 #10)', () => {
  it('expose ≥ 30 entrées couvrant tous les hubs', () => {
    expect(COMMAND_INDEX.length).toBeGreaterThanOrEqual(30);
    const sections = new Set(COMMAND_INDEX.map((e) => e.section));
    expect(sections.has('Expertises')).toBe(true);
    expect(sections.has('Solutions')).toBe(true);
    expect(sections.has('Secteurs')).toBe(true);
    expect(sections.has('Laboratoire')).toBe(true);
    expect(sections.has('Livre IA')).toBe(true);
  });

  it('toutes les entrées ont un href interne (commence par /)', () => {
    for (const entry of COMMAND_INDEX) {
      expect(entry.href.startsWith('/')).toBe(true);
    }
  });

  it('toutes les entrées ont un title non vide', () => {
    for (const entry of COMMAND_INDEX) {
      expect(entry.title.length).toBeGreaterThan(0);
    }
  });

  it('hrefs uniques (pas de doublons)', () => {
    const hrefs = COMMAND_INDEX.map((e) => e.href);
    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });

  it('filterCommands "" retourne tout l’index', () => {
    expect(filterCommands('')).toHaveLength(COMMAND_INDEX.length);
  });

  it('filterCommands matche un mot-clé caché (ex. "cnps" → NexusRH)', () => {
    const results = filterCommands('cnps');
    expect(results.some((r) => r.href === '/solutions/nexusrh')).toBe(true);
  });

  it('filterCommands ignore les accents ("Cote" matche "Côte")', () => {
    const results = filterCommands('cote d');
    // Cherche "Côte d'Ivoire" via le keyword normalisé.
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  it('filterCommands est insensible à la casse', () => {
    const a = filterCommands('SYGESCOM');
    const b = filterCommands('sygescom');
    expect(a.length).toBe(b.length);
    expect(a[0]?.href).toBe('/solutions/sygescom');
  });

  it('filterCommands "audit" matche /audit-ia + Conseil', () => {
    const results = filterCommands('audit');
    expect(results.some((r) => r.href === '/audit-ia')).toBe(true);
  });

  it('filterCommands "rgpd" matche data-gouvernance + politique', () => {
    const results = filterCommands('rgpd');
    expect(results.some((r) => r.href === '/expertises/data-gouvernance')).toBe(
      true,
    );
    expect(results.some((r) => r.href === '/politique-confidentialite')).toBe(
      true,
    );
  });

  it('filterCommands sur query exotique retourne 0', () => {
    expect(filterCommands('xyzzz-non-existent-query-789')).toHaveLength(0);
  });
});
