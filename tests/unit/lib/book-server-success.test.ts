import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Couvre le chemin « Payload disponible » de lib/cms/book-server (getBook) :
 * fusion du global book-settings sur le fallback BOOK, normalisation des
 * arrays (longPitch, audiences) et des champs str/num.
 */
const findGlobalMock = vi.fn();

vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({
  getPayload: async () => ({ findGlobal: findGlobalMock }),
}));

import { getBook } from '@/lib/cms/book-server';
import { BOOK } from '@/lib/data/book';

beforeEach(() => findGlobalMock.mockReset());

describe('lib/cms/book-server — getBook (Payload disponible)', () => {
  it('fusionne les overrides du global sur BOOK', async () => {
    findGlobalMock.mockResolvedValue({
      title: 'Titre overridé',
      subtitle: 'Sous-titre overridé',
      edition: 'Édition 2027',
      isbn: '978-2-0000-0000-0',
      pageCount: 512,
      publicationYear: 2027,
      longPitch: [{ value: 'Paragraphe 1' }, { value: 'Paragraphe 2' }],
      audiences: [{ label: 'Public A', description: 'Desc A' }],
    });
    const book = await getBook();
    expect(book.title).toBe('Titre overridé');
    expect(book.subtitle).toBe('Sous-titre overridé');
    expect(book.pageCount).toBe(512);
    expect(book.publicationYear).toBe(2027);
    expect(book.longPitch).toEqual(['Paragraphe 1', 'Paragraphe 2']);
    expect(book.audiences).toEqual([
      { label: 'Public A', description: 'Desc A' },
    ]);
    // La couverture (non éditable ici) reste celle du fallback.
    expect(book.cover).toEqual(BOOK.cover);
  });

  it('retombe sur BOOK pour les champs vides/absents', async () => {
    findGlobalMock.mockResolvedValue({
      title: '',
      longPitch: [{ value: '' }],
      audiences: [{ label: 'X' }],
    });
    const book = await getBook();
    expect(book.title).toBe(BOOK.title);
    expect(book.longPitch).toEqual(BOOK.longPitch);
    expect(book.audiences).toEqual(BOOK.audiences);
  });
});
