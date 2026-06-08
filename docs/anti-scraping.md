# Protection anti-scraping — openlabconsulting.com

> **But réaliste.** Un site public ne peut pas être rendu _inscrapable_ : tout
> ce qu'un navigateur affiche, un scraper pilotant un vrai Chrome peut
> l'extraire. L'objectif est d'**élever le coût** : bloquer les bots
> paresseux/abusifs, ralentir les industriels, défier les suspects, et fermer
> les fuites de masse — **sans casser le SEO Google/Bing ni le GEO** (présence
> dans ChatGPT/Claude/Perplexity, cf. `CLAUDE.md` §12.4).
>
> **Décisions actées (2026-06-08)** :
>
> - Crawlers IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) → **gardés**.
> - Niveau Cloudflare → **équilibré** (Super Bot Fight Mode, pas de full lockdown).

Les couches sont **ordonnées par impact**. La couche 0 est le prérequis :
sans elle, toutes les autres se contournent en tapant l'origine en direct.

---

## Légende de responsabilité

- 🧑 **Toi** (dashboard Cloudflare / Hetzner — je n'y ai pas accès)
- ✅ **Déjà fait dans le repo** (cette branche `feat/p6-anti-scraping`)

---

## Couche 0 — Verrouiller l'origine sur Cloudflare 🧑 _(le plus important)_

Tant que l'IP du nœud/LB Hetzner répond à n'importe qui, un scraper saute
Cloudflare (WAF, Bot Fight Mode) **et** peut forger `cf-connecting-ip` pour
fausser le rate-limiting. Deux verrous complémentaires :

### 0.a — Authenticated Origin Pulls (mTLS) — robuste, indépendant de la topologie

Cloudflare présente un certificat client que l'origine est seule à accepter.
Aucun trafic hors-Cloudflare ne passe, peu importe les IP.

1. Cloudflare → **SSL/TLS → Origin Server → Authenticated Origin Pulls** →
   activer **au niveau de la zone**.
2. Récupérer le certificat CA Cloudflare (Origin Pull CA) et le monter côté
   ingress-nginx pour exiger le certif client :
   - Créer un Secret avec le CA : `kubectl -n openlab create secret generic
cf-origin-pull-ca --from-file=ca.crt=cloudflare-origin-pull-ca.pem`
   - Annoter l'Ingress (`deploy/helm/.../values-production.yaml`,
     `ingress.annotations`) :
     ```yaml
     nginx.ingress.kubernetes.io/auth-tls-verify-client: 'on'
     nginx.ingress.kubernetes.io/auth-tls-secret: 'openlab/cf-origin-pull-ca'
     ```
3. Vérifier : `curl https://openlabconsulting.com` (via CF) → OK ;
   `curl --resolve openlabconsulting.com:443:<IP_ORIGINE_DIRECTE>` → **refusé**.

### 0.b — Filtrer les IP entrantes sur les plages Cloudflare 🧑 _(ceinture)_

Au **niveau réseau**, avant l'ingress, n'autoriser le 80/443 que depuis
Cloudflare. **Où l'appliquer dépend de ta topologie** :

- **Si Cloudflare attaque directement l'IP du serveur Hetzner** → Hetzner
  Cloud Firewall : règle inbound 80/443 `Source = plages CF`, tout le reste
  DROP.
- **Si tu passes par un Hetzner Load Balancer** → le firewall verrait le LB,
  pas CF ; dans ce cas la couche 0.a (mTLS) est ta vraie protection, et tu
  peux restreindre l'accès **au LB** côté Hetzner.

> ⚠️ **Ne PAS** utiliser `nginx.ingress.kubernetes.io/whitelist-source-range`
> avec les plages CF : cette annotation filtre l'**IP du client réel** (le
> visiteur), pas celle de Cloudflare → tu bloquerais tout le monde.

**Plages IP Cloudflare (à jour)** :

- IPv4 : <https://www.cloudflare.com/ips-v4>
- IPv6 : <https://www.cloudflare.com/ips-v6>
- Liste combinée : <https://www.cloudflare.com/ips/>

### 0.c — Faire de `cf-connecting-ip` la vraie IP visiteur 🧑

Pour que le rate-limiting applicatif (Redis) et les logs key sur le **vrai**
visiteur, le contrôleur ingress-nginx doit traiter Cloudflare comme proxy de
confiance. ConfigMap du contrôleur `ingress-nginx` (⚠️ **partagé** avec
nexusrh/diagnostix sur ce cluster — coordonner) :

```yaml
data:
  use-forwarded-headers: 'true'
  compute-full-forwarded-for: 'true'
  proxy-real-ip-cidr: '<plages CF, séparées par des virgules>'
```

> Le code applicatif est déjà prêt : `lib/request-ip.ts` privilégie
> `cf-connecting-ip` (✅ cette branche). Cet en-tête n'est fiable **que** si la
> couche 0.a/0.b empêche de taper l'origine en direct.

---

## Couche 1 — Cloudflare anti-bot 🧑 _(80 % de la valeur, ~15 min)_

Dashboard Cloudflare → zone `openlabconsulting.com`.

### 1.a — Super Bot Fight Mode

**Security → Bots** (nécessite le plan Pro ou supérieur ; en Free, seul
« Bot Fight Mode » basique est dispo) :

| Catégorie            | Action                |
| -------------------- | --------------------- |
| Definitely automated | **Block**             |
| Likely automated     | **Managed Challenge** |
| Verified bots        | **Allow**             |

- _Verified bots = Allow_ laisse passer **Googlebot, Bingbot et les crawlers
  IA** (GPTBot, ClaudeBot… sont dans la liste « verified » de Cloudflare) →
  SEO + GEO préservés.
- **NE PAS** activer le toggle **« Block AI Scrapers and Crawlers »** : il
  bloquerait GPTBot/ClaudeBot (contraire à la décision GEO).
- Optionnel : cocher **« Block AI bots on... »** uniquement si tu changes
  d'avis et veux exclure l'IA — laisser **décoché** pour l'instant.

### 1.b — Règle de rate limiting

**Security → WAF → Rate limiting rules → Create** :

- **If** : `URI Path` ne commence pas par `/_next/` ni `/icon` (exclure les
  assets) — ou plus simple : appliquer à tout puis exclure les statiques.
- **Rate** : `100 requests / 1 minute` par `IP`.
- **Then** : **Managed Challenge** (ou Block si tu préfères dur).

> Complète le rate-limit Redis applicatif (`lib/rate-limit.ts`,
> `RATE_LIMITS.globalGet/globalAll`) qui, lui, ne voit que l'app derrière CF.

### 1.c — WAF Managed Rules

**Security → WAF → Managed rules** → activer **Cloudflare Managed Ruleset**
(en plus de ton ModSecurity origine). Mode _Block_ sur les signatures
critiques.

### 1.d — Surveiller avant de durcir

**Security → Bots → Bot Analytics** la 1ʳᵉ semaine : vérifier qu'aucun vrai
visiteur n'est challengé en masse (VPN, mobiles partagés). Ajuster si besoin.

---

## Couche 2 — `robots.txt` ✅ _(fait)_

`app/robots.ts` :

- Autorise Google/Bing + crawlers IA gardés (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended).
- **Refuse explicitement** les harvesters commerciaux agressifs : AhrefsBot,
  SemrushBot, MJ12bot, DotBot, DataForSeoBot, BLEXBot, PetalBot, Bytespider,
  ImagesiftBot, magpie-crawler, serpstatbot.

> Rappel : `robots.txt` n'est qu'une **politesse**. Seuls les bots honnêtes
> s'arrêtent ; les autres sont gérés par la couche 1 (Cloudflare).

---

## Couche 3 — Clé de rate-limiting fiable ✅ _(fait)_

`lib/request-ip.ts` privilégie désormais `cf-connecting-ip` (vrai IP visiteur)
avant `x-real-ip`. Voir couche 0.c pour rendre cet en-tête non-spoofable.

---

## Couche 4 — Hygiène du contenu

- ✅ **`feed.xml`** n'expose que des extraits (`excerpt`), pas le corps complet
  des articles — vérifié, rien à changer.
- 🧑 **Livre / PDF / chapitres** : garder derrière email ou auth (lead-magnet
  `CLAUDE.md` §8.2). Pas de lien direct public vers un PDF complet.
- 🧑 **Honeypot** (optionnel, efficace) : ajouter un lien caché vers une URL
  `Disallow` dans robots ; toute IP qui le suit est un bot → règle Cloudflare
  qui la bannit (WAF custom rule sur le path piège).
- ✅ **Turnstile** déjà présent sur les formulaires publics (`lib/turnstile.ts`).

---

## Couche 5 — Dissuasion légale 🧑

- Clause « scraping interdit » dans les **mentions légales / CGU**.
- Mention `©` dans le footer.
- Faible techniquement, mais nécessaire pour fonder une demande de retrait
  (abuse/DMCA) auprès d'un hébergeur si du contenu est repompé.

---

## Couche 6 — Détection 🧑

- **Loki** : alerte sur pic de `403/429` (ton stack monitoring NexusRH).
- **Cloudflare Bot Analytics** + **Security Events** : voir le scraping au lieu
  de le subir, et affiner les règles.

---

## Check-list d'activation (ordre conseillé)

1. [ ] 🧑 Couche 0.a — Authenticated Origin Pulls (mTLS) **← prioritaire**
2. [ ] 🧑 Couche 0.b — Firewall réseau plages CF (selon topologie)
3. [ ] 🧑 Couche 0.c — ingress-nginx real-ip Cloudflare (ConfigMap partagé)
4. [ ] 🧑 Couche 1.a — Super Bot Fight Mode (équilibré)
5. [ ] 🧑 Couche 1.b — Règle de rate limiting
6. [ ] 🧑 Couche 1.c — WAF Managed Rules
7. [x] ✅ Couche 2 — robots.txt durci
8. [x] ✅ Couche 3 — cf-connecting-ip prioritaire
9. [ ] 🧑 Couche 4 — honeypot + contenu premium derrière auth
10. [ ] 🧑 Couches 5–6 — légal + détection

> Après le déploiement de cette branche, **teste** : `curl -A "AhrefsBot"
https://openlabconsulting.com/robots.txt` doit montrer le `Disallow: /` pour
> AhrefsBot, et un accès direct à l'IP origine doit être refusé une fois la
> couche 0 en place.
