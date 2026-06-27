# Identité visuelle & principes UX/UI

> Référence extraite de `CLAUDE.md` (ex-§3 et §4). Source de vérité pour couleurs, polices, tokens et règles d'interaction. Chargé à la demande — le noyau `CLAUDE.md` ne garde que les règles non négociables (orange < 15 %, polices interdites).

## 1. Identité visuelle — règles strictes

### 1.1 Palette (extraite des 18 visuels OpenLab existants)

```css
:root {
  /* Primaires */
  --ol-orange: #ff5a00;
  --ol-orange-light: #ff7a33;
  --ol-orange-dark: #cc4800;

  /* Structurantes */
  --ol-night: #0a0e1a;
  --ol-navy: #0b1b3d;
  --ol-navy-soft: #142654;

  /* Neutres */
  --ol-white: #ffffff;
  --ol-ivory: #faf8f5;
  --ol-graphite: #1a1d24;
  --ol-mist: #e8eaf0;

  /* Fonctionnelles */
  --ol-success: #22c55e;
  --ol-danger: #dc2626;
  --ol-info-blue: #2563eb;

  /* Dégradés signature */
  --ol-gradient-hero: linear-gradient(
    135deg,
    #ff5a00 0%,
    #c2185b 50%,
    #1a1d54 100%
  );
  --ol-gradient-rd: linear-gradient(180deg, #0a0e1a 0%, #1a0f2e 100%);
}
```

### 1.2 Règles couleur

- Orange < 15% de la surface visible à tout instant
- Noir profond #0A0E1A pour expertise IA, R&D, vision
- Bleu navy #0B1B3D pour univers produits (cohérent NexusRH/SYGESCOM)
- Ivory #FAF8F5 pour sections éditoriales (jamais #FFF en grande surface)

> Texte orange : utiliser `--color-ol-orange-text` (encre sur clair, vif sur sombre), jamais `--color-ol-orange` comme couleur de texte (contraste WCAG AA).

### 1.3 Typographie

```css
--font-display: 'Bricolage Grotesque', sans-serif; /* Titres hero */
--font-body: 'Geist', sans-serif; /* Corps */
--font-mono: 'JetBrains Mono', monospace; /* Code, data */
--font-editorial: 'Fraunces', serif; /* Citations, manifeste, livre */
```

**Interdit absolument** : Inter, Roboto, Open Sans, Poppins, Montserrat — marqueurs d'AI slop.

### 1.4 Logo

- Garder le logo orange existant
- Créer 3 variantes : `logo-dark.svg`, `logo-light.svg`, `logo-mark.svg`
- Espace de respiration : marge ≥ hauteur du "O"

## 2. Principes UX/UI

### 2.1 Règle des 3 clics

Toute info critique accessible en ≤ 3 clics depuis la home.

### 2.2 Hiérarchie

- 1 seul CTA primaire par section
- 1 CTA secondaire maximum
- Above-the-fold : valeur + preuve + action

### 2.3 Lisibilité

- Corps 17-18 px, line-height 1.65
- 60-75 caractères par ligne
- Contraste WCAG AAA sur texte principal (≥ 7:1)

### 2.4 Mobile-first absolu

70% du trafic africain est mobile. Touch targets ≥ 44 × 44 px.

### 2.5 Densité informationnelle

Les visuels OpenLab sont denses (dashboards, stats). Le site doit refléter cette signature — pas de "hero vide + 5 sections corporate".

### 2.6 Animations purpose-driven

- 200 ms (micro) · 400 ms (transitions) · 800 ms (révélations)
- Easing : `cubic-bezier(0.22, 1, 0.36, 1)`
- Respect `prefers-reduced-motion`

### 2.7 Accessibilité WCAG 2.2 AA minimum

- Navigation clavier complète
- Aria-labels sur tous les boutons icônes
- Focus ring orange custom (2px offset 2px)
- Skip-to-content link
- axe-core en CI

### 2.8 Système

Un seul `tokens.ts`. Spacing scale Tailwind. Aucun magic number.

### 2.9 Pas de cul-de-sac

Toute page se termine par un CTA contextuel.

### 2.10 No generic

Bannis : "Notre mission…", illustrations isométriques, "Pourquoi nous choisir ?" + 4 cards, chiffres ronds non sourcés, stock photos.
