# Migration complète LWS → Cloudflare + Zoho + Hetzner K3s

**Date** : démarrage 23 mai 2026 · cible fin 14-21 juin 2026
**Échéance dure** : 25 mai 2026 (expiration LWS — domaine + hébergement + emails)
**Décision** : ne PAS renouveler le pack LWS (~70 €). Sortir totalement.

> Ce document **orchestre** les 3 fronts de la migration (domaine,
> emails, site) dans l'ordre chronologique optimal pour minimiser le
> risque. Pour les détails K3s/Helm, voir [`migration-lws-hetzner.md`](./migration-lws-hetzner.md).
>
> Pour la procédure de tagging et publication d'image, voir
> [`release-procedure.md`](./release-procedure.md).

---

## Sommaire

1. [Vue d'ensemble + timeline](#1-vue-densemble--timeline)
2. [État existant (acquis)](#2-état-existant-acquis)
3. [Phase 1 — Transfert domaine LWS → Cloudflare (J0 à J+7)](#3-phase-1--transfert-domaine-lws--cloudflare-j0-à-j7)
4. [Phase 2 — Migration emails LWS → Zoho (J+7 à J+10)](#4-phase-2--migration-emails-lws--zoho-j7-à-j10)
5. [Phase 3 — Cutover site Hetzner (J+10 à J+14)](#5-phase-3--cutover-site-hetzner-j10-à-j14)
6. [Phase 4 — Nettoyage post-migration (J+30)](#6-phase-4--nettoyage-post-migration-j30)
7. [Rollback global](#7-rollback-global)
8. [Annexes — valeurs DNS Zoho + Cloudflare](#8-annexes--valeurs-dns-zoho--cloudflare)

---

## 1. Vue d'ensemble + timeline

```
J0     Démarrer transfert domaine LWS → Cloudflare
       Ouvrir compte Zoho Mail (Forever Free, 5 boîtes)
       Ticket LWS demandant accélération transfert sortant

J+1..  Surveillance transfert (Cloudflare dashboard)
J+5    Transfert ICANN typiquement validé entre J+5 et J+7
       Zone DNS pré-configurée chez Cloudflare avec records LWS

J+7    Cloudflare devient registrar autoritatif
       DNS continue à pointer sur LWS WordPress + emails LWS
       (rien n'a changé pour les visiteurs ni les emails)

       Démarrer Phase 2 : configurer Zoho, importer emails LWS,
       basculer MX dans Cloudflare → Zoho.

J+10   Emails arrivent sur Zoho, plus sur LWS.
       Démarrer Phase 3 : finaliser site Hetzner.
       Tagger v1.0.0 sur main (workflow GHCR publie l'image)
       Sceller secrets prod, déployer staging.

J+12   Tester staging.openlabconsulting.com
       Préparer cutover production

J+14   Cutover : modifier A apex dans Cloudflare → IP Hetzner
       cert-manager émet le certificat HTTPS
       Smoke tests + monitoring J+14 à J+21

J+21   Tout stable depuis 1 semaine.
       Phase 4 : résilier services LWS résiduels, documenter.
```

**Coûts cumulés cible** : ~9 € Cloudflare (transfert domaine 1 an inclus) + 0 € Zoho (Forever Free 5 users) + 0 € Hetzner (cluster déjà payé pour NexusRH) = **9 € au lieu de 70 €**.

---

## 2. État existant (acquis)

✅ **Cluster K3s Hetzner** opérationnel — `nexusrh.openlabconsulting.com` tourne déjà
✅ **Traefik + cert-manager** installés (sinon NexusRH ne pourrait pas répondre en HTTPS)
✅ **IP publique Hetzner** identifiable via `dig nexusrh.openlabconsulting.com +short`
✅ **Helm chart + manifests** du nouveau site prêts (`deploy/`)
✅ **608 tests verts** + Lighthouse CI passing
✅ **Workflow GHCR release.yml** créé (PR `chore/ci-ghcr-release` à merger)
⚠️ **Tag v1.0.0** non encore créé (à faire après merge `develop → main`)
⚠️ **SealedSecret prod** = placeholder (à sceller pour de bon en Phase 3)
⚠️ **Renouvellement LWS** = on NE renouvelle PAS, transfert en cours

---

## 3. Phase 1 — Transfert domaine LWS → Cloudflare (J0 à J+7)

> **Objectif** : sortir le domaine de chez LWS sans perdre la
> résolution DNS. Le site WordPress LWS et les emails LWS continuent
> à fonctionner pendant tout ce transfert (DNS pré-configuré à
> l'identique chez Cloudflare).

### 3.1 — Aujourd'hui : ouvrir un ticket LWS (5 min)

Avant tout, sécuriser la fenêtre de transfert via ticket support :

1. Panneau LWS → **Support** → Nouveau ticket (catégorie « Nom de domaine »)
2. Sujet : `URGENT — Accélération transfert sortant openlabconsulting.com (expire 25/05/2026)`
3. Corps (template) :
   ```
   Bonjour,
   Mon domaine openlabconsulting.com expire le 25/05/2026. J'initie
   aujourd'hui un transfert sortant vers Cloudflare. Pouvez-vous
   accélérer la validation côté LWS (délai habituel ICANN 5-7 jours,
   je demande 48-72h) afin que le transfert se finalise avant
   expiration ?
   Merci, [Votre nom]
   ```
4. **En parallèle, appeler** : **0892 230 220** — plus rapide qu'un ticket

### 3.2 — Préparer Cloudflare (10 min)

5. https://dash.cloudflare.com/sign-up → créer compte avec email pro
6. Vérifier email
7. Dashboard accessible, rien à configurer pour l'instant

### 3.3 — Récupérer infos critiques chez LWS (15 min)

8. Panneau LWS → **Mes domaines** → `openlabconsulting.com`
9. **Déverrouiller** : option « Verrou de transfert / Transfer Lock » → OFF
10. **Désactiver WHOIS privacy** si activée (Cloudflare doit voir le contact admin)
11. **Récupérer le code AUTH/EPP** : option « Code de transfert / Code EPP / Auth-Info »
    - Format : chaîne ~10-20 caractères type `XyZ-aB12-cdE3`
    - Selon LWS, affiché directement OU envoyé par email au contact admin WHOIS
12. **Noter l'email du contact admin WHOIS** (Cloudflare va y envoyer une confirmation)
13. **Sauvegarder la zone DNS actuelle** — exécuter le script PowerShell ou Bash de [`migration-lws-hetzner.md` §2](./migration-lws-hetzner.md#2-audit-dns-actuel-sauvegarde). C'est le filet ultime — sans cette sauvegarde, si on rate un record, on perd un service.

### 3.4 — Initier le transfert chez Cloudflare (10 min)

14. Cloudflare Dashboard → menu gauche → **Domain Registration** → **Transfer Domains**
15. Entrer `openlabconsulting.com` → **Search**
16. Cloudflare vérifie l'éligibilité :
    - Domaine âgé > 60 jours ✓
    - Statut déverrouillé ✓ (étape 9)
    - Pas en grace period ✓
    - Si erreur → corriger côté LWS
17. Coller le **code AUTH/EPP**
18. Cloudflare montre les infos contact WHOIS, ajuster si besoin
19. **Payer ~9 €** (prix coûtant — Cloudflare ne marge pas sur les domaines)
20. Confirmer
21. Le transfert ajoute automatiquement **1 an** à la date d'expiration

### 3.5 — Pré-configurer la zone DNS Cloudflare (15 min) — CRITIQUE

> ⚠️ À faire **pendant** que le transfert est en cours. Sinon, dès
> que Cloudflare prend le contrôle, la zone DNS est vide → site +
> emails en panne instantanée.

22. Cloudflare Dashboard → **Websites** → **Add a site**
23. Entrer `openlabconsulting.com` → choisir plan **Free**
24. Cloudflare scan auto la zone LWS actuelle (~30 sec)
25. **Vérifier MANUELLEMENT** que tous les records sont copiés. Comparer avec l'export sauvegardé à l'étape 13.

| Type      | Nom                    | Cible attendue                             | Vital ?                       |
| --------- | ---------------------- | ------------------------------------------ | ----------------------------- |
| A         | `@` (apex)             | IP WordPress LWS actuelle                  | ✅ site                       |
| A / CNAME | `www`                  | apex ou IP LWS                             | ✅ site                       |
| **MX**    | `@`                    | `mail.lws-mail.com.` (priorité 10)         | ✅ **CRITIQUE emails**        |
| **TXT**   | `@`                    | `v=spf1 include:_spf.lws-hosting.com -all` | ✅ **CRITIQUE délivrabilité** |
| **TXT**   | `_dmarc`               | `v=DMARC1; p=quarantine; ...` (si présent) | ✅ délivrabilité              |
| **TXT**   | `_selector._domainkey` | `v=DKIM1; k=rsa; p=...` (si présent)       | ✅ délivrabilité              |
| A         | `nexusrh`              | **IP Hetzner** (votre cluster K3s)         | ✅ NexusRH déjà en prod       |
| A / CNAME | autres sous-domaines   | selon vos services                         | selon                         |

26. **Si un record manque** (les TXT SPF/DKIM/DMARC sont souvent oubliés par le scan auto) → l'**ajouter manuellement** depuis l'export DNS
27. **Désactiver le proxy Cloudflare** (nuage gris, pas orange) pour TOUS les records dans un premier temps. On activera le proxy plus tard, post-cutover, si on veut le CDN/anti-DDoS.
28. **NE PAS basculer les nameservers** chez LWS encore. Attendre la fin du transfert ICANN.
29. Cloudflare affiche 2 nameservers à utiliser à terme : `xxx.ns.cloudflare.com` et `yyy.ns.cloudflare.com` — les noter

### 3.6 — Approuver les emails de confirmation (5 min)

30. **Email de Cloudflare** au contact WHOIS admin : « Confirm your domain transfer » → cliquer
31. **Email de LWS** demandant confirmation du transfert sortant → cliquer pour CONFIRMER LA SORTIE
    - ⚠️ Point décisif : sans cette confirmation explicite, LWS applique le délai légal max (5 jours)
32. Si LWS ne propose pas d'accélérer : relancer le ticket / téléphone

### 3.7 — Suivi quotidien (J+1 à J+7)

33. Cloudflare Dashboard → **Domain Registration** → `openlabconsulting.com` : statut
34. Phases :
    - « Transfer initiated » (J0)
    - « Pending registrar approval » (J+1 à J+5)
    - « In progress » (J+5 à J+7)
    - « Transfer complete » (J+5 à J+7)

### 3.8 — Validation transfert (J+5 à J+7)

35. Cloudflare devient registrar autoritatif
36. Cloudflare bascule automatiquement les nameservers (Cloudflare → Cloudflare via l'API registrar)
37. La zone DNS pré-configurée à 3.5 devient active
38. **Tout doit continuer à marcher exactement comme avant** :
    ```bash
    dig openlabconsulting.com +short              # → IP LWS WordPress
    dig nexusrh.openlabconsulting.com +short      # → IP Hetzner
    dig MX openlabconsulting.com +short           # → mail.lws-mail.com
    ```
39. Test envoi/réception mail à `waopron@openlabconsulting.com` — doit marcher

### 3.9 — Plan B si transfert bloqué (J+3 sans validation LWS)

- **Option A** : payer renouvellement LWS minimum strict (~15 € si LWS accepte le domaine seul via ticket support, sinon pack 70 €) pour 1 an. Ré-initier transfert dans 1-2 mois sans pression.
- **Option B** : laisser le transfert continuer après l'expiration LWS — grace period ICANN typique 30 jours, transfert peut se compléter pendant cette période. Risque : domaine en mode dégradé.

---

## 4. Phase 2 — Migration emails LWS → Zoho (J+7 à J+10)

> **Objectif** : récupérer waopron@ et infos@ chez Zoho (gratuit
> jusqu'à 5 boîtes, 5 Go chacune), importer l'historique IMAP,
> basculer les MX. Ne PAS toucher au site qui continue à pointer
> sur WordPress LWS.

### 4.1 — Créer compte Zoho Mail (15 min)

1. https://www.zoho.com/mail/zohomail-pricing.html → choisir **Forever Free Plan** (jusqu'à 5 users, 5 Go par boîte)
2. Renseigner email administrateur (peut être votre email perso temporairement)
3. Ajouter le domaine `openlabconsulting.com`
4. Zoho demande de **prouver la propriété du domaine** via un record TXT ou un fichier HTML
   - Choisir **TXT method** (plus simple)
   - Zoho fournit une valeur type `zoho-verification=xxxxxxxxx.zmverify.zoho.com`
5. Dans Cloudflare → DNS → Add record :
   - Type : TXT
   - Nom : `@`
   - Contenu : la valeur Zoho fournie
   - TTL : Auto
6. Sauvegarder. Propagation 1-5 min (Cloudflare est rapide).
7. Retour Zoho → cliquer **Verify** → ✓

### 4.2 — Créer les boîtes Zoho (10 min)

8. Zoho Mail Admin Console → **Users** → **Add User**
9. Créer chaque boîte :
   - `waopron@openlabconsulting.com`
   - `infos@openlabconsulting.com`
   - - jusqu'à 3 autres (équipe future)
10. Pour chaque boîte, définir un mot de passe temporaire (à changer à la première connexion)

### 4.3 — Configurer les MX dans Cloudflare (10 min)

> ⚠️ Cette étape **redirige instantanément** les nouveaux emails
> vers Zoho. Les emails déjà en cours d'acheminement (envoyés avant
> la propagation) iront encore sur LWS pendant 1-4h max.

11. Cloudflare → DNS → `openlabconsulting.com`
12. **Supprimer les MX records actuels** (`mail.lws-mail.com.`)
13. **Ajouter les MX records Zoho** (cf. §8.1 ci-dessous) :
    | Type | Nom | Contenu | Priorité |
    | ---- | --- | ---------------------- | -------- |
    | MX | `@` | `mx.zoho.eu` | 10 |
    | MX | `@` | `mx2.zoho.eu` | 20 |
    | MX | `@` | `mx3.zoho.eu` | 50 |
    > ⚠️ Pour un compte créé en EU. Vérifier dans Zoho Admin → Domain Settings la zone géo allouée (EU vs US vs IN) et utiliser les MX correspondants. Zoho indique les bonnes valeurs dans l'interface.
14. **Mettre à jour le TXT SPF** :
    - Avant : `v=spf1 include:_spf.lws-hosting.com -all`
    - Après : `v=spf1 include:zoho.eu -all` (ou `.com` selon zone)
15. **Configurer DKIM Zoho** :
    - Zoho Admin → Mail Settings → DKIM → Generate
    - Copier la clé publique fournie
    - Cloudflare : ajouter TXT, nom `zoho._domainkey` (ou nom donné par Zoho), contenu = clé
16. **Optionnel : DMARC** — si pas déjà présent :
    - Type TXT, nom `_dmarc`, contenu : `v=DMARC1; p=quarantine; rua=mailto:waopron@openlabconsulting.com`

### 4.4 — Importer l'historique emails LWS via IMAP (1-4 h selon volume)

17. Zoho Mail Admin → **Migration** → **Add Migration**
18. Source = IMAP
19. Renseigner :
    - Serveur IMAP LWS : généralement `mail.lws-hosting.com` ou `imap.lws-hosting.com` (vérifier dans le panneau LWS section Email)
    - Port : 993 (SSL/TLS)
    - Username : `waopron@openlabconsulting.com`
    - Password : mot de passe de la boîte LWS
20. Mapper vers boîte Zoho cible
21. Démarrer la migration
22. Répéter pour chaque boîte
23. Suivre la progression dans Zoho

### 4.5 — Tester (15 min)

24. Depuis votre email perso (Gmail/autre) :
    - Envoyer un mail à `waopron@openlabconsulting.com`
    - Vérifier arrivée dans Zoho Webmail (https://mail.zoho.eu)
25. Depuis Zoho → envoyer un mail à votre email perso
26. Vérifier headers du mail reçu : SPF=PASS, DKIM=PASS, DMARC=PASS
27. Tester sur https://www.mail-tester.com/ (envoyer un mail à l'adresse fournie, vérifier score ≥ 9/10)

### 4.6 — Communication (30 min)

28. Mettre à jour les signatures email avec les nouvelles infos (si changement)
29. Optionnel : configurer une **redirection automatique** depuis l'ancienne boîte LWS (si encore active pour quelques jours) vers Zoho — filet sécurité
30. Configurer **clients mail** (mobile, desktop) avec les nouvelles infos IMAP Zoho :
    - IMAP : `imap.zoho.eu` port 993 SSL
    - SMTP : `smtp.zoho.eu` port 465 SSL
    - Auth : email + mot de passe

---

## 5. Phase 3 — Cutover site Hetzner (J+10 à J+14)

> **Objectif** : déployer le nouveau site Next.js + Payload sur le
> cluster K3s, basculer le A apex vers l'IP Hetzner. Le site
> WordPress LWS sera remplacé par la refonte.

### 5.1 — Pré-requis (J+10)

1. Vérifier que les 3 PR en cours sont mergées dans `develop` :
   - `feat/p2-cmd-k-public` (Cmd+K palette)
   - `docs/restore-audit-p2-seo-ux` (audit + docs/README.md)
   - `feat/p2-whitepaper-souveraine-leadmagnet` (whitepaper lead magnet)
   - `chore/ci-ghcr-release` (workflow release.yml)
2. PR `develop → main` mergée
3. Tagger `v1.0.0` sur `main` → cf. [`release-procedure.md`](./release-procedure.md) §3
4. Vérifier que l'image est publiée : `ghcr.io/couldevlop/website:v1.0.0`
5. Sceller les vrais secrets prod : suivre [`migration-lws-hetzner.md` §5](./migration-lws-hetzner.md#5-j-1--sceller-les-secrets-production)

### 5.2 — Déployer staging (J+11)

6. **Créer un sub-domain `staging.openlabconsulting.com`** dans Cloudflare → DNS :
   - Type A, nom `staging`, contenu = IP Hetzner (même que `nexusrh`), TTL Auto
7. Suivre [`migration-lws-hetzner.md` §3](./migration-lws-hetzner.md#3-j-2--déployer-sur-staging) :
   ```bash
   bash deploy/scripts/deploy.sh staging v1.0.0
   ```
8. Tester https://staging.openlabconsulting.com (chargement, navigation, Cmd+K, formulaire whitepaper)

### 5.3 — Baisser le TTL apex Cloudflare (J+12)

9. Cloudflare → DNS → A `@` : TTL → `2 minutes` (ou `Auto` qui est déjà court)
10. Attendre 1h pour propager les TTL courts aux résolveurs

> Avantage Cloudflare vs LWS : DNS de Cloudflare est ultra-rapide,
> le TTL par défaut « Auto » est de quelques minutes. L'étape de
> baisse TTL préalable est moins critique qu'avec LWS où il fallait
> 48h d'avance.

### 5.4 — Cutover production (J+14)

11. Vérifier production manifests et secrets en place
12. Déployer production :
    ```bash
    bash deploy/scripts/deploy.sh production v1.0.0
    ```
    > Le smoke test va échouer car le DNS pointe encore sur WordPress. Normal — l'app tourne, on continue.
13. Vérifier pods :
    ```bash
    kubectl get pods -n openlab
    kubectl logs -n openlab -l app.kubernetes.io/name=openlab-website --tail=20
    ```
14. **Modifier A apex Cloudflare** :
    - Type A, nom `@`, contenu = **IP Hetzner** (récupérer via `dig nexusrh.openlabconsulting.com +short`)
    - TTL Auto
    - Proxy = OFF (nuage gris) — important : si ON (orange), Cloudflare gère le TLS et il faut configurer mode « Full strict » sinon erreur SSL
15. **Modifier `www`** (A ou CNAME vers `openlabconsulting.com.`)
16. Attendre 2-10 min propagation
17. Vérifier émission cert Let's Encrypt par cert-manager :
    ```bash
    kubectl get certificate -n openlab -w
    # NAME           READY   SECRET        AGE
    # openlab-tls    True    openlab-tls   2m
    ```
18. Une fois `READY=True`, ouvrir https://openlabconsulting.com

### 5.5 — Smoke tests complets

19. Suivre [`migration-lws-hetzner.md` §9](./migration-lws-hetzner.md#9-jour-j--smoke-tests-complets)
20. Tester :
    - https://openlabconsulting.com (home + Cmd+K)
    - https://openlabconsulting.com/solutions/nexusrh
    - https://openlabconsulting.com/livre
    - https://openlabconsulting.com/admin (login Payload)
    - https://openlabconsulting.com/livres-blancs/ia-souveraine-ci-2026
    - Vérifier emails Zoho fonctionnent toujours

### 5.6 — Vérifier nexusrh.openlabconsulting.com toujours OK

21. https://nexusrh.openlabconsulting.com doit répondre normalement (record A `nexusrh` inchangé)

---

## 6. Phase 4 — Nettoyage post-migration (J+30)

Si tout est stable depuis 2 semaines :

1. **WordPress LWS** : déjà résilié (pas renouvelé le 25 mai). Vérifier que vous avez bien un backup ZIP du site dans un dossier local au cas où.
2. **Emails LWS** : si encore actifs (LWS garde parfois 30 jours), récupérer toute archive utile puis demander suppression.
3. **Compte LWS** : si plus aucun service actif, demander la clôture pour éviter relances commerciales.
4. **Cloudflare** : activer le proxy (nuage orange) sur les records A apex et `www` si vous voulez le CDN + anti-DDoS gratuit. **Avant**, configurer SSL/TLS → Overview en mode « **Full (strict)** » (Cloudflare valide le cert Let's Encrypt côté Hetzner).
5. **Documenter** : créer une entrée dans `docs/admin-cms.md` ou un nouveau `docs/post-cutover-notes.md` avec :
   - IP Hetzner finale
   - Nameservers Cloudflare
   - Comptes Zoho créés
   - Backup WordPress sauvegardé
6. Lancer une revue Lighthouse + securityheaders.com pour valider le passage en prod :
   - https://pagespeed.web.dev/analysis?url=https://openlabconsulting.com
   - https://securityheaders.com/?q=openlabconsulting.com

---

## 7. Rollback global

### Si Phase 1 (transfert domaine) échoue

- Plan B : renouveler LWS minimum pour 1 an (négocier ticket pour domaine seul, sinon pack 70 €), re-initier transfert dans 1-2 mois sans pression.

### Si Phase 2 (emails) casse le flow

- Cloudflare → DNS → MX : remettre `mail.lws-mail.com.` priorité 10 (sauvegarde DNS §3.3 étape 13)
- Les emails retournent sur LWS dans 1-4h
- Investiguer Zoho + recommencer plus tard

### Si Phase 3 (site) plante

- Cloudflare → DNS → A `@` : remettre IP WordPress LWS (sauvegarde DNS)
- WordPress LWS reprend la main en 2-10 min (TTL Cloudflare court)
- Helm rollback si besoin : `bash deploy/scripts/rollback.sh production`

Cf. [`migration-lws-hetzner.md` §13](./migration-lws-hetzner.md#13-rollback-en-cas-de-problème) pour les commandes détaillées.

---

## 8. Annexes — valeurs DNS Zoho + Cloudflare

### 8.1 — Valeurs MX Zoho (à confirmer dans Zoho Admin)

Zoho assigne une **zone géo** au compte selon votre pays (EU, US, IN). Les MX changent en conséquence. Référence officielle : https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html

**Zone EU (probable pour Côte d'Ivoire)** :

| Type | Nom | Contenu       | Priorité |
| ---- | --- | ------------- | -------- |
| MX   | `@` | `mx.zoho.eu`  | 10       |
| MX   | `@` | `mx2.zoho.eu` | 20       |
| MX   | `@` | `mx3.zoho.eu` | 50       |

**SPF** :

| Type | Nom | Contenu                       |
| ---- | --- | ----------------------------- |
| TXT  | `@` | `v=spf1 include:zoho.eu -all` |

**DKIM** (généré dans Zoho Admin, valeur unique par compte) :

| Type | Nom                          | Contenu                       |
| ---- | ---------------------------- | ----------------------------- |
| TXT  | `zoho._domainkey` (ou autre) | `v=DKIM1; k=rsa; p=<long...>` |

**DMARC** (optionnel mais recommandé) :

| Type | Nom      | Contenu                                                            |
| ---- | -------- | ------------------------------------------------------------------ |
| TXT  | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:waopron@openlabconsulting.com` |

### 8.2 — Zone DNS Cloudflare finale (cible J+14)

| Type  | Nom               | Contenu                       | Proxy       | TTL  | Notes                              |
| ----- | ----------------- | ----------------------------- | ----------- | ---- | ---------------------------------- |
| A     | `@`               | IP Hetzner                    | DNS only ⚪ | Auto | site Next.js refonte               |
| CNAME | `www`             | `openlabconsulting.com.`      | DNS only ⚪ | Auto | redirige sur apex                  |
| A     | `nexusrh`         | IP Hetzner                    | DNS only ⚪ | Auto | NexusRH existant (déjà en prod)    |
| A     | `staging`         | IP Hetzner                    | DNS only ⚪ | Auto | optionnel, peut être supprimé J+30 |
| MX    | `@`               | `mx.zoho.eu` (priorité 10)    | n/a         | Auto |                                    |
| MX    | `@`               | `mx2.zoho.eu` (priorité 20)   | n/a         | Auto |                                    |
| MX    | `@`               | `mx3.zoho.eu` (priorité 50)   | n/a         | Auto |                                    |
| TXT   | `@`               | `v=spf1 include:zoho.eu -all` | n/a         | Auto | SPF                                |
| TXT   | `zoho._domainkey` | `v=DKIM1; k=rsa; p=...`       | n/a         | Auto | DKIM Zoho                          |
| TXT   | `_dmarc`          | `v=DMARC1; p=quarantine; ...` | n/a         | Auto | DMARC                              |

### 8.3 — Notes Cloudflare proxy

- **Proxy OFF (nuage gris)** : Cloudflare = pur DNS, le visiteur va directement sur l'IP Hetzner. **À utiliser en Phase 3 cutover** (premier déploiement, on évite les complications TLS Cloudflare).
- **Proxy ON (nuage orange)** : Cloudflare intercepte HTTPS, ajoute CDN + anti-DDoS + WAF. **Activer en Phase 4** quand tout est stable.
  - Requiert SSL/TLS mode = **Full (strict)** dans Cloudflare → SSL/TLS → Overview
  - Sinon erreur SSL pour les visiteurs

### 8.4 — Contacts d'urgence

| Service       | Contact                                            |
| ------------- | -------------------------------------------------- |
| LWS support   | https://www.lws.fr/contact.php — 0892 230 220      |
| Cloudflare    | dashboard → Support (ticket) — pas de tel sur Free |
| Zoho Mail     | https://www.zoho.com/mail/support.html             |
| Hetzner       | console.hetzner.cloud → Support                    |
| Let's Encrypt | https://letsencrypt.status.io                      |

---

_Document de référence — OpenLab Consulting · 23 mai 2026._
_À mettre à jour à la fin de chaque phase pour acter ce qui a été
fait et ce qui reste._
