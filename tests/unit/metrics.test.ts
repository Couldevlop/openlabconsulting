import { describe, it, expect, beforeEach } from 'vitest';
import {
  METRICS,
  __resetMetrics,
  counterInc,
  gaugeSet,
  renderMetrics,
} from '@/lib/metrics';

describe('lib/metrics', () => {
  beforeEach(() => {
    __resetMetrics();
  });

  it('incrémente un compteur sans label', () => {
    counterInc({ name: 'test_counter', help: 'test' });
    counterInc({ name: 'test_counter', help: 'test' });
    counterInc({ name: 'test_counter', help: 'test' }, 5);
    const out = renderMetrics();
    expect(out).toContain('test_counter 7');
  });

  it('isole les compteurs par labels', () => {
    counterInc({
      name: 'http_requests_total',
      help: 'test',
      labels: { route: '/', status: '200' },
    });
    counterInc({
      name: 'http_requests_total',
      help: 'test',
      labels: { route: '/', status: '404' },
    });
    counterInc({
      name: 'http_requests_total',
      help: 'test',
      labels: { route: '/', status: '200' },
    });
    const out = renderMetrics();
    expect(out).toMatch(/http_requests_total\{route="\/",status="200"\} 2/);
    expect(out).toMatch(/http_requests_total\{route="\/",status="404"\} 1/);
  });

  it('expose une gauge', () => {
    gaugeSet({ name: 'cache_size_bytes', help: 'size' }, 4096);
    const out = renderMetrics();
    expect(out).toContain('cache_size_bytes 4096');
    expect(out).toContain('# TYPE cache_size_bytes gauge');
  });

  it('émet HELP et TYPE conformément à Prometheus 0.0.4', () => {
    counterInc({
      name: 'openlab_test_total',
      help: 'Compteur de test pour vérifier le format.',
    });
    const out = renderMetrics();
    expect(out).toContain(
      '# HELP openlab_test_total Compteur de test pour vérifier le format.',
    );
    expect(out).toContain('# TYPE openlab_test_total counter');
  });

  it('expose toujours les métriques process (heap, uptime)', () => {
    const out = renderMetrics();
    expect(out).toContain('nodejs_heap_used_bytes');
    expect(out).toContain('nodejs_uptime_seconds');
  });

  it('METRICS.httpRequest pose des labels conformes', () => {
    METRICS.httpRequest('/contact', 202);
    const out = renderMetrics();
    expect(out).toMatch(/route="\/contact"/);
    expect(out).toMatch(/status="202"/);
  });

  it('METRICS.contactSubmission canalise les outcomes', () => {
    METRICS.contactSubmission('accepted');
    METRICS.contactSubmission('rate_limited');
    const out = renderMetrics();
    expect(out).toContain('outcome="accepted"');
    expect(out).toContain('outcome="rate_limited"');
  });
});
