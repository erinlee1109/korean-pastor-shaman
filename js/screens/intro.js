// Revival-poster opening: gold rays, a tongue of fire, the five-colour band.
import { COPY } from '../data/copy.js?v=ecee5c41b3';
import { rays, flame, stripe } from '../render/motifs.js?v=ecee5c41b3';
import { preloadFaceModel } from '../sense/face.js?v=ecee5c41b3';

export default {
  id: 'intro',
  mount(root, { t, go, config }) {
    root.innerHTML = `
      ${stripe({ height: 18, cls: 'edge-stripe' })}
      <section class="screen screen-intro">
        <div class="intro-mark">${rays({ size: 300, n: 12, inner: 0.42, cls: 'spin-slow' })}${flame({ size: 110 })}</div>
        <p class="kicker">${t(COPY.intro.kicker, {}, { inline: true })}</p>
        <h1 class="display">${t(COPY.intro.title)}</h1>
        <p class="lead">${t(COPY.intro.lead)}</p>
        <button class="btn btn-primary btn-big" data-go>${t(COPY.intro.cta)}</button>
        <p class="verse">${t(COPY.intro.verse)}</p>
      </section>`;
    root.querySelector('[data-go]').onclick = () => go('services');
    // warm the face model in the background so the camera opens quickly
    preloadFaceModel(config.camera).catch(() => {});
  },
};
