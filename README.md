# Sinople

Le site de quiz où un goupil gueux devient noble par la ruse… et le savoir.

## Changer le look (couleurs, formes, polices)

Tout se règle dans un seul fichier : **`src/styles/theme.css`**.

- Les couleurs s'écrivent en code hexadécimal, comme dans Photoshop (`#3fae68`).
- `--arrondi` règle l'arrondi des cartes (`0px` = coins carrés).
- `--arrondi-bouton` règle l'arrondi des boutons (`999px` = pilule).
- Les polices viennent de Google Fonts. Pour en changer, il faut aussi modifier le lien dans `src/layouts/Base.astro`.

Pour déplacer des blocs ou changer la mise en page, demandez à Claude.

## Les pages

| Page | Fichier |
| --- | --- |
| Accueil : le feu des conjurés, qui grandit avec les thèmes joués | `src/pages/index.astro` |
| Choix du quiz | `src/pages/themes.astro` |
| Écran avant un quiz (l'animal du thème s'allume) | `src/pages/theme/[id].astro` |
| Un quiz (une partie d'un thème) | `src/pages/quiz/[theme]/[partie].astro` |
| Quiz d'exemple de géographie | `src/pages/quiz/demo.astro` |
| Classement (bientôt) | `src/pages/classement.astro` |

- Thèmes, animaux et carrières : `src/data/themes.json`.
- Questions : un fichier par thème dans `src/data/quiz/` (par exemple `religion.json`), avec le niveau, l'explication et la source de chaque question.
- Le feu et ses animaux : `src/components/Feu.astro`.
- Le renard mascotte : `public/goupil/renard.svg` (les autres dessins du goupil sont rangés dans le même dossier).
- En attendant les comptes, la progression est gardée dans le navigateur : `src/scripts/progres.ts`.

## Voir le site sur son ordinateur

Dans le Terminal, depuis ce dossier :

```
npm install
npm run dev
```

Puis ouvrir http://localhost:4321/sinople/ dans le navigateur.

## Mise en ligne

Le site se met en ligne tout seul sur GitHub Pages à chaque envoi sur la branche `main`
(fichier `.github/workflows/deploy.yml`), à l'adresse https://marieavrd-create.github.io/sinople/.
