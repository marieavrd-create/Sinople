// Grades des animaux : l'épreuve de l'étape N réussie fait passer au grade N + 1 (6 au plus).
import { regles } from './regles';

export const GRADE_DE_DEPART = 1;

/** Grade après une épreuve. On peut sauter des étapes ; on ne redescend jamais. */
export function gradeApresEpreuve(grade: number, etape: number, reussie: boolean): number {
  return reussie ? Math.max(grade, Math.min(regles.grades.max, etape + 1)) : grade;
}

/** Le duel final contre le roi s'ouvre quand tous les animaux ont le grade maximum. */
export function duelDebloque(grades: Record<string, number>, themes: string[]): boolean {
  return themes.length > 0 && themes.every((t) => (grades[t] ?? GRADE_DE_DEPART) >= regles.grades.max);
}
