// Service worker du site (spécification technique § 2 et § 11) : à la fin du build, on écrit dist/sw.js
// avec la liste de toutes les pages, leçons et ressources, pour que le site et les leçons marchent sans réseau.
// (Le module @vite-pwa/astro ne gère pas encore Astro 6, d'où ce petit service worker fait main.)
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Fichiers trop lourds pour être gardés d'office (la vidéo de l'accueil n'est plus affichée). */
const EXCLUS = /\.(mp4|webm|mov)$/i;

/** Chemins relatifs à dist → adresses à mettre en cache ; une page index.html se sert à l'adresse de son dossier. */
export function adressesAPrecacher(chemins, base) {
  const racine = base.endsWith('/') ? base : `${base}/`;
  return chemins
    .filter((c) => !EXCLUS.test(c) && c !== 'sw.js')
    .map((c) => racine + (c === 'index.html' ? '' : c.endsWith('/index.html') ? c.slice(0, -'index.html'.length) : c))
    .sort();
}

function lister(dossier, racine = dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = join(dossier, e.name);
    return e.isDirectory() ? lister(chemin, racine) : [relative(racine, chemin).split(sep).join('/')];
  });
}

const modele = (version, adresses, base) => `// Généré au build par integrations/service-worker.mjs : ne pas modifier à la main.
const VERSION = ${JSON.stringify(version)};
const CACHE = 'sinople-' + VERSION;
const BASE = ${JSON.stringify(base)};
const A_PRECACHER = ${JSON.stringify(adresses)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(A_PRECACHER)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k.startsWith('sinople-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Pages : le réseau d'abord (pour avoir la dernière version), le cache si l'on est hors ligne.
// Ressources du site : le cache d'abord. Polices Google : le cache, rafraîchi en arrière-plan.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith(BASE)) {
    if (req.mode === 'navigate') {
      e.respondWith(
        fetch(req).catch(async () => {
          const cache = await caches.open(CACHE);
          const chemin = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
          const options = { ignoreVary: true };
          return (await cache.match(chemin, options)) || (await cache.match(url.pathname, options)) || (await cache.match(BASE, options)) || Response.error();
        }),
      );
      return;
    }
    e.respondWith(caches.match(url.pathname, { ignoreSearch: true, ignoreVary: true }).then((r) => r || fetch(req)));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const enCache = await cache.match(req);
        const reseau = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') cache.put(req, r.clone()); return r; }).catch(() => enCache);
        return enCache || reseau;
      }),
    );
  }
});
`;

export default function serviceWorker() {
  let base = '/';
  return {
    name: 'sinople-service-worker',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const chemins = lister(dist);
        const adresses = adressesAPrecacher(chemins, base);
        const empreinte = createHash('sha256');
        for (const c of chemins.filter((c) => !EXCLUS.test(c) && c !== 'sw.js').sort()) empreinte.update(c).update(readFileSync(join(dist, c)));
        const version = empreinte.digest('hex').slice(0, 12);
        writeFileSync(join(dist, 'sw.js'), modele(version, adresses, base));
        logger.info(`sw.js : ${adresses.length} adresses gardées hors ligne (version ${version})`);
      },
    },
  };
}
