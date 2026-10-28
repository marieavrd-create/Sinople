// Le chemin d'un thème : quelles leçons sont faites, laquelle est la suivante, lesquelles sont verrouillées.
// Règles (spécification fonctionnelle § 5) : on avance dans l'ordre ; réussir une leçon ouvre la suivante ;
// l'épreuve de l'étape en cours se tente à tout moment (saut d'étape) ; la réussir ouvre l'étape suivante.
import { regles } from './regles';

export type LeconDuChemin = { id: string; etape: number; lecon: number; epreuve: boolean };
export type EtatLecon = 'faite' | 'suivante' | 'ouverte' | 'verrouillee';
export type EtatEpreuve = 'reussie' | 'ouverte' | 'verrouillee';

export type EtapeDuChemin = {
  etape: number;
  /** Étape ouverte : on y joue, ou on y a déjà joué. */
  ouverte: boolean;
  lecons: { id: string; etat: EtatLecon }[];
  epreuve: { id: string; etat: EtatEpreuve } | null;
};

/**
 * `grade` : grade actuel de l'animal (1 au départ). Les étapes 1 à `grade` sont ouvertes ;
 * dans l'étape en cours, seules les leçons faites et la première non faite s'ouvrent.
 */
export function construireChemin(lecons: LeconDuChemin[], faites: ReadonlySet<string>, grade: number): EtapeDuChemin[] {
  const etapes: EtapeDuChemin[] = [];
  for (let n = 1; n <= regles.grades.max; n++) {
    const ouverte = n <= grade;
    const enCours = n === grade;
    const ici = lecons.filter((l) => l.etape === n);
    const normales = ici.filter((l) => !l.epreuve).sort((a, b) => a.lecon - b.lecon);
    let suivanteTrouvee = false;
    const etats = normales.map((l): { id: string; etat: EtatLecon } => {
      if (faites.has(l.id)) return { id: l.id, etat: 'faite' };
      if (!ouverte) return { id: l.id, etat: 'verrouillee' };
      if (!enCours) return { id: l.id, etat: 'ouverte' }; // étape sautée : tout est libre
      if (!suivanteTrouvee) {
        suivanteTrouvee = true;
        return { id: l.id, etat: 'suivante' };
      }
      return { id: l.id, etat: 'verrouillee' };
    });
    const e = ici.find((l) => l.epreuve);
    etapes.push({
      etape: n,
      ouverte,
      lecons: etats,
      epreuve: e ? { id: e.id, etat: grade > n ? 'reussie' : enCours ? 'ouverte' : 'verrouillee' } : null,
    });
  }
  return etapes;
}

/** Une leçon (ou épreuve) peut-elle être ouverte ? Sert aussi de garde sur la page de la leçon. */
export function leconAccessible(chemin: EtapeDuChemin[], id: string): boolean {
  for (const e of chemin) {
    if (e.epreuve?.id === id) return e.epreuve.etat !== 'verrouillee';
    const l = e.lecons.find((x) => x.id === id);
    if (l) return l.etat !== 'verrouillee';
  }
  return false;
}
