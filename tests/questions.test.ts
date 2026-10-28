import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { controlerLecons, type FichierLecon } from '../src/lib/contenu/controles';

const DOSSIER = 'src/content/questions';

function lireTout(dossier: string): FichierLecon[] {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) return lireTout(chemin);
    if (!e.name.endsWith('.json')) return [];
    return [{ chemin: relative(DOSSIER, chemin).split('\\').join('/'), donnees: JSON.parse(readFileSync(chemin, 'utf8')) }];
  });
}

describe('questions du dépôt', () => {
  it('passent tous les contrôles', () => {
    const fichiers = lireTout(DOSSIER);
    expect(fichiers.length).toBeGreaterThan(0);
    // En cas d'échec, la liste affichée dit quel fichier et quelle question corriger.
    expect(controlerLecons(fichiers)).toEqual([]);
  });
});

const qcm = (id: string, autre: Record<string, unknown> = {}) => ({
  id, type: 'qcm', niveau: 'facile', q: 'Question ?', choix: ['A', 'B', 'C', 'D'], juste: 0,
  explication: 'Parce que.', source: 'Une source', ...autre,
});
const lecon = (n: number, questions: unknown[], autre: Record<string, unknown> = {}) => ({
  chemin: `geographie/1-${n}.json`,
  donnees: { id: `geographie-1-${n}`, theme: 'geographie', etape: 1, lecon: n, titre: 'Titre', questions, ...autre },
});

describe('contrôles de contenu', () => {
  it('acceptent une leçon correcte', () => {
    expect(controlerLecons([lecon(1, [qcm('geo-a-0001')])])).toEqual([]);
  });

  it('signalent une question mal formée en nommant le fichier et la question', () => {
    const erreurs = controlerLecons([lecon(1, [qcm('geo-a-0001', { choix: ['A', 'B', 'C'], juste: 5, source: ' ' })])]);
    expect(erreurs).toContain('geographie/1-1.json › questions.0.choix (geo-a-0001) : un QCM a exactement 4 choix');
    expect(erreurs).toContain('geographie/1-1.json › questions.0.juste (geo-a-0001) : juste doit être entre 0 et 3');
    expect(erreurs).toContain('geographie/1-1.json › questions.0.source (geo-a-0001) : la source est vide');
  });

  it('refusent les choix en double et les id réutilisés', () => {
    const erreurs = controlerLecons([
      lecon(1, [qcm('geo-a-0001', { choix: ['Paris', 'paris ', 'Lyon', 'Nice'] })]),
      lecon(2, [qcm('geo-a-0001')]),
    ]);
    expect(erreurs).toContain('geographie/1-1.json › geo-a-0001 : deux choix sont identiques');
    expect(erreurs).toContain('geographie/1-2.json › geo-a-0001 : id déjà utilisé dans geographie/1-1.json (un id ne sert qu\'une fois)');
  });

  it('vérifient les coordonnées des questions de carte', () => {
    const carte = { id: 'geo-loc-0001', type: 'carte', niveau: 'moyen', q: 'Touchez Tombouctou.', cible: { lat: 116.77, lon: -3.01 },
      carte: 'afrique', tolerance_km: 300, explication: '…', source: '…' };
    expect(controlerLecons([lecon(1, [carte])])).toContain('geographie/1-1.json › questions.0.cible.lat (geo-loc-0001) : latitude hors de [-90, 90]');
  });

  it('vérifient le nom du fichier, le thème et le nombre de leçons par étape', () => {
    const mauvais = { chemin: 'geographie/1-9.json', donnees: { ...lecon(1, [qcm('geo-b-0001')]).donnees, theme: 'cuisine', id: 'cuisine-1-1' } };
    const erreurs = controlerLecons([mauvais]);
    expect(erreurs).toContain('geographie/1-9.json : le fichier devrait s\'appeler cuisine/1-1.json (d\'après theme, etape et lecon)');
    expect(erreurs).toContain('geographie/1-9.json : le thème « cuisine » n\'existe pas dans src/data/themes.json');

    const etape = [lecon(1, [qcm('geo-c-0001')]), lecon(6, [qcm('geo-c-0002')], { epreuve: true })];
    expect(controlerLecons(etape)).toContain('geographie/étape 1 : l\'épreuve est là mais il n\'y a que 1 leçon(s), il en faut 4 ou 5');
  });
});
