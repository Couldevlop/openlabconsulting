# Créer un article dans l'admin (processus transparent)

> Guide pas-à-pas pour publier un article Insights **soi-même**, depuis la
> console `https://openlabconsulting.com/admin`, sans code ni déploiement.
> Exemple de référence : « L'IA souveraine ivoirienne » (déjà en ligne).

L'éditeur d'articles est **mûr** : il gère titres, paragraphes, **listes**,
**citations**, **tableaux**, **images**, **encadrés** (callouts) et **blocs de
code**. Tout ce qui est saisi apparaît immédiatement sur le site (rendu à
chaque requête, pas de cache à purger).

---

## 0. Préparer le contenu (avant l'admin)

Depuis un article rédigé (Word, Google Docs, HTML…), repère :

- **Le titre** (≤ 120 caractères).
- **L'accroche / chapô** (1 phrase, ≤ 280 car.) → champ _Excerpt_.
- **2 à 4 points clés** (résumé) → champ _Points clés_ (bon pour Google + IA).
- **Les images / graphiques** : enregistre-les en fichiers **PNG/JPG**
  (l'éditeur n'accepte pas le « copier-coller » d'images encodées). Pour un
  graphique, exporte-le en image.
- **Les sources / références** (liste numérotée en fin d'article).

> 💡 Astuce : un graphique = une **image**. L'éditeur ne fait pas de graphique
> dynamique ; on insère l'image du graphique (export PNG depuis Excel, Canva,
> etc.).

---

## 1. Uploader les images dans la médiathèque

1. Menu de gauche → **Médias**.
2. Bouton **Créer** (ou glisser-déposer).
3. Pour **chaque** image : choisir le fichier, renseigner le champ **Alt**
   (texte décrivant l'image — important pour le SEO et l'accessibilité), puis
   **Save**.
4. Répète pour toutes les images de l'article.

> Tu peux faire ça au fur et à mesure depuis l'éditeur (étape 3.4), mais les
> préparer d'abord rend la rédaction plus fluide.

---

## 2. Créer l'article et remplir l'en-tête

Menu → **Articles** → **Créer**. Remplis :

| Champ            | Quoi mettre                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Title**        | Le titre de l'article.                                                                                                     |
| **Slug**         | L'URL en minuscules-avec-tirets, sans accents. Ex : `ia-souveraine-cote-ivoire`. C'est ce qui apparaît après `/insights/`. |
| **Excerpt**      | L'accroche (≤ 280 car.) — sert de description Google + carte d'aperçu.                                                     |
| **Points clés**  | Ajoute 2 à 4 lignes (bouton _Add Point clé_). Une phrase actionnable chacune.                                              |
| **Category**     | Choisir dans la liste (Souveraineté, Conformité RH, Cybersécurité…).                                                       |
| **Keywords**     | 5 à 8 mots-clés (bouton _Add_).                                                                                            |
| **Author**       | Nom affiché (par défaut « OpenLab Consulting »).                                                                           |
| **Cover**        | Sélectionne une image de couverture depuis la médiathèque.                                                                 |
| **Published At** | La date de publication.                                                                                                    |

---

## 3. Rédiger le corps (champ « Content »)

C'est l'éditeur riche. La **barre d'outils en haut** donne accès à tout.

### 3.1 Titres et texte

- Sélectionne **H2** pour les grandes sections, **H3** pour les sous-sections
  (le **H1** est déjà le titre de l'article — ne pas le réutiliser).
- Tape ton texte normalement. **Gras** = `Ctrl+B`, _italique_ = `Ctrl+I`.
- Règle de lisibilité : un **H2/H3 tous les 300-400 mots**.

### 3.2 Listes et citations

- Icônes liste à puces / liste numérotée dans la barre d'outils.
- Icône **citation** (`"`) pour une mise en exergue.

### 3.3 Tableau

1. Place le curseur sur une ligne vide.
2. Barre d'outils → icône **Tableau** → choisis le nombre de lignes/colonnes.
3. Remplis les cellules. La **première ligne** sert d'en-tête.
4. Un menu contextuel (clic dans une cellule) permet d'ajouter/supprimer
   lignes et colonnes.

### 3.4 Image / graphique

1. Place le curseur où l'image doit apparaître.
2. Barre d'outils → icône **Image / Upload**.
3. Sélectionne l'image dans la médiathèque (ou uploade-la à la volée).
4. _Optionnel_ : ajoute juste en dessous un paragraphe en _italique_ pour la
   **légende / source** (ex : _« Source : Oxford Insights, 2023 »_).

### 3.5 Encadré (callout) et code _(optionnel)_

- Barre d'outils → **Blocks** → **Callout** : encadré info / astuce /
  avertissement / danger.
- **Blocks → Code** : bloc de code colorisé (choisir le langage).

---

## 4. Sources

Champ **Sources** (bas du formulaire) → bouton _Add Source_ pour chaque
référence : **Label** (ex : « Oxford Insights — AI Readiness Index 2023 ») +
**URL** (lien public http(s) obligatoire et valide).

> Les chiffres cités doivent être sourcés (règle éditoriale). Si une référence
> n'a pas d'URL en ligne, mets-la plutôt dans le corps en liste numérotée.

---

## 5. Prévisualiser, puis publier

1. **Aperçu** : bouton _Preview_ (visualise le brouillon sur le site avant
   publication).
2. **Publier** : change le statut en haut à droite de _Draft_ → **Published**,
   puis **Save**.
3. Ouvre `https://openlabconsulting.com/insights/<ton-slug>` → l'article est
   en ligne. Il apparaît aussi automatiquement dans la liste `/insights` et
   le flux RSS.

> Tant qu'il est en **Draft**, l'article n'est **pas** visible publiquement
> (seuls les comptes admin le voient). C'est volontaire (sécurité).

---

## Récapitulatif express

```
Médias (upload images + Alt)
  → Articles › Créer
    → Title, Slug, Excerpt, Points clés, Category, Keywords, Author, Cover, Date
    → Content : H2/H3 + texte + listes + tableau + images(+légendes) + callouts
    → Sources (label + URL)
  → Preview → Status: Published → Save
```

---

## Annexe — l'article d'exemple a été injecté par script

L'article « L'IA souveraine ivoirienne » a été créé une première fois par un
script de seed (`scripts/seed-article-ia-souveraine.ts`,
`pnpm cms:seed:article:ia-souveraine`) qui parse le HTML source et construit le
contenu Lexical (titres, tableau, images). C'était un raccourci technique
ponctuel : **la voie normale et recommandée est l'admin** (ce guide). Les deux
produisent exactement le même résultat — l'admin reste la source de vérité et
tu peux rééditer l'article à tout moment.
