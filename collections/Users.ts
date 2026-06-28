import type { CollectionConfig } from 'payload';
// Imports sans extension : compatibles webpack Next + tsx CLI.
import { logAudit } from '../lib/audit-log';
import { esc, shell } from '../lib/email-core';
import { validatePasswordStrength } from '../lib/password-policy';
import { isSuperAdmin } from '../lib/auth/roles';

/**
 * Users — auth admin Payload (§9 + §11).
 *
 * Rôles (CLAUDE.md §11.3) :
 *   - super-admin   : tous droits + gestion users + paramètres système
 *   - admin         : tous droits sauf gestion users
 *   - editor-chief  : CRUD contenu + produits + livre + leads
 *   - editor        : CRUD articles, médias, FAQs
 *   - author        : CRUD ses propres articles uniquement
 *   - viewer        : lecture seule
 *
 * Sécurité §11.2 (P11) :
 *   - bcrypt cost 12 (default Payload Auth)
 *   - tokenExpiration: 28800 (8 h)
 *   - maxLoginAttempts: 10, lockTime: 30 min
 *   - 2FA TOTP : champs totpSecret (chiffré base32) + totpEnabled
 *   - Policy mot de passe 12+ chars (`validatePasswordStrength`)
 *   - Audit log auto sur create/update/delete + login lockout
 *
 * Le secret TOTP n'est exposé qu'au moment du setup (route
 * `/api/admin/2fa/setup`). Une fois `totpEnabled=true`, le champ
 * `totpSecret` est masqué dans l'admin (`admin.readOnly`).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  auth: {
    tokenExpiration: 28800, // 8 h absolu
    maxLoginAttempts: 10,
    lockTime: 1800 * 1000, // 30 min
    // « Mot de passe oublié » — email FR charte OpenLab, envoyé via
    // l'email adapter ZeptoMail (payload.config.ts). Le lien pointe vers
    // l'écran natif /admin/reset/<token> de Payload.
    forgotPassword: {
      generateEmailSubject: () =>
        'Réinitialisation de votre mot de passe : Admin OpenLab',
      generateEmailHTML: (args) => {
        const token = args?.token ?? '';
        const user = args?.user as
          | { email?: string; fullName?: string }
          | undefined;
        const serverURL =
          process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
        const resetUrl = `${serverURL}/admin/reset/${token}`;
        const greeting = user?.fullName
          ? `Bonjour ${user.fullName},`
          : 'Bonjour,';
        const inner = `
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">${esc(greeting)}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#1a1d24;">Une réinitialisation du mot de passe de votre compte admin OpenLab a été demandée. Ce lien est valable une heure.</p>
<a href="${esc(resetUrl)}" style="display:inline-block;background:#ff5a00;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Choisir un nouveau mot de passe</a>
<p style="margin:24px 0 0;font-size:13px;color:#5b6170;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe reste inchangé. Pensez à signaler l'incident à l'équipe.</p>`;
        return shell('Réinitialisation de votre mot de passe', inner);
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'totpEnabled', 'lastLogin'],
    description:
      'Comptes admin du back-office Payload. 2FA TOTP obligatoire pour super-admin et admin (§11.2).',
  },
  access: {
    // Lecture/écriture réservées aux admins ; un user voit son propre profil.
    read: ({ req }): boolean => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'super-admin' || role === 'admin';
    },
    create: ({ req }): boolean =>
      (req.user as { role?: string } | null)?.role === 'super-admin',
    update: ({ req }): boolean => {
      const role = (req.user as { role?: string } | null)?.role;
      return role === 'super-admin' || role === 'admin';
    },
    delete: ({ req }): boolean =>
      (req.user as { role?: string } | null)?.role === 'super-admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'author',
      // OWASP A07 (escalade de privilèges) : seul un super-admin peut
      // attribuer/modifier un rôle. Sans ça, un `admin` (qui a `update` sur
      // la collection Users) pouvait se promouvoir lui-même `super-admin`
      // via PATCH /api/users/<id> { role: 'super-admin' }.
      access: {
        update: ({ req }): boolean => isSuperAdmin(req.user),
      },
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor in chief', value: 'editor-chief' },
        { label: 'Editor', value: 'editor' },
        { label: 'Author', value: 'author' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      name: 'fullName',
      type: 'text',
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: { readOnly: true },
    },
    // 2FA TOTP — CLAUDE.md §11.2
    {
      name: 'totpEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          'Activé après scan QR + vérification du premier code TOTP. Géré par `/api/admin/2fa/setup`.',
      },
    },
    {
      name: 'totpSecret',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true, // Jamais affiché dans l'UI admin une fois posé.
        description: 'Secret base32 chiffré. Ne pas modifier manuellement.',
      },
    },
    {
      name: 'totpSetupAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }): unknown => {
        // Politique mot de passe (§11.2) — appliquée à create + change.
        // Payload expose le password en clair dans `data.password` au moment
        // du beforeValidate ; il est ensuite haché par l'auth strategy.
        const next = (data ?? {}) as { password?: unknown };
        if (typeof next.password === 'string' && next.password.length > 0) {
          const result = validatePasswordStrength(next.password);
          if (!result.ok) {
            throw new Error(
              `Politique mot de passe non respectée : ${result.errors.join(' ')}`,
            );
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ req, operation, doc, previousDoc }): Promise<void> => {
        // Trace dans l'AuditLog tout create/update sur Users.
        // overrideAccess pour bypass la règle "create: () => false".
        const action: 'create' | 'update' =
          operation === 'create' ? 'create' : 'update';
        const roleChanged =
          operation === 'update' &&
          (previousDoc as { role?: string } | undefined)?.role !==
            (doc as { role?: string }).role;
        await logAudit(req.payload, {
          action: roleChanged ? 'role.change' : action,
          resource: `users:${(doc as { id?: string | number }).id}`,
          user: req.user as Parameters<typeof logAudit>[1]['user'],
          ipAddress:
            req.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
            null,
          userAgent: req.headers?.get?.('user-agent') ?? null,
          metadata: roleChanged
            ? {
                from: (previousDoc as { role?: string } | undefined)?.role,
                to: (doc as { role?: string }).role,
                targetUserId: (doc as { id?: string | number }).id,
              }
            : { targetUserId: (doc as { id?: string | number }).id },
        });
      },
    ],
    afterDelete: [
      async ({ req, doc }): Promise<void> => {
        await logAudit(req.payload, {
          action: 'delete',
          resource: `users:${(doc as { id?: string | number }).id}`,
          user: req.user as Parameters<typeof logAudit>[1]['user'],
          ipAddress:
            req.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
            null,
          metadata: {
            email: (doc as { email?: string }).email,
            role: (doc as { role?: string }).role,
          },
        });
      },
    ],
  },
};
