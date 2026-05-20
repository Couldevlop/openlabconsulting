import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/metrics/route';
import { __resetMetrics, counterInc } from '@/lib/metrics';

describe('GET /api/metrics', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    __resetMetrics();
    process.env = { ...originalEnv };
    delete process.env.METRICS_TOKEN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function req(authorization?: string): Request {
    const headers = new Headers();
    if (authorization) headers.set('authorization', authorization);
    return new Request('http://localhost:3000/api/metrics', { headers });
  }

  it('renvoie 200 + content-type text/plain Prometheus quand pas de token', () => {
    counterInc({ name: 'demo', help: 'demo' });
    const res = GET(req());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/plain/);
    expect(res.headers.get('content-type')).toContain('version=0.0.4');
  });

  it('refuse sans header Authorization quand METRICS_TOKEN est défini', () => {
    process.env.METRICS_TOKEN = 'secret123';
    const res = GET(req());
    expect(res.status).toBe(401);
  });

  it('accepte avec le bon Bearer token', () => {
    process.env.METRICS_TOKEN = 'secret123';
    const res = GET(req('Bearer secret123'));
    expect(res.status).toBe(200);
  });

  it('refuse avec un mauvais token', () => {
    process.env.METRICS_TOKEN = 'secret123';
    const res = GET(req('Bearer wrong'));
    expect(res.status).toBe(401);
  });
});
