// Conversion unique de l'ancien format (src/data/quiz/<thème>.json, une liste de « parties »)
// vers le format des leçons (src/content/questions/<thème>/1-<n>.json). Chaque partie devient une leçon de l'étape 1.
// Usage : node scripts/convertir-ancien-quiz.mjs religion
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const theme = process.argv[2];
if (!theme) throw new Error('Usage : node scripts/convertir-ancien-quiz.mjs <thème>');

const ancien = JSON.parse(readFileSync(`src/data/quiz/${theme}.json`, 'utf8'));
const prefixe = theme.slice(0, 3);
mkdirSync(`src/content/questions/${theme}`, { recursive: true });

ancien.parties.forEach((partie, i) => {
  const n = i + 1;
  const lecon = {
    id: `${theme}-1-${n}`,
    theme,
    etape: 1,
    lecon: n,
    titre: partie.nom,
    intro: partie.intro,
    epreuve: false,
    questions: partie.questions.map((q, j) => ({
      id: `${prefixe}-${partie.id}-${String(j + 1).padStart(4, '0')}`,
      type: 'qcm',
      ...q,
    })),
  };
  const chemin = `src/content/questions/${theme}/1-${n}.json`;
  writeFileSync(chemin, JSON.stringify(lecon, null, 2) + '\n');
  console.log(`${chemin} : ${lecon.questions.length} questions`);
});
