# Sinople : spécification technique

Version 1, 27 octobre 2026. Elle découle de la [spécification fonctionnelle](specification-fonctionnelle.md)
et part du code déjà en place (Astro 6, GitHub Pages, fichier de thème).

## 1. Vue d'ensemble

```
Navigateur (téléphone)                         Supabase (région UE)
┌──────────────────────────────┐              ┌───────────────────────────────┐
│ Site Astro statique          │   HTTPS      │ Auth : lien e-mail, Google    │
│  - pages, feu, chemins       │ ───────────▶ │ Postgres + règles RLS         │
│  - lecteur de leçon (île)    │              │ Fonctions Edge (Deno) :       │
│  - progression locale        │ ◀─────────── │   terminer-lecon, quiz-du-jour│
│  - service worker (hors      │              │   importer-progression, …     │
│    ligne, installable)       │              │ pg_cron : ligues, quiz du jour│
└──────────────────────────────┘              └───────────────────────────────┘
          ▲
          │ mis en ligne à chaque envoi sur main
GitHub (dépôt sinople) ── GitHub Actions ──▶ GitHub Pages
                         └─ synchronise les questions vers Supabase
```

Principes :

1. **Le site reste statique** (GitHub Pages, gratuit). Tout ce qui est dynamique passe par Supabase.
2. **Le jeu marche sans compte et sans réseau** : la progression vit d'abord sur l'appareil.
3. **Le serveur fait foi pour tout ce qui compte dans les classements** : points, ligues, quiz du jour.
4. **Les questions vivent dans le dépôt**, en fichiers JSON relus comme du code, puis sont recopiées dans Supabase.
5. **Marie-Ange garde la main sur le look** : `src/styles/theme.css` reste l'unique fichier de réglage visuel.

## 2. Choix techniques

| Sujet | Choix | Pourquoi |
| --- | --- | --- |
| Site | Astro 6, pages statiques | Déjà en place ; très léger sur mobile. |
| Interactivité | Scripts TypeScript dans les composants Astro ; une **île Preact** pour le lecteur de leçon, la carte et la ligue | Preact pèse ~4 ko ; on ne charge du JavaScript que sur les écrans qui en ont besoin. |
| Données locales | `localStorage` pour l'état léger, IndexedDB (via `idb-keyval`) pour la révision et l'historique | Le stockage du navigateur suffit et survit hors ligne. |
| Backend | Supabase : Auth, Postgres, fonctions Edge, pg_cron | Validé ; offre gratuite suffisante au départ. |
| Cartes | Fond de carte Natural Earth simplifié (TopoJSON, ~150 ko), `d3-geo` pour la projection | Cartes nettes en SVG, calcul de distance précis. |
| Hors ligne / installation | Service worker (`@vite-pwa/astro`) + `manifest.webmanifest` existant | Web app installable, leçons jouables en métro. |
| Tests | Vitest (règles du jeu), Playwright (parcours), validation des questions en CI | Les règles (points, vies, révision) sont faciles à tester isolément. |
| E-mails | SMTP externe (Brevo ou Resend, offre gratuite) branché sur Supabase Auth | Le SMTP intégré de Supabase est limité à quelques e-mails par heure. |

## 3. Organisation du code

```
src/
  content/
    questions/<theme>/<etape>-<lecon>.json   ← les leçons et leurs questions
    config.ts                                ← schéma (zod) : le build échoue si une question est mal formée
  data/
    themes.json                              ← thèmes, animaux, grades (noms modifiables ici)
    regles.json                              ← réglages du jeu : vies, recharge, points, bonus, ligues
  lib/
    jeu/        points.ts, vies.ts, serie.ts, revision.ts, reponses.ts (normalisation, tolérance)
    stockage/   local.ts (progression sur l'appareil), sync.ts (envoi vers Supabase)
    supabase.ts                              ← client Supabase (clé publique seulement)
  components/   Feu.astro, Chemin.astro, Vies.astro, …
  islands/      LecteurLecon.tsx, Carte.tsx, Ligue.tsx
  pages/        index, themes, theme/[id], theme/[id]/[lecon], revision, quiz-du-jour, ligue, compte, legal/…
  styles/       theme.css (réglages de Marie-Ange), global.css
supabase/
  migrations/   *.sql (tables, RLS, fonctions SQL, tâches pg_cron)
  functions/    terminer-lecon/, quiz-du-jour/, importer-progression/, supprimer-compte/, signaler/
scripts/
  sync-questions.ts                          ← recopie src/content/questions dans Supabase
tests/          unitaires (Vitest) et parcours (Playwright)
```

Le dossier `src/scripts/progres.ts` actuel est remplacé par `src/lib/stockage/local.ts`, avec une reprise
automatique des données déjà enregistrées sous la clé `sinople-progres`.

## 4. Les questions (contenu)

### 4.1 Format d'une leçon

```json
{
  "id": "geographie-1-2",
  "theme": "geographie",
  "etape": 1,
  "lecon": 2,
  "titre": "Les capitales d'Europe",
  "epreuve": false,
  "questions": [
    {
      "id": "geo-cap-0012",
      "type": "qcm",
      "niveau": "facile",
      "q": "Quelle est la capitale de la Slovénie ?",
      "choix": ["Ljubljana", "Zagreb", "Bratislava", "Skopje"],
      "juste": 0,
      "explication": "…",
      "source": "…"
    },
    {
      "id": "geo-loc-0003",
      "type": "carte",
      "niveau": "moyen",
      "q": "Touchez Tombouctou.",
      "cible": { "lat": 16.77, "lon": -3.01 },
      "carte": "afrique",
      "tolerance_km": 300,
      "explication": "…",
      "source": "…"
    },
    {
      "id": "geo-liste-0001",
      "type": "saisie",
      "niveau": "difficile",
      "q": "Citez les 5 pays les plus peuplés du monde.",
      "reponses": [["Inde"], ["Chine"], ["États-Unis", "USA", "Etats Unis"], ["Indonésie"], ["Pakistan"]],
      "duree_s": 60,
      "explication": "…",
      "source": "…"
    }
  ]
}
```

- `id` de question **stable et unique** : il sert à la révision et aux statistiques. On ne le réutilise jamais.
- L'ancien format (`src/data/quiz/religion.json`) est converti une fois par un petit script.
- Une épreuve de grade est une leçon avec `"epreuve": true` (environ 12 questions, plus de difficiles).

### 4.2 Contrôles automatiques

À chaque PR, la CI vérifie : schéma valide, `id` uniques, 4 choix distincts pour un QCM, index `juste` valide,
coordonnées plausibles, source non vide, et nombre de leçons par étape (4 ou 5 + 1 épreuve).

### 4.3 Synchronisation

À chaque mise en ligne, `scripts/sync-questions.ts` (lancé par GitHub Actions avec la clé de service stockée dans les
secrets du dépôt) fait un *upsert* des questions dans la table `questions`. Les questions retirées du dépôt sont
marquées `active = false`, jamais supprimées, pour garder l'historique.

## 5. Règles du jeu (code partagé)

Toutes les règles sont des **fonctions pures** dans `src/lib/jeu/`, lues par le navigateur **et** recopiées dans
les fonctions Edge (même fichier importé par Deno), pour que le téléphone et le serveur calculent pareil.
Les réglages chiffrés sont dans `src/data/regles.json` pour pouvoir les ajuster sans toucher au code.

| Règle | Calcul |
| --- | --- |
| Points d'une question | QCM juste : 10. Carte : `round(10 × max(0, 1 − distance / tolérance))`. Saisie : 10 × part des réponses trouvées. |
| Bonus de leçon | Sans faute : +5 par question. Série en cours : +10 % (plafonné à +50 %). |
| Leçon réussie | Au moins 70 % de bonnes réponses ; épreuve : 80 %. |
| Vies | 5 au maximum. Calcul paresseux : `vies = min(5, vies_enregistrees + floor((maintenant − maj) / 30 min))`. Pas de minuterie côté serveur. |
| Vie regagnée | +1 vie pour une révision terminée (5 questions minimum). |
| Série | Jour = date à Paris (`Europe/Paris`). Une leçon terminée le jour J prolonge la série si la dernière était à J−1. |
| Gel de série | 1 gel gagné tous les 7 jours de série, 2 au maximum ; consommé automatiquement pour un jour manqué. |
| Révision | Système de Leitner à 5 boîtes. Mauvaise réponse → boîte 1. Bonne réponse → boîte suivante. Délais : 1, 2, 4, 8, 16 jours. |
| Grade d'un animal | Épreuve de l'étape N réussie → grade N + 1 (6 au maximum). Une épreuve peut être tentée sans avoir fait les leçons (saut d'étape). |
| Duel final | Débloqué quand les 9 animaux sont au grade 6. |
| Réponse tapée | Minuscules, sans accents ni ponctuation, articles initiaux retirés (le, la, les, l'). Tolérance d'une faute de frappe (distance de Levenshtein ≤ 1) à partir de 5 lettres. |

## 6. Base de données Supabase

Toutes les tables sont en **RLS activée**. Un joueur ne lit et n'écrit que ses propres lignes ; les écritures qui
touchent aux points passent uniquement par les fonctions Edge (clé de service).

| Table | Colonnes principales | Accès joueur |
| --- | --- | --- |
| `profils` | `id` (= auth.users), `pseudo` unique, `cree_le`, `gels_serie`, `serie`, `dernier_jour_joue`, `vies`, `vies_maj` | lecture/écriture de son pseudo seulement |
| `grades` | `joueur`, `theme`, `grade` (1 à 6), `grade_regne` | lecture |
| `lecons_faites` | `joueur`, `lecon_id`, `meilleur_score`, `nb_parties`, `derniere_fois` | lecture |
| `parties` | `id`, `joueur`, `lecon_id`, `debut`, `fin`, `reponses` (jsonb), `points`, `valide` | lecture |
| `revision` | `joueur`, `question_id`, `boite`, `a_revoir_le` | lecture |
| `questions` | `id`, `lecon_id`, `type`, `contenu` (jsonb, avec la réponse), `active` | **aucun accès direct** |
| `quiz_du_jour` | `jour`, `questions` (liste d'id) | lecture des id du jour |
| `reponses_du_jour` | `jour`, `joueur`, `score`, `duree_ms` | lecture du classement du jour |
| `ligues` | `id`, `nom`, `rang` (1 Sable … 6 Sinople) | lecture |
| `groupes` | `id`, `ligue`, `semaine` | lecture |
| `membres_groupe` | `groupe`, `joueur`, `points_semaine` | lecture de son groupe |
| `signalements` | `id`, `joueur`, `question_id`, `message`, `cree_le` | insertion |

Vues publiques pour les classements : elles n'exposent que `pseudo`, l'animal le plus gradé et les points.

## 7. Fonctions Edge (API)

| Fonction | Rôle | Garde-fous |
| --- | --- | --- |
| `terminer-lecon` | Reçoit `lecon_id`, les réponses et les temps ; recalcule le score avec les vraies réponses, met à jour vies, série, gels, grades, révision, points de ligue. | Rejette une partie trop rapide (moins de 1,5 s par question en moyenne), une leçon verrouillée, ou plus de 60 parties par heure. |
| `quiz-du-jour` | `GET` : les questions du jour **sans les réponses**. `POST` une réponse : renvoie juste/faux et l'explication. | Un seul passage par joueur et par jour ; la réponse n'est révélée qu'après l'envoi. |
| `importer-progression` | À la création du compte, reprend la progression locale (leçons faites, grades, révision). | Les points importés ne comptent pas pour la ligue ; plafonds de vraisemblance. |
| `supprimer-compte` | Supprime le joueur et toutes ses lignes (cascade), puis le compte Auth. | Demande une confirmation récente (connexion de moins de 10 minutes). |
| `signaler` | Enregistre un signalement d'erreur sur une question. | 20 signalements par jour et par joueur. |

**Pourquoi les leçons gardent les réponses dans le navigateur** : pour corriger instantanément et jouer hors ligne,
le lecteur de leçon a besoin des bonnes réponses. Un tricheur pourrait les lire, mais le serveur limite l'intérêt de
tricher (vitesse plausible, plafonds horaires, points des ligues recalculés). Le **quiz du jour**, lui, ne livre jamais
les réponses à l'avance : c'est le seul classement « à armes égales ».

## 8. Tâches planifiées (pg_cron)

| Quand (heure de Paris) | Tâche |
| --- | --- |
| Chaque jour à 0 h 00 | Tirer les 10 questions du quiz du jour (thèmes mélangés, pas une question des 60 derniers jours). |
| Chaque lundi à 0 h 05 | Clore la semaine des ligues : les 7 premiers de chaque groupe montent, les 5 derniers descendent (sauf en Sable et en Sinople), puis former les nouveaux groupes de 30 avec les joueurs actifs. |
| Chaque nuit | Purger les parties de plus de 12 mois (on garde les totaux). |

## 9. Progression sans compte et synchronisation

- Tout l'état du joueur est stocké localement sous une forme identique aux tables (`profil`, `grades`, `lecons_faites`,
  `revision`), avec un numéro de version pour les migrations futures.
- **Sans compte** : tout est calculé dans le navigateur ; rien n'est envoyé.
- **Avec compte** : chaque fin de leçon appelle `terminer-lecon`. Hors ligne, la partie est mise en file d'attente et
  envoyée au retour du réseau (le service worker relance l'envoi). L'état du serveur fait foi en cas de désaccord.
- **Création du compte** : `importer-progression` est appelé une fois, puis l'état local est remplacé par celui du
  serveur.

## 10. Authentification

- Supabase Auth : **lien magique par e-mail** (sans mot de passe) et **Google** (OAuth).
- Les adresses de redirection autorisées : `https://marieavrd-create.github.io/sinople/` et `http://localhost:4321/sinople/`.
- Le pseudo est demandé juste après la première connexion ; il est unique, 3 à 20 caractères, filtré contre les
  insultes (liste simple).
- La clé publique Supabase (`anon`) est dans le code du site, ce qui est normal : la sécurité repose sur les règles RLS.
  La clé de service ne quitte jamais les secrets GitHub et les fonctions Edge.

## 11. Performance mobile

Objectifs, mesurés avec Lighthouse en mode mobile sur l'accueil et une leçon :

- Affichage principal (LCP) < 2,5 s en 4G ; poids de la première visite < 300 ko hors carte.
- JavaScript : < 30 ko sur l'accueil, < 80 ko sur l'écran de leçon (Preact compris).
- Le feu et les animaux sont en SVG inline ; animations en CSS, coupées si `prefers-reduced-motion`.
- La vidéo `renard-conquerant.mp4` n'est jamais chargée d'office (seulement sur demande, avec affiche JPG).
- Polices : deux familles, sous-ensemble latin, `font-display: swap` ; à terme, hébergées sur le site.
- Leçons chargées à la demande (un JSON par leçon, quelques ko), mises en cache par le service worker.
- Fond de carte chargé seulement pour les questions de type carte.

## 12. Accessibilité

- Contrastes AA vérifiés sur les couleurs de `theme.css` (un test automatique signale une couleur trop pâle).
- Toutes les actions jouables au clavier ; focus visible ; boutons de réponse de 48 px de haut minimum.
- Bonne ou mauvaise réponse annoncée aussi en texte (pas seulement par la couleur) et aux lecteurs d'écran
  (`aria-live`).
- Questions de carte : une alternative au toucher précis (zoom, et tolérance plus large).

## 13. Vie privée (RGPD)

- Données collectées : e-mail, pseudo, progression et réponses. Rien d'autre.
- Supabase hébergé en **région UE** (Francfort ou Paris).
- Pas de publicité, pas de traceur, pas de cookie hors session de connexion : pas de bandeau cookies nécessaire.
  Mesure d'audience éventuelle sans cookie (GoatCounter ou Plausible), à décider plus tard.
- Pages : mentions légales, politique de confidentialité, conditions d'utilisation (public visé : adultes ;
  âge minimum déclaré de 15 ans, majorité numérique en France).
- Droits : suppression du compte en un clic (`supprimer-compte`), export des données sur demande (JSON).
- Sous-traitants à citer : GitHub (hébergement du site), Supabase (données), le fournisseur d'e-mails.

## 14. Qualité et mise en ligne

- **Branches** : `main` = site en ligne ; une branche et une PR par évolution.
- **CI sur chaque PR** (nouveau workflow `verifier.yml`) : build Astro, vérification TypeScript, tests Vitest,
  validation des questions, Lighthouse (budget de performance), tests Playwright sur les parcours principaux.
- **Mise en ligne** : `deploy.yml` existant, plus une étape de synchronisation des questions.
- **Migrations Supabase** versionnées dans `supabase/migrations/`, appliquées avec la CLI Supabase.
- **Environnements** : un projet Supabase de test et un de production (deux projets gratuits).

## 15. Limites de l'offre gratuite à surveiller

| Limite | Valeur | Que faire |
| --- | --- | --- |
| Projet Supabase en pause | après 7 jours sans activité | Une tâche planifiée GitHub qui interroge la base chaque jour tant que le trafic est faible. |
| Base de données | 500 Mo | Purge des vieilles parties ; largement suffisant pour des milliers de joueurs. |
| Fonctions Edge | 500 000 appels par mois | Environ 16 000 leçons par jour : suffisant au départ. |
| E-mails | dépend du fournisseur (Brevo : 300 par jour) | Suffisant pour les connexions au début. |

## 16. Prêt pour la suite

- **Modèle économique** : une table `abonnements` et un champ `premium` dans `profils` pourront s'ajouter sans
  changer le reste ; rien n'est construit au départ.
- **Mises à jour de contenu** : un champ `saison` sur les leçons permet de publier des événements temporaires.
- **Administration des questions** : les questions étant déjà dans Supabase, une page d'administration pourra s'y
  brancher plus tard.
