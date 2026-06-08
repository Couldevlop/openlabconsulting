import { describe, it, expect } from 'vitest';
import { getRequestIp, UNKNOWN_IP } from '@/lib/request-ip';

function reqWith(headers: Record<string, string>): Request {
  return new Request('https://openlabconsulting.com/api/contact', { headers });
}

describe('lib/request-ip — getRequestIp (clé de rate-limit fiable)', () => {
  it('privilégie cf-connecting-ip (vrai IP visiteur posé par Cloudflare)', () => {
    const req = reqWith({
      // Cloudflare en amont : cf-connecting-ip est le visiteur réel et
      // doit gagner sur x-real-ip (qui peut valoir l’IP edge CF/LB).
      'cf-connecting-ip': '198.51.100.9',
      'x-real-ip': '203.0.113.7',
      'x-forwarded-for': '1.2.3.4',
    });
    expect(getRequestIp(req)).toBe('198.51.100.9');
  });

  it('retombe sur x-real-ip puis x-forwarded-for sans Cloudflare', () => {
    expect(
      getRequestIp(
        reqWith({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '1.2.3.4' }),
      ),
    ).toBe('203.0.113.7');
    expect(getRequestIp(reqWith({ 'x-forwarded-for': '192.0.2.5' }))).toBe(
      '192.0.2.5',
    );
  });

  it('prend le premier hop d’un XFF multi-valeurs', () => {
    expect(
      getRequestIp(reqWith({ 'x-forwarded-for': '192.0.2.5, 10.0.0.1' })),
    ).toBe('192.0.2.5');
  });

  it('ignore une valeur d’IP invalide (forgée) et continue', () => {
    const req = reqWith({
      'x-real-ip': 'not-an-ip',
      'x-forwarded-for': '192.0.2.50',
    });
    expect(getRequestIp(req)).toBe('192.0.2.50');
  });

  it('retourne UNKNOWN_IP quand aucune IP fiable n’est présente', () => {
    expect(getRequestIp(reqWith({}))).toBe(UNKNOWN_IP);
    expect(getRequestIp(reqWith({ 'x-real-ip': '999.999.0.1' }))).toBe(
      UNKNOWN_IP,
    );
  });
});
