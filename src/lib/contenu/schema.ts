// Format d'une leçon et de ses questions (spécification technique § 4.1).
// Utilisé par la collection Astro (le build échoue si une leçon est mal formée) et par les contrôles de contenu.
import { z } from 'astro/zod';

const texte = (nom: string) => z.string().trim().min(1, `${nom} est vide`);

const commun = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "l'id d'une question s'écrit en minuscules et tirets, ex. geo-cap-0012"),
  niveau: z.enum(['facile', 'moyen', 'difficile'], { error: 'niveau doit valoir facile, moyen ou difficile' }),
  q: texte("l'énoncé (q)"),
  explication: texte("l'explication"),
  source: texte('la source'),
};

export const questionQcm = z.object({
  ...commun,
  type: z.literal('qcm'),
  choix: z.array(texte('un choix')).length(4, 'un QCM a exactement 4 choix'),
  juste: z.number().int().min(0, 'juste doit être entre 0 et 3').max(3, 'juste doit être entre 0 et 3'),
});

export const questionCarte = z.object({
  ...commun,
  type: z.literal('carte'),
  cible: z.object({
    lat: z.number().min(-90, 'latitude hors de [-90, 90]').max(90, 'latitude hors de [-90, 90]'),
    lon: z.number().min(-180, 'longitude hors de [-180, 180]').max(180, 'longitude hors de [-180, 180]'),
  }),
  carte: texte('le nom de la carte'),
  tolerance_km: z.number().positive('tolerance_km doit être positive'),
});

export const questionSaisie = z.object({
  ...commun,
  type: z.literal('saisie'),
  reponses: z.array(z.array(texte('une réponse acceptée')).min(1, 'chaque réponse attendue a au moins une forme acceptée')).min(1, 'il faut au moins une réponse attendue'),
  duree_s: z.number().int().positive('duree_s doit être positive'),
});

export const question = z.discriminatedUnion('type', [questionQcm, questionCarte, questionSaisie], {
  error: 'type doit valoir qcm, carte ou saisie',
});

export const lecon = z.object({
  id: z.string(),
  theme: z.string(),
  etape: z.number().int().min(1),
  lecon: z.number().int().min(1),
  titre: texte('le titre'),
  intro: z.string().optional(),
  epreuve: z.boolean().default(false),
  questions: z.array(question).min(1, 'une leçon a au moins une question'),
});

export type Question = z.infer<typeof question>;
export type Lecon = z.infer<typeof lecon>;
