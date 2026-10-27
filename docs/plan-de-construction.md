# Sinople : plan de construction

Version 1, 27 octobre 2026. Il suit le découpage en versions de la
[spécification fonctionnelle](specification-fonctionnelle.md) (§ 15) et les choix de la
[spécification technique](specification-technique.md).

Chaque étape ci-dessous correspond à **une PR** : petite, relue, testée, mise en ligne dès qu'elle est fusionnée.
Une étape est finie quand ses critères « C'est fini quand » sont vérifiés sur le site en ligne, sur téléphone.

Le site existe déjà (accueil avec le feu, choix du thème, écran avant quiz, quiz QCM de démonstration).
On construit par-dessus, sans repartir de zéro.

---

## Version 1 : jouable sans compte

But : un joueur peut parcourir un chemin complet de deux étapes, perdre et regagner des vies, garder sa série,
réviser, et voir l'animal monter en grade au feu. Tout tient dans le navigateur.

| # | Étape | Contenu | C'est fini quand |
| --- | --- | --- | --- |
| 1.1 | Fondations | Workflow `verifier.yml` (build, TypeScript, Vitest) sur chaque PR ; dossiers `src/lib/`, `src/islands/` ; ajout de Preact ; `regles.json`. | Une PR déclenche la vérification, qui passe au vert. |
| 1.2 | Format des questions | Collection `src/content/questions` avec schéma zod ; script de conversion de `religion.json` ; contrôles de contenu en CI. | Une question mal formée fait échouer la CI avec un message clair. |
| 1.3 | Règles du jeu | `points.ts`, `vies.ts`, `serie.ts`, `revision.ts`, `reponses.ts` avec leurs tests. | Tous les calculs du tableau § 5 de la spec technique sont couverts par des tests. |
| 1.4 | Stockage local | `local.ts` (état versionné), reprise des données de `progres.ts`. | Une progression de l'ancien format est retrouvée après la mise à jour. |
| 1.5 | Chemin du thème | Page `theme/[id]` transformée en chemin : étapes, leçons verrouillées / faites / suivante, épreuve, saut d'étape. | On voit où l'on en est et on ne peut ouvrir que les leçons débloquées. |
| 1.6 | Lecteur de leçon (QCM) | Île `LecteurLecon` : vies (bûches), barre d'avancement, explication et source, fin de leçon, feu qui s'éteint à zéro vie. | Une leçon se joue d'un bout à l'autre au pouce, sur téléphone. |
| 1.7 | Passage de grade | Épreuve, montée de grade, scène au feu (l'animal change de tenue), décor du feu selon les animaux. | Réussir une épreuve change le grade et l'accueil. |
| 1.8 | Série et révision | Flamme et gels de série sur l'accueil ; page `revision` (Leitner) qui rend une vie. | Une question ratée revient en révision le lendemain. |
| 1.9 | Hors ligne et installation | Service worker : site et leçons déjà ouvertes disponibles sans réseau. | En mode avion, une leçon déjà vue se rejoue. |
| 1.10 | Contenu de lancement | Géographie, Mythes et croyances et Culture générale : étapes 1 et 2 complètes (≈ 30 leçons, ≈ 200 questions). | Marie-Ange a relu les questions et les sources. |

**Jalon** : Marie-Ange et quelques testeurs jouent pendant une semaine ; on ajuste `regles.json` (difficulté,
recharge des vies, points) selon leurs retours.

---

## Version 2 : comptes et compétition

But : créer un compte, retrouver sa partie partout, jouer le quiz du jour et monter dans les ligues.

| # | Étape | Contenu | C'est fini quand |
| --- | --- | --- | --- |
| 2.1 | Projet Supabase | Projets « test » et « production » en région UE ; SMTP externe ; migrations des tables et règles RLS ; tests des règles RLS. | Un joueur ne peut lire ni modifier les données d'un autre (testé). |
| 2.2 | Connexion | Lien magique et Google ; choix du pseudo ; page Mon compte ; déconnexion. | On se connecte sur téléphone et sur ordinateur avec le même compte. |
| 2.3 | Synchronisation des questions | `sync-questions.ts` dans le workflow de mise en ligne. | Les questions du dépôt sont dans Supabase après chaque mise en ligne. |
| 2.4 | Fin de leçon côté serveur | Fonction `terminer-lecon` (score recalculé, garde-fous) ; file d'attente hors ligne. | Une partie truquée (réponses fausses annoncées justes, trop rapide) est refusée. |
| 2.5 | Reprise de la progression | Fonction `importer-progression` à la création du compte. | La partie jouée sans compte se retrouve dans le compte. |
| 2.6 | Quiz du jour | Tâche pg_cron, fonction `quiz-du-jour`, page et classement du jour. | Deux joueurs ont les mêmes questions le même jour, une seule tentative chacun. |
| 2.7 | Ligues | Tables, tâche du lundi, page Ligue (groupe, place, temps restant). | Une semaine simulée fait monter et descendre les bons joueurs. |
| 2.8 | Vie privée | Pages légales, suppression du compte, export des données, bouton « Signaler une erreur ». | Supprimer son compte efface toutes ses lignes (vérifié en base). |

**Jalon** : ouverture publique du site.

---

## Version 3 : tous les types de questions

| # | Étape | Contenu | C'est fini quand |
| --- | --- | --- | --- |
| 3.1 | Réponse à taper | Normalisation et tolérance aux fautes ; listes à compléter avec chrono. | « etats unis », « États-Unis » et « USA » sont acceptés quand prévus. |
| 3.2 | Carte à cliquer | Île `Carte` (d3-geo, TopoJSON) ; zoom ; points selon la distance. | Une question de carte se joue au doigt, même sur un petit écran. |
| 3.3 | Contenu | Leçons de géographie avec cartes ; listes « citez les… » dans plusieurs thèmes. | Chaque thème lancé a au moins une leçon de chaque type adapté. |

---

## Version 4 : le jeu complet

| # | Étape | Contenu | C'est fini quand |
| --- | --- | --- | --- |
| 4.1 | Tous les thèmes | Les 6 autres thèmes ouverts, étapes 1 et 2. | Les 9 animaux peuvent venir au feu. |
| 4.2 | Étapes 3 à 6 | Contenu par vagues, thème par thème. | Chaque animal peut atteindre son grade 6. |
| 4.3 | Duel final et scène de fin | Épreuve contre le lion (questions de tous les thèmes), scène du renard sur le trône. | Un joueur avec les 9 animaux au grade 6 peut renverser le roi. |
| 4.4 | Grades de règne | Roi, Sage, Mage, Archimage, Grand Mage suprême, Esprit universel. | Le joueur continue de monter après la fin. |

---

## Ensuite

- Mises à jour de contenu régulières et événements temporaires (champ `saison`).
- Page d'administration des questions branchée sur Supabase.
- Mesure d'audience sans cookie, si besoin.
- Modèle économique éventuel (dons, abonnement sans publicité).

## Production des questions

Le contenu est le plus gros chantier : un jeu complet compte environ 270 leçons et plus de 2 000 questions.

- Claude écrit les questions par **lots d'une étape d'un thème** (5 leçons + 1 épreuve, environ 40 questions),
  avec une source vérifiable pour chacune.
- Chaque lot arrive dans une PR à part ; Marie-Ange relit, corrige si besoin, puis fusionne.
- Rythme visé pour la version 1 : 6 lots (3 thèmes × 2 étapes).
- Les signalements des joueurs (version 2) alimentent les corrections.

## Ordre conseillé et dépendances

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9      (1.10 en parallèle dès 1.2)
                                   │
                                   └→ 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8
                                                                   │
                                            3.1, 3.2 (dès 1.6) ────┘ → 4.x
```

Les étapes 3.1 et 3.2 ne dépendent que du lecteur de leçon (1.6) ; elles peuvent avancer en même temps que la
version 2 si l'on veut.

## Ce qu'il faudra de la part de Marie-Ange

- **Relire les lots de questions** (étape 1.10 puis à chaque vague).
- **Créer les comptes** au début de la version 2 : projet Supabase (région UE), fournisseur d'e-mails (Brevo ou
  Resend), identifiants Google pour la connexion. Claude donnera les étapes une à une.
- **Ajouter deux secrets** dans les réglages du dépôt GitHub (adresse et clé de service Supabase) pour la
  synchronisation des questions.
- **Tester sur son téléphone** à chaque jalon.
