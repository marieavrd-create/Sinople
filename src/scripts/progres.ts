// Progression du joueur, gardée dans le navigateur en attendant les comptes (étape 2, Supabase).
// Pour chaque thème : nombre de quiz joués et de bonnes réponses.
export type Progres = Record<string, { quiz: number; bonnes: number }>;
const CLE = 'sinople-progres';

export function lireProgres(): Progres {
  try {
    return JSON.parse(localStorage.getItem(CLE) ?? '{}');
  } catch {
    return {};
  }
}

export function noterQuiz(theme: string, bonnes: number) {
  const p = lireProgres();
  const t = p[theme] ?? { quiz: 0, bonnes: 0 };
  p[theme] = { quiz: t.quiz + 1, bonnes: t.bonnes + bonnes };
  try {
    localStorage.setItem(CLE, JSON.stringify(p));
  } catch {
    // navigation privée : la progression n'est pas gardée
  }
}
