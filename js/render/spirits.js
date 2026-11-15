// ─────────────────────────────────────────────────────────────
// Evil-spirit generator.
// Two hand-drawn marks:
//   • coil  — a looping "telephone cord" line that runs along a channel
//   • knot  — a dense scribbled ball, where spirits "nest"
// Pure functions → SVG path strings. No DOM needed (works in node too).
// ─────────────────────────────────────────────────────────────
import { makeRng } from '../lib/rng.js?v=ecee5c41b3';

const TAU = Math.PI * 2;

// ── Minimal path sampler ─────────────────────────────────────
// Channels in bodyparts.js use ABSOLUTE commands only: M L C Q Z.
export function parsePath(d) {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
  const segs = [];
  let i = 0, cmd = null, cur = [0, 0], start = [0, 0];
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLCQZ]/i.test(tokens[i])) cmd = tokens[i++].toUpperCase();
    if (cmd === 'M') { cur = [num(), num()]; start = cur; cmd = 'L'; segs.push({ type: 'M', p: cur }); }
    else if (cmd === 'L') { const p = [num(), num()]; segs.push({ type: 'L', a: cur, p }); cur = p; }
    else if (cmd === 'C') { const c1 = [num(), num()], c2 = [num(), num()], p = [num(), num()]; segs.push({ type: 'C', a: cur, c1, c2, p }); cur = p; }
    else if (cmd === 'Q') { const c = [num(), num()], p = [num(), num()]; segs.push({ type: 'Q', a: cur, c, p }); cur = p; }
    else if (cmd === 'Z') { segs.push({ type: 'L', a: cur, p: start }); cur = start; cmd = null; }
    else i++;
  }
  return segs;
}

function pointOnSeg(s, t) {
  const u = 1 - t;
  if (s.type === 'L') return [s.a[0] * u + s.p[0] * t, s.a[1] * u + s.p[1] * t];
  if (s.type === 'Q') return [
    u * u * s.a[0] + 2 * u * t * s.c[0] + t * t * s.p[0],
    u * u * s.a[1] + 2 * u * t * s.c[1] + t * t * s.p[1]];
  return [
    u * u * u * s.a[0] + 3 * u * u * t * s.c1[0] + 3 * u * t * t * s.c2[0] + t * t * t * s.p[0],
    u * u * u * s.a[1] + 3 * u * u * t * s.c1[1] + 3 * u * t * t * s.c2[1] + t * t * t * s.p[1]];
}

/** Sample a path into evenly spaced points (spacing in viewBox units). */
export function samplePath(d, spacing = 0.6) {
  const raw = [];
  for (const s of parsePath(d)) {
    if (s.type === 'M') { raw.push(s.p); continue; }
    for (let k = 1; k <= 40; k++) raw.push(pointOnSeg(s, k / 40));
  }
  // resample to equal arc length
  const out = [raw[0]];
  let carry = 0;
  for (let k = 1; k < raw.length; k++) {
    let [x0, y0] = raw[k - 1];
    const [x1, y1] = raw[k];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (carry + seg >= spacing) {
      const t = (spacing - carry) / seg;
      x0 += (x1 - x0) * t; y0 += (y1 - y0) * t;
      out.push([x0, y0]);
      seg = Math.hypot(x1 - x0, y1 - y0);
      carry = 0;
    }
    carry += seg;
  }
  return out;
}

const fmt = (n) => Math.round(n * 10) / 10;
const toD = (pts) => 'M' + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L');

// ── Coil ─────────────────────────────────────────────────────
export const COIL_DEFAULTS = {
  radius: 6,     // loop size
  pitch: 7.5,    // distance travelled per loop (smaller = tighter coil)
  lean: 1.0,     // how much loops swing along the path (>~0.2 makes real loops)
  wobble: 0.35,  // hand-drawn irregularity 0..1
  taper: 0.25,   // fraction of length that eases in/out at the ends
  from: 0,       // draw only part of the channel: 0..1 start …
  to: 1,         // … and end (lets the same channel look different each time)
};

/** Coil along a channel path `d`. Returns an SVG path `d` string. */
export function coil(d, opts = {}, seed = 1) {
  const o = { ...COIL_DEFAULTS, ...opts };
  const rng = makeRng(seed);
  const all = samplePath(d, 0.5);
  const pts = all.slice(Math.floor(o.from * all.length), Math.ceil(o.to * all.length));
  if (pts.length < 3) return '';
  const phase = rng.range(0, TAU);
  const total = pts.length * 0.5;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
    const nx = -ty, ny = tx;
    const s = i * 0.5;
    const edge = Math.min(s, total - s) / (total * o.taper || 1);
    const ease = Math.min(1, Math.max(0.15, edge));
    const r = o.radius * ease * (1 + o.wobble * (rng.noise1D(s * 0.08) - 0.5) * 2);
    const th = phase + (s / o.pitch) * TAU + o.wobble * (rng.noise1D(50 + s * 0.05) - 0.5);
    out.push([
      pts[i][0] + tx * Math.cos(th) * r * o.lean + nx * Math.sin(th) * r,
      pts[i][1] + ty * Math.cos(th) * r * o.lean + ny * Math.sin(th) * r,
    ]);
  }
  return toD(out);
}

// ── Knot ─────────────────────────────────────────────────────
/** Scribbled ball centred on (cx, cy). Returns an SVG path `d` string. */
export function knot(cx, cy, size = 7, seed = 1, density = 1) {
  const rng = makeRng(seed);
  const turns = Math.round(rng.range(6, 10) * density);
  const steps = 22;
  const pts = [];
  let a = rng.range(0, TAU), ox = 0, oy = 0;
  for (let k = 0; k < turns * steps; k++) {
    a += TAU / steps + rng.range(-0.15, 0.15);
    ox += rng.range(-0.35, 0.35); oy += rng.range(-0.35, 0.35);
    ox *= 0.92; oy *= 0.92; // keep it centred
    const r = size * (0.35 + 0.65 * rng.noise1D(k * 0.07));
    pts.push([cx + ox + Math.cos(a) * r, cy + oy + Math.sin(a) * r * rng.range(0.8, 1)]);
  }
  return toD(pts);
}

/** A few loose curls trailing out of a knot (small "e"-shaped loops). */
export function curls(cx, cy, size = 7, seed = 1) {
  const rng = makeRng(seed + 99);
  const n = rng.int(2, 4);
  const paths = [];
  for (let j = 0; j < n; j++) {
    const ang = rng.range(0, TAU);
    const len = size * rng.range(1.8, 3.2);
    const ex = cx + Math.cos(ang) * len, ey = cy + Math.sin(ang) * len;
    paths.push(coil(`M${cx} ${cy} L${ex} ${ey}`, { radius: size * 0.35, pitch: size * 0.45, taper: 0.5 }, seed + j));
  }
  return paths;
}
