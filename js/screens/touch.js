// ─────────────────────────────────────────────────────────────
// Touch ritual (premium tier). The visitor presses and holds the trackpad on
// the pad. Pressing time accumulates to CONFIG.touch.holdSeconds; lifting
// pauses it. The waveform + flame follow pressure. When full, it moves to
// 'ritual' on its own. Real pressure in Safari (Force Touch); simulated
// elsewhere; SPACE simulates too. ?dev → Enter finishes instantly.
// ─────────────────────────────────────────────────────────────
import { COPY } from '../data/copy.js';
import { createPressureSource, pressureCues } from '../sense/pressure.js';
import { createWaveform } from '../render/waveform.js';
import { rays, flame, progressBar, setProgress, pressHint } from '../render/motifs.js';

export default {
  id: 'touch',
  mount(root, { t, go, poke, config, dev }) {
    const C = config.touch;
    root.innerHTML = `
      <section class="screen screen-touch">
        <h1 class="display display-sm">${t(COPY.touch.title)}</h1>
        <div class="touch-pad" data-state="idle" tabindex="0">
          <div class="touch-glow">${rays({ size: 420, n: 12, inner: 0.35, width: 6, cls: 'touch-rays' })}${flame({ size: 90, cls: 'touch-flame' })}</div>
          <div class="touch-freq">${t(COPY.touch.frequency, {}, { inline: true })}</div>
          <div class="touch-hint">${pressHint()}<p class="touch-hint-label">${t(COPY.touch.hint, {}, { inline: true })}</p></div>
          <canvas class="touch-wave"></canvas>
        </div>
        ${progressBar()}
        <p class="lead touch-msg" aria-live="polite">${t(COPY.touch.instruct)}</p>
        <button class="btn btn-quiet" data-back>${t(COPY.touch.back)}</button>
        ${dev ? '<p class="fineprint" data-kind></p>' : ''}
      </section>`;

    const $ = (s) => root.querySelector(s);
    const pad = $('.touch-pad'), msg = $('.touch-msg'), bar = $('.obang-progress'), glow = $('.touch-glow');
    // the whole screen is the pad: press anywhere (except on buttons)
    const pressure = createPressureSource($('.screen-touch'), { ...C, ignore: 'button, a' });
    const wave = createWaveform($('.touch-wave'), () => pressure.value, C.waveform);
    let pressed = 0, last = performance.now(), raf = 0, finished = false, msgKey = 'instruct', everTouched = false, lastPoke = 0;
    const shownAt = performance.now();
    const timers = [];
    const say = (key) => { if (key !== msgKey) { msgKey = key; msg.innerHTML = t(COPY.touch[key]); } };

    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      const s = pressure.stats();
      const signals = { seed: s.seed || ((Math.random() * 1e9) | 0), cues: pressureCues(s, C), pressure: s };
      setProgress(bar, 1);
      pad.dataset.state = 'done';
      say('done');
      timers.push(setTimeout(() => go('ritual', { signals }), C.doneHoldMs));
    }

    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const v = pressure.value, touching = pressure.touching;
      if (touching) {
        pressed += dt; everTouched = true;
        // a hand on the pad (no mouse movement) still counts as "someone is here"
        if (now - lastPoke > 1000) { lastPoke = now; poke(); }
      }
      const p = Math.min(1, pressed / C.holdSeconds);
      setProgress(bar, p);
      pad.dataset.state = touching ? 'pressing' : everTouched ? 'lifted' : 'idle';
      glow.style.setProperty('--p', v.toFixed(3));
      // nobody has pressed yet after a few seconds → plainer instruction + one pulse of the pad
      const waiting = !everTouched && now - shownAt > (C.nudgeMs ?? 5000);
      if (waiting && msgKey !== 'nudge') pad.classList.add('nudge');
      say(!everTouched ? (waiting ? 'nudge' : 'instruct') : !touching ? 'lifted' : v < 0.3 && p > 0.25 ? 'deeper' : 'hold');
      if (dev) $('[data-kind]').textContent = `source: ${pressure.kind} · ${v.toFixed(2)}`;
      if (p >= 1) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    $('[data-back]').onclick = () => go('services');
    const onKey = (e) => { if (dev && e.key === 'Enter') finish(); };
    addEventListener('keydown', onKey);
    pad.focus();

    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      removeEventListener('keydown', onKey);
      pressure.destroy();
      wave.stop();
    };
  },
};
