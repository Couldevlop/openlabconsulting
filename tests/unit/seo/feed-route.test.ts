import { describe, it, expect } from 'vitest';
import { GET } from '@/app/feed.xml/route';

describe('GET /feed.xml', () => {
  it('renvoie un flux RSS 2.0 valide', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('rss');
  });

  it('contient un channel et au moins un item (fallback articles)', async () => {
    const res = await GET();
    const body = await res.text();
    expect(body).toContain('<rss');
    expect(body).toContain('<channel>');
    expect(body).toMatch(/<item>/);
    expect(body).toContain('/insights/');
  });
});
