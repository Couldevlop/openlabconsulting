# Back-office d'administration premium

> Référence extraite de `CLAUDE.md` (ex-§9). Spécification des modules admin Payload, design et génération assistée IA. Voir aussi `docs/admin-cms.md` et `docs/admin-creer-un-article.md`.

L'admin est aussi soignée que le site public. Rédacteurs et admins y passent leur journée — elle doit être un plaisir.

## 1. Principes

1. **Même charte** que le site public
2. **Ergonomie cockpit** : tout atteignable en 2 clics
3. **Densité informationnelle** : pas de "vide UX"
4. **Aperçu temps réel** : draft/preview
5. **Recherche globale instantanée** (Cmd+K)
6. **Multi-langues** dès le départ
7. **Historique et versioning** sur chaque document
8. **Audit log** complet

## 2. Stack admin

Payload CMS v3 fournit nativement :

- Back-office React généré
- Auth + 2FA
- RBAC access control
- Versioning, draft, preview
- Live preview Next.js
- File uploads + sharp
- Localization
- REST + GraphQL API
- Hooks (before/after change)
- Jobs queue

À customiser visuellement pour respecter notre charte.

## 3. Modules admin

```
ADMIN /admin
├── Dashboard
│   ├── KPIs : visites/jour, leads, conversions audit IA
│   ├── Derniers leads (score IA de qualification)
│   ├── Articles en draft, à publier
│   ├── Démos produits demandées
│   └── Alertes (spam, build échec, certif expirant)
│
├── Contenu
│   ├── Articles (CRUD, catégories, tags, auteurs)
│   ├── Pages
│   ├── Études de cas
│   ├── Témoignages clients
│   ├── Livres blancs
│   └── FAQs
│
├── Produits
│   ├── 7 fiches produit
│   ├── Fonctionnalités composables
│   ├── Tarifications
│   └── Demandes de démo (CRM léger)
│
├── Livre
│   ├── Métadonnées
│   ├── Chapitres
│   ├── Extraits
│   ├── Préfaces & témoignages
│   └── Ventes (suivi Stripe)
│
├── Médias
│   ├── Bibliothèque MinIO
│   ├── Upload drag-and-drop
│   ├── Recherche par tag, couleur, date
│   └── Conversion auto AVIF/WebP
│
├── Leads & CRM
│   ├── Pipeline Kanban (Nouveau, Qualifié, RDV, Proposition, Signé, Perdu)
│   ├── Score IA par lead (Claude)
│   ├── Audit IA soumis
│   └── Export CSV
│
├── Insights IA
│   ├── Génération assistée d'articles (brouillon Claude)
│   ├── Résumé auto d'un article
│   ├── Suggestions mots-clés SEO
│   └── Détection plagiat (option)
│
├── SEO & Marketing
│   ├── Méta titres/descriptions par page
│   ├── Sitemaps auto
│   ├── Schema.org par contenu
│   ├── Redirections 301
│   ├── Newsletters (Brevo)
│   └── Tracking conversions
│
├── Utilisateurs & Rôles
│   ├── Admin · Éditeur · Auteur · Lecteur
│   ├── Permissions granulaires par collection
│   ├── 2FA obligatoire pour admin
│   └── Audit log
│
└── Système
    ├── Health checks (DB, Redis, MinIO, Claude API)
    ├── Sauvegardes (statut, restauration)
    ├── Logs (Loki integration)
    ├── Variables d'environnement (lecture seule)
    └── Webhooks
```

## 4. Design admin — règles

- Sidebar fixe à gauche (220 px), repliable
- Top bar : recherche Cmd+K, notifications, profil
- Tables : virtualisation > 100 lignes, filtres en haut, tri par colonne
- Formulaires : auto-save toutes les 15 s, indicateur visible
- Mode sombre activable
- Toasts non bloquants en bas à droite
- Onboarding : tour guidé première connexion

## 5. Génération assistée IA (différenciateur admin)

Dans `/admin/insights/ia` :

- **Générer brouillon article** : titre + brief → Claude → article 1500 mots
- **Améliorer un draft** : sélection texte → reformuler / raccourcir / allonger / changer ton
- **SEO optimizer** : analyse mots-clés + suggestions
- **Image alt automatique** : à l'upload, Claude génère alt + caption FR
- **Traduction FR → EN** en un clic (phase 2)

Coût plafonné : 30 €/mois max via rate-limiting serveur.
