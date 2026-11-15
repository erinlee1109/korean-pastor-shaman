// Seeded randomness so a diagnosis is reproducible from a seed
// (e.g. derived from face geometry or touch pressure), never from an image.

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRng(seed = 1) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    next,
    range: (min, max) => min + (max - min) * next(),
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    // Fisher–Yates; returns a new array
    shuffle: (arr) => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    sample: (arr, n) => rng.shuffle(arr).slice(0, n),
    // cheap 1D value noise for wobble
    noise1D: (() => {
      const table = Array.from({ length: 256 }, next);
      return (x) => {
        const i = Math.floor(x), f = x - i;
        const u = f * f * (3 - 2 * f);
        return table[i & 255] * (1 - u) + table[(i + 1) & 255] * u;
      };
    })(),
  };
  return rng;
}

/** A fresh random 32-bit seed (so two visitors in a row never get the same sheet). */
export const freshSeed = () => (globalThis.crypto?.getRandomValues
  ? crypto.getRandomValues(new Uint32Array(1))[0]
  : (Math.random() * 2 ** 32) >>> 0);

export const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
