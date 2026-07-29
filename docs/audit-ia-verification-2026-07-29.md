# Vérification du parcours « Audit IA gratuit »

**Date** : 29 juillet 2026 · **Périmètre** : `/audit-ia`, `POST /api/audit-ia`, persistance des leads, emails transactionnels
**Rédaction** : brouillon généré par Lucie-7B-Instruct (Ollama, cluster K3s, namespace `maturia`), relu et corrigé.

---

## 1. Objet et périmètre

Vérifier que le lead magnet « Audit IA gratuit » fonctionne de bout en bout : affichage du questionnaire, validation serveur, protections anti-abus, enregistrement de la demande et notifications par email. Contrôles effectués en lecture seule sur le code et sur la production (cluster Hetzner, namespace `openlab`).

## 2. Ce qui fonctionne

- La page `/audit-ia` répond en HTTP 200 en 0,36 s. Le questionnaire interactif (5 questions, écran de recommandation, formulaire de coordonnées) est rendu correctement.
- La validation serveur fonctionne : un envoi invalide renvoie un HTTP 400 avec le détail des champs fautifs.
- Protections en place : anti-bot Turnstile (clés site et secrète présentes en production), limitation à 3 envois par heure et par adresse IP, champ piège anti-robot, consentement RGPD obligatoire.
- 35 tests automatisés couvrant le questionnaire, la page et la route API sont au vert.
- La demande du 29 juillet 2026 à 17 h 36 a bien été enregistrée en base (lead n° 18, société EXPERTISE IA, fonction CTO), avec le résumé complet des réponses au questionnaire, le consentement et l'adresse IP.

## 3. Anomalies bloquantes

**Anomalie 1 : aucun email ne part.** Le fournisseur ZeptoMail renvoie HTTP 429 `TM_5001 / LE_102 « Credit exhausted »`. Conséquence : le prospect ne reçoit pas son accusé de réception alors que l'écran lui annonce un rapport sous 48 heures ouvrées, et l'équipe commerciale n'est pas alertée. Les demandes ne sont pas perdues, elles restent consultables dans le back-office. **Action** : recharger les crédits ZeptoMail dans la console Zoho.

**Anomalie 2 : la clé d'API Anthropic est vide** dans le secret `openlab-website-secrets` du cluster. Le scoring automatique des demandes n'a donc jamais fonctionné : un calcul de repli par règles simples prend le relais, sans interruption de service, mais la qualification annoncée est inactive. **Action** : renseigner `ANTHROPIC_API_KEY` puis redémarrer les pods.

## 4. Écarts secondaires

| #   | Écart                                                                                                                                          | Statut                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Si l'enregistrement en base échoue, l'incident n'est tracé nulle part en production : une demande peut être perdue sans alerte.                | Ouvert                                                                  |
| 2   | Le score de qualification n'était pas transmis dans l'email de notification envoyé à l'équipe.                                                 | **Corrigé** (`persistLead` renvoie le score, les 4 routes le reportent) |
| 3   | La limite de 3 envois par heure compte aussi les tentatives échouées : un visiteur qui se trompe deux fois peut se retrouver bloqué une heure. | Ouvert                                                                  |
| 4   | Aucun test de bout en bout automatisé ne couvre le parcours audit IA.                                                                          | Ouvert                                                                  |
| 5   | La promesse de rapport sous 48 heures ouvrées repose sur un traitement humain, sans relance ni suivi d'échéance automatisé.                    | Ouvert, à arbitrer                                                      |

## 5. Actions recommandées

| Priorité | Action                                                                           | Responsable           |
| -------- | -------------------------------------------------------------------------------- | --------------------- |
| 1        | Recharger les crédits ZeptoMail (console Zoho)                                   | OpenLab, exploitation |
| 1        | Renseigner `ANTHROPIC_API_KEY` dans le secret K8s puis `kubectl rollout restart` | OpenLab, exploitation |
| 2        | Tracer en production les échecs de persistance des leads (écart 1)               | Équipe technique      |
| 3        | Ne décompter le quota qu'après validation réussie (écart 3)                      | Équipe technique      |
| 3        | Ajouter un test Playwright de bout en bout sur le parcours (écart 4)             | Équipe technique      |
| 4        | Décider du suivi de l'échéance 48 h (relance, rappel back-office) — écart 5      | Direction             |
