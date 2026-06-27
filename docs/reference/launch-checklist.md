# Checklist de qualité avant mise en ligne

> Référence extraite de `CLAUDE.md` (ex-§17). À passer en revue avant chaque mise en ligne majeure. Voir aussi `docs/qa-checklist.md`.

## 1. Design

- [ ] Aucune police générique
- [ ] Orange < 15% à tout écran
- [ ] Testé 360 / 768 / 1024 / 1440 / 2560 px
- [ ] Aucun stock photo générique
- [ ] `prefers-reduced-motion` respecté

## 2. UX

- [ ] Règle des 3 clics validée
- [ ] CTA primaire above-the-fold partout
- [ ] Aucune page cul-de-sac
- [ ] Cmd+K admin fonctionnel

## 3. Performance

- [ ] Lighthouse mobile : Perf ≥ 95 · A11y ≥ 95 · BP ≥ 95 · SEO ≥ 100
- [ ] LCP < 1.8 s · INP < 200 ms · CLS < 0.05
- [ ] Bundle JS first-load < 150 kB

## 4. Accessibilité

- [ ] axe-core : 0 erreur critique
- [ ] Navigation clavier 100%
- [ ] Contrastes WCAG AAA

## 5. SEO

- [ ] Sitemap.xml + soumis Search Console
- [ ] robots.txt configuré
- [ ] Schema.org pages clés
- [ ] /llms.txt présent

## 6. Sécurité OWASP

- [ ] Headers sécurité présents → securityheaders.com note A+
- [ ] CSP stricte testée
- [ ] Rate limiting actif
- [ ] CAPTCHA sur formulaires publics
- [ ] 2FA obligatoire admin
- [ ] Audit log opérationnel
- [ ] OWASP ZAP scan sans HIGH/CRITICAL
- [ ] Trivy scan image sans HIGH/CRITICAL
- [ ] Pentest manuel (optionnel mais recommandé)

## 7. Conformité

- [ ] Mentions légales + DPO
- [ ] Politique confidentialité
- [ ] Bandeau cookies (si requis)
- [ ] Registre traitements

## 8. Infra

- [ ] HTTPS forcé + HSTS preload
- [ ] Sauvegardes PG + MinIO testées
- [ ] Monitoring Prometheus + alertes
- [ ] Health checks (liveness + readiness)
- [ ] HPA min 2, max 5
- [ ] PodDisruptionBudget
- [ ] NetworkPolicy restrictive
- [ ] Deploy < 10 min validé en prod

## 9. Contenu

- [ ] Zéro faute (Antidote / LanguageTool)
- [ ] Tous chiffres sourcés
- [ ] 10 articles publiés au lancement
- [ ] Page livre complète
- [ ] 7 pages produits remplies
