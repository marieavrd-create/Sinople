// Points d'une question et bilan d'une leçon (spécification technique § 5).
import { regles } from './regles';

const P = regles.points;

export function pointsQcm(juste: boolean): number {
  return juste ? P.qcm_juste : 0;
}

/** Carte : tous les points sur la cible, puis de moins en moins jusqu'à 0 à la distance de tolérance. */
export function pointsCarte(distanceKm: number, toleranceKm: number): number {
  return Math.round(P.carte_max * Math.max(0, 1 - distanceKm / toleranceKm));
}

/** Saisie : points au prorata des réponses trouvées. */
export function pointsSaisie(trouvees: number, attendues: number): number {
  return attendues > 0 ? Math.round((P.saisie_max * Math.min(trouvees, attendues)) / attendues) : 0;
}

/** Distance à vol d'oiseau entre deux points du globe, en km (formule de haversine). */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export type Resultat = { points: number; juste: boolean };

export type Bilan = {
  bonnes: number;
  total: number;
  reussie: boolean;
  points: number;
  bonusSansFaute: number;
  bonusSerie: number;
  totalPoints: number;
};

/**
 * Bilan d'une leçon : réussite (70 %, ou 80 % pour une épreuve), bonus sans faute (+5 par question)
 * et bonus de série (+10 % par jour de série, plafonné à +50 %), appliqué à tout le reste.
 */
export function bilanLecon(resultats: Resultat[], options: { epreuve?: boolean; joursSerie?: number } = {}): Bilan {
  const total = resultats.length;
  const bonnes = resultats.filter((r) => r.juste).length;
  const seuil = options.epreuve ? regles.reussite.epreuve : regles.reussite.lecon;
  const points = resultats.reduce((s, r) => s + r.points, 0);
  const bonusSansFaute = total > 0 && bonnes === total ? P.bonus_sans_faute_par_question * total : 0;
  const pourcent = Math.min(P.bonus_serie_plafond_pourcent, P.bonus_serie_pourcent * Math.max(0, options.joursSerie ?? 0));
  const bonusSerie = Math.round(((points + bonusSansFaute) * pourcent) / 100);
  return {
    bonnes,
    total,
    reussie: total > 0 && bonnes / total >= seuil,
    points,
    bonusSansFaute,
    bonusSerie,
    totalPoints: points + bonusSansFaute + bonusSerie,
  };
}
