// Une leçon en JSON, chargée à la demande (révision, et bientôt hors ligne via le service worker).
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths = (async () => {
  const lecons = await getCollection('questions');
  return lecons.map((l) => ({ params: { id: l.data.id }, props: { lecon: l.data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(JSON.stringify(props.lecon));
