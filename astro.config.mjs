// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';

// Le site est publié par GitHub Pages sous le domaine du portfolio de Marie-Ange :
// https://marieangeviard.com/sinople/
export default defineConfig({
  site: 'https://marieangeviard.com',
  base: '/sinople',
  integrations: [preact()],
});