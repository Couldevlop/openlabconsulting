# Pipeline de rapport d'audit IA — design

**Date** : 30 juillet 2026
**Statut** : validé, prêt pour le plan d'implémentation
**Origine** : vérification du parcours `/audit-ia` du 29/07/2026 (`docs/audit-ia-verification-2026-07-29.md`), écart n° 5 — la promesse « rapport personnalisé sous 48 h ouvrées » ne repose sur aucune automatisation.

---

## 1. Problème

Le parcours `/audit-ia` promet au prospect un rapport personnalisé sous 48 heures ouvrées. Rien dans le code ne produit ce rapport : ni génération, ni file de tâches, ni suivi d'échéance. Le lead atterrit dans le back-office avec `stage = nouveau` et attend qu'un consultant le remarque. Si personne ne consulte l'admin, le prospect attend indéfiniment un document que le site lui a promis.

Deux demandes d'audit ont été reçues en trois semaines. Le volume est faible ; l'enjeu est la tenue de la promesse, pas la mise à l'échelle.

## 2. Objectif

Produire automatiquement un brouillon de rapport à partir des réponses au questionnaire, le soumettre à la validation d'un consultant, et livrer au prospect un PDF téléchargeable via un lien signé — sans jamais envoyer au prospect un texte qu'aucun humain n'a relu.

## 3. Décisions structurantes

| Décision              | Choix retenu                                                                                  | Raison                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Validation            | Dans le back-office Payload, texte librement éditable                                         | Traçabilité native (qui, quand, quelle version) ; le correcteur peut réécrire ce que le modèle a mal dit          |
| Alerte                | Email à `EMAIL_TEAM` + compteur permanent dans l'admin + relance à 12 h puis rappel quotidien | Un dispositif reposant sur le seul email est resté muet trois semaines sans que personne ne s'en aperçoive        |
| Livraison             | Lien signé à durée limitée, PDF stocké hors du web public                                     | Un rapport nominatif contenant le diagnostic d'une entreprise ne doit être ni devinable, ni indexable, ni éternel |
| Matière               | Une 6e question libre, facultative, ajoutée au questionnaire                                  | Sans texte libre, deux entreprises du même secteur et de la même taille reçoivent un rapport interchangeable      |
| Repli                 | Squelette déterministe si le modèle échoue                                                    | Le consultant a toujours un document à corriger, jamais une page blanche                                          |
| Hébergement du modèle | Lucie-7B-Instruct v1.1 (Ollama, cluster)                                                      | Souveraineté : les données du prospect ne quittent pas l'infrastructure                                           |

## 4. Flux

```
Prospect                    Site (Next/Payload)              Lucie-7B        Consultant
   │                              │                              │                │
   ├─ questionnaire (6 réponses) ─▶│                              │                │
   │◀─ 202 « demande reçue » ──────┤                              │                │
   │◀─ accusé de réception ────────┤ lead créé (score)            │                │
   │                              │                              │                │
   │                    job « générer rapport » ──────prompt─────▶│                │
   │                              │◀────── texte structuré ───────┤                │
   │                              │ rapport [brouillon IA]        │                │
   │                              ├─ alerte email + badge admin ──────────────────▶│
   │                              │                              │   lit, corrige │
   │                              │◀───── « Valider et envoyer » ─────────────────┤
   │                              │ PDF généré → MinIO (privé)    │                │
   │◀─ email + lien signé ─────────┤                              │                │
   ├─ clic ──────────────────────▶│ vérifie HMAC + expiration     │                │
   │◀─ PDF ────────────────────────┤ compteur incrémenté          │                │
```

Le prospect reçoit deux emails : l'accusé de réception immédiat (existant) puis le rapport une fois validé.

## 5. Composants

L'UI ne parle jamais à Payload directement ; seule l'unité `store-server.ts` touche la base.

| Unité                                   | Rôle                                                                                                                       | Dépendances                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `lib/audit-report/lucie.ts`             | Client Ollama : construction du prompt, appel, découpage de la réponse en sections typées. Aucune connaissance de Payload. | `fetch`                      |
| `lib/audit-report/skeleton.ts`          | Squelette déterministe construit depuis les réponses au questionnaire. Fonction pure.                                      | `lib/audit-ia/quiz.ts`       |
| `lib/audit-report/pdf.tsx`              | Rendu PDF de marque à partir des sections.                                                                                 | `@react-pdf/renderer`        |
| `lib/audit-report/link.ts`              | Signature et vérification du jeton de téléchargement. Fonctions pures.                                                     | `node:crypto`                |
| `lib/audit-report/store-server.ts`      | Création et mise à jour du rapport en base, dépôt et lecture du PDF dans MinIO.                                            | `payload`, client S3         |
| `collections/AuditReports.ts`           | Modèle, statuts, contrôle d'accès, hook d'alerte.                                                                          | Payload                      |
| `app/audit-ia/rapport/[token]/route.ts` | Diffusion du PDF sous jeton signé.                                                                                         | `link.ts`, `store-server.ts` |

Chaque unité est testable isolément : `lucie.ts` avec un `fetch` simulé, `skeleton.ts` sans réseau, `link.ts` sans base.

### Contrat de sections

Le modèle et le squelette produisent la même structure, ce qui permet au rendu PDF d'ignorer leur origine :

```
Rapport = {
  titre: string
  synthese: string              // 3-5 phrases
  situation: string             // lecture du contexte déclaré
  recommandation: string        // adossée au format issu de getRecommendation()
  feuilleDeRoute: Etape[]       // 3 à 5 étapes, chacune { titre, horizon, contenu }
  prochainesEtapes: string
}
```

## 6. Données

Collection `AuditReports` :

| Champ                         | Type                      | Notes                                                                  |
| ----------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `lead`                        | relation → `leads`        | obligatoire, un rapport par lead                                       |
| `status`                      | select                    | `brouillon-ia` · `en-revue` · `valide` · `envoye` · `echec-generation` |
| `sections`                    | groupe de richText        | contenu éditable, structure du § 5                                     |
| `generatedBy`                 | select                    | `lucie-7b` · `squelette`                                               |
| `generationError`             | textarea                  | message d'erreur si `echec-generation`                                 |
| `validatedBy` / `validatedAt` | relation → `users` / date | posés au clic « Valider et envoyer »                                   |
| `pdfKey`                      | text                      | clé MinIO du fichier, jamais exposée publiquement                      |
| `sentAt`                      | date                      | horodatage de l'envoi au prospect                                      |
| `downloadCount`               | number                    | incrémenté à chaque téléchargement                                     |

À l'envoi, le `stage` du lead passe de `nouveau` à `contacte`.

### Alerte et relance

Trois signaux, de force croissante :

1. **À la création du brouillon** — email à `EMAIL_TEAM` (`waopron@`) portant le nom de l'organisation, le score du lead et le lien direct vers le rapport dans l'admin.
2. **En permanence** — compteur des rapports en statut `brouillon-ia` ou `echec-generation` affiché dans la navigation du back-office. Ce signal ne dépend d'aucun transport externe : il reste visible même quand l'email est en panne.
3. **À 12 h sans validation** — second email ; puis rappel quotidien tant que le rapport n'est pas validé. La tâche de relance tourne dans la même file que la génération.

## 7. Sécurité (OWASP)

- **A01 — contrôle d'accès** : la collection refuse tout accès anonyme, comme `Leads`. La route publique sert le PDF et rien d'autre : aucune métadonnée, aucun listing.
- **Jeton de téléchargement** : HMAC-SHA256 sur `{reportId, exp}` avec `PAYLOAD_SECRET`, comparaison à temps constant (`timingSafeEqual`), expiration 30 jours. Révocation en sortant le rapport du statut `envoye`. En-têtes `X-Robots-Tag: noindex` et `Content-Disposition: attachment`.
- **A03 — injection** : le texte libre du prospect est borné à 600 caractères et validé par Zod avant tout usage. Le modèle ne dispose d'aucun outil ; sa sortie n'est ni exécutée ni injectée en HTML brut — elle transite par le richText Payload et le rendu PDF, tous deux échappés. Un humain la relit avant tout envoi.
- **A05 — configuration** : l'ouverture réseau vers Ollama est une règle d'egress unique et nominative (IP et port précis), pas un élargissement général.
- **A09 — journalisation** : tout échec de génération est tracé en base et journalisé en production. Aucun échec silencieux, contrairement au comportement constaté sur les emails.
- **Débit** : la route de téléchargement est limitée par IP pour empêcher le balayage de jetons.

## 8. Erreurs et reprise

La génération s'exécute dans la file de tâches Payload, hors du cycle de la requête HTTP : le prospect reçoit son 202 immédiatement, sans attendre le modèle. Deux tentatives espacées ; en cas d'échec persistant ou de dépassement de délai, bascule sur le squelette avec `generatedBy = squelette` et une mention interne « génération indisponible, à rédiger ». Le rapport existe toujours, l'alerte part toujours.

La file tourne sur les cinq répliques ; le verrouillage des tâches est assuré par la base, comme le prévoit Payload.

## 9. Tests

| Niveau      | Couverture                                                                                                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unitaire    | `skeleton.ts` (chaque combinaison de réponses produit un rapport complet) · `lucie.ts` (réponse conforme, réponse tronquée, timeout, service absent) · `link.ts` (jeton valide, expiré, signature falsifiée, jeton d'un autre rapport) |
| Intégration | Job de génération : chemin nominal, chemin de repli, non-duplication si relancé                                                                                                                                                        |
| Route       | Téléchargement : jeton valide → 200 et compteur incrémenté ; expiré → 410 ; falsifié → 403 ; rapport non envoyé → 404                                                                                                                  |
| E2E         | Parcours complet du questionnaire avec la 6e question, jusqu'à l'écran de confirmation                                                                                                                                                 |

## 10. Infrastructure

- **NetworkPolicy** : ajout d'une règle d'egress vers `10.42.0.1:11434`. Vérifié le 30/07 : un pod du site ne joint pas Ollama aujourd'hui (`fetch failed`), les plages privées étant exclues de la règle 443.
- **MinIO** : bucket privé dédié aux rapports, distinct du bucket des médias publics.
- **Variables** : `OLLAMA_BASE_URL` et `OLLAMA_MODEL` en ConfigMap, pour changer de modèle sans reconstruction d'image.

## 11. Hors périmètre

Volontairement exclus : fiches sectorielles enrichissant le prompt, relance commerciale automatique vers le prospect, rapport multilingue, régénération section par section, tableau de bord de suivi des rapports. Le volume réel — deux demandes en trois semaines — ne les justifie pas.

## 12. Dépendance bloquante

L'envoi du rapport au prospect passe par ZeptoMail, dont le token est actuellement rejeté (`401 SERR_157 Invalid API Token`, vérifié le 30/07 depuis un pod de production, sur les deux régions). Tant que ce token n'est pas remplacé dans le secret `openlab-website-secrets`, la chaîne se construit et se teste mais ne délivre rien au prospect. La génération, la validation et le PDF restent vérifiables indépendamment.
