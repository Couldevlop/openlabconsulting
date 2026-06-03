import { describe, it, expect } from 'vitest';
import { isPublicHttpUrl } from '@/lib/safe-url';

describe('lib/safe-url — isPublicHttpUrl (anti-SSRF)', () => {
  it('accepte les URLs http(s) publiques', () => {
    expect(isPublicHttpUrl('https://banquemondiale.org/rapport')).toBe(true);
    expect(isPublicHttpUrl('http://example.com')).toBe(true);
    expect(isPublicHttpUrl('https://sub.domain.ci/x?y=1#z')).toBe(true);
  });

  it('rejette les schémas non http(s)', () => {
    expect(isPublicHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isPublicHttpUrl('data:text/html,<script>')).toBe(false);
    expect(isPublicHttpUrl('ftp://example.com')).toBe(false);
    expect(isPublicHttpUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejette localhost et les TLD internes', () => {
    expect(isPublicHttpUrl('http://localhost:3000')).toBe(false);
    expect(isPublicHttpUrl('http://minio.openlab.svc.cluster.local:9000')).toBe(
      false,
    );
    expect(isPublicHttpUrl('http://db.internal')).toBe(false);
    expect(isPublicHttpUrl('http://printer.local')).toBe(false);
  });

  it('rejette les IP privées / loopback / link-local (métadonnées cloud)', () => {
    expect(isPublicHttpUrl('http://127.0.0.1')).toBe(false);
    expect(isPublicHttpUrl('http://10.0.0.5')).toBe(false);
    expect(isPublicHttpUrl('http://192.168.1.1')).toBe(false);
    expect(isPublicHttpUrl('http://172.16.0.1')).toBe(false);
    expect(isPublicHttpUrl('http://169.254.169.254/latest/meta-data')).toBe(
      false,
    );
    expect(isPublicHttpUrl('http://[::1]')).toBe(false);
  });

  it('rejette les entrées vides / non-string', () => {
    expect(isPublicHttpUrl('')).toBe(false);
    expect(isPublicHttpUrl('   ')).toBe(false);
    expect(isPublicHttpUrl(null)).toBe(false);
    expect(isPublicHttpUrl(42)).toBe(false);
    expect(isPublicHttpUrl('pas une url')).toBe(false);
  });

  it('accepte une IPv4 publique', () => {
    expect(isPublicHttpUrl('http://8.8.8.8')).toBe(true);
  });
});
