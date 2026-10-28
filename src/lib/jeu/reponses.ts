// Réponses tapées : normalisation et tolérance d'une faute de frappe (spécification technique § 5).
import { regles } from './regles';

const { fautes_tolerees, lettres_min_pour_tolerance, articles_ignores, part_pour_juste } = regles.saisie;

/** Minuscules, sans accents ni ponctuation, sans article au début : « L'Égypte ! » → « egypte ». */
export function normaliser(texte: string): string {
  let s = texte.trim().toLowerCase().replace(/[’`´]/g, "'");
  for (const article of [...articles_ignores].sort((a, b) => b.length - a.length)) {
    const fin = article.endsWith("'") ? '' : '\\s+';
    const m = s.match(new RegExp(`^${article}${fin}`));
    if (m && s.length > m[0].length) {
      s = s.slice(m[0].length);
      break;
    }
  }
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Distance de Levenshtein : nombre minimal de lettres à ajouter, retirer ou changer. */
export function levenshtein(a: string, b: string): number {
  let precedente = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const ligne = [i];
    for (let j = 1; j <= b.length; j++) {
      ligne[j] = Math.min(precedente[j] + 1, ligne[j - 1] + 1, precedente[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    precedente = ligne;
  }
  return precedente[b.length];
}

/** La saisie correspond-elle à l'une des formes acceptées ? Une faute tolérée à partir de 5 lettres. */
export function estAcceptee(saisie: string, formes: string[]): boolean {
  const s = normaliser(saisie);
  if (!s) return false;
  return formes.some((forme) => {
    const f = normaliser(forme);
    if (s === f) return true;
    return f.replace(/ /g, '').length >= lettres_min_pour_tolerance && levenshtein(s, f) <= fautes_tolerees;
  });
}

/**
 * Question à réponses multiples (« Citez les 5 pays… ») : renvoie l'index de la réponse attendue
 * que la saisie trouve, en ignorant celles déjà trouvées ; -1 si aucune.
 */
export function trouverReponse(saisie: string, reponses: string[][], dejaTrouvees: ReadonlySet<number> = new Set()): number {
  return reponses.findIndex((formes, i) => !dejaTrouvees.has(i) && estAcceptee(saisie, formes));
}

/**
 * Pendant la frappe d'une liste : seule une saisie exacte (aux accents et majuscules près) compte,
 * pour que « Chine » ne soit pas pris pour « Chili » avant la fin du mot. Renvoie l'index trouvé, ou -1.
 */
export function trouverExacte(saisie: string, reponses: string[][]): number {
  const s = normaliser(saisie);
  if (!s) return -1;
  return reponses.findIndex((formes) => formes.some((f) => normaliser(f) === s));
}

/** Une question à taper est juste si l'on trouve la réponse (seule) ou assez de réponses de la liste. */
export function saisieJuste(trouvees: number, attendues: number): boolean {
  if (attendues <= 0) return false;
  return attendues === 1 ? trouvees >= 1 : trouvees / attendues >= part_pour_juste;
}
