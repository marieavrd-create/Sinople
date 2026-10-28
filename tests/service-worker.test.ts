import { describe, expect, it } from 'vitest';
import { adressesAPrecacher } from '../integrations/service-worker.mjs';

describe('service worker', () => {
  it('garde les pages à l’adresse de leur dossier, et pas la vidéo', () => {
    expect(adressesAPrecacher(['index.html', 'theme/religion/index.html', 'lecons/religion-1-1.json', '_astro/a.js', 'accueil/renard.mp4', 'sw.js'], '/sinople/')).toEqual([
      '/sinople/',
      '/sinople/_astro/a.js',
      '/sinople/lecons/religion-1-1.json',
      '/sinople/theme/religion/',
    ]);
  });
});
