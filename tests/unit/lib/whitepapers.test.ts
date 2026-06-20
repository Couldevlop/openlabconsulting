import { describe, it, expect } from 'vitest';
import { isDownloadOpen, downloadReleaseAt } from '@/lib/whitepapers';
import { whitepaperRequestSchema } from '@/lib/validation';

const SLUG = 'donnez-la-parole-a-vos-donnees';
const TARGET = Date.parse('2026-06-22T10:00:00.000Z');

describe('lib/whitepapers — ouverture du téléchargement', () => {
  it('downloadReleaseAt : date pour le livre, null sinon', () => {
    expect(downloadReleaseAt(SLUG)).toBe('2026-06-22T10:00:00.000Z');
    expect(downloadReleaseAt('ia-souveraine-ci-2026')).toBeNull();
    expect(downloadReleaseAt('inconnu')).toBeNull();
  });

  it('isDownloadOpen : fermé avant l’heure, ouvert à/après', () => {
    expect(isDownloadOpen(SLUG, TARGET - 1000)).toBe(false);
    expect(isDownloadOpen(SLUG, TARGET)).toBe(true);
    expect(isDownloadOpen(SLUG, TARGET + 1000)).toBe(true);
  });

  it('sans date d’ouverture → toujours ouvert', () => {
    expect(isDownloadOpen('ia-souveraine-ci-2026', 0)).toBe(true);
    expect(isDownloadOpen('inconnu', 0)).toBe(true);
  });
});

describe('whitepaperRequestSchema — opt-in newsletter', () => {
  const base = {
    email: 'a@b.com',
    slug: SLUG,
    consentRgpd: 'on',
  };

  it('accepte le livre « Donnez la parole à vos données »', () => {
    expect(whitepaperRequestSchema.safeParse(base).success).toBe(true);
  });

  it('newsletter "on" → true, absent → false, optionnel', () => {
    const withNl = whitepaperRequestSchema.parse({ ...base, newsletter: 'on' });
    expect(withNl.newsletter).toBe(true);
    const without = whitepaperRequestSchema.parse(base);
    expect(without.newsletter).toBe(false);
  });
});
