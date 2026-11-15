// ─────────────────────────────────────────────────────────────
// Turns sensor "signals" into a diagnosis object. Pure data in → data out.
// Screens render the result; nothing here touches the DOM.
//
// signals (all optional):
//   seed        number  — derived from face geometry / pressure trace
//   cues        string[]— e.g. ['smile','squint'] or ['heavy','shaky']
//   faceKnots   [[x,y]] — head-front coords where the face "showed" spirits
//   pressure    {mean, peak, steadiness} 0..1 (touch)
// ─────────────────────────────────────────────────────────────
import { CONFIG } from '../config.js';
import { makeRng } from '../lib/rng.js';
import { fill } from '../lib/ko.js';
import { BODY_PARTS, partsFor } from '../data/bodyparts.js';
import { SPIRITS } from '../data/spirits.js';
import { REPENT_ITEMS, REPENT_TEMPLATES } from '../data/repent.js';

function weightedSample(rng, items, n, weightOf) {
  const pool = items.slice();
  const out = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, it) => s + weightOf(it), 0);
    let r = rng.next() * total;
    let k = 0;
    for (; k < pool.length - 1; k++) { r -= weightOf(pool[k]); if (r <= 0) break; }
    out.push(pool.splice(k, 1)[0]);
  }
  return out;
}

/** "34~5%" (Korean shorthand for 34–35%); when the tens digit rolls over, spell it out: "29~30%". */
export const meterLabel = (pct) => `${pct}~${pct % 10 === 9 ? pct + 1 : (pct % 10) + 1}%`;

/** Touch tier: always the two bowls (the gauges), then fill to touchPartCount from the rest, in sheet order. */
function pickTouchParts(rng) {
  const pool = partsFor('touch');
  const fixed = pool.filter((p) => p.meter);
  const rest = rng.sample(pool.filter((p) => !p.meter), Math.max(0, (CONFIG.touchPartCount ?? 7) - fixed.length));
  const chosen = new Set([...fixed, ...rest]);
  return pool.filter((p) => chosen.has(p));
}

export function diagnose({ serviceId, flow, seed = Date.now(), cues = [], faceKnots = [], pressure = null }) {
  const rng = makeRng(seed);
  const cueSet = new Set(cues);
  const cheap = flow === 'camera';
  const R = CONFIG.result;

  // 1. Parts — camera reads the head only; touch reads a different set of
  //    body regions each time (the two bowls always, plus a draw from the rest).
  const parts = (cheap ? partsFor('camera').filter((p) => CONFIG.cameraParts.includes(p.id)) : pickTouchParts(rng)).map((p, i) => {
    const base = pressure ? 0.3 + pressure.mean * 0.45 : 0.45;
    const intensity = Math.min(1, Math.max(0.2, base + rng.range(-0.25, 0.45)));
    const meter = p.meter ? rng.range(...R.meterRange) : null;
    const pct = meter != null ? Math.round(meter * 100) : null;
    return {
      id: p.id,
      seed: seed + i * 101,
      intensity,
      meter,
      meterText: pct != null ? meterLabel(pct) : null,
      note: p.notes?.length && rng.chance(R.noteChance ?? 0.7) ? rng.pick(p.notes) : null,
      extraKnots: p.id === 'head-front' ? faceKnots : [],
    };
  });
  const partIds = new Set(parts.map((p) => p.id));

  // 2. Spirits — favour ones whose signal matched, and whose parts were read.
  const spirits = weightedSample(rng, SPIRITS, R.spiritsCount[flow] ?? 10, (s) =>
    (s.weight ?? 1) *
    (s.signal?.some((c) => cueSet.has(c)) ? 4 : 1) *
    (s.parts?.some((id) => partIds.has(id)) ? 2 : 1));

  // 3. Repent — always some shamanism (the irony), always something about money.
  const pool = REPENT_ITEMS.filter((it) =>
    (CONFIG.includeHeavy || !it.heavy) && (!it.when || (it.when === 'cheap' && cheap)));
  const must = [
    ...weightedSample(rng, pool.filter((i) => i.cat === 'shamanTraditional'), 2, (i) => i.weight),
    ...weightedSample(rng, pool.filter((i) => i.cat === 'shamanModern'), 2, (i) => i.weight),
    ...weightedSample(rng, pool.filter((i) => i.cat === 'money'), 1, (i) => i.weight),
  ];
  const rest = weightedSample(rng, pool.filter((i) => !must.includes(i)),
    Math.max(0, (R.repentCount[flow] ?? 6) - must.length), (i) => i.weight);
  const repent = rng.shuffle([...must, ...rest]).map((it) => {
    const t = rng.pick(REPENT_TEMPLATES);
    return { ...it, line: { ko: fill(t.ko, { x: it.ko }), en: t.en.replace('{x}', it.en) } };
  });

  return {
    serviceId, flow, seed,
    date: new Date(),
    parts,
    spirits,
    repent,
    // the upsell: cheap reading always "finds" more than it can show
    hidden: cheap ? rng.int(7, 14) : rng.int(2, 5),
  };
}

export { BODY_PARTS };
