// Fin d'une leçon jouée dans le navigateur : calcule le bilan et l'enregistre sur l'appareil.
import { bilanLecon, pointsQcm, type Bilan } from '../lib/jeu/points';
import { serieDuJour } from '../lib/jeu/serie';
import { lireEtat, ecrireEtat, stockageNavigateur, terminerLecon } from '../lib/stockage/local';

export function enregistrerFin(fin: {
  theme: string;
  leconId: string;
  etape: number;
  epreuve: boolean;
  reponses: Record<string, boolean>;
  /** Faux pour le quiz d'exemple, dont les questions n'entrent pas en révision. */
  reviser?: boolean;
}): Bilan {
  const maintenant = Date.now();
  const stockage = stockageNavigateur();
  const etat = lireEtat(stockage, maintenant);
  const resultats = Object.values(fin.reponses).map((juste) => ({ juste, points: pointsQcm(juste) }));
  const bilan = bilanLecon(resultats, { epreuve: fin.epreuve, joursSerie: serieDuJour(etat.profil.serie, maintenant) });
  const score = bilan.total ? Math.round((bilan.bonnes / bilan.total) * 100) : 0;
  ecrireEtat(
    stockage,
    terminerLecon(
      etat,
      { ...fin, reponses: fin.reviser === false ? {} : fin.reponses, reussie: bilan.reussie, points: bilan.totalPoints, score },
      maintenant,
    ),
  );
  return bilan;
}
