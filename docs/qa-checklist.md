# Checklist QA — pré-lancement

CLAUDE.md §17. À cocher avant chaque release majeure.

## Automatisé (CI)

Tourne à chaque PR vers `develop` et `main`, gates obligatoires.

| Gate                 | Cible                             | Job         |
| -------------------- | --------------------------------- | ----------- |
| `pnpm format:check`  | Prettier propre                   | ci.yml      |
| `pnpm lint`          | ESLint 0 error                    | ci.yml      |
| `pnpm typecheck`     | tsc strict 0 erreur               | ci.yml      |
| `pnpm test`          | Vitest 100 % verts                | ci.yml      |
| `pnpm test:coverage` | Lignes ≥ 80 %, branches ≥ 75 %    | ci.yml      |
| `pnpm build`         | Next standalone build OK          | ci.yml      |
| Trivy scan image     | 0 CVE HIGH/CRITICAL               | ci.yml      |
| Cosign sign          | Image signée                      | ci.yml      |
| Playwright E2E       | Smoke + axe-core 0 violation      | quality.yml |
| Lighthouse CI        | Perf ≥ 90 / A11y ≥ 95 / SEO = 100 | quality.yml |

## Manuel — avant release

### Design (§17.1)

- [ ] Aucune des polices interdites (Inter, Roboto, Open Sans, Poppins, Montserrat)
- [ ] Orange < 15 % de la surface visible à tout instant
- [ ] Testé sur résolutions 360 / 768 / 1024 / 1440 / 2560 px
- [ ] Aucun stock photo générique
- [ ] `prefers-reduced-motion` respecté (animations Motion v12)

### UX (§17.2)

- [ ] Règle des 3 clics validée pour info critique depuis la home
- [ ] CTA primaire visible above-the-fold sur toutes les pages clés
- [ ] Aucune page cul-de-sac (toujours un CTA en bas)
- [ ] Cmd+K fonctionnel dans l'admin Payload

### Performance (§17.3)

- [ ] Lighthouse mobile : Perf ≥ 95 / A11y ≥ 95 / BP ≥ 95 / SEO 100
- [ ] LCP < 1.8 s sur 4G simulé
- [ ] INP < 200 ms
- [ ] CLS < 0.05
- [ ] Bundle JS first-load < 150 kB (mesuré actuel : ~103 kB)

### Accessibilité (§17.4)

- [ ] axe-core CI : 0 erreur critique / serious sur 4 pages clés
- [ ] Navigation clavier complète (skip-link, focus visible, tab order)
- [ ] Contrastes WCAG AAA sur le texte principal

### SEO (§17.5)

- [ ] sitemap.xml soumis dans Google Search Console + Bing Webmaster
- [ ] robots.txt autorise GPTBot, ClaudeBot, PerplexityBot
- [ ] Schema.org Organization / LocalBusiness / Article / Product / Book / FAQPage
- [ ] /llms.txt présent à la racine
- [ ] OG images dynamiques sur articles + page racine

### Sécurité OWASP (§17.6)

- [ ] securityheaders.com note A+ (https://openlabconsulting.com)
- [ ] CSP nonce + strict-dynamic actif (aucun script inline sans nonce)
- [ ] Rate limiting Redis actif sur /api/contact + /api/audit-ia
- [ ] CAPTCHA Turnstile sur formulaires publics
- [ ] 2FA TOTP obligatoire pour rôles super-admin + admin
- [ ] Audit log opérationnel (collection auditLog visible dans admin)
- [ ] OWASP ZAP scan baseline : 0 vulnérabilité HIGH
- [ ] Trivy scan image : 0 CVE HIGH/CRITICAL
- [ ] Pentest manuel (optionnel, recommandé pour les organismes publics)

### Conformité (§17.7)

- [ ] Mentions légales avec RCCM, siège, DPO contact
- [ ] Politique de confidentialité complète (loi 2013-450 + RGPD UE)
- [ ] Pas de cookies sans consentement (Plausible n'en pose pas → OK)
- [ ] Registre des traitements à jour (admin → système, P11+)

### Infra (§17.8)

- [ ] HTTPS forcé via Traefik + cert-manager (Let's Encrypt prod)
- [ ] HSTS preload activé sur openlabconsulting.com
- [ ] Sauvegardes Postgres testées (DR CronJob `dr-test` vert)
- [ ] Monitoring Prometheus actif + alertes Slack
- [ ] Health + readiness probes vertes sur tous les pods
- [ ] HPA min 2 / max 5 configuré
- [ ] PodDisruptionBudget minAvailable 1
- [ ] NetworkPolicy restrictive (egress whitelist)
- [ ] Deploy < 10 min vérifié sur staging puis prod

### Contenu (§17.9)

- [ ] 0 faute (Antidote / LanguageTool)
- [ ] Tous les chiffres sourcés (footer ou tooltip)
- [ ] 10 articles publiés au minimum avant lancement public
- [ ] Page livre complète (chapitres, extraits, acheter, companion)
- [ ] 7 fiches produits remplies avec proofs + pricing + FAQ

## Commandes utiles

```bash
# Lancer la suite QA complète en local
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build
pnpm test:e2e

# Lighthouse local (ne nécessite pas la CI)
pnpm build && pnpm start &
npx @lhci/cli@latest autorun --config=.lighthouserc.json

# Smoke vers staging
curl -fsS https://staging.openlabconsulting.com/api/health
curl -fsS https://staging.openlabconsulting.com/sitemap.xml | head -20

# Audit sécurité headers
curl -I https://openlabconsulting.com | grep -iE 'strict-transport|x-frame|content-security|referrer-policy'
```
