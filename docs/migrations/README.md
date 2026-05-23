# `docs/migrations/` — snapshots historiques

Dossier d'archives pour les migrations majeures du projet. Chaque
snapshot est **immuable** une fois committé : il documente un état
existant à une date donnée, pour permettre rollback, post-mortem ou
audit.

> Ces fichiers ne sont **jamais** consommés par du code applicatif.
> Ils sont uniquement consultés par les humains (et l'agent Claude
> Code) lors des opérations de migration.

## Naming convention

```
<date-iso>-<scope>-<source>.<ext>
```

Exemples :

- `2026-05-23-zone-lws.txt` — zone DNS BIND exportée depuis LWS le 23/05/2026
- `2026-06-15-zone-cloudflare-pre-cutover.txt` — zone DNS Cloudflare juste avant cutover site (hypothétique)

## Index

| Fichier                                                | Source | Date       | Contexte                                                                                                                                                                                                       |
| ------------------------------------------------------ | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`2026-05-23-zone-lws.txt`](./2026-05-23-zone-lws.txt) | LWS    | 2026-05-23 | Zone DNS BIND complète exportée depuis le panel LWS avant le démarrage de la migration vers Cloudflare/Zoho/Hetzner. Sert de filet de sécurité pour la pré-config Cloudflare et de référence pour le rollback. |

## Sécurité

Les fichiers DNS contiennent uniquement des informations **publiques**
par définition (records DNS résolvables par n'importe qui via `dig`).
La clé DKIM y figurant est la clé **publique** (la privée reste chez
le provider mail). Pas de credentials.

**Ne JAMAIS** stocker ici :

- Mots de passe
- Clés API
- SealedSecrets en clair (utiliser `deploy/k8s/base/secret.sealedsecret.yaml` qui est déjà chiffré)
- Tokens
- Captures contenant ces éléments

Si vous devez archiver un fichier sensible : nommer `*.local.md` ou
`*.local.txt` (déjà gitignored via `*.local.md` + ajouter `*.local.txt`
si besoin).
