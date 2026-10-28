import { describe, expect, it } from 'vitest';
import { construireChemin, leconAccessible, type LeconDuChemin } from '../src/lib/jeu/chemin';

const L = (etape: number, lecon: number, epreuve = false): LeconDuChemin => ({ id: `t-${etape}-${lecon}`, etape, lecon, epreuve });
const lecons = [L(1, 1), L(1, 2), L(1, 3), L(1, 4), L(1, 5, true), L(2, 1), L(2, 2), L(2, 3), L(2, 4), L(2, 5, true)];
const etats = (c: ReturnType<typeof construireChemin>, n: number) => c[n - 1].lecons.map((l) => l.etat);

describe('chemin du thème', () => {
  it('au départ : seule la première leçon et l’épreuve de l’étape 1 sont ouvertes', () => {
    const c = construireChemin(lecons, new Set(), 1);
    expect(c).toHaveLength(6);
    expect(etats(c, 1)).toEqual(['suivante', 'verrouillee', 'verrouillee', 'verrouillee']);
    expect(c[0].epreuve?.etat).toBe('ouverte');
    expect(c[1].ouverte).toBe(false);
    expect(etats(c, 2)).toEqual(['verrouillee', 'verrouillee', 'verrouillee', 'verrouillee']);
    expect(c[1].epreuve?.etat).toBe('verrouillee');
    expect(c[2]).toMatchObject({ lecons: [], epreuve: null });
  });

  it('réussir une leçon ouvre la suivante', () => {
    const c = construireChemin(lecons, new Set(['t-1-1', 't-1-2']), 1);
    expect(etats(c, 1)).toEqual(['faite', 'faite', 'suivante', 'verrouillee']);
    expect(leconAccessible(c, 't-1-2')).toBe(true); // on peut rejouer une leçon faite
    expect(leconAccessible(c, 't-1-3')).toBe(true);
    expect(leconAccessible(c, 't-1-4')).toBe(false);
  });

  it('après un saut d’étape, les leçons de l’étape sautée restent libres', () => {
    const c = construireChemin(lecons, new Set(), 2);
    expect(etats(c, 1)).toEqual(['ouverte', 'ouverte', 'ouverte', 'ouverte']);
    expect(c[0].epreuve?.etat).toBe('reussie');
    expect(etats(c, 2)).toEqual(['suivante', 'verrouillee', 'verrouillee', 'verrouillee']);
    expect(leconAccessible(c, 't-2-5')).toBe(true);
  });

  it('refuse une leçon inconnue', () => {
    expect(leconAccessible(construireChemin(lecons, new Set(), 1), 'autre-1-1')).toBe(false);
  });
});
