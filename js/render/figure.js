// ─────────────────────────────────────────────────────────────
// Renders a body part (from bodyparts.js) with spirits on it.
// Output is an SVG string; colours come from CSS (css/figure.css + theme).
// ─────────────────────────────────────────────────────────────
import { makeRng, hashString, clamp } from '../lib/rng.js?v=ecee5c41b3';
import { coil, knot, curls, samplePath } from './spirits.js?v=ecee5c41b3';

let _uid = 0;

/**
 * @param {object} part           entry from BODY_PARTS
 * @param {object} o
 * @param {number} o.seed         reproducible randomness
 * @param {number} o.intensity    0..1 — how possessed (channels, loop size, knots)
 * @param {number} [o.meter]      0..1 fill level for parts with a meter
 * @param {string} [o.meterText]  e.g. "34~5%"
 * @param {Array}  [o.extraKnots] [[x,y]] in part coords (e.g. from face landmarks)
 * @param {boolean}[o.pen]        hand-drawn wobble filter on outlines
 * @param {boolean}[o.animate]    adds pathLength + classes for draw-on animation
 */
export function renderPart(part, o = {}) {
  const seed = o.seed ?? 1;
  const intensity = clamp(o.intensity ?? 0.6);
  const rng = makeRng((seed * 7919) ^ hashString(part.id));
  const uid = `bp${++_uid}`;
  const anim = o.animate ? ' pathLength="1"' : '';

  // — spirits —
  // Every sheet should look hand-drawn for *this* person: per-render loop size,
  // tightness and swing, partial channels, and knots that drift off their anchors.
  const style = { r: rng.range(0.75, 1.35), pitch: rng.range(0.7, 1.4), lean: rng.range(0.6, 1.4) };
  const nCh = Math.max(1, Math.round(intensity * part.channels.length));
  const chans = rng.sample(part.channels, nCh);
  const coils = chans.map((c, i) => {
    const from = rng.chance(0.35) ? rng.range(0, 0.35) : 0;
    const to = rng.chance(0.35) ? rng.range(0.65, 1) : 1;
    return coil(c.d, {
      radius: (c.r ?? 6) * (0.7 + intensity * 0.6) * style.r,
      pitch: (c.pitch ?? 7.5) * style.pitch,
      lean: style.lean,
      from, to,
    }, seed * 31 + i * 7 + hashString(part.id));
  });

  const nK = Math.max(1, Math.round(intensity * part.knots.length));
  const jitter = ([x, y]) => [x + rng.range(-7, 7), y + rng.range(-7, 7)];
  // 0–2 extra knots dropped somewhere along a drawn channel
  const strays = Array.from({ length: rng.int(0, 2) }, () => {
    const pts = samplePath(rng.pick(chans).d, 4);
    return pts[Math.floor(rng.range(0.15, 0.85) * pts.length)];
  }).filter(Boolean);
  const knotPts = rng.sample(part.knots, nK).map(jitter).concat(strays, o.extraKnots || []);
  const knots = knotPts.map(([x, y], i) => {
    const size = 5 + intensity * 4 + rng.range(-1, 1.5);
    return { d: knot(x, y, size, seed + i * 13), curls: rng.chance(0.6) ? curls(x, y, size, seed + i) : [], x, y, size };
  });

  // — meter —
  let meterSvg = '';
  if (part.meter && o.meter != null) {
    const { top, bottom, clip } = part.meter;
    const y = bottom - (bottom - top) * clamp(o.meter);
    meterSvg = `
      <clipPath id="${uid}-clip"><path d="${clip}"/></clipPath>
      <g clip-path="url(#${uid}-clip)">
        <rect class="bp-meter" x="0" y="${y}" width="400" height="${bottom - y + 2}" fill="url(#${uid}-hatch)"/>
        <path class="bp-meter-line" d="M0 ${y} L400 ${y}"/>
      </g>
      ${o.meterText ? `<text class="bp-meter-text" x="${parseFloat(part.viewBox.split(' ')[2]) - 34}" y="${y - 5}" text-anchor="end">${o.meterText}</text>` : ''}`;
  }

  const decor = (part.decor || []).map((dc) =>
    `<path class="bp-decor ${dc.kind || ''}" d="${dc.d}" ${dc.kind === 'hatch' ? `fill="url(#${uid}-hatch)"` : ''}/>`).join('');

  return `
<svg class="bp-svg" data-part="${part.id}" viewBox="${part.viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${part.label.ko}">
  <defs>
    <pattern id="${uid}-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line class="bp-hatch-line" x1="0" y1="0" x2="0" y2="5"/>
    </pattern>
    <filter id="${uid}-pen" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="${seed % 97}"/>
      <feDisplacementMap in="SourceGraphic" scale="1.6"/>
    </filter>
  </defs>
  <g class="bp-figure" ${o.pen ? `filter="url(#${uid}-pen)"` : ''}>
    ${meterSvg}
    ${decor}
    ${part.outline.map((d) => `<path class="bp-outline" d="${d}"/>`).join('')}
  </g>
  <g class="bp-spirits">
    ${coils.map((d, i) => `<path class="bp-coil" style="--i:${i}" d="${d}"${anim}/>`).join('')}
    ${knots.map((k, i) => `
      <g class="bp-knot-g" style="--i:${i}">
        <circle class="bp-knot-core" cx="${k.x}" cy="${k.y}" r="${(k.size * 0.4).toFixed(1)}"/>
        <path class="bp-knot" d="${k.d}"${anim}/>
        ${k.curls.map((c) => `<path class="bp-curl" d="${c}"${anim}/>`).join('')}
      </g>`).join('')}
  </g>
</svg>`;
}

/** Card wrapper: label + figure + optional handwritten note. */
export function renderPartCard(part, o = {}) {
  const lang = o.lang || 'en';
  const other = lang === 'ko' ? 'en' : 'ko';
  const note = o.note
    ? `<p class="bp-note"><span class="bp-note-main">${o.note[lang]}</span><span class="bp-note-sub" lang="${other}">${o.note[other]}</span></p>`
    : '';
  return `
<figure class="bp-card" data-part="${part.id}">
  <figcaption class="bp-label">${part.label[lang]} <span class="bp-label-sub" lang="${other}">${part.label[other]}</span></figcaption>
  ${renderPart(part, o)}
  ${note}
</figure>`;
}
