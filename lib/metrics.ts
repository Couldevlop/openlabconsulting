/**
 * Métriques Prometheus — CLAUDE.md §15.
 *
 * Implémentation minimale sans dépendance (prom-client est trop lourd
 * pour les besoins MVP). Format texte conforme Prometheus exposition
 * format v0.0.4 — readable par Grafana sans transformation.
 *
 * Compteurs / jauges in-memory : adapté pour 1-2 réplicas. Si on
 * scale > 2, brancher prom-client + Pushgateway pour agrégation.
 */

interface MetricCommon {
  name: string;
  help: string;
  /** Labels figés au moment de l'incrément. */
  labels?: Record<string, string>;
}

type MetricKey = string;

const counters = new Map<MetricKey, number>();
const gauges = new Map<MetricKey, number>();

function keyOf(name: string, labels?: Record<string, string>): MetricKey {
  if (!labels || Object.keys(labels).length === 0) return name;
  const parts = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v.replace(/"/g, '\\"')}"`)
    .join(',');
  return `${name}{${parts}}`;
}

const help = new Map<string, string>();
const types = new Map<string, 'counter' | 'gauge'>();

export function counterInc(metric: MetricCommon, delta = 1): void {
  help.set(metric.name, metric.help);
  types.set(metric.name, 'counter');
  const k = keyOf(metric.name, metric.labels);
  counters.set(k, (counters.get(k) ?? 0) + delta);
}

export function gaugeSet(metric: MetricCommon, value: number): void {
  help.set(metric.name, metric.help);
  types.set(metric.name, 'gauge');
  const k = keyOf(metric.name, metric.labels);
  gauges.set(k, value);
}

/**
 * Rend les métriques au format Prometheus exposition format.
 * Une ligne `# HELP` et une ligne `# TYPE` par nom de métrique, puis
 * une ligne par tuple (name, labels) = value.
 */
export function renderMetrics(): string {
  const lines: string[] = [];
  const seen = new Set<string>();

  // On émet d'abord les counters puis les gauges, en regroupant par nom.
  const allKeys = [...counters.keys(), ...gauges.keys()];
  const byName = new Map<string, MetricKey[]>();
  for (const k of allKeys) {
    const name = k.split('{')[0]!;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name)!.push(k);
  }

  for (const [name, keys] of byName.entries()) {
    if (seen.has(name)) continue;
    seen.add(name);
    lines.push(`# HELP ${name} ${help.get(name) ?? 'n/a'}`);
    lines.push(`# TYPE ${name} ${types.get(name) ?? 'untyped'}`);
    for (const k of keys) {
      const value = counters.get(k) ?? gauges.get(k) ?? 0;
      lines.push(`${k} ${value}`);
    }
  }

  // Métadonnées process basiques (sans dépendre de prom-client) :
  // uptime, memory heap. Permet déjà des alertes utiles.
  const memUsage = process.memoryUsage();
  lines.push('# HELP nodejs_heap_used_bytes Heap memory used (bytes).');
  lines.push('# TYPE nodejs_heap_used_bytes gauge');
  lines.push(`nodejs_heap_used_bytes ${memUsage.heapUsed}`);
  lines.push('# HELP nodejs_uptime_seconds Process uptime (seconds).');
  lines.push('# TYPE nodejs_uptime_seconds gauge');
  lines.push(`nodejs_uptime_seconds ${process.uptime().toFixed(2)}`);

  return lines.join('\n') + '\n';
}

/**
 * Réinitialise toutes les métriques — utile en tests.
 */
export function __resetMetrics(): void {
  counters.clear();
  gauges.clear();
  help.clear();
  types.clear();
}

/**
 * Helpers métier — incrémentent les compteurs canoniques OpenLab.
 */
export const METRICS = {
  httpRequest(route: string, status: number): void {
    counterInc({
      name: 'http_requests_total',
      help: 'Total HTTP requests received by the Next.js app.',
      labels: { route, status: String(status) },
    });
  },
  contactSubmission(outcome: 'accepted' | 'rate_limited' | 'invalid'): void {
    counterInc({
      name: 'openlab_contact_submissions_total',
      help: 'Soumissions du formulaire de contact, par issue.',
      labels: { outcome },
    });
  },
  auditIaSubmission(outcome: 'accepted' | 'rate_limited' | 'invalid'): void {
    counterInc({
      name: 'openlab_audit_ia_submissions_total',
      help: 'Demandes d’audit IA, par issue.',
      labels: { outcome },
    });
  },
  authEvent(
    event: 'login.success' | 'login.failed' | '2fa.verify' | '2fa.enable',
  ): void {
    counterInc({
      name: 'openlab_auth_events_total',
      help: 'Événements d’authentification admin.',
      labels: { event },
    });
  },
};
