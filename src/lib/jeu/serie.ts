// Série de jours joués (la flamme) et gels de série. Le jour est celui de Paris.
import { regles } from './regles';

const { fuseau, jours_par_gel, gels_max } = regles.serie;

/** `dernierJour` : dernier jour joué, au format AAAA-MM-JJ (heure de Paris). */
export type EtatSerie = { jours: number; dernierJour: string | null; gels: number };

export const serieDeDepart: EtatSerie = { jours: 0, dernierJour: null, gels: 0 };

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function jourParis(maintenant: number | Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit' }).format(maintenant);
}

/** Nombre de jours calendaires entre deux dates AAAA-MM-JJ. */
export function joursEntre(de: string, a: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);
}

/** Jours manqués depuis le dernier jour joué que les gels ne couvrent pas (0 si la série tient). */
function joursPerdus(etat: EtatSerie, jour: string): number {
  if (!etat.dernierJour) return 0;
  const manques = joursEntre(etat.dernierJour, jour) - 1;
  return Math.max(0, manques - etat.gels);
}

/** Série à afficher aujourd'hui : elle tombe à 0 si des jours manqués ne sont pas couverts par les gels. */
export function serieDuJour(etat: EtatSerie, maintenant: number): number {
  return joursPerdus(etat, jourParis(maintenant)) > 0 ? 0 : etat.jours;
}

/**
 * Une leçon terminée : la série continue si la dernière était la veille. Des jours manqués consomment
 * automatiquement les gels ; s'il n'y en a pas assez, la série repart à 1. Un gel est gagné tous les 7 jours (2 au plus).
 */
export function apresLecon(etat: EtatSerie, maintenant: number): EtatSerie {
  const jour = jourParis(maintenant);
  if (etat.dernierJour === jour) return etat;
  if (!etat.dernierJour || joursPerdus(etat, jour) > 0) return { jours: 1, dernierJour: jour, gels: 0 };

  const manques = Math.max(0, joursEntre(etat.dernierJour, jour) - 1);
  const jours = etat.jours + 1;
  const gels = Math.min(gels_max, etat.gels - manques + (jours % jours_par_gel === 0 ? 1 : 0));
  return { jours, dernierJour: jour, gels };
}
