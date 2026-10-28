// Index des questions : id de question → id de sa leçon. Sert à retrouver les questions à réviser.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const lecons = await getCollection('questions');
  const index = Object.fromEntries(lecons.flatMap((l) => l.data.questions.map((q) => [q.id, l.data.id])));
  return new Response(JSON.stringify(index));
};
