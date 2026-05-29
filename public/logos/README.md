# Logos clients / partenaires

Bandeau « Ils nous accompagnent depuis le terrain » (CLAUDE.md §6.2),
rendu par `components/sections/Reassurance.tsx`.

## Pilotage depuis l'admin (source de vérité)

Les logos sont **pilotables depuis Payload** via le global
**Réassurance — Homepage** (`globals/ReassuranceSettings.ts`,
slug `reassurance-settings`) : l'éditeur ajoute/retire des partenaires
(nom + logo uploadé dans Media) sans toucher au code.

Le helper `getReassuranceContent()` (`lib/cms/site-settings-server.ts`)
fetch ce global et retombe sur les fichiers ci-dessous (`REASSURANCE_FALLBACK`
dans `lib/cms/site-settings.ts`) tant que le global n'est pas rempli, ou
si Payload est indisponible (résilience).

## Logos par défaut (fallback)

| Fichier | Client | Dimensions |
| --- | --- | --- |
| `doci.png` | DOCI | 267×189 |
| `sertemef.png` | Sertemef | 602×203 |
| `spitec.png` | SPITEC | 413×122 |

Pour changer le fallback, remplacer ces fichiers (mêmes noms) et ajuster
les dimensions dans `REASSURANCE_FALLBACK`. Pour le contenu réel en prod,
préférer l'upload via l'admin.
