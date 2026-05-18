# Politique de sécurité — overrides pnpm & scans Trivy

Deux sections : (1) overrides `pnpm` pour patcher des CVE transitives, (2) politique du job Trivy en CI.

## 1. Overrides pnpm — packages forcés

Ce document recense **toutes les entrées de `pnpm.overrides` dans `package.json`**, avec leur justification CVE et leur condition de retrait. Tout ajout/retrait doit passer en revue ici.

| Package   | Version forcée | CVE / GHSA                                                               | Risque                                                                                     | Raison du override                                                                                                                                      | Condition de retrait                                                                                                                                           |
| --------- | -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postcss` | `^8.5.10`      | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | Moderate (GHSA) / High (NVD via Trivy) — XSS via `</style>` non échappé dans CSS Stringify | `next@15.5.18` embarque `postcss@8.4.31`. PostCSS n'est utilisé qu'au build mais ressort dans la couche `[node-pkg]` du standalone output → Trivy fail. | Quand Next.js publie une version qui bump `postcss` à `>= 8.5.10` (suivre [next changelog](https://github.com/vercel/next.js/releases) et `pnpm why postcss`). |

## Procédure pour ajouter un override

1. **Identifier** : `pnpm audit --prod` ou retour Trivy CI.
2. **Vérifier** que le fix amont n'existe pas (sinon bumper la dep directe est préférable).
3. **Tester** localement : `pnpm install` → `pnpm typecheck` → `pnpm test` → `pnpm build`. Aucune régression tolérée.
4. **Ajouter une ligne dans le tableau ci-dessus** avec la condition explicite de retrait — sinon l'override devient une dette invisible.
5. **Commit** sur une branche `fix/<slug>` puis PR vers `develop`.

## Procédure pour retirer un override

1. Vérifier que la version amont est sortie : `pnpm outdated`.
2. Retirer l'entrée de `pnpm.overrides` ET la ligne du tableau ci-dessus.
3. `pnpm install` → vérifier `pnpm why <package>` → la version résolue est la nouvelle officielle.
4. `pnpm audit --prod` → 0 finding sur ce package.
5. PR vers `develop`.
