# Journal de migration LWS → Cloudflare + Zoho + Hetzner

> **Document vivant** — à mettre à jour à chaque étape franchie.
> Source d'orchestration : [`../migration-cloudflare-zoho-orchestrator-2026-05.md`](../migration-cloudflare-zoho-orchestrator-2026-05.md).

---

## 1. Timeline réalisée

### 2026-05-23 — Jour 0 (préparation + bascule NS DNS)

| Heure  | Action                                                                                     | Statut | Acteur      |
| ------ | ------------------------------------------------------------------------------------------ | ------ | ----------- |
| matin  | Analyse audit P2 SEO/UX existant + plan migration                                          | ✅     | dev         |
| matin  | Création workflow `.github/workflows/release.yml` (push GHCR + Cosign) — blocker B1        | ✅     | dev         |
| matin  | Création doc orchestrateur `migration-cloudflare-zoho-orchestrator-2026-05.md`             | ✅     | dev         |
| matin  | Export zone DNS LWS au format BIND → `migrations/2026-05-23-zone-lws.txt`                  | ✅     | user        |
| midi   | Découverte sous-domaine `diagnostix` (3e service Hetzner non documenté)                    | ✅     | dev + user  |
| 12h00  | Création compte Cloudflare + 2FA + plan Free                                               | ✅     | user        |
| 12h10  | Add a site `openlabconsulting.com` → scan auto zone LWS                                    | ✅     | user        |
| 12h20  | Détection : 12 records auto-importés, 3 manquants (`nexusrh`, `api.nexusrh`, `diagnostix`) | ✅     | user + dev  |
| 12h30  | Ajout manuel des 3 records A Hetzner (62.238.11.20)                                        | ✅     | user        |
| 12h35  | Suppression record CNAME `ftp` (obsolète)                                                  | ✅     | user        |
| 12h40  | Désactivation proxy sur 7 records (mail/apex/www/imap/pop/smtp)                            | ✅     | user        |
| 12h50  | Cloudflare assigne NS : `algin.ns.cloudflare.com` + `jamie.ns.cloudflare.com`              | ✅     | Cloudflare  |
| 13h00  | Vérification DNSSEC LWS = INACTIF (commande `Resolve-DnsName -Type DS` → aucun DS)         | ✅     | user        |
| 13h10  | Bascule LWS : « Configuration DNS personnalisée » = Oui, 2 NS Cloudflare                   | ✅     | user        |
| ~13h15 | Propagation NS : `Resolve-DnsName ... -Server 8.8.8.8` retourne déjà les 2 NS CF           | ✅     | propagation |

### État au moment de cette entrée

- **Registrar** : encore **LWS** (transfert pas encore initié)
- **DNS authoritative** : **Cloudflare** ✅ (NS basculés)
- **Site web** : encore **WordPress LWS** (IP `83.229.19.73`)
- **Emails** : encore **LWS** (MX → `mail.openlabconsulting.com` → `193.203.239.21`)
- **Sous-domaines Hetzner** : `nexusrh`, `api.nexusrh`, `diagnostix` → `62.238.11.20`

---

## 2. Tests à faire MAINTENANT (post-bascule NS)

Tant que Cloudflare passe en « Active » mais surtout dès que les NS sont confirmés (déjà le cas via 8.8.8.8), valider que **rien n'est cassé** :

### 2.1 Tests DNS (PowerShell, en ciblant Google DNS)

```powershell
Write-Host "=== NS (doit être Cloudflare) ==="
Resolve-DnsName openlabconsulting.com -Type NS -Server 8.8.8.8

Write-Host "`n=== Apex (doit pointer LWS 83.229.19.73) ==="
Resolve-DnsName openlabconsulting.com -Type A -Server 8.8.8.8

Write-Host "`n=== AAAA apex (IPv6 LWS) ==="
Resolve-DnsName openlabconsulting.com -Type AAAA -Server 8.8.8.8

Write-Host "`n=== www (CNAME vers apex) ==="
Resolve-DnsName www.openlabconsulting.com -Server 8.8.8.8

Write-Host "`n=== nexusrh (Hetzner 62.238.11.20) ==="
Resolve-DnsName nexusrh.openlabconsulting.com -Type A -Server 8.8.8.8

Write-Host "`n=== api.nexusrh (Hetzner) ==="
Resolve-DnsName api.nexusrh.openlabconsulting.com -Type A -Server 8.8.8.8

Write-Host "`n=== diagnostix (Hetzner) ==="
Resolve-DnsName diagnostix.openlabconsulting.com -Type A -Server 8.8.8.8

Write-Host "`n=== MX (doit pointer mail.openlabconsulting.com) ==="
Resolve-DnsName openlabconsulting.com -Type MX -Server 8.8.8.8

Write-Host "`n=== A mail (LWS 193.203.239.21) ==="
Resolve-DnsName mail.openlabconsulting.com -Type A -Server 8.8.8.8

Write-Host "`n=== SPF (TXT apex) ==="
Resolve-DnsName openlabconsulting.com -Type TXT -Server 8.8.8.8

Write-Host "`n=== DKIM ==="
Resolve-DnsName dkim._domainkey.openlabconsulting.com -Type TXT -Server 8.8.8.8

Write-Host "`n=== DMARC ==="
Resolve-DnsName _dmarc.openlabconsulting.com -Type TXT -Server 8.8.8.8
```

### 2.2 Tests navigateur (mode privé pour bypass cache)

- [ ] https://openlabconsulting.com → WordPress LWS doit s'afficher normalement
- [ ] https://www.openlabconsulting.com → redirige vers apex
- [ ] https://nexusrh.openlabconsulting.com → NexusRH doit charger normalement
- [ ] https://api.nexusrh.openlabconsulting.com → API NexusRH répond (vérifier endpoint health)
- [ ] https://diagnostix.openlabconsulting.com → service répond
- [ ] Certificats HTTPS valides partout (cadenas vert)

### 2.3 Tests emails

- [ ] Depuis Gmail (perso) → envoyer mail à `waopron@openlabconsulting.com` → vérifier réception sur webmail LWS
- [ ] Depuis webmail LWS → répondre au mail → vérifier que ça arrive sur Gmail
- [ ] Idem pour `infos@openlabconsulting.com` si actif

### 2.4 Si un test échoue — rollback express

Retour panel LWS → Mes domaines → openlabconsulting.com → Serveurs DNS :

- « Configuration DNS personnalisée » → **Non**
- Valider

→ Retour automatique aux NS `ns5/6/7/8.lwsdns.com` en 5-10 min. Investiguer ensuite côté Cloudflare le record manquant ou mal recopié.

---

## 3. Étapes restantes (planning)

### Phase 1.5 — finaliser transfert registrar (J+1 à J+7)

Aujourd'hui on n'a fait que la bascule **DNS** (NS Cloudflare). Le **registrar** est encore LWS. Pour transférer aussi le registrar :

- [ ] Panel LWS → Mes domaines → openlabconsulting.com
- [ ] Déverrouiller (« Verrou de transfert / Transfer Lock » → OFF)
- [ ] Désactiver WHOIS privacy si activée
- [ ] Récupérer code AUTH/EPP (« Code de transfert » / « Code EPP »)
- [ ] Cloudflare → menu gauche **Domain Registration** → **Transfer Domains**
- [ ] Entrer `openlabconsulting.com` + code AUTH
- [ ] Payer ~9 € (ajoute 1 an d'expiration au domaine)
- [ ] Approuver l'email de confirmation Cloudflare (boîte du contact admin WHOIS)
- [ ] Approuver l'email LWS « transfert sortant »
- [ ] Attendre 5-7 jours (transfert ICANN)

> Note : la bascule NS ayant déjà été faite, le transfert n'aura aucun impact visible (DNS continue à fonctionner via Cloudflare). C'est juste un changement administratif (qui est propriétaire du domaine au registry).

### Phase 2 — Migration emails LWS → Zoho (J+7 à J+10)

Quand le transfert registrar est validé (ou avant si on veut), basculer les emails.

- [ ] Créer compte Zoho Mail Forever Free → https://www.zoho.com/mail/
- [ ] Ajouter domaine `openlabconsulting.com` dans Zoho Admin
- [ ] Vérifier propriété domaine via TXT (Cloudflare → DNS → ajouter `zoho-verification=...`)
- [ ] Créer boîtes `waopron@`, `infos@`, + autres si besoin (limite 5 boîtes)
- [ ] **Migration IMAP** : Zoho → Migration → IMAP, importer historique LWS
  - Serveur source : `mail.openlabconsulting.com` ou `imap.openlabconsulting.com` (CNAME équivalent)
  - Port 993 SSL
  - Username + password de chaque boîte LWS (à récupérer/sauvegarder AVANT de couper LWS)
- [ ] **Bascule MX dans Cloudflare** :
  - Supprimer MX `@` → `mail.openlabconsulting.com`
  - Ajouter MX `@` → `mx.zoho.eu` (priorité 10) + `mx2.zoho.eu` (20) + `mx3.zoho.eu` (50)
  - Mettre à jour TXT SPF : `v=spf1 include:zoho.eu -all`
  - Ajouter DKIM Zoho (TXT généré dans Zoho Admin)
  - Optionnel : enrichir DMARC avec `rua=mailto:waopron@openlabconsulting.com`
- [ ] Supprimer records LWS résiduels devenus inutiles dans Cloudflare : `A mail`, `CNAME imap/pop/smtp`, vieux DKIM
- [ ] Tester : Gmail → mail à waopron@ → arrive sur Zoho ; reply Zoho → arrive sur Gmail
- [ ] Score `mail-tester.com` ≥ 9/10

### Phase 3 — Cutover site WordPress LWS → Next.js Hetzner (J+10 à J+14)

Pré-requis : les 4-5 PR en cours mergées dans `develop`, puis `develop → main`.

- [ ] Merger les PR listées au §5 ci-dessous
- [ ] Tagger `v1.0.0` sur main (cf. [`release-procedure.md`](../release-procedure.md))
- [ ] Workflow `release.yml` build et push l'image vers `ghcr.io/couldevlop/website:v1.0.0`
- [ ] Sceller les secrets prod ([`migration-lws-hetzner.md` §5](../migration-lws-hetzner.md#5-j-1--sceller-les-secrets-production))
- [ ] Créer record DNS Cloudflare `staging` → `62.238.11.20` (DNS only)
- [ ] `bash deploy/scripts/deploy.sh staging v1.0.0`
- [ ] Tester https://staging.openlabconsulting.com
- [ ] `bash deploy/scripts/deploy.sh production v1.0.0`
- [ ] **Cutover apex** : Cloudflare → DNS → record A `@` :
  - Avant : `83.229.19.73` (LWS)
  - Après : `62.238.11.20` (Hetzner)
- [ ] Supprimer record AAAA `@` (IPv6 LWS) ou le remplacer par IPv6 Hetzner si désiré
- [ ] cert-manager émet le certificat Let's Encrypt
- [ ] Smoke tests complets ([`migration-lws-hetzner.md` §9](../migration-lws-hetzner.md#9-jour-j--smoke-tests-complets))

### Phase 4 — Nettoyage (J+30)

- [ ] Activer proxy Cloudflare (nuage orange) sur apex + www (mode SSL/TLS = Full strict requis)
- [ ] Résilier services LWS résiduels (le pack expire le 25/05, donc pas grand-chose à faire)
- [ ] Documenter état final dans `migrations/2026-XX-XX-post-cutover.md`

---

## 4. Éléments critiques à sauvegarder

### 4.1 Credentials Cloudflare ⚠️ ULTRA CRITIQUES

À stocker dans **un gestionnaire de mots de passe** (Bitwarden, 1Password, KeePass) — JAMAIS dans le repo, JAMAIS dans un email :

- [ ] **Email du compte Cloudflare** : `<votre-email-perso>`
- [ ] **Mot de passe Cloudflare** : généré, ≥ 16 caractères
- [ ] **2FA TOTP secret** : déjà dans votre app (Aegis/2FAS/Authy)
- [ ] **Codes de récupération 2FA** (backup codes) : **VITAL** si vous perdez votre téléphone. Cloudflare en affiche 10 — copier dans gestionnaire de mots de passe + imprimer une copie papier dans un endroit sûr
- [ ] **Méthode de paiement** : carte enregistrée pour les ~9 €/an du domaine

### 4.2 Identifiants techniques

À sauvegarder dans le gestionnaire de mots de passe ou dans un fichier `.local.md` (gitignored) sur votre machine :

- [ ] **2 NS Cloudflare** : `algin.ns.cloudflare.com` + `jamie.ns.cloudflare.com`
- [ ] **IP Hetzner** : `62.238.11.20`
- [ ] **IP WordPress LWS** (pour rollback Phase 3) : `83.229.19.73`
- [ ] **IP serveur mail LWS** (pour rollback Phase 2) : `193.203.239.21`
- [ ] **IPv6 LWS apex** : `2a00:7ee0:8:0:3:66:0:20f`

### 4.3 À récupérer chez LWS AVANT que l'hébergement expire (25/05)

- [ ] **Code AUTH/EPP** du domaine (pour le transfert registrar Phase 1.5) — à récupérer dans le panel
- [ ] **Mots de passe IMAP** de chaque boîte email LWS (waopron@, infos@) — nécessaires pour la migration vers Zoho via IMAP
- [ ] **Backup ZIP WordPress** : panel LWS → Sauvegarde du site → télécharger en local (`Desktop/wordpress-lws-backup-2026-05-23.zip`). À conserver 6 mois.
- [ ] **Archive emails LWS** : optionnel mais recommandé, télécharger en MBOX/EML via le webmail si pas envie d'importer en IMAP plus tard

### 4.4 Snapshot DNS (déjà fait)

- ✅ [`migrations/2026-05-23-zone-lws.txt`](./2026-05-23-zone-lws.txt) — zone BIND complète exportée du panel LWS, commit `7058db2` sur la branche `docs/migration-cloudflare-zoho-orchestrator`

### 4.5 Documents de référence (déjà dans le repo)

- ✅ [`migration-cloudflare-zoho-orchestrator-2026-05.md`](../migration-cloudflare-zoho-orchestrator-2026-05.md) — orchestrateur 3 fronts
- ✅ [`migration-lws-hetzner.md`](../migration-lws-hetzner.md) — runbook détaillé K3s
- ✅ [`release-procedure.md`](../release-procedure.md) — procédure tag + workflow GHCR
- ✅ [`audit-seo-ux-2026-05.md`](../audit-seo-ux-2026-05.md) (sur la PR `docs/restore-audit-p2-seo-ux`) — priorisation des 15 chantiers

### 4.6 Compte LWS (à garder actif jusqu'au transfert registrar complet)

⚠️ **Tant que le transfert registrar n'est pas finalisé (Phase 1.5), garder l'accès au panel LWS** — pour pouvoir :

- Récupérer le code AUTH/EPP
- Approuver l'email LWS de confirmation transfert sortant
- Récupérer les mots de passe IMAP des boîtes mail
- Rollback NS si problème

Une fois la Phase 1.5 finalisée (Cloudflare = registrar), vous pouvez résilier le compte LWS.

---

## 5. PR en cours à merger (préalables Phase 3)

| PR                           | URL                                                                                                  | Statut                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| feat Cmd+K palette           | https://github.com/Couldevlop/openlabconsulting/pull/new/feat/p2-cmd-k-public                        | ✅ portes vertes                 |
| docs restore audit + index   | https://github.com/Couldevlop/openlabconsulting/pull/new/docs/restore-audit-p2-seo-ux                | ✅ portes vertes                 |
| feat whitepaper lead magnet  | https://github.com/Couldevlop/openlabconsulting/pull/new/feat/p2-whitepaper-souveraine-leadmagnet    | ✅ 608 tests + coverage 96.1%    |
| chore CI/CD GHCR release.yml | https://github.com/Couldevlop/openlabconsulting/pull/new/chore/ci-ghcr-release                       | ✅ portes vertes                 |
| docs migration orchestrateur | https://github.com/Couldevlop/openlabconsulting/pull/new/docs/migration-cloudflare-zoho-orchestrator | en cours (ce journal s'y ajoute) |

Une fois les 5 PR mergées dans `develop`, faire `develop → main` puis tagger `v1.0.0` pour déclencher le build d'image GHCR.

---

## 6. Contacts d'urgence

| Service                     | Contact                                             |
| --------------------------- | --------------------------------------------------- |
| LWS support DNS             | https://www.lws.fr/contact.php — **0892 230 220**   |
| Cloudflare support          | dashboard → Support (ticket) — pas de tel sur Free  |
| Zoho Mail support           | https://www.zoho.com/mail/support.html              |
| Hetzner support cluster     | https://console.hetzner.cloud → Support             |
| Let's Encrypt status        | https://letsencrypt.status.io                       |
| Vérif DNS public temps réel | https://www.whatsmydns.net + https://dnschecker.org |

---

_Journal créé le 2026-05-23 — à mettre à jour à chaque jalon._
