// Séance de révision : les questions dont la date de rappel est arrivée (système de Leitner),
// chargées leçon par leçon, puis jouées dans le lecteur en mode révision.
import { useEffect, useState } from 'preact/hooks';
import LecteurLecon, { type QuestionJeu } from './LecteurLecon';
import { lireEtat, stockageNavigateur } from '../lib/stockage/local';
import { aReviser } from '../lib/jeu/revision';
import { jourParis } from '../lib/jeu/serie';
import { regles } from '../lib/jeu/regles';

type Chargement = { etat: 'charge' } | { etat: 'vide'; prochaine: string | null } | { etat: 'erreur' } | { etat: 'pret'; questions: QuestionJeu[] };

export default function Revision({ base }: { base: string }) {
  const [c, setC] = useState<Chargement>({ etat: 'charge' });

  useEffect(() => {
    const fiches = lireEtat(stockageNavigateur()).revision;
    const ids = aReviser(fiches, jourParis(Date.now())).slice(0, regles.revision.questions_par_seance);
    if (ids.length === 0) {
      const prochaine = Object.values(fiches).map((f) => f.aRevoirLe).sort()[0] ?? null;
      setC({ etat: 'vide', prochaine });
      return;
    }
    (async () => {
      const index: Record<string, string> = await (await fetch(`${base}/lecons.json`)).json();
      const lecons = [...new Set(ids.map((id) => index[id]).filter(Boolean))];
      const contenus = await Promise.all(lecons.map(async (l) => (await fetch(`${base}/lecons/${l}.json`)).json()));
      const parId = new Map<string, QuestionJeu>(
        contenus.flatMap((l: { questions: (QuestionJeu | { type: 'carte'; id: string })[] }) =>
          l.questions.flatMap((q) => (q.type === 'carte' ? [] : [[q.id, q] as const])),
        ),
      );
      // Une question retirée du contenu est simplement ignorée.
      const questions = ids.map((id) => parId.get(id)).filter((q): q is QuestionJeu => !!q);
      setC(questions.length ? { etat: 'pret', questions } : { etat: 'vide', prochaine: null });
    })().catch(() => setC({ etat: 'erreur' }));
  }, []);

  if (c.etat === 'charge') return <p class="lecteur ecran-centre">Le goupil rassemble ses notes…</p>;
  if (c.etat === 'erreur')
    return (
      <section class="lecteur ecran-centre">
        <h1>Impossible de charger la révision</h1>
        <p class="sous-titre">Vérifie la connexion et réessaie.</p>
        <a class="bouton" href={`${base}/`}>Retour au feu</a>
      </section>
    );
  if (c.etat === 'vide') {
    const date = c.prochaine
      ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${c.prochaine}T00:00:00Z`))
      : null;
    return (
      <section class="lecteur ecran-centre">
        <h1>Rien à revoir aujourd'hui</h1>
        <p class="sous-titre">
          {date ? `Prochaine révision : ${date}.` : 'Les questions ratées dans les leçons viendront ici, pour être revues plus tard.'}
        </p>
        <a class="bouton" href={`${base}/themes`}>Jouer une leçon</a>
        <a class="bouton clair" href={`${base}/`}>Retour au feu</a>
      </section>
    );
  }
  return (
    <LecteurLecon
      revision
      base={base}
      nomTheme="Révision"
      lecon={{ id: 'revision', theme: '', etape: 0, titre: `${c.questions.length} question${c.questions.length > 1 ? 's' : ''} à revoir`, epreuve: false }}
      questions={c.questions}
      chemin={[]}
      animal=""
      grades={[]}
    />
  );
}
