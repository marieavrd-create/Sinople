# Sinople : spécification fonctionnelle

Version 1, 27 octobre 2026. Rédigée à partir des décisions de Marie-Ange.
Les points marqués **[à valider]** sont des propositions qui attendent son accord.

## 1. Le projet en une phrase

Sinople est un site de quiz public, en français, où l'on incarne un renard gueux qui, par la ruse et le savoir,
rallie les animaux du royaume autour de son feu pour faire tomber le roi lion.

## 2. Pour qui

- Des adultes curieux, francophones. Le site n'est pas pensé pour les enfants.
- Sur téléphone d'abord, mais il marche aussi sur ordinateur.
- Le site s'installe sur l'écran d'accueil du téléphone comme une application (web app installable).

## 3. L'histoire

- Au début, le renard est seul près d'un petit feu de trois bûches. Au loin, le château du roi lion.
- Chaque thème de quiz a son animal. Quand on joue un thème, son animal vient s'asseoir au feu écouter le complot
  du renard, dans l'esprit des fables de La Fontaine.
- Chaque animal monte en grade dans son thème. Plus il y a d'animaux et plus ils sont gradés, plus le feu est beau :
  pierres autour du feu à 3 animaux, bannières à 6, et d'autres décors au-delà **[à valider]**.
- **Le roi ne tombe que lorsque tous les animaux ont atteint leur plus haut grade.** Alors se débloque le duel final :
  une épreuve de questions sur tous les thèmes contre le lion, suivie d'une scène de fin où le renard prend le trône.
- Après la fin, le jeu continue (voir § 10).

## 4. Les thèmes, les animaux et les grades

Neuf thèmes, chacun avec son animal. Le renard porte la culture générale (toutes les matières mélangées).

Chaque animal a **6 grades**. Le dernier grade est sa carrière, déjà décidée. Les noms des grades intermédiaires
sont des propositions **[à valider]**.

| Thème | Animal | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5 | Grade 6 (carrière) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Culture générale | Renard | Gueux | Braconnier | Colporteur | Conteur | Conseiller | Conjuré |
| Géographie | Hibou | Vagabond | Messager | Cartographe | Explorateur | Navigateur | Ambassadeur |
| Histoire (et monarchie) | Cerf | Écolier | Copiste | Archiviste | Lettré | Historiographe | Chroniqueur du roi |
| Culture (art, musique, pop culture, tech) | Paon | Curieux | Apprenti | Ménestrel | Artiste | Amateur éclairé | Mécène |
| Mythes et croyances | Bélier | Pèlerin | Novice | Moine | Chanoine | Abbé | Évêque |
| Politique et économie | Pie | Manant | Échevin | Bailli | Intendant | Conseiller d'État | Ministre |
| Savoir-vivre | Lapin | Rustre | Valet | Page | Courtisan | Chambellan | Maître des cérémonies |
| Sport | Sanglier | Garçon d'écurie | Écuyer | Bachelier | Champion | Banneret | Chevalier |
| Savoir inutile | Grenouille | Badaud | Crieur | Saltimbanque | Jongleur | Fou | Bouffon du roi |

Le roi est le lion.

## 5. Le chemin d'un thème (progression façon Duolingo)

- Chaque thème est un **chemin** qui se parcourt dans l'ordre, comme sur Duolingo.
- Le chemin est découpé en **6 étapes, une par grade**.
- Chaque étape contient **4 à 5 leçons** courtes (5 à 8 questions, 2 à 3 minutes), puis une **épreuve de passage
  de grade** (plus longue, environ 12 questions, plus difficile).
- Réussir une leçon débloque la suivante. Réussir l'épreuve fait monter l'animal d'un grade, avec une petite scène
  au feu (l'animal change de tenue ou d'accessoire).
- La difficulté monte au fil du chemin : les premières étapes ont surtout des questions faciles, les dernières
  surtout des difficiles (les questions ont déjà un niveau facile, moyen ou difficile).
- On peut rejouer une leçon déjà réussie pour gagner des points, sans limite.
- Un joueur qui connaît déjà bien un thème peut tenter l'épreuve d'une étape pour sauter directement
  au grade suivant.

## 6. Les types de questions

Trois types, tous avec une **explication** et une **source** affichées après la réponse.

1. **QCM** : une question, 4 choix, une seule bonne réponse. Type principal, dans tous les thèmes.
2. **Carte à cliquer** (géographie, façon 94 Degrees) : on doit toucher un lieu sur une carte ; la réponse est juste
   si on est assez près. Plus on est près, plus on gagne de points.
3. **Réponse à taper** (façon JetPunk) : on tape une réponse libre, ou une liste à compléter dans un temps donné
   (« Citez les 10 pays les plus peuplés »). Les fautes de frappe légères, les accents et les majuscules sont tolérés,
   et plusieurs orthographes acceptées peuvent être prévues pour chaque réponse.

## 7. Les vies

- Le joueur a **5 vies** (des bûches, pour rester dans l'histoire).
- Une mauvaise réponse en leçon fait perdre une vie : une bûche du feu se consume. À zéro vie, **le feu s'éteint**
  (les animaux restent dans l'ombre autour des braises) et on ne peut plus commencer de leçon jusqu'à ce qu'une vie revienne.
- Les vies reviennent avec le temps : **une vie toutes les 30 minutes** **[à valider]**.
- On regagne aussi une vie en faisant une **révision** (§ 8), ce qui donne une façon de continuer à jouer en apprenant.
- Le quiz du jour et la révision ne coûtent pas de vie.

## 8. Revenir chaque jour

- **La série** : nombre de jours d'affilée où l'on a terminé au moins une leçon. Elle est représentée par la flamme
  du feu. Une journée manquée la remet à zéro **[à valider : un « gel » de série gagné en jouant, comme sur Duolingo]**.
- **Le quiz du jour** : 10 questions, les mêmes pour tout le monde ce jour-là, tous thèmes mélangés.
  Un seul essai par jour. Son score a un petit classement du jour.
- **La révision** : un paquet de questions que le joueur a ratées, reposées plus tard pour mieux les retenir.
  Une question bien réussie en révision revient de plus en plus rarement.

## 9. Points, classement et ligues

- On gagne des **points de savoir** à chaque bonne réponse, avec des bonus : leçon sans faute, rapidité, série en cours.
- Les points servent à deux choses : le **total** (affiché sur l'accueil) et la **ligue de la semaine**.
- **Les ligues** : chaque semaine, les joueurs sont répartis en groupes d'environ 30. Le lundi, les meilleurs de chaque
  groupe montent dans la ligue supérieure, les derniers descendent. Les ligues portent les couleurs du blason, de la
  plus modeste à la plus haute **[à valider]** : Sable, Argent, Or, Gueules, Azur, et enfin **Sinople**.
- Seuls les joueurs avec un compte apparaissent dans les ligues et les classements.
- Les classements affichent le pseudo et l'animal ou le grade le plus élevé, jamais l'adresse e-mail.

## 10. Après la fin : le règne

- Une fois sur le trône, le joueur continue à jouer. Le site ajoute régulièrement du contenu par **mises à jour**,
  à la manière de Candy Crush : nouvelles leçons, nouveaux thèmes ou nouveaux animaux, événements temporaires.
- Le renard roi continue de monter dans des **grades de règne** aux titres pompeux, du côté de la magie et du savoir
  **[à valider]** : Roi, Sage, Mage, Archimage, Grand Mage suprême, Esprit universel.
- Les joueurs qui ont fini restent dans les ligues.

## 11. Compte et partie sans compte

- **On peut jouer sans compte.** La progression est alors gardée sur l'appareil.
- **Créer un compte** permet d'apparaître dans les ligues et classements, et de retrouver sa partie sur un autre appareil.
  À la création du compte, la progression faite sans compte est reprise.
- Inscription avec un **pseudo** et une **adresse e-mail** (lien de connexion envoyé par e-mail, sans mot de passe) ;
  connexion avec Google en option **[à valider]**.
- Page **Mon compte** : changer de pseudo, se déconnecter, **supprimer son compte et ses données**.

## 12. Les écrans

| Écran | Ce qu'on y voit |
| --- | --- |
| Accueil (le feu des conjurés) | Le feu, les animaux ralliés, le château du lion au loin ; points, série, grade du renard ; bouton pour jouer. Existe déjà. |
| Choix du thème | Les 9 thèmes avec leur animal et leur grade actuel. Existe déjà. |
| Chemin du thème | Les étapes et leçons, celles faites, la prochaine, l'épreuve de grade. À créer. |
| Leçon | Une question à la fois, vies, barre d'avancement, réponse, explication et source. Existe pour le QCM. |
| Fin de leçon | Points gagnés, bonnes réponses, série ; scène de l'animal au feu en cas de passage de grade. |
| Quiz du jour | Les 10 questions du jour et le classement du jour. |
| Révision | Le paquet de questions à revoir. |
| Ligue | Le groupe de la semaine, sa place, le temps restant avant lundi. |
| Profil / Mon compte | Pseudo, grades de chaque animal, statistiques, réglages, suppression du compte. |
| Duel final et scène de fin | Débloqués quand tous les animaux sont au grade 6. |
| Pages légales | Mentions légales, confidentialité, conditions d'utilisation. |

## 13. Les questions

- Pour l'instant, Claude écrit les questions avec leur source, et Marie-Ange les teste et les relit.
- Chaque question a : un thème, une leçon, un niveau (facile, moyen, difficile), le type, l'énoncé, les réponses,
  une explication et une source.
- Une page d'administration en ligne n'est pas prévue au début ; on la reconsidérera plus tard.
- Il faut beaucoup de questions : environ 9 thèmes × 6 étapes × 5 leçons, soit 270 leçons et plus de 2 000 questions
  pour un jeu complet. Le contenu est donc produit par vagues (§ 15).
- Un bouton **« Signaler une erreur »** sous chaque explication permet aux joueurs de signaler une question douteuse.

## 14. Exigences générales

- **Mobile d'abord** : rapide sur un téléphone moyen en 4G, utilisable d'une main.
- **Le look reste modifiable par Marie-Ange** dans un seul fichier de thème (couleurs, formes, polices).
- **Accessibilité** : textes lisibles, contrastes suffisants, jouable au clavier, animations réduites si le téléphone
  le demande.
- **Équité** : les points des ligues et classements sont vérifiés par le serveur, pas seulement par le téléphone,
  pour éviter la triche.
- **Vie privée (RGPD)** : on ne collecte que le pseudo, l'e-mail et la progression ; pas de publicité ni de traceurs
  au départ ; suppression du compte possible à tout moment ; page de confidentialité claire.
- **Gratuit** au départ **[à valider : modèle économique plus tard ?]**.

## 15. Ce qui vient d'abord : la première version jouable

**Version 1 (jouable, sans compte)**
- Accueil avec le feu, choix du thème, chemin du thème, leçons QCM, fin de leçon, passage de grade.
- Vies, série, révision, progression gardée sur l'appareil.
- Deux thèmes complets sur les deux premières étapes : Géographie et Mythes et croyances, plus la Culture générale.

**Version 2 (comptes et compétition)**
- Comptes, reprise de la progression, quiz du jour, ligues et classements, pages légales.

**Version 3 (tous les types de questions)**
- Carte à cliquer pour la géographie, réponses à taper.

**Version 4 (le jeu complet)**
- Tous les thèmes et les 6 étapes, duel final, scène de fin, grades de règne.

**Ensuite** : mises à jour régulières de contenu, événements, éventuellement une page d'administration des questions.

## 16. Questions encore ouvertes

1. Les noms des grades (§ 4), des ligues (§ 9) et des grades de règne (§ 10).
2. La recharge des vies : une toutes les 30 minutes ?
3. Le gel de série.
4. Connexion par e-mail seulement, ou aussi avec Google ?
5. Un modèle économique un jour (dons, abonnement sans pub), ou gratuit pour toujours ?
