// Lecteur de leçon (QCM) : une question à la fois, les vies en bûches, la barre d'avancement,
// l'explication et la source après chaque réponse, puis le bilan. À zéro vie, le feu s'éteint et la leçon s'arrête.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { lireEtat, ecrireEtat, stockageNavigateur } from '../lib/stockage/local';
import { viesActuelles, perdreVie, prochaineVieDans } from '../lib/jeu/vies';
import { construireChemin, leconAccessible, type LeconDuChemin } from '../lib/jeu/chemin';
import { regles } from '../lib/jeu/regles';
import type { Bilan } from '../lib/jeu/points';
import { enregistrerFin, enregistrerRevision } from '../scripts/fin-de-lecon';

export type QuestionQcm = { id: string; q: string; choix: string[]; juste: number; niveau: string; explication: string; source: string };

type Props = {
  base: string;
  nomTheme: string;
  lecon: { id: string; theme: string; etape: number; titre: string; epreuve: boolean };
  /** Pour la scène de passage de grade : « le bélier », et les noms des 6 grades du thème. */
  animal: string;
  grades: string[];
  questions: QuestionQcm[];
  chemin: LeconDuChemin[];
  /** Mode révision : pas de bûche perdue, pas de verrou ; la fin rend une bûche (5 questions minimum). */
  revision?: boolean;
};

type Ecran = 'question' | 'eteint' | 'fin' | 'fin-revision';

const MAX = regles.vies.max;

function Buches({ vies }: { vies: number }) {
  return (
    <span class="buches" role="img" aria-label={`${vies} vie${vies > 1 ? 's' : ''} sur ${MAX}`}>
      {Array.from({ length: MAX }, (_, i) => (
        <svg class={`buche ${i < vies ? 'allumee' : 'brulee'}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path class="flammeche" d="M12 2c2 3 4 4.5 4 7.5A4 4 0 0 1 8 9.5C8 7.5 10 6 12 2z" />
          <rect class="bois" x="2" y="13" width="20" height="8" rx="4" />
          <circle class="cerne" cx="18" cy="17" r="2.2" />
        </svg>
      ))}
    </span>
  );
}

function FeuEteint() {
  return (
    <svg class="feu-eteint" viewBox="0 0 160 120" width="160" height="120" aria-hidden="true">
      <path class="fumee" d="M80 70c-10-12 8-18-2-32s6-20 0-30" />
      <rect x="35" y="78" width="90" height="16" rx="8" transform="rotate(-12 80 86)" fill="#5a4636" />
      <rect x="35" y="78" width="90" height="16" rx="8" transform="rotate(12 80 86)" fill="#4a3a2d" />
      <ellipse cx="80" cy="102" rx="60" ry="8" fill="rgb(0 0 0 / .25)" />
    </svg>
  );
}

/** Typographie française : espace fine insécable avant ? ! : ; (le signe ne part plus seul à la ligne). */
const typo = (t: string) => t.replace(/\s+([?!:;])/g, '\u202f$1');

function formatDuree(ms: number) {
  const min = Math.ceil(ms / 60_000);
  return min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`;
}

export default function LecteurLecon({ base, nomTheme, lecon, questions, chemin, animal, grades, revision = false }: Props) {
  const retour = revision ? `${base}/` : `${base}/theme/${lecon.theme}`;
  const [vies, setVies] = useState(MAX);
  const [ecran, setEcran] = useState<Ecran>('question');
  const [i, setI] = useState(0);
  const [choisi, setChoisi] = useState(-1);
  const [corrige, setCorrige] = useState(false);
  const [reponses, setReponses] = useState<Record<string, boolean>>({});
  const [bilan, setBilan] = useState<Bilan | null>(null);
  const [promu, setPromu] = useState(0);
  const [rendue, setRendue] = useState(false);
  // Un court temps avant « Continuer » : un double toucher ne saute plus l'explication.
  const verrou = useRef(false);
  const [attente, setAttente] = useState(0);

  // Au chargement : leçon verrouillée → retour au chemin ; plus de vie → feu éteint.
  useEffect(() => {
    const maintenant = Date.now();
    const etat = lireEtat(stockageNavigateur(), maintenant);
    const c = construireChemin(chemin, new Set(Object.keys(etat.leconsFaites)), etat.grades[lecon.theme] ?? 1);
    if (!revision && !leconAccessible(c, lecon.id)) {
      location.replace(retour);
      return;
    }
    const v = viesActuelles(etat.profil.vies, maintenant);
    setVies(v.vies);
    if (v.vies === 0 && !revision) {
      setAttente(prochaineVieDans(etat.profil.vies, maintenant));
      setEcran('eteint');
    }
  }, []);

  // Clavier : les touches 1 à 4 choisissent, les flèches passent d'une réponse à l'autre.
  useEffect(() => {
    if (ecran !== 'question' || corrige) return;
    const auClavier = (e: KeyboardEvent) => {
      const n = questions[i]?.choix.length ?? 0;
      let k = -1;
      if (/^[1-9]$/.test(e.key)) k = Number(e.key) - 1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') k = (choisi + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') k = (Math.max(choisi, 0) - 1 + n) % n;
      if (k < 0 || k >= n) return;
      e.preventDefault();
      setChoisi(k);
      document.querySelectorAll<HTMLButtonElement>('.lecteur .reponse')[k]?.focus();
    };
    addEventListener('keydown', auClavier);
    return () => removeEventListener('keydown', auClavier);
  }, [ecran, corrige, choisi, i]);

  const q = questions[i];
  const ok = choisi === q?.juste;
  const fait = i + (corrige ? 1 : 0);
  const pourcent = useMemo(() => (questions.length ? (fait / questions.length) * 100 : 0), [fait, questions.length]);

  function valider() {
    if (choisi < 0) return;
    setCorrige(true);
    verrou.current = true;
    setTimeout(() => (verrou.current = false), 400);
    setReponses((r) => ({ ...r, [q.id]: ok }));
    if (!ok && !revision) {
      // La bûche brûle tout de suite : quitter la leçon ne la rend pas.
      const maintenant = Date.now();
      const stockage = stockageNavigateur();
      const etat = lireEtat(stockage, maintenant);
      const v = perdreVie(etat.profil.vies, maintenant);
      ecrireEtat(stockage, { ...etat, profil: { ...etat.profil, vies: v } });
      setVies(v.vies);
      setAttente(prochaineVieDans(v, maintenant));
    }
  }

  function continuer() {
    if (verrou.current) return;
    if (vies === 0 && !revision) return setEcran('eteint');
    if (i + 1 < questions.length) {
      setI(i + 1);
      setChoisi(-1);
      setCorrige(false);
      return;
    }
    if (revision) {
      const r = enregistrerRevision(reponses);
      setVies(r.viesApres);
      setRendue(r.viesApres > r.viesAvant);
      setEcran('fin-revision');
      return;
    }
    const fin = enregistrerFin({ theme: lecon.theme, leconId: lecon.id, etape: lecon.etape, epreuve: lecon.epreuve, reponses });
    setBilan(fin.bilan);
    if (fin.gradeApres > fin.gradeAvant) setPromu(fin.gradeApres);
    setEcran('fin');
  }

  if (ecran === 'eteint') {
    return (
      <section class="lecteur ecran-centre">
        <FeuEteint />
        <h1 tabIndex={-1} ref={(h) => h?.focus()}>Le feu s'est éteint</h1>
        <p class="sous-titre">Plus une bûche pour l'entretenir. Une nouvelle bûche arrive dans {formatDuree(attente)}.</p>
        <a class="bouton" href={`${base}/revision`}>Réviser pour regagner une bûche</a>
        <a class="bouton clair" href={retour}>Retour au chemin</a>
      </section>
    );
  }

  if (ecran === 'fin-revision') {
    const min = regles.vies.questions_min_revision;
    return (
      <section class="lecteur ecran-centre">
        <Buches vies={vies} />
        <h1>Révision terminée</h1>
        <p class="sous-titre">
          {Object.values(reponses).filter(Boolean).length} bonne(s) réponse(s) sur {questions.length}.{' '}
          {rendue
            ? 'Une bûche revient au feu.'
            : questions.length < min
              ? `Il faut revoir au moins ${min} questions pour regagner une bûche.`
              : 'Le feu a déjà toutes ses bûches.'}
        </p>
        <a class="bouton" href={retour}>Retour au feu</a>
      </section>
    );
  }

  if (ecran === 'fin' && bilan) {
    const seuil = Math.round((lecon.epreuve ? regles.reussite.epreuve : regles.reussite.lecon) * 100);
    return (
      <section class="lecteur ecran-centre">
        <p class="theme">{nomTheme} · {lecon.titre}</p>
        <h1 tabIndex={-1} ref={(h) => h?.focus()}>
          {typo(
            bilan.total > 0 && bilan.bonnes === bilan.total
              ? 'Sans faute, goupil !'
              : bilan.reussie
                ? lecon.epreuve ? 'Épreuve réussie !' : 'Leçon réussie !'
                : bilan.bonnes / Math.max(1, bilan.total) >= 0.4 ? 'Pas mal, petit goupil' : 'Le chemin sera long',
          )}
        </h1>
        <p class="sous-titre">
          {bilan.bonnes} bonne{bilan.bonnes > 1 ? 's' : ''} réponse{bilan.bonnes > 1 ? 's' : ''} sur {bilan.total}
          {!bilan.reussie && ` : il en faut ${seuil} % pour ${lecon.epreuve ? 'réussir l’épreuve' : 'valider la leçon'}.`}
        </p>
        <dl class="gains">
          <div><dt>Réponses</dt><dd>+{bilan.points}</dd></div>
          {bilan.bonusSansFaute > 0 && <div><dt>Sans faute</dt><dd>+{bilan.bonusSansFaute}</dd></div>}
          {bilan.bonusSerie > 0 && <div><dt>Série</dt><dd>+{bilan.bonusSerie}</dd></div>}
          <div class="total"><dt>Points de savoir</dt><dd>+{bilan.totalPoints}</dd></div>
        </dl>
        {promu > 0 ? (
          <>
            <p class="promotion">{animal.charAt(0).toUpperCase() + animal.slice(1)} devient <strong>{grades[promu - 1]}</strong> !</p>
            <a class="bouton" href={`${retour}?promu=${promu}`}>Voir la scène au feu</a>
          </>
        ) : (
          <a class="bouton" href={retour}>Continuer</a>
        )}
      </section>
    );
  }

  return (
    <div class="lecteur">
      <header class="haut">
        <a
          class="fermer icone-bouton"
          href={retour}
          aria-label="Quitter la leçon"
          onClick={(e) => {
            if ((i > 0 || corrige) && !confirm('Quitter la leçon ? Les réponses de cette partie ne seront pas gardées.')) e.preventDefault();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </a>
        <div class="barre" role="progressbar" aria-label="Avancement" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={fait}>
          <div class="remplissage" style={{ width: `${pourcent}%` }} />
        </div>
        <Buches vies={vies} />
      </header>

      <section class="ecran-question">
        <p class="theme">{nomTheme} · {lecon.titre} · {q.niveau}</p>
        <h1 class="question" id="question">{typo(q.q)}</h1>
        <div class="choix" role="radiogroup" aria-labelledby="question">
          {q.choix.map((c, k) => (
            <button
              type="button"
              role="radio"
              aria-checked={choisi === k}
              disabled={corrige}
              class={`reponse${corrige && k === q.juste ? ' juste' : ''}${corrige && k === choisi && !ok ? ' faux' : ''}`}
              onClick={() => setChoisi(k)}
            >
              {c}
              {corrige && k === q.juste && <span class="invisible"> (bonne réponse)</span>}
              {corrige && k === choisi && !ok && <span class="invisible"> (votre réponse, fausse)</span>}
            </button>
          ))}
        </div>
      </section>

      <footer class={`verdict${corrige ? (ok ? ' ok' : ' rate') : ''}`}>
        <p class="message" aria-live="polite">
          {corrige && typo(ok ? 'Bravo, rusé goupil !' : `La bonne réponse : ${q.choix[q.juste]}`)}
        </p>
        {corrige && (
          <p class="explication">
            {typo(q.explication)} <span class="source">({typo(`Source : ${q.source}`)})</span>
          </p>
        )}
        <button type="button" class="bouton valider" disabled={!corrige && choisi < 0} onClick={corrige ? continuer : valider}>
          {corrige ? 'Continuer' : 'Valider'}
        </button>
      </footer>
    </div>
  );
}
