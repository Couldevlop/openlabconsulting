/**
 * Helper pour écrire dans la collection AuditLog depuis n'importe
 * quelle source (hook Payload, route API, server action).
 *
 * Usage typique depuis un hook Payload :
 *
 *   afterChange: [
 *     async ({ req, operation, doc, previousDoc }) => {
 *       await logAudit(req.payload, {
 *         action: operation === 'create' ? 'create' : 'update',
 *         resource: `articles:${doc.id}`,
 *         user: req.user,
 *         ipAddress: req.headers?.get('x-forwarded-for') ?? null,
 *       });
 *     },
 *   ],
 *
 * Tous les champs sont optionnels sauf `action` et `resource`. La
 * fonction fail-soft : log warn si échec, n'interrompt jamais le flux.
 */

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login.success'
  | 'login.failed'
  | 'logout'
  | '2fa.enable'
  | '2fa.disable'
  | '2fa.verify'
  | 'password.change'
  | 'account.lockout'
  | 'role.change'
  | 'data.export';

export interface AuditEntry {
  action: AuditAction;
  resource: string;
  user?: {
    id?: string | number | null;
    email?: string | null;
    role?: string | null;
  } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Type minimal pour Payload local API — évite l'import du type lourd.
interface PayloadLike {
  create: (args: {
    collection: 'auditLog';
    data: Record<string, unknown>;
    overrideAccess?: boolean;
  }) => Promise<unknown>;
}

export async function logAudit(
  payload: PayloadLike,
  entry: AuditEntry,
): Promise<void> {
  try {
    await payload.create({
      collection: 'auditLog',
      data: {
        action: entry.action,
        resource: entry.resource,
        userId: entry.user?.id ? String(entry.user.id) : null,
        userEmail: entry.user?.email ?? null,
        userRole: entry.user?.role ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: entry.metadata ?? null,
      },
      overrideAccess: true,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[audit-log] échec écriture journal :',
        (err as Error).message,
      );
    }
  }
}
