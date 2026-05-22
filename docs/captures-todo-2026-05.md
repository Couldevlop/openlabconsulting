# Captures à produire — Liste exhaustive priorisée

> Source : audit `docs/audit-seo-ux-2026-05.md` faiblesse #2 + plan
> d'action §7 items #8 + #12. Cible : remplacer les `MediaPlaceholder`
> partout par des visuels réels.
>
> **Format demandé** : AVIF en priorité (fallback WebP). Largeur native
> 1920px (Container width) ou 2400px pour les hero. Compression cible
> ≤ 200 ko par image après pipeline `next/image`.
>
> Convention nommage : `kebab-case` + suffixe `-{taille}.avif`
> (ex : `nexusrh-dashboard-paie-1920.avif`).

---

## 1. Hero & homepage (priorité absolue — above-the-fold)

| #   | Vue               | Description capture                                     | Path cible |
| --- | ----------------- | ------------------------------------------------------- | ---------- |
| 1   | Hero canvas WebGL | Pas une capture — déjà rendu en R3F. **Aucune action.** | (déjà OK)  |
| 2   | OG image homepage | Aucune action — généré dynamiquement.                   | (déjà OK)  |

## 2. Pages produits `/solutions/[slug]` — 7 captures dashboard

Ces 7 captures sont les **plus rentables** pour la conversion. Elles
remplacent les `MediaPlaceholder` du hero produit.

| #   | Produit       | Description capture                                                                                                                    | Path cible                                                     |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 3   | NexusRH CI    | Dashboard paie : bulletin CNPS+ITS+FDFP+CMU, vue mensuelle, graphes effectifs. Charte navy/orange.                                     | `/public/captures/solutions/nexusrh-dashboard-paie.avif`       |
| 4   | NexusERP      | Tableau de bord financier multi-devises (XOF / EUR / USD), modules SYSCOHADA visibles dans la sidebar (compta, ventes, achats, stock). | `/public/captures/solutions/nexuserp-finance.avif`             |
| 5   | SYGESCOM v2.0 | Carte stations hydrocarbures Côte d'Ivoire + KPIs temps réel (litres vendus, anomalies).                                               | `/public/captures/solutions/sygescom-stations-temps-reel.avif` |
| 6   | AgroSense CI  | Carte IoT parcelles (cacao/anacarde) + courbes capteurs SODEXAM/ERA5 sur 30j. Univers chaud (terre, vert, soleil).                     | `/public/captures/solutions/agrosense-parcelles-iot.avif`      |
| 7   | QualitOS      | Tableau de bord QMS (PDCA, 5S, DMAIC), liste audits, taux conformité.                                                                  | `/public/captures/solutions/qualitos-qms.avif`                 |
| 8   | Fraud Shield  | Capture analyse facture suspecte (loupe + zones flaggées + score IA).                                                                  | `/public/captures/solutions/fraud-shield-facture.avif`         |
| 9   | Smart City    | Heatmap urbaine (sécurité/mobilité Cocody), légende, filtres temporels. Univers night.                                                 | `/public/captures/solutions/smart-city-heatmap.avif`           |

## 3. Pages expertises `/expertises/[slug]` — 4 illustrations

Moins critique que produits, mais évite l'effet « page corporate ».

| #   | Expertise               | Description                                                                           | Path cible                                           |
| --- | ----------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 10  | Conseil & stratégie IA  | Photo session de travail (board room, post-its, écran). Pas de stock photo générique. | `/public/captures/expertises/conseil-strategie.avif` |
| 11  | Agents & automatisation | Diagramme schématique agent + outils + workflow (style technique).                    | `/public/captures/expertises/agents-workflow.avif`   |
| 12  | Data & gouvernance      | Schéma RGPD/AI Act + tableau registre traitements.                                    | `/public/captures/expertises/data-gouvernance.avif`  |
| 13  | Cybersécurité IA        | Diagramme menaces (prompt injection, jailbreak) + parades.                            | `/public/captures/expertises/cybersecurite-ia.avif`  |

## 4. Page laboratoire — captures recherche

| #   | Vue              | Description                                                                          | Path cible                                                 |
| --- | ---------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 14  | Hero laboratoire | Photo équipe réelle ou setup recherche (terminaux + papier + posters scientifiques). | `/public/captures/laboratoire/hero.avif`                   |
| 15  | Publications     | Couvertures PDF des 3 livres blancs (montage triptique).                             | `/public/captures/laboratoire/publications-triptyque.avif` |

## 5. Livre `/livre` — couverture 3D + extraits

| #   | Vue                   | Description                                                                                                                | Path cible                               |
| --- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 16  | Couverture livre IA   | Couverture finale du livre « Intelligence Artificielle : du ML aux Agents Autonomes ». Doit être lisible à 400px de large. | `/public/captures/livre/couverture.avif` |
| 17  | Mockup 3D ouvert      | Livre ouvert sur capstone AgroSense (page 12 mockup). Pour effet Three.js.                                                 | `/public/captures/livre/mockup-3d.avif`  |
| 18  | Extrait page sommaire | Screenshot table des matières (11 chapitres lisibles).                                                                     | `/public/captures/livre/sommaire.avif`   |

## 6. À propos `/a-propos` + équipe — portrait Debora

| #   | Vue                     | Description                                                                                                        | Path cible                          |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 19  | Portrait Debora Ahouma  | Portrait pro Debora — fond uni neutre (ivory ou night), lumière naturelle, regard caméra. 4:5 vertical recommandé. | `/public/team/debora-ahouma.avif`   |
| 20  | Équipe complète (futur) | Photo de groupe (à organiser quand recrutements).                                                                  | `/public/team/team-collective.avif` |

## 7. Cas clients (carrousel homepage §6.5)

Pour chaque case study déjà documenté, photos avant/après ou setup
terrain. Coordonner avec le service commercial.

| #   | Client           | Description                                                  | Path cible                                   |
| --- | ---------------- | ------------------------------------------------------------ | -------------------------------------------- |
| 21  | SYGESCOM (avant) | Station avant déploiement — gestion papier, files d'attente. | `/public/captures/cases/sygescom-avant.avif` |
| 22  | SYGESCOM (après) | Dashboard temps réel sur écran station.                      | `/public/captures/cases/sygescom-apres.avif` |
| 23  | SIDO             | Photo terrain (entrepôt SIDO modernisé).                     | `/public/captures/cases/sido.avif`           |
| 24  | HCI              | Photo intervention HCI.                                      | `/public/captures/cases/hci.avif`            |

## 8. Témoignages vidéo (item audit §7 #12 — sprint P5)

Plus lourd à produire, peut attendre. Plan :

- 3 témoignages de 60-90 sec chacun (clients SYGESCOM, SIDO, HCI).
- Tournage en français, sous-titres FR + EN incrustés.
- Format MP4 H.264 + poster AVIF pour le lazy load.

| #   | Type                | Description                          | Path cible                                                   |
| --- | ------------------- | ------------------------------------ | ------------------------------------------------------------ |
| 25  | Témoignage SYGESCOM | DG SYGESCOM raconte ROI -12% pertes. | `/public/captures/temoignages/sygescom.mp4` + `.poster.avif` |
| 26  | Témoignage SIDO     | (à scoper)                           | `/public/captures/temoignages/sido.mp4`                      |
| 27  | Témoignage HCI      | (à scoper)                           | `/public/captures/temoignages/hci.mp4`                       |

---

## Pipeline traitement

1. **Capture brute** : PNG ou screenshot 2x DPR si possible.
2. **Retouche** : enlever données sensibles, mettre cadre charte.
3. **Conversion** : `sharp` ou Squoosh.app → AVIF q=70 + WebP fallback.
4. **Upload** : passage par la collection `media` de Payload (admin
   `/admin/collections/media`). Le pipeline `sharp` génère thumbnail
   - card + cover automatiquement (cf. `payload.config.ts`).
5. **Wire** : la donnée concernée (Article / Solution / Expertise)
   référence le media via le champ `cover`. Le composant
   `MediaPlaceholder` détecte la présence d'un `src` réel et bascule
   automatiquement (pas de code à changer).

## Métriques de succès

- **0 `MediaPlaceholder` visible** sur les 7 pages produits et la
  homepage à la mise en ligne (CLAUDE.md §17.9 « tous chiffres
  sourcés, mockups réels »).
- **LCP < 1.8 s mobile** maintenu malgré les images (next/image avec
  AVIF + lazy + sizing).
- **Lighthouse SEO 100** maintenu (alt complet, dimensions définies).
