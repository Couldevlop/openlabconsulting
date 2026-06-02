/**
 * Rate limiting — CLAUDE.md §10.4.
 *
 * Backend Redis (production K3s) avec fallback in-memory pour dev sans
 * Redis. Détection via `REDIS_URL` :
 *   - défini → ioredis vers le cluster
 *   - absent  → token bucket en mémoire (process-local, suffit en dev)
 *
 * API : `await rateLimit(key, opts)` → `{ ok, remaining, resetAt }`.
 * Si `ok === false`, l'appelant doit renvoyer 429 avec `Retry-After`.
 *
 * Aucune dépendance Edge runtime — utilisable depuis route handlers
 * Node.js (`/api/*`). Pour le middleware (Edge), utiliser uniquement
 * la version in-memory ou un client compatible Edge (Upstash REST).
 */

export interface RateLimitOptions {
  /** Nombre max de hits dans la fenêtre. */
  limit: number;
  /** Taille de la fenêtre en secondes. */
  windowSec: number;
  /**
   * Comportement en cas d'indisponibilité de Redis (incident/timeout).
   *   - `false` (défaut) : fail-open — on laisse passer (dispo > sécurité).
   *   - `true` : fail-closed — on renvoie `ok:false` (429). À réserver aux
   *     endpoints sensibles (contact, audit-ia, login) où une panne Redis
   *     ne doit pas ouvrir un flood/brute-force (OWASP A07).
   */
  failClosed?: boolean;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Timestamp (ms) auquel la fenêtre se réinitialise. */
  resetAt: number;
}

// ────────────────────────────────────────────────────────────
// In-memory fallback (dev sans Redis)
// ────────────────────────────────────────────────────────────

interface MemoryBucket {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryBucket>();

function memoryRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: opts.limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  const remaining = Math.max(0, opts.limit - existing.count);
  return {
    ok: existing.count <= opts.limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

/**
 * Purge périodique du Map en mémoire — évite la fuite mémoire si
 * beaucoup de clés uniques (ex. IP). Appelé tous les 5 min.
 */
let memoryCleanupTimer: ReturnType<typeof setInterval> | null = null;
function startMemoryCleanup(): void {
  if (memoryCleanupTimer) return;
  memoryCleanupTimer = setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of memoryStore.entries()) {
        if (bucket.resetAt <= now) memoryStore.delete(key);
      }
    },
    5 * 60 * 1000,
  );
  // unref pour ne pas bloquer le process shutdown en dev.
  memoryCleanupTimer.unref?.();
}

// ────────────────────────────────────────────────────────────
// Redis backend (production)
// ────────────────────────────────────────────────────────────

// Chargement paresseux pour ne pas embarquer ioredis dans les bundles
// si jamais cette lib finissait dans un client component.
type RedisClient = {
  multi: () => {
    incr: (k: string) => unknown;
    expire: (k: string, sec: number) => unknown;
    pttl: (k: string) => unknown;
    exec: () => Promise<Array<[Error | null, unknown]> | null>;
  };
};

let redisClient: RedisClient | null = null;
let redisLoadAttempted = false;

async function getRedis(): Promise<RedisClient | null> {
  if (redisClient) return redisClient;
  if (redisLoadAttempted) return null;
  redisLoadAttempted = true;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const mod = (await import('ioredis')) as unknown as {
      default: new (url: string) => RedisClient;
    };
    const Ctor = mod.default;
    redisClient = new Ctor(url);
    return redisClient;
  } catch {
    return null;
  }
}

async function redisRateLimit(
  redis: RedisClient,
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  // Token bucket simplifié : INCR + EXPIRE (set la première fois)
  // + PTTL pour connaître le temps restant.
  const ns = `ratelimit:${key}`;
  const pipeline = redis.multi();
  pipeline.incr(ns);
  pipeline.expire(ns, opts.windowSec);
  pipeline.pttl(ns);
  const res = await pipeline.exec();
  if (!res) {
    // Exec rejeté → fail-closed sur endpoints sensibles, sinon fail-open.
    const open = opts.failClosed !== true;
    return {
      ok: open,
      remaining: open ? opts.limit : 0,
      resetAt: Date.now() + opts.windowSec * 1000,
    };
  }
  const count = Number(res[0]?.[1] ?? 0);
  const ttlMs = Number(res[2]?.[1] ?? opts.windowSec * 1000);
  const resetAt = Date.now() + Math.max(0, ttlMs);
  const remaining = Math.max(0, opts.limit - count);
  return { ok: count <= opts.limit, remaining, resetAt };
}

// ────────────────────────────────────────────────────────────
// API publique
// ────────────────────────────────────────────────────────────

/**
 * Décrémente le quota associé à `key` et renvoie le résultat.
 * `key` est typiquement `<route>:<ip>` (ex: `contact:1.2.3.4`).
 *
 * - En prod (REDIS_URL set) : utilise Redis.
 * - En dev sans Redis : token bucket en mémoire.
 *
 * Fail-open : si Redis down, on laisse passer (mieux que de tout
 * bloquer). Le système d'alerting Loki captera l'anomalie.
 */
export async function rateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  startMemoryCleanup();
  const redis = await getRedis();
  if (redis) {
    try {
      return await redisRateLimit(redis, key, opts);
    } catch {
      // Incident Redis (timeout, etc.). Sur endpoint sensible → fail-closed
      // (429) plutôt que de retomber sur un bucket mémoire par-pod qui, en
      // prod multi-réplicas, laisserait passer le flood. Sinon fail-open dev.
      if (opts.failClosed === true) {
        return {
          ok: false,
          remaining: 0,
          resetAt: Date.now() + opts.windowSec * 1000,
        };
      }
      return memoryRateLimit(key, opts);
    }
  }
  return memoryRateLimit(key, opts);
}

/**
 * Réinitialise le store mémoire — utilisé uniquement dans les tests.
 */
export function __resetMemoryStore(): void {
  memoryStore.clear();
}

/**
 * Préréglages de quotas par endpoint (CLAUDE.md §10.4).
 */
export const RATE_LIMITS = {
  contact: { limit: 5, windowSec: 15 * 60, failClosed: true }, // 5 / 15 min / IP
  auditIa: { limit: 3, windowSec: 60 * 60, failClosed: true }, // 3 / 1 h / IP
  chat: { limit: 20, windowSec: 60 }, // 20 / 1 min / session
  login: { limit: 5, windowSec: 15 * 60, failClosed: true }, // 5 / 15 min / IP
  globalGet: { limit: 200, windowSec: 60 }, // 200 / 1 min / IP (GET)
  globalAll: { limit: 1000, windowSec: 60 }, // 1000 / 1 min / IP (toutes méthodes)
} as const satisfies Record<string, RateLimitOptions>;
