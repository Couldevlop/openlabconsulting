# Durcissement DNS anti-usurpation (SPF / DKIM / DMARC)

> Runbook à appliquer **dans Cloudflare** (zone `openlabconsulting.com`).
> Objectif : passer DMARC `p=quarantine` → `p=reject` et SPF `~all` → `-all`
> **sans casser** l'email transactionnel (ZeptoMail) ni la boîte Zoho Mail.
>
> ⚠️ Ces changements sont **outward-facing** : un `-all` ou un `p=reject` posé
> trop tôt fait **rejeter de vrais emails** (contact, audit-IA, livraison du
> livre blanc — tous via ZeptoMail, cf. `lib/email.ts`). On procède par étapes
> mesurées, pas d'un coup.

## 1. État relevé (2026-06-24)

| Enregistrement       | Valeur actuelle                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| SPF (`TXT @`)        | `v=spf1 mx:openlabconsulting.com a:mail.openlabconsulting.com a:mailphp.lws-hosting.com include:zohomail.com ~all` |
| DMARC (`TXT _dmarc`) | `v=DMARC1; p=quarantine;`                                                                                          |
| MX                   | `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50)                                                       |
| DKIM                 | sélecteur Zoho `zmail` présent (à confirmer + sélecteur **ZeptoMail** distinct)                                    |

**Observations :**

- Le SPF contient encore des entrées **LWS héritées** (`mx:openlabconsulting.com`,
  `a:mail.openlabconsulting.com`, `a:mailphp.lws-hosting.com`) datant d'avant la
  migration vers Hetzner/Zoho. Si plus aucun email légitime ne part de ces
  hôtes, elles sont à retirer — mais **seulement après confirmation**.
- Le DMARC n'a **pas de `rua`** : on ne reçoit aucun rapport agrégé, donc on est
  aveugle sur qui envoie au nom du domaine. C'est le premier trou à combler.

## 2. Pré-requis AVANT tout passage en strict

1. **Identifier tous les expéditeurs légitimes** du domaine :
   - **Zoho Mail** (boîtes humaines) → couvert par `include:zohomail.com`.
   - **ZeptoMail** (transactionnel applicatif, API HTTP) → exige son **propre**
     include SPF + DKIM. Récupérer la valeur **exacte** dans la console
     ZeptoMail → _Domains_ → domaine vérifié → enregistrements DNS proposés
     (généralement un `include:` ZeptoMail + un CNAME/TXT DKIM dédié).
     **Ne pas deviner la valeur** : la copier depuis la console.
2. **Vérifier le DKIM ZeptoMail** : le sélecteur DKIM affiché par ZeptoMail doit
   être présent dans la zone et **valider** (sinon `p=reject` rejettera le
   transactionnel dès qu'il n'aligne plus). Tester un envoi réel et inspecter
   l'en-tête `Authentication-Results` (`spf=pass`, `dkim=pass`, `dmarc=pass`).
3. **Confirmer les hôtes LWS inutilisés** avant de les retirer du SPF.

## 3. Déploiement séquencé

### Étape A — Observabilité d'abord (aucun risque, à faire maintenant)

Ajouter le reporting DMARC **sans** changer la politique. Permet de voir, via
les rapports agrégés, qui envoie au nom du domaine et si tout aligne.

```
# TXT  _dmarc.openlabconsulting.com
v=DMARC1; p=quarantine; rua=mailto:dmarc@openlabconsulting.com; ruf=mailto:dmarc@openlabconsulting.com; fo=1; adkim=r; aspf=r; pct=100
```

> Créer la boîte/alias `dmarc@openlabconsulting.com` (ou un mailbox dédié) pour
> recevoir les rapports. Laisser tourner **~2 semaines** et vérifier que les
> sources légitimes (Zoho, ZeptoMail) ressortent en `pass`.

### Étape B — SPF complet puis strict

1. D'abord, **compléter** le SPF avec l'include ZeptoMail (valeur exacte de la
   console) tout en gardant `~all` :

```
# TXT @ (exemple — REMPLACER <include-zeptomail> par la valeur réelle de la console)
v=spf1 include:zohomail.com <include-zeptomail> mx:openlabconsulting.com a:mail.openlabconsulting.com a:mailphp.lws-hosting.com ~all
```

2. Après validation (rapports DMARC `spf=pass` sur tout le trafic légitime),
   **retirer les entrées LWS confirmées inutilisées** et passer en `-all` :

```
# TXT @ (cible durcie — une fois ZeptoMail confirmé et LWS retiré)
v=spf1 include:zohomail.com <include-zeptomail> -all
```

> Garder le SPF sous **10 lookups DNS** (limite RFC 7208) — chaque `include:`/
> `a:`/`mx:` compte. Retirer les entrées LWS aide à rester sous le plafond.

### Étape C — DMARC en rejet

Seulement une fois les étapes A et B vertes (≥ 2 semaines de rapports propres) :

```
# TXT  _dmarc.openlabconsulting.com
v=DMARC1; p=reject; rua=mailto:dmarc@openlabconsulting.com; ruf=mailto:dmarc@openlabconsulting.com; fo=1; adkim=r; aspf=r; pct=100
```

> Option de prudence : passer d'abord `pct=25` puis `pct=100` sur quelques jours
> avant `p=reject` plein, si le volume sortant est important.

## 4. Vérification

```bash
# SPF / DMARC après propagation (TTL)
nslookup -type=TXT openlabconsulting.com
nslookup -type=TXT _dmarc.openlabconsulting.com

# Test de bout en bout : déclencher un email transactionnel réel
#   (formulaire /contact ou /audit-ia) et contrôler l'en-tête reçu :
#   Authentication-Results: spf=pass; dkim=pass; dmarc=pass
```

Outils externes utiles : MXToolbox (SPF/DMARC/DKIM), dmarcian / Postmark DMARC
(lecture des rapports `rua`).

## 5. Rollback

Réversible à tout instant en réécrivant l'enregistrement TXT précédent dans
Cloudflare (propagation = TTL, garder un TTL court ~5 min pendant la bascule) :

- DMARC : revenir à `v=DMARC1; p=quarantine; rua=...` (on garde le `rua`).
- SPF : revenir à `~all` (soft-fail) — n'entraîne aucun rejet.

## 6. État cible (résumé)

| Enregistrement | Cible                                                                       |
| -------------- | --------------------------------------------------------------------------- |
| SPF            | `v=spf1 include:zohomail.com <include-zeptomail> -all`                      |
| DMARC          | `v=DMARC1; p=reject; rua=mailto:dmarc@openlabconsulting.com; fo=1; pct=100` |
| DKIM           | sélecteurs Zoho **et** ZeptoMail présents et valides                        |

Voir aussi : `docs/migration-cloudflare-zoho-orchestrator-2026-05.md` (migration
DNS/email), mémoire `reference_zeptomail_email` (intégration transactionnelle).
