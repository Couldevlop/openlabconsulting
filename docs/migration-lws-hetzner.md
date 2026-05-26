# Migration openlabconsulting.com — LWS → Hetzner K3s

**Objectif** : déployer le nouveau site Next.js + Payload sur le cluster K3s Hetzner existant, **sans casser les emails pros LWS** (waopron@, infos@) et **sans toucher aux 2 sous-domaines existants**.

**Durée totale** :

- Préparation J-2 : ~1 h
- Cutover jour J : ~30 min de manip + 30 min de monitoring
- Surveillance : J+1 à J+7

**Compatibilité OS** : toutes les commandes locales sont données pour **PowerShell (Windows)** et **Bash (Linux/macOS)**.

---

## Sommaire

1. [Prérequis outillage](#1-prérequis-outillage)
2. [Audit DNS actuel (sauvegarde)](#2-audit-dns-actuel-sauvegarde)
3. [J-2 : déployer sur staging](#3-j-2--déployer-sur-staging)
4. [J-2 : baisser le TTL apex](#4-j-2--baisser-le-ttl-apex)
5. [J-1 : sceller les secrets production](#5-j-1--sceller-les-secrets-production)
6. [Jour J : déployer production](#6-jour-j--déployer-production)
7. [Jour J : modifier le DNS LWS](#7-jour-j--modifier-le-dns-lws)
8. [Jour J : vérifier le certificat HTTPS](#8-jour-j--vérifier-le-certificat-https)
9. [Jour J : smoke tests complets](#9-jour-j--smoke-tests-complets)
10. [Jour J : vérifier que les emails marchent toujours](#10-jour-j--vérifier-que-les-emails-marchent-toujours)
11. [J+1 à J+7 : monitoring](#11-j1-à-j7--monitoring)
12. [J+7 : nettoyage](#12-j7--nettoyage)
13. [Rollback en cas de problème](#13-rollback-en-cas-de-problème)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prérequis outillage

### Sur ta machine locale

| Outil             | Windows                                                                                                                | Linux/macOS                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `kubectl` v1.28+  | [Installer Windows](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/) ou `choco install kubernetes-cli` | `apt install kubectl` / `brew install kubectl`                                                                  |
| `helm` v3.13+     | `choco install kubernetes-helm`                                                                                        | `brew install helm` ou `curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 \| bash` |
| `kubeseal` v0.27+ | [Releases GitHub](https://github.com/bitnami-labs/sealed-secrets/releases)                                             | `brew install kubeseal`                                                                                         |
| `openssl`         | Git for Windows inclut `openssl` dans Git Bash                                                                         | natif                                                                                                           |
| `curl`            | natif Windows 10+                                                                                                      | natif                                                                                                           |
| `dig`             | Pas natif → utiliser `Resolve-DnsName` PowerShell, OU installer BIND ou utiliser Git Bash                              | natif                                                                                                           |

### Vérification rapide

**PowerShell** :

```powershell
kubectl version --client
helm version
kubeseal --version
openssl version  # via Git Bash si nécessaire
curl --version
Resolve-DnsName openlabconsulting.com -Type A
```

**Bash (Linux/macOS)** :

```bash
kubectl version --client
helm version
kubeseal --version
openssl version
curl --version
dig openlabconsulting.com A +short
```

### Configuration `kubectl` pour Hetzner K3s

Tu dois avoir le `kubeconfig` du cluster K3s. Si tes 2 apps actuelles tournent déjà, c'est déjà fait. Sinon :

**Récupère le fichier `/etc/rancher/k3s/k3s.yaml`** depuis ton serveur Hetzner (par SSH), puis :

**PowerShell** :

```powershell
$env:USERPROFILE\.kube\
# Crée le dossier si absent
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.kube"
# Copie le fichier (remplacer le path source par ton chemin réel)
Copy-Item "C:\chemin\vers\k3s.yaml" "$env:USERPROFILE\.kube\config"
# Vérifie
kubectl get nodes
```

**Bash** :

```bash
mkdir -p ~/.kube
scp root@<IP-Hetzner>:/etc/rancher/k3s/k3s.yaml ~/.kube/config
# Remplace 127.0.0.1 par l'IP publique Hetzner dans le fichier
sed -i 's|127.0.0.1|<IP-Hetzner>|g' ~/.kube/config
kubectl get nodes
```

### Vérifier que cert-manager et Traefik tournent déjà

Tes 2 sous-domaines existants utilisent forcément ces deux composants. Vérifie :

```powershell
kubectl get pods -n cert-manager
kubectl get clusterissuer
kubectl get pods -n kube-system | Select-String traefik   # PowerShell
```

```bash
kubectl get pods -n cert-manager
kubectl get clusterissuer
kubectl get pods -n kube-system | grep traefik            # Bash
```

Le `ClusterIssuer` `letsencrypt-prod` doit exister. S'il manque, demande à l'admin du cluster.

### Prérequis image GHCR

Avant tout `bash deploy/scripts/deploy.sh ... v<X.Y.Z>`, l'image doit
exister sur GHCR. C'est le rôle du workflow `.github/workflows/release.yml`
qui se déclenche sur push d'un tag `v*`.

**Procédure complète** : [`docs/release-procedure.md`](./release-procedure.md).

Vérification rapide qu'une image existe (remplacer `<owner>` et la
version) :

```bash
docker pull ghcr.io/<owner>/website:v1.0.0
# ou :
gh api "/users/<owner>/packages/container/website/versions" --jq '.[].metadata.container.tags[]'
```

Si l'image n'existe pas → tagger sur `main` :

```bash
git checkout main && git pull --ff-only
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0       # déclenche release.yml (~10-12 min)
```

---

## 2. Audit DNS actuel (sauvegarde)

**⚠️ ÉTAPE CRITIQUE : sauvegarde les MX et SPF avant toute modification.**

### Récupérer tous les records actuels

**PowerShell** :

```powershell
# Crée un dossier de sauvegarde horodaté
$ts = Get-Date -Format "yyyy-MM-dd-HHmm"
$dir = "$env:USERPROFILE\Desktop\dns-backup-$ts"
New-Item -ItemType Directory -Force -Path $dir

# A apex (ce qu'on va modifier)
Resolve-DnsName openlabconsulting.com -Type A | Out-File "$dir\A-apex.txt"

# A www
Resolve-DnsName www.openlabconsulting.com -Type A -ErrorAction SilentlyContinue | Out-File "$dir\A-www.txt"

# MX (à NE PAS toucher)
Resolve-DnsName openlabconsulting.com -Type MX | Out-File "$dir\MX.txt"

# TXT (SPF + DKIM + DMARC, à NE PAS toucher)
Resolve-DnsName openlabconsulting.com -Type TXT | Out-File "$dir\TXT-apex.txt"
Resolve-DnsName _dmarc.openlabconsulting.com -Type TXT -ErrorAction SilentlyContinue | Out-File "$dir\TXT-dmarc.txt"

# Sous-domaines existants (à NE PAS toucher)
Resolve-DnsName sub1.openlabconsulting.com -Type A -ErrorAction SilentlyContinue | Out-File "$dir\A-sub1.txt"
Resolve-DnsName sub2.openlabconsulting.com -Type A -ErrorAction SilentlyContinue | Out-File "$dir\A-sub2.txt"

Write-Host "✅ Sauvegarde DNS dans : $dir"
```

> Remplace `sub1`/`sub2` par les vrais noms de tes 2 sous-domaines.

**Bash** :

```bash
ts=$(date +%Y-%m-%d-%H%M)
dir="$HOME/dns-backup-$ts"
mkdir -p "$dir"

dig openlabconsulting.com A     +noall +answer > "$dir/A-apex.txt"
dig www.openlabconsulting.com A +noall +answer > "$dir/A-www.txt"
dig openlabconsulting.com MX    +noall +answer > "$dir/MX.txt"
dig openlabconsulting.com TXT   +noall +answer > "$dir/TXT-apex.txt"
dig _dmarc.openlabconsulting.com TXT +noall +answer > "$dir/TXT-dmarc.txt"
dig sub1.openlabconsulting.com A +noall +answer > "$dir/A-sub1.txt"
dig sub2.openlabconsulting.com A +noall +answer > "$dir/A-sub2.txt"

echo "✅ Sauvegarde DNS dans : $dir"
```

### Identifier l'IP Hetzner

**PowerShell** :

```powershell
$ipHetzner = (Resolve-DnsName sub1.openlabconsulting.com -Type A).IPAddress
Write-Host "IP Hetzner = $ipHetzner"
```

**Bash** :

```bash
IP_HETZNER=$(dig sub1.openlabconsulting.com +short)
echo "IP Hetzner = $IP_HETZNER"
```

> Garde cette IP sous la main, tu vas la réutiliser plusieurs fois.

### Identifier l'IP WordPress actuelle (pour rollback)

**PowerShell** :

```powershell
$ipWordpress = (Resolve-DnsName openlabconsulting.com -Type A).IPAddress
Write-Host "IP WordPress actuelle (à noter pour rollback) = $ipWordpress"
```

**Bash** :

```bash
IP_WORDPRESS=$(dig openlabconsulting.com +short)
echo "IP WordPress actuelle (à noter pour rollback) = $IP_WORDPRESS"
```

> **⚠️ Écris cette IP sur un papier.** Si quelque chose foire à J, c'est cette valeur qu'il faut remettre dans le DNS LWS pour revenir à l'état avant migration.

---

## 3. J-2 : déployer sur staging

L'objectif : valider tout le déploiement sur `staging.openlabconsulting.com` **sans toucher au site openlabconsulting.com actuel**.

### 3.1 Créer le record DNS staging

Dans le panneau **LWS → Gérer le domaine → Zone DNS** :

```
Type     Nom        Valeur          TTL
A        staging    <IP Hetzner>    300
```

Sauvegarde. Propagation 5-30 min.

### 3.2 Vérifier que le DNS staging propage

**PowerShell** :

```powershell
Resolve-DnsName staging.openlabconsulting.com -Type A
# Doit retourner l'IP Hetzner
```

**Bash** :

```bash
dig staging.openlabconsulting.com +short
# Doit retourner l'IP Hetzner
```

### 3.3 Sceller le SealedSecret staging

> Le SealedSecret protège les vrais secrets dans Git. Sans cette étape, le déploiement échoue.

**Bash (recommandé même sous Windows via Git Bash ou WSL) — toutes les valeurs sont générées à la volée** :

```bash
cd D:/OPENLAB/openlabconsulting   # ou ton chemin

# Génère le secret en clair dans un fichier temporaire
kubectl -n openlab-staging create secret generic openlab-website-secrets \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -hex 32) \
  --from-literal=DATABASE_URL="postgresql://openlab:CHANGE-ME@postgres:5432/openlab" \
  --from-literal=PAYLOAD_SECRET=$(openssl rand -hex 32) \
  --from-literal=BETTER_AUTH_SECRET=$(openssl rand -hex 32) \
  --from-literal=MINIO_ACCESS_KEY=$(openssl rand -hex 16) \
  --from-literal=MINIO_SECRET_KEY=$(openssl rand -hex 32) \
  --from-literal=MEILISEARCH_MASTER_KEY=$(openssl rand -hex 32) \
  --from-literal=ANTHROPIC_API_KEY="REMPLACE-PAR-TA-CLE" \
  --from-literal=TURNSTILE_SECRET_KEY="REMPLACE-PAR-TA-CLE-TURNSTILE" \
  --from-literal=METRICS_TOKEN=$(openssl rand -hex 32) \
  --dry-run=client -o yaml > /tmp/secret-staging-cleartext.yaml

# IMPORTANT : édite /tmp/secret-staging-cleartext.yaml pour remplacer
# `CHANGE-ME` dans DATABASE_URL par la valeur de POSTGRES_PASSWORD générée
# au-dessus. Le secret final doit être cohérent.

# Sceller
kubeseal --controller-namespace=sealed-secrets-system \
         --controller-name=sealed-secrets \
         --format=yaml < /tmp/secret-staging-cleartext.yaml \
         > deploy/k8s/base/secret-staging.sealedsecret.yaml

# Détruire le fichier en clair (CRITIQUE — sinon il pourrait être commit)
shred -u /tmp/secret-staging-cleartext.yaml 2>/dev/null || rm -f /tmp/secret-staging-cleartext.yaml

# Apply le SealedSecret
kubectl create namespace openlab-staging 2>/dev/null || true
kubectl apply -f deploy/k8s/base/secret-staging.sealedsecret.yaml
```

**PowerShell** : utilise Git Bash (livré avec Git for Windows). Sinon adapte avec `Get-Random` à la place de `openssl rand`, mais l'entropie est moins bonne — préfère Git Bash.

### 3.4 Vérifier que le secret est bien déchiffré dans le cluster

```bash
kubectl get secret openlab-website-secrets -n openlab-staging
# NAME                       TYPE     DATA   AGE
# openlab-website-secrets    Opaque   10     5s
```

Si tu vois `SealedSecret` mais pas de `Secret` correspondant après 30 sec, c'est que SealedSecrets n'a pas réussi le déchiffrement. Vérifie les logs :

```bash
kubectl logs -n sealed-secrets-system -l app.kubernetes.io/name=sealed-secrets
```

### 3.5 Déployer le chart Helm en staging

**PowerShell** :

```powershell
cd D:\OPENLAB\openlabconsulting
bash deploy/scripts/deploy.sh staging v1.0.0
```

**Bash** :

```bash
cd /chemin/vers/openlabconsulting
bash deploy/scripts/deploy.sh staging v1.0.0
```

Le script va :

1. Vérifier kubectl + helm + namespace
2. `helm dependency build` (télécharge sub-charts Bitnami)
3. Vérifier le SealedSecret est déchiffré
4. `helm lint`
5. `helm upgrade --install --atomic --wait --timeout 8m`
6. Smoke test sur https://staging.openlabconsulting.com/api/health
7. Rapport final

### 3.6 Valider le staging

Ouvre dans ton navigateur :

- https://staging.openlabconsulting.com — la home doit s'afficher
- https://staging.openlabconsulting.com/solutions/nexusrh — page produit
- https://staging.openlabconsulting.com/admin — login Payload
- https://staging.openlabconsulting.com/api/health — `{"status":"ok"}`

**Checklist staging** :

- [ ] Home charge en < 2 s
- [ ] Pas d'erreur console navigateur
- [ ] Formulaire `/contact` accepte un envoi test
- [ ] `/admin` redirige vers login Payload
- [ ] Certificat HTTPS valide (cadenas vert)

> Si quelque chose foire, ne passe pas à l'étape suivante. C'est le bon moment pour debug — staging est isolé.

---

## 4. J-2 : baisser le TTL apex

Connecte-toi au panneau LWS → **Zone DNS** de openlabconsulting.com.

Trouve l'enregistrement actuel :

```
Type: A    Nom: @ (ou openlabconsulting.com)    Valeur: <IP WordPress LWS>    TTL: 3600
```

**Modifie uniquement le TTL** à `300` (5 minutes). Sauvegarde.

Pareil pour le record `www` s'il existe.

> Pourquoi ? Les résolveurs DNS du monde entier ont actuellement en cache l'ancien IP pour 1 h. En descendant à 5 min, dans 1 h tout le monde aura un cache court → cutover plus rapide + rollback plus rapide en cas de souci.

**Attends 1 h minimum (idéalement 48 h) avant de continuer.** Pendant ce temps, tout fonctionne normalement.

---

## 5. J-1 : sceller les secrets production

Même procédure qu'au 3.3 mais avec :

- Namespace `openlab` (au lieu de `openlab-staging`)
- Vraies clés API (Anthropic, Resend, Turnstile production)
- Mots de passe différents du staging (sécurité)

**Bash (ou Git Bash sous Windows)** :

```bash
cd D:/OPENLAB/openlabconsulting

POSTGRES_PWD=$(openssl rand -hex 32)

kubectl -n openlab create secret generic openlab-website-secrets \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PWD" \
  --from-literal=DATABASE_URL="postgresql://openlab:$POSTGRES_PWD@postgres:5432/openlab" \
  --from-literal=PAYLOAD_SECRET=$(openssl rand -hex 32) \
  --from-literal=BETTER_AUTH_SECRET=$(openssl rand -hex 32) \
  --from-literal=MINIO_ACCESS_KEY=$(openssl rand -hex 16) \
  --from-literal=MINIO_SECRET_KEY=$(openssl rand -hex 32) \
  --from-literal=MEILISEARCH_MASTER_KEY=$(openssl rand -hex 32) \
  --from-literal=ANTHROPIC_API_KEY="sk-ant-api03-VOTRE-VRAIE-CLE" \
  --from-literal=RESEND_API_KEY="re_VOTRE-VRAIE-CLE" \
  --from-literal=TURNSTILE_SECRET_KEY="VOTRE-VRAIE-CLE-TURNSTILE-PROD" \
  --from-literal=METRICS_TOKEN=$(openssl rand -hex 32) \
  --dry-run=client -o yaml > /tmp/secret-prod-cleartext.yaml

kubeseal --controller-namespace=sealed-secrets-system \
         --controller-name=sealed-secrets \
         --format=yaml < /tmp/secret-prod-cleartext.yaml \
         > deploy/k8s/base/secret.sealedsecret.yaml

shred -u /tmp/secret-prod-cleartext.yaml 2>/dev/null || rm -f /tmp/secret-prod-cleartext.yaml

# Commit dans git (le fichier scellé est safe à commiter)
git add deploy/k8s/base/secret.sealedsecret.yaml
git commit -m "chore(secrets): seal production secrets for openlabconsulting.com"
git push origin develop

# Apply le SealedSecret (Postgres password sera utilisé au démarrage du sub-chart)
kubectl create namespace openlab 2>/dev/null || true
kubectl apply -f deploy/k8s/base/secret.sealedsecret.yaml

# Vérifier
kubectl get secret openlab-website-secrets -n openlab
```

---

## 6. Jour J : déployer production

**Heure recommandée** : nuit en CI (00:00-04:00 GMT) ou un dimanche matin. Heure de moindre trafic.

### 6.1 Pré-checks

```bash
# kubectl pointe bien sur Hetzner ?
kubectl config current-context

# Le secret est bien là ?
kubectl get secret openlab-website-secrets -n openlab

# cert-manager opérationnel ?
kubectl get clusterissuer letsencrypt-prod
# Doit afficher READY=True
```

### 6.2 Lancer le déploiement Helm

**PowerShell** :

```powershell
cd D:\OPENLAB\openlabconsulting
bash deploy/scripts/deploy.sh production v1.0.0
```

**Bash** :

```bash
cd /chemin/vers/openlabconsulting
bash deploy/scripts/deploy.sh production v1.0.0
```

⚠️ **Le smoke test du script va échouer à la fin** car le DNS pointe encore vers WordPress. C'est normal. Helm a fait son job (déploiement OK). Le script renvoie 1 mais l'app tourne. Continue avec l'étape 7.

Pour vérifier que les pods sont up :

```bash
kubectl get pods -n openlab
# Attendre que tous les pods soient Running (1-3 min)

kubectl logs -n openlab -l app.kubernetes.io/name=openlab-website --tail=20
# Pas d'erreur fatale ?
```

---

## 7. Jour J : modifier le DNS LWS

> **⚠️ AVANT TOUTE MODIFICATION — RAPPEL** : tu ne touches que les records **A apex** et **www**. Les **MX, SPF, DKIM, DMARC, sub1, sub2 ne doivent JAMAIS changer**.

### 7.1 Sauvegarde une dernière fois les MX

**PowerShell** :

```powershell
Resolve-DnsName openlabconsulting.com -Type MX | Format-Table
# Note ce qui s'affiche sur un papier
```

**Bash** :

```bash
dig openlabconsulting.com MX +short
# Note ce qui s'affiche
```

### 7.2 Modifier le record A apex dans LWS

Dans le panneau **LWS → Zone DNS de openlabconsulting.com** :

Trouve la ligne :

```
Type: A    Nom: @ (ou openlabconsulting.com)    Valeur: <IP WordPress LWS>    TTL: 300
```

**Modifie uniquement la valeur** :

```
Type: A    Nom: @    Valeur: <IP Hetzner>    TTL: 300
```

Sauvegarde.

### 7.3 Créer / modifier le record www

Si tu as déjà un record `www` :

```
Type: A    Nom: www    Valeur: <IP WordPress LWS>    TTL: 300
```

→ **modifie en CNAME** (plus simple à maintenir) :

```
Type: CNAME    Nom: www    Valeur: openlabconsulting.com.    TTL: 300
```

Le point final est important.

Si pas de record `www`, crée-le directement en CNAME.

### 7.4 Vérifier la propagation

Attends 5 à 30 minutes. Test :

**PowerShell** :

```powershell
Resolve-DnsName openlabconsulting.com -Type A
Resolve-DnsName www.openlabconsulting.com
```

**Bash** :

```bash
dig openlabconsulting.com +short
dig www.openlabconsulting.com +short
```

Les deux doivent retourner ton IP Hetzner.

Tu peux aussi vérifier depuis l'extérieur (autre résolveur) :

```bash
dig @8.8.8.8 openlabconsulting.com +short          # DNS Google
dig @1.1.1.1 openlabconsulting.com +short          # DNS Cloudflare
```

> Si après 30 min un résolveur public retourne encore l'ancienne IP, attends. Si après 2 h c'est toujours le cas, le TTL n'avait pas eu le temps d'expirer (étape 4 sautée ou trop récente).

---

## 8. Jour J : vérifier le certificat HTTPS

Dès que le DNS pointe vers Hetzner, cert-manager va émettre automatiquement le certificat Let's Encrypt via challenge HTTP-01.

```bash
# Watch en temps réel (Ctrl+C pour quitter)
kubectl get certificate -n openlab -w

# NAME           READY   SECRET        AGE
# openlab-tls    True    openlab-tls   2m
```

Attendre `READY = True`. Délai habituel : 30 sec à 2 min après que le DNS soit propagé.

Si après 5 min toujours `False` :

```bash
kubectl describe certificate openlab-tls -n openlab
kubectl describe order -n openlab
kubectl describe challenge -n openlab
```

Cherche le message d'erreur — le plus courant est "challenge HTTP-01 failed" → soit le DNS n'est pas encore propagé, soit Traefik n'expose pas /.well-known/acme-challenge/.

---

## 9. Jour J : smoke tests complets

### 9.1 Tests HTTPS de base

**PowerShell** :

```powershell
# Doit renvoyer 200
Invoke-WebRequest -Uri "https://openlabconsulting.com/api/health" -UseBasicParsing | Select-Object StatusCode
Invoke-WebRequest -Uri "https://www.openlabconsulting.com" -UseBasicParsing | Select-Object StatusCode

# Headers OWASP
$response = Invoke-WebRequest -Uri "https://openlabconsulting.com" -UseBasicParsing
$response.Headers["Strict-Transport-Security"]
$response.Headers["X-Frame-Options"]
$response.Headers["Content-Security-Policy"]
```

**Bash** :

```bash
curl -I https://openlabconsulting.com/api/health
curl -I https://www.openlabconsulting.com

# Vérifier les headers OWASP
curl -I https://openlabconsulting.com | grep -iE 'strict-transport|x-frame|content-security|referrer-policy'
```

### 9.2 Test navigateur manuel

Ouvre dans un navigateur en **mode navigation privée** (sans cache) :

- https://openlabconsulting.com
- https://openlabconsulting.com/solutions/nexusrh
- https://openlabconsulting.com/livre
- https://openlabconsulting.com/admin

Checklist :

- [ ] Home charge en < 2 s
- [ ] Cadenas vert (HTTPS valide)
- [ ] Pas de redirection WordPress (sinon DNS pas propagé)
- [ ] Le carrousel des cas clients tourne
- [ ] Le simulateur de paie NexusRH calcule
- [ ] /admin redirige vers login Payload
- [ ] Console navigateur (F12) sans erreur rouge

### 9.3 Test sitemap + SEO

```bash
# Sitemap doit lister 30+ URLs
curl -s https://openlabconsulting.com/sitemap.xml | grep -c "<loc>"

# robots.txt OK ?
curl https://openlabconsulting.com/robots.txt

# OG image
curl -I https://openlabconsulting.com/opengraph-image
```

### 9.4 Test note securityheaders.com

Ouvre dans le navigateur : https://securityheaders.com/?q=openlabconsulting.com

Doit afficher **A+** ou **A**. Si moins, vérifier le middleware Next (mais ce sera surprenant vu que les headers sont déjà testés en E2E).

---

## 10. Jour J : vérifier que les emails marchent toujours

**🚨 ÉTAPE CRITIQUE — ne pas sauter.**

### 10.1 Vérifier que les MX n'ont pas bougé

**PowerShell** :

```powershell
Resolve-DnsName openlabconsulting.com -Type MX | Format-Table
# Doit afficher EXACTEMENT la même valeur qu'à l'étape 2 et 7.1
```

**Bash** :

```bash
dig openlabconsulting.com MX +short
# Compare avec ce que tu avais noté en 7.1
```

Si différent → **rollback immédiat** dans LWS : remets l'ancienne valeur MX.

### 10.2 Test envoi d'email

Depuis ton mail perso (pas openlabconsulting.com) :

```
À : waopron@openlabconsulting.com
Objet : Test post-cutover DNS
Corps : Test du flux mail après migration DNS. Si tu lis ceci, tout va bien.
```

Vérifie sur le webmail LWS (https://webmail.lws-hosting.com ou panneau LWS) :

- L'email arrive dans la boîte
- Les liens / formattage sont OK

### 10.3 Test reply

Depuis la boîte LWS, envoie une réponse à toi-même. Vérifie qu'elle part bien.

### 10.4 Vérifier que sub1 + sub2 fonctionnent toujours

```bash
curl -I https://sub1.openlabconsulting.com
curl -I https://sub2.openlabconsulting.com
```

Doit renvoyer 200 (ou ce qu'elles renvoyaient avant).

---

## 11. J+1 à J+7 : monitoring

### Tous les jours

```bash
# Pods toujours up
kubectl get pods -n openlab

# Pas de crash récent ?
kubectl get events -n openlab --sort-by='.lastTimestamp' | tail -20

# Logs sans erreurs fatales
kubectl logs -n openlab -l app.kubernetes.io/name=openlab-website --tail=100 | grep -iE 'error|fatal'

# Smoke test rapide
curl -fsS https://openlabconsulting.com/api/health
```

### Test email régulier

Envoie-toi un email test toutes les 24 h pour vérifier que le flow reste OK.

### Tableau de bord

Si Prometheus + Grafana sont en place pour tes 2 autres apps, le dashboard scrape automatiquement les métriques openlab via les annotations `prometheus.io/scrape: 'true'` du déploiement.

---

## 12. J+7 : nettoyage

Si tout est stable depuis 1 semaine :

### 12.1 Remonter le TTL DNS apex

Dans LWS :

```
Type: A    Nom: @    Valeur: <IP Hetzner>    TTL: 3600  ← remonter de 300 à 3600
Type: CNAME    Nom: www    Valeur: openlabconsulting.com.    TTL: 3600
```

### 12.2 Supprimer le WordPress LWS

1. **Sauvegarde** le WordPress avant suppression :
   - Panneau LWS → Sauvegarde du site
   - Télécharge le ZIP en local (`Desktop\wordpress-backup-final.zip`)
   - Conserve 6 mois minimum
2. Dans le panneau LWS → Hébergement → Supprimer le site
3. **Ne touche surtout pas au domaine ni à l'email** dans la foulée

### 12.3 Désactiver le sous-domaine staging (optionnel)

Si tu n'as plus besoin de staging public :

```bash
helm uninstall openlab -n openlab-staging
kubectl delete namespace openlab-staging
```

Dans LWS, supprime le record DNS `staging`.

### 12.4 Documenter

Mets à jour :

- `docs/admin-cms.md` : section "Production" pour mentionner l'environnement live
- Sauvegarde la version finale du SealedSecret dans ton coffre-fort (Bitwarden, 1Password)

---

## 13. Rollback en cas de problème

### Scénario A — le site openlabconsulting.com ne charge pas après cutover

**Symptôme** : 30 min après modif DNS, le site répond en erreur ou ne répond pas.

**Action immédiate** : retourne dans LWS → Zone DNS → remets le record A apex :

```
Type: A    Nom: @    Valeur: <IP WordPress LWS noté en étape 2>    TTL: 300
```

WordPress reprend la main en 5-10 min (TTL court).

Puis investigue le cluster sans pression :

```bash
kubectl get pods -n openlab
kubectl describe pod -n openlab -l app.kubernetes.io/name=openlab-website
kubectl logs -n openlab -l app.kubernetes.io/name=openlab-website --tail=200
```

### Scénario B — les emails ne marchent plus

**Symptôme** : tu ne reçois plus de mail sur waopron@.

**Action immédiate** : vérifie le record MX dans LWS. Si modifié, remets l'ancienne valeur (note en étape 2 et 7.1).

```bash
dig openlabconsulting.com MX +short
# Doit être identique à la sauvegarde initiale
```

### Scénario C — rollback Helm

Si le déploiement Hetzner pose problème mais que le DNS est encore valide :

```bash
bash deploy/scripts/rollback.sh production
```

Ou manuellement :

```bash
helm history openlab -n openlab
helm rollback openlab <REVISION_PRECEDENTE> -n openlab --wait
```

---

## 14. Troubleshooting

### "Certificate stuck on False / order pending"

```bash
kubectl describe order -n openlab
```

Cherche `Reason: waiting`. Vérifie :

- DNS bien propagé : `dig openlabconsulting.com +short` retourne l'IP Hetzner
- Traefik route bien : `kubectl logs -n kube-system -l app.kubernetes.io/name=traefik --tail=50`
- Aucun firewall ne bloque le port 80 entrant sur le serveur Hetzner

### "Pod crashloopbackoff"

```bash
kubectl logs -n openlab -l app.kubernetes.io/name=openlab-website --previous
```

Erreurs courantes :

- `DATABASE_URL` mal formé dans le SealedSecret → re-sceller
- Postgres pas encore prêt → attendre 2-3 min
- Erreur de migration Payload → `kubectl logs -n openlab job/openlab-migrate`

### "ImagePullBackOff"

L'image n'existe pas sur GHCR. Vérifier que le tag `v1.0.0` a bien été pushé par la CI GitHub Actions.

```bash
kubectl describe pod -n openlab -l app.kubernetes.io/name=openlab-website
# Cherche "Failed to pull image"
```

### "503 Service Unavailable" sur openlabconsulting.com

Traefik renvoie 503 = backend pas prêt. Vérifie :

```bash
kubectl get endpoints -n openlab openlab-website
# Doit lister au moins 1 IP de pod
```

Si vide : les pods ne sont pas Ready (problème liveness/readiness probe).

### "DNS pas propagé après 30 min"

- Vérifie dans LWS que tu as bien cliqué "Sauvegarder" sur le record modifié
- Le TTL n'avait pas eu le temps d'expirer (étape 4 sautée)
- Cache navigateur : ouvre en navigation privée, ou flush DNS local :
  - Windows : `ipconfig /flushdns` (PowerShell admin)
  - macOS : `sudo dscacheutil -flushcache`
  - Linux : `sudo systemd-resolve --flush-caches` (varie selon distrib)

### "Email LWS down après cutover"

Vérifie immédiatement les MX (cf. scénario B). Si MX OK mais mail bloqué, vérifie SPF :

```bash
dig openlabconsulting.com TXT +short | grep spf
# Doit contenir include:_spf.lws-hosting.com ou similaire
```

Si modifié → remettre la valeur d'origine.

---

## Contacts en cas d'urgence

| Service                 | Contact                                       |
| ----------------------- | --------------------------------------------- |
| LWS support DNS         | https://www.lws.fr/contact.php — 0892 230 220 |
| Hetzner support cluster | console.hetzner.cloud → Support               |
| Let's Encrypt status    | https://letsencrypt.status.io                 |

---

## Annexe — Récapitulatif DNS final

Voici l'état attendu de la zone DNS LWS après migration complète :

| Type  | Nom                     | Valeur                                     | TTL  | Notes                             |
| ----- | ----------------------- | ------------------------------------------ | ---- | --------------------------------- |
| A     | @                       | `<IP Hetzner>`                             | 3600 | ✅ modifié au cutover             |
| CNAME | www                     | `openlabconsulting.com.`                   | 3600 | ✅ créé au cutover                |
| A     | sub1                    | `<IP Hetzner>`                             | 3600 | inchangé                          |
| A     | sub2                    | `<IP Hetzner>`                             | 3600 | inchangé                          |
| A     | staging                 | `<IP Hetzner>`                             | 3600 | optionnel, peut être supprimé J+7 |
| MX    | @                       | `mail.lws-mail.com.` (prio 10)             | 3600 | 🔒 NE PAS toucher                 |
| TXT   | @                       | `v=spf1 include:_spf.lws-hosting.com -all` | 3600 | 🔒 NE PAS toucher                 |
| TXT   | \_dmarc                 | `v=DMARC1; p=quarantine;...`               | 3600 | 🔒 NE PAS toucher                 |
| TXT   | \_selector1.\_domainkey | `v=DKIM1; k=rsa; p=...`                    | 3600 | 🔒 NE PAS toucher (si présent)    |
| CNAME | mail                    | `mail.lws-mail.com.`                       | 3600 | 🔒 NE PAS toucher (webmail)       |

Les valeurs exactes des MX/SPF/DKIM dépendent de l'offre LWS. Récupère-les via `dig` avant toute modification.
