# Sécurité OWASP & authentification

> Référence extraite de `CLAUDE.md` (ex-§10 et §11). Headers HTTP, rate limiting, RGPD, OWASP Top 10, rôles RBAC, 2FA. **Checklist OWASP obligatoire à chaque PR sensible.** Voir aussi `docs/security-overrides.md`.

## 1. Sécurité — conformité OWASP

### 1.1 Référentiels suivis

- **OWASP Top 10 (2021)** — couverture intégrale
- **OWASP ASVS 4.0.3** — niveau 2 minimum
- **OWASP API Security Top 10 (2023)**
- **CNIL/RGPD** — droit ivoirien (Loi 2013-450) + européen
- **NIST Cybersecurity Framework**

### 1.2 Couverture OWASP Top 10

| #       | Risque                             | Mitigation                                                                                          |
| ------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| **A01** | Broken Access Control              | RBAC strict Payload, vérification serveur sur chaque route API, deny by default, tests E2E par rôle |
| **A02** | Cryptographic Failures             | TLS 1.3, HSTS max-age 1 an, AES-256 data at rest (PostgreSQL TDE), bcrypt cost 12, SealedSecrets    |
| **A03** | Injection                          | Drizzle ORM paramétré, Zod validation, échappement React, CSP stricte                               |
| **A04** | Insecure Design                    | Threat modeling sur features sensibles, tests d'abus en CI                                          |
| **A05** | Security Misconfiguration          | Distroless images, no shell prod, headers via middleware, .env jamais commit                        |
| **A06** | Vulnerable Components              | Renovate Bot, pnpm audit en CI, Trivy scan images, Snyk                                             |
| **A07** | Identification & Auth Failures     | Better-Auth + 2FA TOTP, rate limit login (5/15min), session rotation, password policy 12+ chars     |
| **A08** | Software & Data Integrity Failures | SBOM signé Cosign, images container signées, lockfiles committed                                    |
| **A09** | Security Logging & Monitoring      | Loki + Grafana, alertes 5xx > 1%, 401/403 > 10/min                                                  |
| **A10** | SSRF                               | Whitelist domaines outbound, validation URL Zod, NetworkPolicy K3s                                  |

### 1.3 Headers HTTP de sécurité

Via middleware Next.js (`middleware.ts`) :

```typescript
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-{NONCE}' https://plausible.openlabconsulting.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.anthropic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
'X-Frame-Options': 'DENY'
'X-Content-Type-Options': 'nosniff'
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)'
'Cross-Origin-Opener-Policy': 'same-origin'
'Cross-Origin-Embedder-Policy': 'credentialless'
'Cross-Origin-Resource-Policy': 'same-origin'
```

Cible : note A+ sur securityheaders.com

### 1.4 Rate limiting (Redis-backed)

| Endpoint                     | Limite                                              |
| ---------------------------- | --------------------------------------------------- |
| `POST /api/contact`          | 5 req / 15 min / IP                                 |
| `POST /api/audit-ia`         | 3 req / 1 h / IP                                    |
| `POST /api/chat` (assistant) | 20 req / 1 min / session                            |
| `POST /admin/login`          | 5 req / 15 min / IP, lockout 30 min après 10 échecs |
| `GET /*`                     | 200 req / 1 min / IP                                |
| `*` (global)                 | 1000 req / 1 min / IP                               |

### 1.5 Anti-bot & anti-spam

- **Cloudflare Turnstile** sur formulaires publics (gratuit, RGPD-friendly)
- **Honeypot fields** invisibles
- **Validation Zod stricte** serveur
- **Détection spam IA** : Claude API analyse en arrière-plan

### 1.6 Données personnelles & RGPD

- Bandeau cookies minimal (Plausible n'en pose pas → souvent inutile)
- Politique confidentialité complète
- Droit à l'oubli : `/api/data-export` et `/api/data-delete` (auth)
- DPO désigné : nom et email dans mentions légales
- Registre des traitements (admin → système)
- Données en Allemagne (Hetzner Falkenstein/Nuremberg) — conforme RGPD UE

### 1.7 Sauvegardes & DR

- **PostgreSQL** : pgBackRest ou wal-g, incrémental horaire, full quotidien
- **MinIO** : réplication asynchrone vers second bucket
- **Rétention** : 30 jours quotidiens + 12 mois mensuels
- **Storage backups** : Backblaze B2 (off-site)
- **Test restauration** : CronJob automatisé toutes les 2 semaines
- **RPO** : 1 h · **RTO** : 30 min

## 2. Authentification & autorisation

### 2.1 Site public

- Pas de compte obligatoire
- Inscription optionnelle pour : audit IA, livre companion, extraits livre
- Better-Auth avec : email + password + 2FA optionnel, social login LinkedIn (B2B) + Google

### 2.2 Admin

- **Better-Auth + Keycloak SSO** unifié avec NexusRH déjà déployé
- **2FA OBLIGATOIRE** (TOTP via Aegis, Authy, Google Authenticator)
- **Politique mot de passe** : 12+ chars, zxcvbn ≥ 3, rotation 6 mois admins, historique 5 derniers interdits
- **Session** : cookie httpOnly secure sameSite=lax, rolling 30 min idle, 8 h absolu, rotation à chaque login
- **Account lockout** : 10 échecs / 30 min → blocage 30 min + alerte email admin
- **Audit log** : chaque action sensible (CRUD, login, export) loggée avec timestamp, user, IP, user-agent, ressource, action

### 2.3 Rôles admin

```
SUPER_ADMIN     Tous droits + gestion users + paramètres système
ADMIN           Tous droits sauf gestion users
EDITOR_CHIEF    CRUD complet contenu + produits + livre + voit leads
EDITOR          CRUD articles, médias, FAQs
AUTHOR          CRUD ses propres articles uniquement (soumission validation)
VIEWER          Lecture seule (dashboard, KPIs)
```

### 2.4 Implémentation

```typescript
// lib/auth/permissions.ts
export const permissions = {
  articles: {
    create: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF', 'EDITOR', 'AUTHOR'],
    update: (user, doc) => {
      if (
        ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF', 'EDITOR'].includes(user.role)
      )
        return true;
      if (user.role === 'AUTHOR' && doc.author === user.id) return true;
      return false;
    },
    delete: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF'],
    publish: ['SUPER_ADMIN', 'ADMIN', 'EDITOR_CHIEF'],
  },
};
```

Toute route admin : `assertPermission(user, resource, action)` côté serveur.
