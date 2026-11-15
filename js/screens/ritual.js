// The "processing" beat between sensing and result. Computes the diagnosis,
// cycles the discerning lines, then moves to 'result' on its own.
import { COPY } from '../data/copy.js';
import { diagnose } from '../logic/diagnosis.js';
import { rays, flame, progressBar, setProgress } from '../render/motifs.js';
import { makeRng, freshSeed } from '../lib/rng.js';

export default {
  id: 'ritual',
  mount(root, { t, go, state, config }) {
    // every visit: a fresh seed (sensor seed still mixed in) and a different set of lines
    const seed = ((state.signals?.seed ?? 0) ^ freshSeed()) >>> 0;
    const rng = makeRng(seed);
    const R = COPY.ritual;
    const lines = [R.first, ...rng.sample(R.lines, (config.ritual.lineCount ?? 4) - 2), R.last];
    const ms = config.ritual.lineMs;
    root.innerHTML = `
      <section class="screen screen-ritual">
        <div class="ritual-mark">${rays({ size: 320, n: 12, inner: 0.35, cls: 'spin' })}${flame({ size: 84, cls: 'pulse' })}</div>
        <p class="lead ritual-line" aria-live="polite">${t(lines[0])}</p>
        ${progressBar()}
      </section>`;
    const el = root.querySelector('.ritual-line'), bar = root.querySelector('.obang-progress');
    const diagnosis = diagnose({ serviceId: state.serviceId, flow: state.flow || 'camera', ...(state.signals || {}), seed });
    const total = lines.length * ms, t0 = performance.now();
    let i = 0, raf = 0;
    const iv = setInterval(() => { i = Math.min(i + 1, lines.length - 1); el.innerHTML = t(lines[i]); }, ms);
    const tick = (now) => { setProgress(bar, (now - t0) / total); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const to = setTimeout(() => go('result', { diagnosis }), total);
    return () => { clearInterval(iv); clearTimeout(to); cancelAnimationFrame(raf); };
  },
};
