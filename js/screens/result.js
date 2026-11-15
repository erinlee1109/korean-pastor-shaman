// The diagnosis sheet:
// header → figures → a few named spirits → the repentance list (the focus);
// upsell beside it. An aftercare button "receives the offering" (nothing is
// charged), shows a Hallelujah receipt, then returns to the start.
import { COPY } from '../data/copy.js?v=ecee5c41b3';
import { PART_BY_ID } from '../data/bodyparts.js?v=ecee5c41b3';
import { SERVICES, AFTERCARE } from '../data/services.js?v=ecee5c41b3';
import { renderPartCard } from '../render/figure.js?v=ecee5c41b3';
import { diagnose } from '../logic/diagnosis.js?v=ecee5c41b3';
import { wonWords } from '../lib/ko.js?v=ecee5c41b3';
import { priceEntry, dateEntry } from '../lib/i18n.js?v=ecee5c41b3';
import { stripe, chip, flame, rays, progressBar, setProgress } from '../render/motifs.js?v=ecee5c41b3';
import { freshSeed } from '../lib/rng.js?v=ecee5c41b3';

const fresh = { serviceId: null, flow: null, signals: null, diagnosis: null };

export default {
  id: 'result',
  mount(root, { t, go, state, lang, config }) {
    // #result directly (design work) → demo diagnosis
    const d = state.diagnosis || diagnose({ flow: 'touch', serviceId: 'premium', seed: freshSeed() });
    const service = SERVICES.find((s) => s.id === d.serviceId) || SERVICES[1];
    const figures = d.parts.map((p) =>
      renderPartCard(PART_BY_ID[p.id], { ...p, lang, animate: true, pen: true })).join('');
    root.innerHTML = `
      ${stripe({ height: 18, cls: 'edge-stripe' })}
      <section class="screen screen-result">
        <article class="sheet">
          ${stripe({ height: 10 })}
          <div class="sheet-inner">
            <header class="sheet-head">
              <h1>${t(COPY.result.title)}</h1>
              <dl>
                <dt>${t(COPY.result.service, {}, { inline: true })}</dt><dd>${t(service.name, {}, { inline: true })}</dd>
                <dt>${t(COPY.result.date, {}, { inline: true })}</dt><dd>${t(dateEntry(d.date), {}, { inline: true })}</dd>
              </dl>
            </header>
            <div class="figures bp-draw" data-count="${d.parts.length}">${figures}</div>
            <div class="cols">
              <section>
                <h2>${t(COPY.result.spirits, {}, { inline: true })}</h2>
                <ol class="spirits">${d.spirits.map((s) => `<li>${t(s)}</li>`).join('')}</ol>
                <p class="hidden-count">${t(COPY.result.hidden, { n: d.hidden })}</p>
              </section>
              <section>
                <h2>${t(COPY.result.repent, {}, { inline: true })}</h2>
                <ol class="repent">${d.repent.map((r) => `<li>${t(r.line)}</li>`).join('')}</ol>
              </section>
            </div>
          </div>
        </article>
        <aside class="upsell">
          <h2>${t(COPY.result.upsell)}</h2>
          <p class="blurb">${t(COPY.result.upsellNote)}</p>
          <div class="btns">${AFTERCARE.map((a, i) => `
            <button class="btn aftercare" data-care="${a.id}">${chip(i)}<span class="ac-name">${t(a.name)}</span><span class="ac-price">${t(priceEntry(a.price, wonWords))}</span></button>`).join('')}
          </div>
          <button class="btn btn-quiet" data-again>${t(COPY.result.again, {}, { inline: true })}</button>
          <p class="fineprint">${t(COPY.result.disclaimer)}</p>
        </aside>
      </section>`;

    const timers = [];
    let raf = 0;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    root.querySelector('[data-again]').onclick = () => go('intro', fresh);
    root.querySelectorAll('[data-care]').forEach((b) => {
      b.onclick = () => receive(AFTERCARE.find((a) => a.id === b.dataset.care));
    });

    // ── the offering "goes through": short working beat → Hallelujah receipt → intro
    function receive(a) {
      const R = COPY.receipt, cfg = config.receipt || {};
      const overlay = document.createElement('div');
      overlay.className = 'receipt-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="receipt-working">
          <div class="ritual-mark">${rays({ size: 240, n: 12, inner: 0.35, cls: 'spin' })}${flame({ size: 70, cls: 'pulse' })}</div>
          <p class="lead" aria-live="polite">${t(a.working)}</p>
          ${progressBar()}
        </div>`;
      root.append(overlay);
      const bar = overlay.querySelector('.obang-progress');
      const t0 = performance.now(), workMs = cfg.workingMs ?? 2600;
      const tick = (now) => {
        setProgress(bar, (now - t0) / workMs);
        if (now - t0 < workMs) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      later(() => showReceipt(overlay, a, R, cfg), workMs);
    }

    function showReceipt(overlay, a, R, cfg) {
      const no = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}${String(d.date.getDate()).padStart(2, '0')}-${String(d.seed % 10000).padStart(4, '0')}`;
      overlay.innerHTML = `
        <article class="receipt">
          ${stripe({ height: 10 })}
          <div class="receipt-inner">
            <h2 class="receipt-title">${t(R.title)}</h2>
            <p class="receipt-received">${t(R.received)}</p>
            <dl>
              <dt>${t(R.no, {}, { inline: true })}</dt><dd>${no}</dd>
              <dt>${t(R.item, {}, { inline: true })}</dt><dd>${t(a.name, {}, { inline: true })}</dd>
              <dt>${t(R.amount, {}, { inline: true })}</dt><dd>${t(priceEntry(a.price, wonWords), {}, { inline: true })}</dd>
              <dt>${t(COPY.result.date, {}, { inline: true })}</dt><dd>${t(dateEntry(new Date()), {}, { inline: true })}</dd>
            </dl>
            <p class="receipt-done">${t(a.done)}</p>
            <p class="receipt-pray">${t(R.pray)}</p>
            <p class="fineprint">${t(R.followup)}</p>
            <button class="btn btn-primary btn-big" data-amen>${t(R.amen, {}, { inline: true })}</button>
            <p class="fineprint receipt-count" aria-live="off"></p>
            <p class="fineprint">${t(COPY.result.disclaimer)}</p>
          </div>
        </article>`;
      overlay.querySelector('[data-amen]').onclick = () => go('intro', fresh);
      overlay.querySelector('[data-amen]').focus();
      const count = overlay.querySelector('.receipt-count');
      let n = cfg.returnSeconds ?? 20;
      const step = () => {
        if (n <= 0) return go('intro', fresh);
        count.innerHTML = t(R.returning, { n });
        n -= 1;
        later(step, 1000);
      };
      step();
    }

    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  },
};
