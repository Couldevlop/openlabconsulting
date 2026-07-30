import { describe, expect, it, vi } from 'vitest';

/**
 * `store-server` est la seule unité du pipeline autorisée à toucher
 * Payload et MinIO. On teste ici ce qui est vérifiable sans base : la
 * construction de la clé d'objet, qui doit interdire toute traversée de
 * chemin (OWASP A03).
 */

const send = vi.fn(async () => ({}));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = send;
  },
  PutObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  GetObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}));

const { buildReportKey } = await import('@/lib/audit-report/store-server');

describe('buildReportKey', () => {
  it('produit une clé préfixée et stable', () => {
    expect(buildReportKey('42')).toBe('audit-reports/42.pdf');
  });

  it('accepte les identifiants alphanumériques et tirets', () => {
    expect(buildReportKey('a1b2-c3')).toBe('audit-reports/a1b2-c3.pdf');
  });

  it('rejette une tentative de traversée de chemin', () => {
    expect(() => buildReportKey('../../etc/passwd')).toThrow();
  });

  it('rejette une clé vide ou porteuse de séparateurs', () => {
    expect(() => buildReportKey('')).toThrow();
    expect(() => buildReportKey('42/43')).toThrow();
    expect(() => buildReportKey('42.pdf')).toThrow();
  });
});
