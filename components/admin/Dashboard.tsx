import type { ReactElement } from 'react';
import type { AdminViewServerProps } from 'payload';

/**
 * Dashboard admin custom — phase 3 refonte « cPanel premium ».
 *
 * Override la view `dashboard` par défaut de Payload v3 (paramètre
 * `admin.components.views.dashboard.Component` dans payload.config.ts).
 *
 * Affiche :
 *   1. KPIs (4 cards) : leads totaux, leads nouveaux (7j), articles
 *      brouillons, journal d'audit (24h).
 *   2. Derniers leads (5 entrées).
 *   3. Activité récente (5 entrées audit log).
 *
 * Server Component : fetch direct via `payload.find()` côté server,
 * pas de boucle de bootstrap client. Style charte OpenLab (orange,
 * navy, ivory) via CSS variables natives Tailwind v4.
 *
 * OWASP §10 :
 *   - A01 : la view n'est rendue que si l'utilisateur est authentifié
 *     (Payload garde toute la route /admin derrière le middleware auth).
 *   - A03 : Payload requêtes paramétrées, pas d'interpolation.
 *   - A09 : best-effort fetch — si une collection plante, on dégrade
 *     gracieusement à un état vide plutôt que de crasher tout l'admin.
 */
export default async function OpenLabAdminDashboard(
  props: AdminViewServerProps,
): Promise<ReactElement> {
  const { payload, user } = props;

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Best-effort : si une collection est cassée, on capture et affiche 0
  // plutôt que faire crasher tout l'admin (§A09 fail-soft).
  const safeCount = async (
    promise: Promise<{ totalDocs: number }>,
  ): Promise<number> => {
    try {
      const r = await promise;
      return r.totalDocs;
    } catch {
      return 0;
    }
  };

  const safeFind = async <T,>(
    promise: Promise<{ docs: T[] }>,
  ): Promise<T[]> => {
    try {
      const r = await promise;
      return r.docs;
    } catch {
      return [];
    }
  };

  const [
    leadsTotal,
    leadsRecent,
    articlesDraft,
    auditLast24h,
    recentLeads,
    recentAudit,
  ] = await Promise.all([
    safeCount(payload.count({ collection: 'leads' })),
    safeCount(
      payload.count({
        collection: 'leads',
        where: { createdAt: { greater_than: sevenDaysAgo } },
      }),
    ),
    safeCount(
      payload.count({
        collection: 'articles',
        where: { status: { equals: 'draft' } },
      }),
    ),
    safeCount(
      payload.count({
        collection: 'auditLog',
        where: { createdAt: { greater_than: oneDayAgo } },
      }),
    ),
    safeFind<RecentLead>(
      payload.find({
        collection: 'leads',
        limit: 5,
        sort: '-createdAt',
        depth: 0,
      }) as unknown as Promise<{ docs: RecentLead[] }>,
    ),
    safeFind<RecentAudit>(
      payload.find({
        collection: 'auditLog',
        limit: 5,
        sort: '-createdAt',
        depth: 0,
      }) as unknown as Promise<{ docs: RecentAudit[] }>,
    ),
  ]);

  const kpis: KpiCard[] = [
    {
      label: 'Leads totaux',
      value: leadsTotal,
      hint: 'Pipeline CRM complet',
      accent: 'orange',
    },
    {
      label: 'Nouveaux (7j)',
      value: leadsRecent,
      hint: 'Soumissions /contact + /audit-ia',
      accent: 'navy',
    },
    {
      label: 'Articles brouillons',
      value: articlesDraft,
      hint: 'À relire / publier',
      accent: 'orange',
    },
    {
      label: 'Audit log (24h)',
      value: auditLast24h,
      hint: 'Événements sensibles',
      accent: 'navy',
    },
  ];

  return (
    <div
      data-testid="admin-dashboard"
      style={{
        padding: '32px 40px',
        background: '#FAF8F5',
        minHeight: '100vh',
        fontFamily:
          '"Bricolage Grotesque", Geist, system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#FF5A00',
            margin: 0,
            fontWeight: 600,
          }}
        >
          Tableau de bord
        </p>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#0A0E1A',
            letterSpacing: '-0.02em',
            margin: '8px 0 0',
          }}
        >
          Bonjour {user?.email?.split('@')[0] ?? 'OpenLab'}.
        </h1>
        <p style={{ margin: '8px 0 0', color: '#4A4E58', maxWidth: 640 }}>
          Vue d’ensemble du cabinet — leads, contenu, sécurité.
        </p>
      </header>

      <section
        aria-label="Indicateurs clés"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {kpis.map((k) => (
          <KpiBlock key={k.label} kpi={k} />
        ))}
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
        }}
      >
        <Panel title="Derniers leads">
          {recentLeads.length === 0 ? (
            <p style={{ color: '#4A4E58', fontSize: 14, margin: 0 }}>
              Aucun lead pour l’instant. Les soumissions <code>/contact</code>{' '}
              et <code>/audit-ia</code> apparaîtront ici.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentLeads.map((lead) => (
                <li
                  key={String(lead.id)}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #E8EAF0',
                  }}
                >
                  <strong style={{ color: '#0A0E1A' }}>{lead.email}</strong>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#4A4E58',
                      marginTop: 2,
                    }}
                  >
                    {lead.organization ?? '—'} · {lead.source ?? '—'} ·{' '}
                    {lead.stage ?? '—'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Activité récente">
          {recentAudit.length === 0 ? (
            <p style={{ color: '#4A4E58', fontSize: 14, margin: 0 }}>
              Pas d’événement enregistré récemment.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentAudit.map((entry) => (
                <li
                  key={String(entry.id)}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #E8EAF0',
                  }}
                >
                  <strong style={{ color: '#0A0E1A' }}>{entry.action}</strong>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#4A4E58',
                      marginTop: 2,
                    }}
                  >
                    {entry.resource ?? '—'} · {entry.userEmail ?? 'système'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

// --- Sub-components + types ---

interface KpiCard {
  label: string;
  value: number;
  hint: string;
  accent: 'orange' | 'navy';
}

interface RecentLead {
  id: string | number;
  email: string;
  organization?: string;
  source?: string;
  stage?: string;
}

interface RecentAudit {
  id: string | number;
  action: string;
  resource?: string;
  userEmail?: string;
}

function KpiBlock({ kpi }: { kpi: KpiCard }): ReactElement {
  const accentColor = kpi.accent === 'orange' ? '#FF5A00' : '#0B1B3D';
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 8,
        padding: 20,
        boxShadow: '0 1px 2px rgba(10,14,26,0.04)',
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: '#4A4E58',
          margin: 0,
          fontWeight: 500,
        }}
      >
        {kpi.label}
      </p>
      <p
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: accentColor,
          margin: '6px 0 4px',
          letterSpacing: '-0.02em',
          fontFamily: '"Bricolage Grotesque", Geist, system-ui, sans-serif',
        }}
      >
        {kpi.value}
      </p>
      <p style={{ fontSize: 12, color: '#4A4E58', margin: 0 }}>{kpi.hint}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): ReactElement {
  return (
    <section
      aria-labelledby={`panel-${title}`}
      style={{
        background: '#FFFFFF',
        borderRadius: 8,
        padding: 24,
        boxShadow: '0 1px 2px rgba(10,14,26,0.04)',
      }}
    >
      <h2
        id={`panel-${title}`}
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#0A0E1A',
          margin: '0 0 16px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
