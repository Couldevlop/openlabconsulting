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

## 6. Valider un rapport d'audit IA

Le parcours `/audit-ia` promet au prospect un rapport personnalisé sous **24 h ouvrées**. Un brouillon est généré automatiquement à chaque demande ; il n'est **jamais** envoyé sans relecture humaine.

### Où sont les brouillons

Trois signaux, de force croissante :

1. **Email** à `waopron@` dès qu'un brouillon est prêt, avec un lien direct vers la fiche.
2. **Compteur permanent** dans la navigation du back-office (« N rapports à valider »). Il ne dépend d'aucun transport externe : il reste visible même quand l'email est en panne.
3. **Relance** à 12 h, puis email « échéance dépassée » à 24 h et rappel quotidien tant que rien n'est validé.

### Ce qu'il faut relire en priorité

Le champ **Généré par** indique l'origine du texte :

- `Lucie-7B` : le modèle a produit le brouillon. Relire pour le fond, corriger les approximations, vérifier qu'aucun chiffre n'a été inventé.
- `Squelette de repli` : le modèle était indisponible. Le document est un canevas générique rempli à partir des réponses au questionnaire. **Il doit être réécrit**, pas seulement relu. Le champ `generationError` précise la raison.

Le texte est librement modifiable. **Enregistrez avant de valider** : le PDF est rendu à partir du document en base, une correction laissée dans le formulaire sans sauvegarde ne partira pas. La fenêtre de confirmation le rappelle.

Un rapport déjà envoyé ne peut pas être renvoyé d'un second clic : la route refuse, pour éviter un deuxième email au prospect et la réactivation d'un lien qu'on aurait voulu couper.

### Envoyer

Le bouton **« Valider et envoyer »** enchaîne : rendu du PDF, dépôt dans le bucket privé, envoi au prospect d'un email contenant un lien signé, puis passage du rapport au statut « envoyé » et du lead au stade « qualifié ».

Le message de confirmation distingue deux cas. « Rapport envoyé au prospect » signifie que le transport a accepté le message. « Enregistré comme envoyé, mais le transport email l'a refusé » signifie que **le prospect n'a rien reçu** : vérifier la configuration ZeptoMail avant de considérer qu'il est prévenu.

### Révoquer un lien

Le lien de téléchargement expire au bout de 30 jours. Pour le couper avant terme, il suffit de repasser le rapport à un statut autre que « envoyé » : la route de téléchargement ne sert le fichier que pour un rapport au statut « envoyé ».

### Ce que vaut réellement un brouillon de Lucie

Mesuré sur le cluster le 31 juillet 2026, sur un cas type : **55 secondes** de génération, JSON exploitable, mais **un chiffre inventé** dès le premier essai. Le modèle avait transformé la tranche d'effectif « 50 à 200 » en « budget estimé entre 50 à 200 », alors que la consigne système lui interdit d'inventer des chiffres.

Conséquence pratique pour le relecteur : **traquer les chiffres en priorité**. Tout montant, pourcentage, délai ou volume présent dans un brouillon doit être vérifié ou supprimé. Le reste du texte est reformulable ; un chiffre faux dans un document signé OpenLab, envoyé à un prospect, ne l'est pas.
