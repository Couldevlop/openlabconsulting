import type { ReactElement } from 'react';
import type { AdminViewServerProps } from 'payload';
import {
  Users,
  MailPlus,
  FileText,
  ShieldCheck,
  PlusCircle,
  SlidersHorizontal,
  Target,
  UserCog,
  ImageIcon,
  Globe,
  type LucideIcon,
} from 'lucide-react';

/**
 * Dashboard admin custom v2 — refonte « cPanel premium »
 * (CLAUDE.md §9.3 dashboard + KPIs + activité + actions rapides).
 *
 * Vue d'ensemble cockpit avec :
 *   1. Hero contextuel (date/heure server, salutation, lien rapide
 *      vers le site public).
 *   2. 4 KPIs cards avec icône, valeur, delta 7j et hint.
 *   3. 6 Quick actions (cards cliquables vers les collections Payload).
 *   4. Pipeline leads (distribution par stage, bar chart SVG inline).
 *   5. Sources leads (distribution par source, bar chart SVG inline).
 *   6. 2 panneaux côte à côte (derniers leads, activité récente)
 *      avec liens vers la collection.
 *
 * 100 % Server Component, fetch direct via `payload.find/count`. Aucun
 * JS client embarqué — l'interactivité passe par les Links natifs vers
 * /admin/collections/* + hover CSS (charte appliquée via admin-theme.css).
 *
 * OWASP §10 :
 *   - A01 Auth : /admin protégé par middleware Payload upstream.
 *   - A03 Injection : Payload requêtes paramétrées.
 *   - A09 Fail-soft : helpers safeCount/safeFind absorbent les erreurs
 *     par collection — l'admin reste accessible même si une collection
 *     plante.
 */
export default async function OpenLabAdminDashboard(
  props: AdminViewServerProps,
): Promise<ReactElement> {
  const { payload, user } = props;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const fourteenDaysAgo = new Date(
    now.getTime() - 14 * 86_400_000,
  ).toISOString();
  const oneDayAgo = new Date(now.getTime() - 86_400_000).toISOString();

  // ---- helpers fail-soft ----
  const safeCount = async (
    p: Promise<{ totalDocs: number }>,
  ): Promise<number> => {
    try {
      return (await p).totalDocs;
    } catch {
      return 0;
    }
  };
  const safeFind = async <T,>(p: Promise<{ docs: T[] }>): Promise<T[]> => {
    try {
      return (await p).docs;
    } catch {
      return [];
    }
  };

  // ---- batches fetch ----
  const [
    leadsTotal,
    leadsRecent,
    leadsPrev,
    articlesDraft,
    articlesPublished,
    auditLast24h,
    leadsByStageRaw,
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
        collection: 'leads',
        where: {
          and: [
            { createdAt: { greater_than: fourteenDaysAgo } },
            { createdAt: { less_than_equal: sevenDaysAgo } },
          ],
        },
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
        collection: 'articles',
        where: { status: { equals: 'published' } },
      }),
    ),
    safeCount(
      payload.count({
        collection: 'auditLog',
        where: { createdAt: { greater_than: oneDayAgo } },
      }),
    ),
    safeFind<LeadRaw>(
      payload.find({
        collection: 'leads',
        limit: 200,
        depth: 0,
      }) as unknown as Promise<{ docs: LeadRaw[] }>,
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
        limit: 8,
        sort: '-createdAt',
        depth: 0,
      }) as unknown as Promise<{ docs: RecentAudit[] }>,
    ),
  ]);

  // Distribution par stage (depuis le dataset déjà chargé).
  const stagesOrder: readonly LeadStage[] = [
    'nouveau',
    'qualifie',
    'rdv',
    'proposition',
    'signe',
    'perdu',
  ];
  const stageCounts = countBy(leadsByStageRaw, 'stage', stagesOrder);
  const sourceLabels: readonly string[] = ['contact', 'audit-ia', 'newsletter'];
  const sourceCounts = countBy(leadsByStageRaw, 'source', sourceLabels);

  const leadsDeltaPct =
    leadsPrev > 0
      ? Math.round(((leadsRecent - leadsPrev) / leadsPrev) * 100)
      : leadsRecent > 0
        ? 100
        : 0;

  const kpis: KpiCard[] = [
    {
      icon: Users,
      label: 'Leads totaux',
      value: leadsTotal,
      hint: 'Pipeline CRM complet',
      delta: null,
      accent: 'orange',
      href: '/admin/collections/leads',
    },
    {
      icon: MailPlus,
      label: 'Nouveaux 7j',
      value: leadsRecent,
      hint: 'Soumissions /contact + /audit-ia',
      delta: leadsDeltaPct,
      accent: 'navy',
      href: `/admin/collections/leads?where[createdAt][greater_than]=${sevenDaysAgo}`,
    },
    {
      icon: FileText,
      label: 'Brouillons articles',
      value: articlesDraft,
      hint: `${articlesPublished} publié(s) au total`,
      delta: null,
      accent: 'orange',
      href: '/admin/collections/articles?where[status][equals]=draft',
    },
    {
      icon: ShieldCheck,
      label: 'Audit log 24h',
      value: auditLast24h,
      hint: 'Événements sensibles',
      delta: null,
      accent: 'navy',
      href: '/admin/collections/auditLog',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      icon: PlusCircle,
      label: 'Nouvel article',
      hint: 'Insights blog',
      href: '/admin/collections/articles/create',
      tone: 'orange',
    },
    {
      icon: SlidersHorizontal,
      label: 'Contenu site',
      hint: 'Globals Hero / Manifeste / Footer',
      href: '/admin/globals/hero-settings',
      tone: 'navy',
    },
    {
      icon: Target,
      label: 'Audit IA CTA',
      hint: 'Bandeau lead magnet',
      href: '/admin/globals/audit-ia-cta-settings',
      tone: 'navy',
    },
    {
      icon: UserCog,
      label: 'Utilisateurs',
      hint: 'Comptes + RBAC',
      href: '/admin/collections/users',
      tone: 'navy',
    },
    {
      icon: ImageIcon,
      label: 'Médias',
      hint: 'Bibliothèque MinIO',
      href: '/admin/collections/media',
      tone: 'navy',
    },
    {
      icon: Globe,
      label: 'Voir le site',
      hint: 'openlabconsulting.com',
      href: '/',
      tone: 'orange',
    },
  ];

  const heroSubtitle = formatHeroDate(now);
  const firstName = (user?.email?.split('@')[0] ?? 'OpenLab').replace(
    /[.+]/g,
    ' ',
  );

  return (
    <div data-testid="admin-dashboard" style={dashboardStyles.shell}>
      {/* -------- Hero contextuel -------- */}
      <header style={dashboardStyles.hero}>
        <div>
          <p style={dashboardStyles.eyebrow}>Tableau de bord</p>
          <h1 style={dashboardStyles.h1}>
            Bonjour <span style={{ color: '#FF5A00' }}>{firstName}</span>.
          </h1>
          <p style={dashboardStyles.heroSubtitle}>{heroSubtitle}</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={dashboardStyles.heroLink}
        >
          openlabconsulting.com ↗
        </a>
      </header>

      {/* -------- KPIs -------- */}
      <section aria-label="Indicateurs clés" style={dashboardStyles.grid4}>
        {kpis.map((k) => (
          <KpiBlock key={k.label} kpi={k} />
        ))}
      </section>

      {/* -------- Quick actions -------- */}
      <section aria-label="Actions rapides" style={dashboardStyles.actionsRow}>
        <h2 style={dashboardStyles.sectionTitle}>Actions rapides</h2>
        <div style={dashboardStyles.grid6}>
          {quickActions.map((a) => (
            <QuickActionBlock key={a.label} action={a} />
          ))}
        </div>
      </section>

      {/* -------- Visualisations -------- */}
      <section
        aria-label="Distribution leads"
        style={dashboardStyles.grid2Wide}
      >
        <Panel
          title="Pipeline leads"
          hint="Distribution par stage"
          href="/admin/collections/leads"
        >
          <BarChart
            data={stagesOrder.map((s) => ({
              label: STAGE_LABELS[s],
              value: stageCounts[s] ?? 0,
              accent:
                s === 'signe'
                  ? '#22c55e'
                  : s === 'perdu'
                    ? '#dc2626'
                    : '#FF5A00',
            }))}
          />
        </Panel>
        <Panel
          title="Sources des leads"
          hint="Origine des soumissions"
          href="/admin/collections/leads"
        >
          <BarChart
            data={sourceLabels.map((s) => ({
              label: SOURCE_LABELS[s] ?? s,
              value: sourceCounts[s] ?? 0,
              accent: '#0B1B3D',
            }))}
          />
        </Panel>
      </section>

      {/* -------- Panneaux activité -------- */}
      <section aria-label="Activité" style={dashboardStyles.grid2}>
        <Panel
          title="Derniers leads"
          hint={`${recentLeads.length} entrée(s) récente(s)`}
          href="/admin/collections/leads"
        >
          {recentLeads.length === 0 ? (
            <EmptyState message="Aucun lead pour l'instant. Les soumissions /contact + /audit-ia apparaîtront ici." />
          ) : (
            <ul style={dashboardStyles.list}>
              {recentLeads.map((lead) => (
                <li key={String(lead.id)} style={dashboardStyles.listItem}>
                  <a
                    href={`/admin/collections/leads/${lead.id}`}
                    style={dashboardStyles.listLink}
                  >
                    <strong style={dashboardStyles.listTitle}>
                      {lead.email}
                    </strong>
                    <div style={dashboardStyles.listMeta}>
                      {lead.organization ?? '—'} ·{' '}
                      {SOURCE_LABELS[lead.source ?? ''] ?? lead.source ?? '—'} ·{' '}
                      <Badge tone={stageTone(lead.stage)}>
                        {STAGE_LABELS[lead.stage as LeadStage] ?? lead.stage}
                      </Badge>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Activité récente"
          hint="Journal d'audit"
          href="/admin/collections/auditLog"
        >
          {recentAudit.length === 0 ? (
            <EmptyState message="Pas d'événement enregistré récemment." />
          ) : (
            <ul style={dashboardStyles.list}>
              {recentAudit.map((entry) => (
                <li key={String(entry.id)} style={dashboardStyles.listItem}>
                  <a
                    href={`/admin/collections/auditLog/${entry.id}`}
                    style={dashboardStyles.listLink}
                  >
                    <strong style={dashboardStyles.listTitle}>
                      {entry.action}
                    </strong>
                    <div style={dashboardStyles.listMeta}>
                      {entry.resource ?? '—'} · {entry.userEmail ?? 'système'}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

// =============================================================
// Sub-components
// =============================================================

function KpiBlock({ kpi }: { kpi: KpiCard }): ReactElement {
  const accentColor = kpi.accent === 'orange' ? '#FF5A00' : '#0B1B3D';
  const deltaColor = (kpi.delta ?? 0) >= 0 ? '#22c55e' : '#dc2626';
  const Icon = kpi.icon;
  return (
    <a
      href={kpi.href}
      style={{ ...dashboardStyles.kpi, textDecoration: 'none' }}
    >
      <div style={dashboardStyles.kpiHead}>
        <span style={dashboardStyles.kpiIcon}>
          <Icon size={22} color={accentColor} aria-hidden />
        </span>
        <span style={{ ...dashboardStyles.kpiLabel, color: '#4A4E58' }}>
          {kpi.label}
        </span>
      </div>
      <div style={{ ...dashboardStyles.kpiValue, color: accentColor }}>
        {kpi.value.toLocaleString('fr-FR')}
      </div>
      <div style={dashboardStyles.kpiFooter}>
        <span style={dashboardStyles.kpiHint}>{kpi.hint}</span>
        {kpi.delta !== null ? (
          <span
            style={{
              ...dashboardStyles.kpiDelta,
              color: deltaColor,
              background:
                (kpi.delta ?? 0) >= 0
                  ? 'rgba(34,197,94,0.10)'
                  : 'rgba(220,38,38,0.10)',
            }}
          >
            {kpi.delta >= 0 ? '↑' : '↓'} {Math.abs(kpi.delta)} %
          </span>
        ) : null}
      </div>
    </a>
  );
}

function QuickActionBlock({ action }: { action: QuickAction }): ReactElement {
  const accent = action.tone === 'orange' ? '#FF5A00' : '#0B1B3D';
  const Icon = action.icon;
  return (
    <a href={action.href} style={dashboardStyles.action}>
      <span
        style={{
          ...dashboardStyles.actionIcon,
          background: `${accent}15`,
          color: accent,
        }}
      >
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <div style={dashboardStyles.actionLabel}>{action.label}</div>
        <div style={dashboardStyles.actionHint}>{action.hint}</div>
      </div>
    </a>
  );
}

function Panel({
  title,
  hint,
  href,
  children,
}: {
  title: string;
  hint?: string;
  href?: string;
  children: React.ReactNode;
}): ReactElement {
  return (
    <section aria-labelledby={`panel-${title}`} style={dashboardStyles.panel}>
      <header style={dashboardStyles.panelHead}>
        <div>
          <h2 id={`panel-${title}`} style={dashboardStyles.panelTitle}>
            {title}
          </h2>
          {hint ? <p style={dashboardStyles.panelHint}>{hint}</p> : null}
        </div>
        {href ? (
          <a href={href} style={dashboardStyles.panelLink}>
            Voir tout →
          </a>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function BarChart({
  data,
}: {
  data: readonly { label: string; value: number; accent: string }[];
}): ReactElement {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul style={{ ...dashboardStyles.list, gap: 10 }}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <li key={d.label}>
            <div style={dashboardStyles.barLabelRow}>
              <span style={dashboardStyles.barLabel}>{d.label}</span>
              <strong style={dashboardStyles.barValue}>{d.value}</strong>
            </div>
            <div style={dashboardStyles.barTrack}>
              <div
                style={{
                  ...dashboardStyles.barFill,
                  width: `${pct}%`,
                  background: d.accent,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: 'orange' | 'navy' | 'green' | 'red' | 'neutral';
  children: React.ReactNode;
}): ReactElement {
  const bg = {
    orange: 'rgba(255,90,0,0.12)',
    navy: 'rgba(11,27,61,0.10)',
    green: 'rgba(34,197,94,0.12)',
    red: 'rgba(220,38,38,0.12)',
    neutral: 'rgba(74,78,88,0.10)',
  }[tone];
  const color = {
    orange: '#CC4800',
    navy: '#0B1B3D',
    green: '#15803d',
    red: '#991b1b',
    neutral: '#4A4E58',
  }[tone];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: bg,
        color,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

function EmptyState({ message }: { message: string }): ReactElement {
  return (
    <div style={dashboardStyles.emptyState}>
      <p style={{ margin: 0, color: '#4A4E58', fontSize: 14 }}>{message}</p>
    </div>
  );
}

// =============================================================
// Types
// =============================================================

interface KpiCard {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  delta: number | null;
  accent: 'orange' | 'navy';
  href: string;
}
interface QuickAction {
  icon: LucideIcon;
  label: string;
  hint: string;
  href: string;
  tone: 'orange' | 'navy';
}
interface LeadRaw {
  id: string | number;
  stage?: string;
  source?: string;
}
interface RecentLead extends LeadRaw {
  email: string;
  organization?: string;
}
interface RecentAudit {
  id: string | number;
  action: string;
  resource?: string;
  userEmail?: string;
}
type LeadStage =
  | 'nouveau'
  | 'qualifie'
  | 'rdv'
  | 'proposition'
  | 'signe'
  | 'perdu';

// =============================================================
// Helpers (pure functions, testable)
// =============================================================

function countBy<T extends object>(
  items: readonly T[],
  key: keyof T,
  keysOfInterest: readonly string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keysOfInterest) out[k] = 0;
  for (const item of items) {
    const v = (item as Record<string, unknown>)[key as string];
    if (typeof v === 'string') {
      out[v] = (out[v] ?? 0) + 1;
    }
  }
  return out;
}

function formatHeroDate(d: Date): string {
  const days = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
  ];
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${hh}h${mm}`;
}

function stageTone(
  stage: string | undefined,
): 'orange' | 'navy' | 'green' | 'red' | 'neutral' {
  switch (stage) {
    case 'signe':
      return 'green';
    case 'perdu':
      return 'red';
    case 'nouveau':
      return 'orange';
    default:
      return 'navy';
  }
}

const STAGE_LABELS: Record<LeadStage, string> = {
  nouveau: 'Nouveau',
  qualifie: 'Qualifié',
  rdv: 'RDV',
  proposition: 'Proposition',
  signe: 'Signé',
  perdu: 'Perdu',
};

const SOURCE_LABELS: Record<string, string> = {
  contact: 'Contact',
  'audit-ia': 'Audit IA',
  newsletter: 'Newsletter',
};

// =============================================================
// Styles (inline pour garantir cohérence dans le shell Payload)
// =============================================================

const dashboardStyles = {
  shell: {
    padding: '32px 40px 64px',
    background: '#FAF8F5',
    minHeight: '100vh',
    fontFamily:
      '"Bricolage Grotesque", Geist, system-ui, -apple-system, sans-serif',
    color: '#0A0E1A',
  },
  hero: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap' as const,
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
    color: '#FF5A00',
    margin: 0,
    fontWeight: 600,
  },
  h1: {
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: '8px 0 4px',
  },
  heroSubtitle: { margin: 0, color: '#4A4E58', fontSize: 14 },
  heroLink: {
    fontSize: 13,
    fontWeight: 600,
    color: '#0B1B3D',
    textDecoration: 'none',
    padding: '8px 14px',
    border: '1px solid #E8EAF0',
    borderRadius: 6,
    background: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    color: '#4A4E58',
    margin: '0 0 12px',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  grid6: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  grid2Wide: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  actionsRow: { marginBottom: 32 },
  // -- KPI --
  kpi: {
    background: '#FFFFFF',
    border: '1px solid #E8EAF0',
    borderRadius: 10,
    padding: 20,
    display: 'block',
    color: '#0A0E1A',
    transition: 'border-color 150ms ease, transform 150ms ease',
  },
  kpiHead: { display: 'flex', alignItems: 'center', gap: 10 },
  kpiIcon: { fontSize: 20 },
  kpiLabel: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    fontWeight: 600,
  },
  kpiValue: {
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: '8px 0 8px',
    lineHeight: 1,
  },
  kpiFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kpiHint: { fontSize: 12, color: '#4A4E58' },
  kpiDelta: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 999,
  },
  // -- Action --
  action: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid #E8EAF0',
    background: '#FFFFFF',
    textDecoration: 'none',
    color: '#0A0E1A',
    transition: 'border-color 150ms ease, transform 150ms ease',
  },
  actionIcon: {
    display: 'inline-flex',
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
  },
  actionLabel: { fontSize: 14, fontWeight: 600 },
  actionHint: { fontSize: 12, color: '#4A4E58', marginTop: 2 },
  // -- Panel --
  panel: {
    background: '#FFFFFF',
    border: '1px solid #E8EAF0',
    borderRadius: 10,
    padding: 24,
  },
  panelHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  panelHint: { margin: '2px 0 0', fontSize: 12, color: '#4A4E58' },
  panelLink: {
    fontSize: 13,
    fontWeight: 600,
    color: '#FF5A00',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
  },
  // -- Lists --
  list: {
    listStyle: 'none' as const,
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  listItem: { borderBottom: '1px solid #F0F2F6' },
  listLink: {
    display: 'block',
    padding: '12px 0',
    textDecoration: 'none',
    color: '#0A0E1A',
  },
  listTitle: { fontSize: 14, fontWeight: 600 },
  listMeta: {
    fontSize: 12,
    color: '#4A4E58',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  // -- BarChart --
  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  barLabel: { fontSize: 12, color: '#4A4E58', fontWeight: 500 },
  barValue: { fontSize: 13, color: '#0A0E1A' },
  barTrack: {
    height: 6,
    background: '#F0F2F6',
    borderRadius: 999,
    overflow: 'hidden' as const,
  },
  barFill: { height: '100%', borderRadius: 999 },
  emptyState: {
    padding: '24px 0',
    borderTop: '1px dashed #E8EAF0',
  },
} as const;
