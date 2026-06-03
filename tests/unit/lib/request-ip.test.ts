import { describe, it, expect } from 'vitest';
import { getRequestIp, UNKNOWN_IP } from '@/lib/request-ip';

function reqWith(headers: Record<string, string>): Request {
  return new Request('https://openlabconsulting.com/api/contact', { headers });
}

describe('lib/request-ip — getRequestIp (clé de rate-limit fiable)', () => {
  it('privilégie x-real-ip (posé par l’ingress de confiance)', () => {
    const req = reqWith({
      'x-real-ip': '203.0.113.7',
      // XFF spoofable ne doit PAS gagner sur x-real-ip
      'x-forwarded-for': '1.2.3.4',
    });
    expect(getRequestIp(req)).toBe('203.0.113.7');
  });

  it('retombe sur cf-connecting-ip puis x-forwarded-for', () => {
    expect(getRequestIp(reqWith({ 'cf-connecting-ip': '198.51.100.9' }))).toBe(
      '198.51.100.9',
    );
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
