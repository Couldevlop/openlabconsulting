# Logos clients

SVG vectoriels utilisés par `components/sections/Reassurance.tsx` (§6 section 2 du CLAUDE.md).

## Placeholders à remplacer

Les SVG actuels sont des **placeholders typographiques** (mot-clé client en Bricolage Grotesque). À substituer dès que le design fournit les vrais logos officiels :

| Slug | Client | Statut |
|---|---|---|
| `sido.svg` | SIDO | Placeholder |
| `hci.svg` | HCI | Placeholder |
| `sertemef.svg` | Sertemef | Placeholder |
| `doci.svg` | DOCI | Placeholder |

## Contraintes pour les SVG officiels

- Format : `<svg viewBox="0 0 W H">` avec ratio cohérent (largeur ≈ 3-4× hauteur).
- Couleur : utiliser `fill="currentColor"` pour que la couleur suive `text-*` côté composant (filtre grayscale appliqué par défaut, colorisation au hover via `group-hover`).
- Pas de filtres CSS lourds, pas de gradients complexes (impact perf).
- Inclure `<title>` ou `role="img" aria-label="..."` pour l'a11y — le composant fournit déjà `alt` via `next/image`, mais doubler en accessibilité interne SVG ne coûte rien.
- Hauteur visuelle cible : 32-40 px sur desktop, 24-28 px sur mobile.
