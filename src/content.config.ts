// Collections de contenu. Les leçons vivent dans src/content/questions/<thème>/<étape>-<leçon>.json.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { lecon } from './lib/contenu/schema';

const questions = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/questions' }),
  schema: lecon,
});

export const collections = { questions };
