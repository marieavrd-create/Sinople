import { describe, expect, it } from 'vitest';
import { regles } from '../src/lib/jeu/regles';

// Vérifie que les réglages restent cohérents quand on modifie src/data/regles.json.
describe('regles.json', () => {
  it('donne des vies et une recharge positives', () => {
    expect(regles.vies.max).toBeGreaterThan(0);
    expect(regles.vies.recharge_minutes).toBeGreaterThan(0);
  });

  it('garde des seuils de réussite entre 0 et 1, l’épreuve au moins aussi dure que la leçon', () => {
    for (const seuil of [regles.reussite.lecon, regles.reussite.epreuve]) {
      expect(seuil).toBeGreaterThan(0);
      expect(seuil).toBeLessThanOrEqual(1);
    }
    expect(regles.reussite.epreuve).toBeGreaterThanOrEqual(regles.reussite.lecon);
  });

  it('a des délais de révision croissants', () => {
    const d = regles.revision.delais_jours;
    expect(d.length).toBeGreaterThan(0);
    d.slice(1).forEach((jour, i) => expect(jour).toBeGreaterThan(d[i]));
  });

  it('utilise un fuseau horaire reconnu', () => {
    expect(() => new Intl.DateTimeFormat('fr-FR', { timeZone: regles.serie.fuseau })).not.toThrow();
  });

  it('garde le bonus de série sous son plafond', () => {
    expect(regles.points.bonus_serie_pourcent).toBeLessThanOrEqual(regles.points.bonus_serie_plafond_pourcent);
  });
});
