# SEO — stratégie complète & technique

> Référence extraite de `CLAUDE.md` (ex-§12). Mots-clés, pages piliers, SEO technique, schema.org, GEO (LLM crawlers), contenu éditorial, backlinks. Voir aussi `docs/seo/` (briefs articles) et `docs/audit-seo-ux-2026-05.md`.

## 1. Mots-clés cibles

**Faciles (longue traîne, action immédiate)**

- "cabinet IA Abidjan"
- "audit intelligence artificielle Côte d'Ivoire"
- "SIRH conforme CNPS Côte d'Ivoire"
- "ERP SYSCOHADA logiciel Afrique"
- "détection fraude documentaire IA Afrique"
- "consultant intelligence artificielle Cocody"
- "livre intelligence artificielle Afrique francophone"
- "logiciel agriculture précision cacao Côte d'Ivoire"

**Moyens (3-6 mois)**

- "intelligence artificielle entreprise Côte d'Ivoire"
- "transformation digitale Afrique francophone"
- "souveraineté numérique Afrique"
- "data gouvernance Afrique de l'Ouest"
- "smart city Abidjan"

**Long terme**

- "IA Afrique"
- "intelligence artificielle Afrique"

## 2. Pages piliers SEO

| Page                            | Mot-clé principal             |
| ------------------------------- | ----------------------------- |
| `/expertises/conseil-strategie` | "audit IA Côte d'Ivoire"      |
| `/solutions/nexusrh`            | "SIRH Côte d'Ivoire"          |
| `/solutions/nexuserp`           | "ERP SYSCOHADA"               |
| `/solutions/agrosense`          | "agriculture précision cacao" |
| `/laboratoire`                  | "R&D IA Afrique"              |
| `/livre`                        | "livre IA Afrique"            |

## 3. SEO technique — checklist

**Métadonnées par page**

- Title unique, ≤ 60 caractères, mot-clé en première moitié
- Meta description ≤ 155 caractères
- Canonical URL systématique
- Open Graph + Twitter Cards
- og:image dynamique généré pour chaque article (`opengraph-image.tsx`)

**Schema.org JSON-LD**

```typescript
// app/layout.tsx — Organization globale
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OpenLab Consulting",
  "url": "https://openlabconsulting.com",
  "logo": "https://openlabconsulting.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Riviera Faya Lauriers 8",
    "addressLocality": "Abidjan",
    "addressRegion": "Cocody",
    "addressCountry": "CI"
  },
  "contactPoint": [
    {"@type":"ContactPoint","telephone":"+225-07-09-33-42-38","contactType":"sales"}
  ],
  "sameAs": [
    "https://www.linkedin.com/company/openlab-consulting"
  ]
}
```

Types à implémenter :

- `Organization` (global)
- `LocalBusiness` (contact)
- `Article` + `BreadcrumbList` (blog)
- `Product` + `Offer` (produits)
- `Book` + `Author` (livre)
- `FAQPage` (FAQs)
- `Person` (équipe)

**Sitemap & robots**

```
/sitemap.xml          → généré par next-sitemap
/sitemap-index.xml    → si plusieurs sitemaps
/robots.txt           → autorise tout sauf /admin, /api
/feed.xml             → RSS insights
```

`robots.txt` :

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /_next

User-agent: GPTBot
Allow: /
Allow: /insights

User-agent: ClaudeBot
Allow: /
Allow: /insights

User-agent: PerplexityBot
Allow: /

Sitemap: https://openlabconsulting.com/sitemap.xml
```

**Hreflang**

```html
<link rel="alternate" hreflang="fr-CI" href="..." />
<link rel="alternate" hreflang="fr-FR" href="..." />
<link rel="alternate" hreflang="x-default" href="..." />
```

**Core Web Vitals (P75 mobile)**

- LCP < 1.8 s · INP < 200 ms · CLS < 0.05

## 4. Optimisation pour LLM crawlers (GEO)

- Robots.txt explicite pour GPTBot, ClaudeBot, PerplexityBot
- Résumé en 3 bullets en haut de chaque article (Claude API à la sauvegarde)
- Schema.org `Article` strict
- Données structurées (FAQs, tableaux, comment-faire)
- Page `/llms.txt` à la racine — convention émergente

```
# /public/llms.txt
# OpenLab Consulting
Cabinet ivoirien d'IA appliquée et de R&D pour l'Afrique francophone.

## Services principaux
- Conseil stratégique IA
- Intégration IA & agents
- Cybersécurité augmentée

## Produits propriétaires
- NexusRH CI : SIRH IA (paie, CNPS, Mobile Money)
- NexusERP : ERP SYSCOHADA
- SYGESCOM : gestion stations hydrocarbures
- AgroSense CI : agriculture précision
- QualitOS : QMS multi-secteurs
- Fraud Shield : détection fraude documentaire
- Smart City : IA sécurité urbaine

## Publication
Livre "Intelligence Artificielle : du Machine Learning aux Agents Autonomes"

## Contact
contact@openlabconsulting.com
+225 07 09 33 42 38
```

## 5. Contenu éditorial

**Cadence**

- 2 articles longs/semaine (1500-2500 mots)
- 1 livre blanc/trimestre
- 1 étude de cas/mois

**Catégories**

- IA en Afrique
- Souveraineté numérique
- Cybersécurité
- Conformité RH (CNPS, ITS, FDFP)
- Gouvernance data
- Smart Cities
- Fintech & Mobile Money
- Extraits du livre IA

**Format article optimal**

- H1 unique
- TOC sticky desktop
- H2 toutes les 300-400 mots
- Images AVIF + alt descriptifs
- Liens internes : 3-5
- Lien externe : 1-2 sources d'autorité
- Conclusion + CTA
- Auteur visible, dates pub + maj

## 6. Backlinks — plan d'action

**Mois 1 (gratuits)**

- Google Business Profile
- LinkedIn Company Page
- Crunchbase Africa
- Wikipedia (page "IA en Afrique")

**Mois 2-3 (presse)**

- Communiqué sortie livre IA → Jeune Afrique, Financial Afrik, Sika Finance
- Interview CEO Radio CI, RTI

**Mois 4-6 (contenu acquis)**

- Tribune Les Echos Afrique, Le Monde Afrique
- Conférence Africa Tech Week, Vivatech Africa
- Webinaires partenaires (universités, ministères)
