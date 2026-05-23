# `docs/` — Index

Documentation interne du projet OpenLab Consulting. Tout fichier ici
est destiné à l'équipe (dev, éditorial, ops) — pas au visiteur public.

> **Règle** : tout nouveau document de référence majeur doit être
> ajouté à cet index avec une ligne de description, et référencé
> depuis [`../README.md`](../README.md#documentation--audits) quand
> il s'agit d'un audit, runbook ou checklist transverse.

## Audits & priorisation

| Fichier                                                  | Rôle                                                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`audit-seo-ux-2026-05.md`](./audit-seo-ux-2026-05.md)   | **Audit comparatif vs top 4 mondial** (Palantir, Anthropic, IBM, QuantumBlack). 15 chantiers priorisés. Tableau d'avancement en tête du file. |
| [`captures-todo-2026-05.md`](./captures-todo-2026-05.md) | 27 visuels à produire pour remplacer les `MediaPlaceholder` (priorité ROI conversion).                                                        |

## Checklists & QA

| Fichier                                | Rôle                                                                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [`qa-checklist.md`](./qa-checklist.md) | Checklist QA avant chaque mise en ligne (Lighthouse, axe, OWASP ZAP, schema, hreflang, sitemap…). Miroir opérationnel de `CLAUDE.md §17`. |

## Sécurité & infra

| Fichier                                                  | Rôle                                                                                                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`security-overrides.md`](./security-overrides.md)       | **Déviations assumées** de la spec sécurité (ex. image Chainguard vs Distroless prévue, raison + plan de retour). À lire avant tout audit pentest pour ne pas s'étonner. |
| [`migration-lws-hetzner.md`](./migration-lws-hetzner.md) | Runbook pas-à-pas de la migration DNS LWS → cluster K3s Hetzner.                                                                                                         |

## Produit & CMS

| Fichier                          | Rôle                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`admin-cms.md`](./admin-cms.md) | Guide d'utilisation du back-office Payload : collections, rôles, génération assistée IA, recettes éditoriales courantes. |

---

## Fichiers locaux ignorés

Les fichiers `*.local.md` (ex. `.dev-credentials.local.md`) sont ignorés par git via [`.gitignore`](../.gitignore) — ne jamais committer de credentials.
