import { describe, it, expect, vi } from 'vitest';
import { logAudit } from '@/lib/audit-log';
import { AuditLog } from '@/collections/AuditLog';

describe('collection AuditLog', () => {
  it('a le slug "auditLog"', () => {
    expect(AuditLog.slug).toBe('auditLog');
  });

  it('interdit toute mutation API (create/update/delete renvoient false)', () => {
    const create = AuditLog.access?.create as (() => boolean) | undefined;
    const update = AuditLog.access?.update as (() => boolean) | undefined;
    const del = AuditLog.access?.delete as (() => boolean) | undefined;
    expect(create?.()).toBe(false);
    expect(update?.()).toBe(false);
    expect(del?.()).toBe(false);
  });

  it('lecture réservée aux super-admin et admin', () => {
    const read = AuditLog.access?.read as (args: {
      req: { user: { role?: string } | null };
    }) => boolean;
    expect(read({ req: { user: { role: 'super-admin' } } })).toBe(true);
    expect(read({ req: { user: { role: 'admin' } } })).toBe(true);
    expect(read({ req: { user: { role: 'editor' } } })).toBe(false);
    expect(read({ req: { user: null } })).toBe(false);
  });

  it('expose les 13 actions §11.2 (CRUD + login + 2FA + role/password)', () => {
    const actionField = (AuditLog.fields ?? []).find(
      (f) => 'name' in f && f.name === 'action',
    );
    const options = (actionField as { options?: { value: string }[] }).options;
    const values = options?.map((o) => o.value) ?? [];
    expect(values.length).toBeGreaterThanOrEqual(13);
    expect(values).toEqual(
      expect.arrayContaining([
        'create',
        'update',
        'delete',
        'login.success',
        'login.failed',
        'logout',
        '2fa.enable',
        '2fa.disable',
        '2fa.verify',
        'password.change',
        'account.lockout',
        'role.change',
        'data.export',
      ]),
    );
  });
});

describe('lib/audit-log — logAudit', () => {
  it('appelle payload.create avec collection auditLog + overrideAccess', async () => {
    const create = vi.fn().mockResolvedValue({});
    await logAudit(
      { create },
      {
        action: '2fa.enable',
        resource: 'users:42',
        user: { id: '42', email: 'a@b.c', role: 'admin' },
        ipAddress: '1.2.3.4',
        userAgent: 'curl',
      },
    );
    expect(create).toHaveBeenCalledOnce();
    const arg = create.mock.calls[0]![0];
    expect(arg.collection).toBe('auditLog');
    expect(arg.overrideAccess).toBe(true);
    expect(arg.data.action).toBe('2fa.enable');
    expect(arg.data.resource).toBe('users:42');
    expect(arg.data.userEmail).toBe('a@b.c');
    expect(arg.data.ipAddress).toBe('1.2.3.4');
  });

  it('ne throw pas si payload.create échoue (fail-soft)', async () => {
    const create = vi.fn().mockRejectedValue(new Error('db down'));
    await expect(
      logAudit({ create }, { action: 'login.success', resource: 'users:1' }),
    ).resolves.toBeUndefined();
  });
});
