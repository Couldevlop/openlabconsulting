import { describe, expect, it } from 'vitest';
import { AuditReports } from '@/collections/AuditReports';

/**
 * Contrôle d'accès de la collection des rapports d'audit (OWASP A01).
 *
 * Un rapport contient le diagnostic nominatif d'une entreprise : il ne
 * doit jamais être lisible en anonyme, et sa création reste réservée à
 * la file de tâches (via overrideAccess), comme pour les leads.
 */

type AccessFn = (args: { req: { user: { role?: string } | null } }) => boolean;

describe('AuditReports : contrôle d’accès', () => {
  const read = AuditReports.access?.read as AccessFn;
  const update = AuditReports.access?.update as AccessFn;
  const del = AuditReports.access?.delete as AccessFn;

  it('refuse toute lecture anonyme', () => {
    expect(read({ req: { user: null } })).toBe(false);
  });

  it('autorise la lecture aux rôles de staff', () => {
    for (const role of ['super-admin', 'admin', 'editor-chief']) {
      expect(read({ req: { user: { role } } })).toBe(true);
    }
  });

  it('refuse la lecture aux autres rôles', () => {
    expect(read({ req: { user: { role: 'author' } } })).toBe(false);
    expect(read({ req: { user: {} } })).toBe(false);
  });

  it('refuse la modification anonyme', () => {
    expect(update({ req: { user: null } })).toBe(false);
  });

  it('réserve la suppression au super-admin', () => {
    expect(del({ req: { user: { role: 'admin' } } })).toBe(false);
    expect(del({ req: { user: { role: 'super-admin' } } })).toBe(true);
  });

  it('interdit la création manuelle depuis l’admin', () => {
    expect((AuditReports.access?.create as () => boolean)()).toBe(false);
  });
});

describe('AuditReports : modèle', () => {
  const fieldNames = AuditReports.fields
    .map((f) => ('name' in f ? f.name : undefined))
    .filter(Boolean);

  it('expose les champs du cycle de vie', () => {
    for (const name of [
      'lead',
      'status',
      'sections',
      'generatedBy',
      'generationError',
      'validatedBy',
      'validatedAt',
      'pdfKey',
      'sentAt',
      'remindedAt',
      'downloadCount',
    ]) {
      expect(fieldNames).toContain(name);
    }
  });

  it('démarre au statut brouillon IA', () => {
    const status = AuditReports.fields.find(
      (f) => 'name' in f && f.name === 'status',
    );
    expect(status && 'defaultValue' in status && status.defaultValue).toBe(
      'brouillon-ia',
    );
  });
});
