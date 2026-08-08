---
title: "La signature qui n'engageait personne"
subtitle: "Ce qu'un dossier de dégrèvements irréguliers révèle de nos systèmes d'information, et ce que l'intelligence artificielle sait réellement y changer"
slug: 'signature-qui-n-engageait-personne'
date: 2026-07-31
author: 'Waopron Coulibaly, Directeur technique, OpenLab Consulting'
category: 'Souveraineté numérique'
tags:
  [
    'contrôle interne',
    'détection de fraude',
    'intelligence artificielle',
    'signature électronique',
    'GovTech',
    "Côte d'Ivoire",
  ]
reading_time: '6 min'
description: "Un acte administratif numérique qui n'identifie pas son auteur n'est pas un acte : c'est une rumeur avec un logo. Analyse neutre d'une défaillance d'architecture, et de ce que l'IA sait anticiper, chiffres à l'appui."
---

# La signature qui n'engageait personne

> Un acte administratif numérique qui n'identifie pas son auteur avec certitude n'est pas un acte. C'est une rumeur avec un logo.

## Les faits, sobrement

Un dossier portant sur un préjudice supérieur à 39 milliards de francs CFA, lié à des dégrèvements et exonérations jugés irréguliers, a été porté devant la justice ivoirienne en juillet 2026. Les éléments publics évoquent l'usurpation d'une signature électronique.

Ce texte ne traite pas de ce dossier : l'instruction est en cours, la présomption d'innocence s'applique, et nous ne disposons d'aucune pièce. Aucune personne, aucune institution n'est mise en cause ici. Il pose une question d'ingénierie, valable dans des dizaines d'organisations publiques et privées : **comment un système conçu pour sécuriser des flux financiers peut-il laisser émettre des actes dont l'auteur réel n'est pas identifiable ?**

## Le chiffre qui compte n'est pas 39 milliards

Le montant occupe les conversations. Le chiffre instructif est ailleurs : **cinq mois** entre le premier constat interne et la saisine judiciaire. Et ce constat est déjà tardif : les traces existaient dans les journaux applicatifs dès le premier acte. Personne ne les regardait.

Voici ce qui devrait déranger : **cinq mois, c'est mieux que la moyenne mondiale.**

L'Association of Certified Fraud Examiners documente 1 921 cas réels de fraude professionnelle dans 138 pays. La fraude type court **12 mois** avant d'être découverte, et **43 %** des cas sont mis au jour par une dénonciation, loin devant toute méthode technique. Surtout, la même étude donne la variable qui déplace tout : détectée par une **méthode active**, c'est-à-dire une surveillance automatisée des données et des transactions, une fraude est découverte en **six mois environ**. Détectée passivement, par hasard ou par aveu, elle peut courir jusqu'à **24 mois**.

Un rapport de un à quatre. Ce n'est pas une nuance méthodologique, c'est un budget.

C'est la marque d'un contrôle **périodique et déclaratif**, conçu pour un monde de papier où la fraude était limitée par la vitesse d'écriture d'un agent. Dans un système intégré où un acte se génère en quatre clics, il est obsolète.

La question n'est donc pas « pourquoi n'a-t-on pas vu ? » mais « **qu'est-ce qui, dans l'architecture, rendait le fait de voir impossible en temps réel ?** »

## Ce que « usurpation de signature » veut dire

La formule évoque une prouesse cryptographique. C'est presque certainement faux, et cela change le remède.

Trois scénarios l'expliquent, par vraisemblance décroissante. **Le compte plutôt que la clé** : des identifiants porteurs du pouvoir d'engagement utilisés par un tiers, la signature n'étant qu'un attribut de session applicative. **La délégation sans traçabilité** : le droit de valider _au nom de_, sans que le système distingue le délégataire du délégant. **Le contournement du workflow** : l'acte créé en amont de l'écran de validation, la signature apposée mécaniquement par la génération documentaire.

Les trois convergent vers un même diagnostic. **La signature n'était pas liée cryptographiquement à une personne physique détenant sa propre clé.** Si elle l'avait été, l'usurpation aurait supposé un vol physique et une contrainte sur une personne identifiée. L'enquête n'aurait pas eu besoin de trois mois d'analyse informatique : elle aurait eu un nom en trois heures.

## Ce que l'intelligence artificielle change

Commençons par ce qu'elle ne doit pas faire.

**L'IA n'a rien à faire dans la vérification de conformité juridique.** Un dégrèvement est légal ou il ne l'est pas ; les conditions figurent dans le Code général des Impôts. Cette vérification doit rester **déterministe, explicite, auditable ligne à ligne**, parce qu'un score probabiliste n'est pas opposable devant un juge. L'Australie l'a appris avec Robodebt : dispositif déclaré illégal, plusieurs milliards de réparations.

**L'IA ne détecte pas une fraude que personne n'a le pouvoir de sanctionner.** Si l'alerte remonte à l'autorité incluse dans le périmètre audité, l'outil est neutralisé dès sa mise en production. La valeur d'un dispositif tient à l'indépendance du destinataire de l'alerte.

Reste ce que l'IA fait mieux que quiconque : **trouver ce que personne ne cherche.** Ce n'est plus une promesse, c'est mesuré.

| Organisation     | Résultat publié                                                  |
| ---------------- | ---------------------------------------------------------------- |
| Trésor américain | 652,7 M$ recouvrés en 2023, **plus de 4 Md$** en 2024            |
| DGFiP (France)   | **56 %** des contrôles fiscaux professionnels 2024 ciblés par IA |
| HSBC             | **2 à 4 fois plus** de risque avéré, **60 % d'alertes en moins** |
| Danske Bank      | 1 200 faux positifs par jour réduits de **60 %**                 |
| Mastercard       | Décision rendue en **50 millisecondes**                          |

Deux enseignements comptent plus que la technologie.

**Le gain vient de l'exhaustivité, pas de la finesse du modèle.** Ces organisations sont passées d'un contrôle sur échantillon a posteriori à une notation de chaque acte à son émission : montant atypique pour le segment, concentration inhabituelle d'un agent sur un portefeuille, fractionnement contournant un seuil. Et surtout l'**analyse de graphe** : la fraude interne n'est presque jamais l'affaire d'un individu, elle est l'affaire d'une relation.

**La baisse des fausses alertes compte autant que la hausse de la détection.** Un dispositif qui noie ses contrôleurs sous les fausses pistes ne détecte rien. Les 60 % d'alertes en moins chez HSBC, ce sont aussi des dossiers honnêtes qui cessent d'être bloqués : un contrôle continu ne ralentit pas l'organisation, il l'accélère. Moins de fraude **et** moins de délai. C'est le seul récit qui fait accepter un tel projet de l'intérieur.

## Sept questions à poser à votre système d'information

Cette grille se répond en une journée. Elle vaut un audit de trois mois :

1. Nos signatures sur actes financiers sont-elles liées à une personne physique, ou est-ce un cachet applicatif institutionnel ?
2. S'il s'agit d'un cachet : combien de clés existent, et où sont-elles stockées ?
3. La délégation de signature est-elle modélisée, ou repose-t-elle sur le partage de comptes ?
4. Les profils à pouvoir d'engagement financier sont-ils protégés par une authentification multifacteur ?
5. Un seuil de montant déclenche-t-il une validation par un second acteur indépendant ?
6. Nos journaux d'audit sont-ils inaltérables et répliqués hors du périmètre audité ?
7. Un acte financier peut-il être émis sans rattachement à sa pièce justificative ?

Si trois de ces sept réponses sont négatives, votre exposition n'est pas hypothétique. Elle est simplement non mesurée.

## Notre conviction

La dématérialisation a réussi. La seconde étape est différente de nature : elle consiste à **inscrire la règle de droit et la responsabilité individuelle dans l'architecture technique elle-même**. Un système qui numérise un processus sans en numériser les contre-pouvoirs ne fait pas disparaître la fraude : il en augmente le débit.

C'est là qu'OpenLab Consulting travaille, et dans cet ordre. La **couche de confiance** d'abord : identité opposable, signature liée à une personne, piste d'audit immuable répliquée hors du périmètre audité. Puis le **contrôle déterministe de conformité**, exécuté avant l'émission de l'acte. Puis seulement la **détection intelligente**, dont la sortie est un rang de priorité et jamais une décision.

Sur le maillon des pièces justificatives, notre produit **OpenLab Fraud Shield** est en production : détection de cachet copié-collé, de montant retouché ou de signature reproduite, avec un score d'authenticité et un calque désignant les zones suspectes. Chaque détection s'explique, l'analyse tient sous les deux secondes par document sur processeur seul, et un pilote en banque UEMOA au premier trimestre 2026 a triplé les cas détectés par contrôleur. Le tout en souveraineté, avec des équipes ivoiriennes, jusqu'à l'installation entièrement sur site.

Cinq mois d'un côté, cinquante millisecondes de l'autre. Entre les deux, il n'y a pas un mystère technologique. Il y a des décisions d'architecture que quelqu'un doit prendre.

_OpenLab Consulting accompagne les administrations et les grandes organisations d'Afrique de l'Ouest sur l'intégrité et l'intelligence des flux financiers. Pour un premier échange : [waopron@openlabconsulting.com](mailto:waopron@openlabconsulting.com)_

## Sources

- Association of Certified Fraud Examiners, _Occupational Fraud 2024: A Report to the Nations_, 1 921 cas, 138 pays. [acfe.com](https://www.acfe.com/-/media/files/acfe/pdfs/rttn/2024/2024-report-to-the-nations.pdf)
- Commonwealth Fraud Prevention Centre, délais de détection par méthode active et passive. [counterfraud.gov.au](https://www.counterfraud.gov.au/news/general-news/digest-occupational-fraud-report-2024)
- U.S. Department of the Treasury, prévention et recouvrement des paiements indus, exercice 2024. [Nextgov/FCW](https://www.nextgov.com/artificial-intelligence/2024/10/ai-tools-helped-treasury-recover-billions-fraud-and-improper-payments/400368/)
- Direction générale des Finances publiques, rapport d'activité 2024. [EPSA](https://www.epsa.com/fr/actualite/controle-fiscal-ce-quil-faut-retenir-du-rapport-dactivite-2024-de-la-dgfip/)
- Google Cloud, AML AI et résultats communiqués par HSBC. [Google Cloud Press Corner](https://www.googlecloudpresscorner.com/2023-06-21-Google-Cloud-Launches-AI-Powered-Anti-Money-Laundering-Product-for-Financial-Institutions)
- Danske Bank et Teradata, moteur de détection de fraude en temps réel. [PR Newswire](https://www.prnewswire.com/news-releases/danske-bank-and-teradata-implement-artificial-intelligence-ai-engine-that-monitors-fraud-in-real-time-300540944.html)
- Mastercard, _Decision Intelligence Pro_, mai 2024. [mastercard.com](https://www.mastercard.com/us/en/news-and-trends/press/2024/may/mastercard-accelerates-card-fraud-detection-with-generative-ai-technology.html)
- Robodebt, commission royale d'enquête et règlements. [tandfonline.com](https://www.tandfonline.com/doi/full/10.1080/10361146.2025.2549868)

---

---

# EXTRAIT LINKEDIN

_(à publier sur la page OpenLab Consulting, lien vers l'article complet en premier commentaire, pas dans le corps du post)_

---

Le chiffre qui devrait nous interpeller dans le dossier des dégrèvements fiscaux n'est pas 39 milliards.

C'est cinq mois.

Cinq mois entre le premier constat interne et la saisine judiciaire. Et ce constat est déjà tardif : les traces existaient dans les journaux applicatifs dès le premier acte. Personne ne les regardait.

Voilà ce qui devrait vraiment déranger : 𝗰𝗶𝗻𝗾 𝗺𝗼𝗶𝘀, 𝗰'𝗲𝘀𝘁 𝗺𝗶𝗲𝘂𝘅 𝗾𝘂𝗲 𝗹𝗮 𝗺𝗼𝘆𝗲𝗻𝗻𝗲 𝗺𝗼𝗻𝗱𝗶𝗮𝗹𝗲.

L'ACFE a documenté 1 921 cas réels de fraude professionnelle dans 138 pays. Durée médiane avant détection : 12 mois. Première méthode de détection : la dénonciation, 43 % des cas. Mais avec une surveillance automatisée des données, on tombe à six mois. Sans, on monte jusqu'à 24.

Un élément technique traverse ce dossier : l'usurpation d'une signature électronique. La formule évoque une prouesse cryptographique. C'est presque certainement faux, et cette précision change tout.

Trois scénarios l'expliquent : des identifiants réutilisés, une délégation sans traçabilité, un contournement de workflow. Les trois mènent au même diagnostic :

𝗟𝗮 𝘀𝗶𝗴𝗻𝗮𝘁𝘂𝗿𝗲 𝗻'𝗲́𝘁𝗮𝗶𝘁 𝗽𝗮𝘀 𝗹𝗶𝗲́𝗲 𝗮̀ 𝘂𝗻𝗲 𝗽𝗲𝗿𝘀𝗼𝗻𝗻𝗲 𝗽𝗵𝘆𝘀𝗶𝗾𝘂𝗲.

Si elle l'avait été, l'enquête n'aurait pas eu besoin de trois mois d'analyse informatique. Elle aurait eu un nom en trois heures.

J'ai écrit un article là-dessus. Il ne met personne en cause : l'instruction est en cours et la présomption d'innocence s'applique. Il parle d'architecture.

On y trouve les chiffres publiés par ceux qui ont industrialisé la détection :

▪️ Trésor américain : 652,7 M$ de paiements indus recouvrés en 2023, plus de 4 Md$ en 2024.
▪️ DGFiP : 56 % des contrôles fiscaux professionnels de 2024 ciblés par datamining ou IA.
▪️ HSBC : 2 à 4 fois plus de risque avéré détecté, avec 60 % d'alertes en moins.
▪️ Mastercard : décision de fraude en 50 millisecondes.

Cinq mois d'un côté. Cinquante millisecondes de l'autre.

Et une position que je défends à contre-courant : 𝗹'𝗜𝗔 𝗻'𝗮 𝗿𝗶𝗲𝗻 𝗮̀ 𝗳𝗮𝗶𝗿𝗲 𝗱𝗮𝗻𝘀 𝗹𝗲 𝗰𝗼𝗻𝘁𝗿𝗼̂𝗹𝗲 𝗱𝗲 𝗹𝗲́𝗴𝗮𝗹𝗶𝘁𝗲́. Un dégrèvement est conforme ou il ne l'est pas. Cette vérification doit être déterministe et opposable devant un juge. L'Australie l'a appris avec Robodebt : dispositif déclaré illégal, plusieurs milliards de réparations.

L'IA sert ailleurs, et elle y est irremplaçable : trouver ce que personne ne cherche. Les réseaux. Les relations. Les structures qu'aucune analyse ligne à ligne ne fera jamais apparaître.

Dernier point, souvent oublié : un contrôle continu ne ralentit pas l'administration. Il l'accélère. Il libère les dossiers conformes que la défiance immobilise aujourd'hui.

Moins de fraude, et moins de délai.

L'article contient sept questions à poser à votre système d'information. Elles se répondent en une journée. Si trois réponses sur sept sont négatives, votre exposition n'est pas hypothétique, elle est simplement non mesurée.

À lire en commentaire. Vos retours m'intéressent, particulièrement ceux des praticiens du contrôle interne.

#SouveraineteNumerique #IntelligenceArtificielle #ContrôleInterne #LutteContreLaFraude #GovTech #CôteDIvoire
