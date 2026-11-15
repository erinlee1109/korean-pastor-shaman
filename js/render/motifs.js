// ─────────────────────────────────────────────────────────────
// Obangsaek Pentecost motifs (canvas board 01): gold rays, tongue of fire,
// the five-colour stripe, colour chips (靑 赤 黃 白 黑).
// Pure SVG/HTML strings; colours come from theme tokens where possible.
// ─────────────────────────────────────────────────────────────

export const OBANG = [
  { key: 'blue', hex: '#1F3A8A', han: '靑', ink: '#FFFFFF' },
  { key: 'red', hex: '#C8102E', han: '赤', ink: '#FFFFFF' },
  { key: 'yellow', hex: '#F2B705', han: '黃', ink: '#141414' },
  { key: 'white', hex: '#FFFFFF', han: '白', ink: '#141414' },
  { key: 'black', hex: '#141414', han: '黑', ink: '#F2B705' },
];

/** 12 gold rays. size in px; inner = where rays start (0..1 of radius). */
export function rays({ size = 260, n = 12, inner = 0.3, color = 'var(--gold, #C9A24B)', width = 6, cls = '' } = {}) {
  const r = 130, len = r * (1 - inner);
  const bars = Array.from({ length: n }, (_, i) =>
    `<rect x="${-width / 2}" y="${-r}" width="${width}" height="${len}" transform="rotate(${(360 / n) * i})"/>`).join('');
  return `<svg class="rays ${cls}" aria-hidden="true" width="${size}" height="${size}" viewBox="-130 -130 260 260"><g fill="${color}">${bars}</g></svg>`;
}

/** Tongue of fire (red flame, yellow core). */
export function flame({ size = 80, cls = '' } = {}) {
  return `<svg class="flame ${cls}" aria-hidden="true" width="${size}" height="${size * 1.2}" viewBox="0 0 100 120">
    <path d="M50 5 C 68 35, 85 50, 74 82 C 66 104, 34 104, 26 82 C 16 56, 40 42, 50 5 Z" fill="#C8102E"/>
    <path d="M50 45 C 58 60, 66 70, 60 86 C 56 96, 44 96, 40 86 C 36 74, 46 66, 50 45 Z" fill="#F2B705"/>
  </svg>`;
}

/** Thin five-colour band. */
export function stripe({ height = 6, cls = '' } = {}) {
  return `<div class="obang-stripe ${cls}" style="height:${height}px" aria-hidden="true">${OBANG.map((c) =>
    `<i style="background:${c.hex}${c.key === 'white' ? ';box-shadow:inset 0 0 0 1px #14141422' : ''}"></i>`).join('')}</div>`;
}

/** Square chip with a Hanja colour character. */
export const chip = (i) => {
  const c = OBANG[i % OBANG.length];
  return `<span class="obang-chip" style="background:${c.hex};color:${c.ink}" aria-hidden="true">${c.han}</span>`;
};

/** Progress made of five colour segments that fill in order 靑→赤→黃→白→黑. */
export function progressBar() {
  return `<div class="obang-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">${OBANG.map((c) =>
    `<span><i style="background:${c.hex}"></i></span>`).join('')}</div>`;
}
export function setProgress(el, p) {
  const segs = el.querySelectorAll('i');
  segs.forEach((s, k) => { s.style.width = `${Math.max(0, Math.min(1, p * segs.length - k)) * 100}%`; });
  el.setAttribute('aria-valuenow', Math.round(p * 100));
}

/** "Press & hold" picture for the touch screen: laptop keys, the touchpad
 *  below them, and a finger pressing into it with rings pulsing out.
 *  Pen-line style; colours from CSS (.press-hint in app.css). */
export function pressHint({ cls = '' } = {}) {
  const keys = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) {
    keys.push(`<rect x="${26.5 + c * 17}" y="${16 + r * 12}" width="14" height="9" rx="1.5"/>`);
  }
  keys.push('<rect x="77.5" y="52" width="65" height="6" rx="1.5"/>'); // space bar
  return `<svg class="press-hint ${cls}" aria-hidden="true" viewBox="0 0 220 170">
    <g class="ph-keys">${keys.join('')}</g>
    <rect class="ph-pad" x="66" y="68" width="88" height="62" rx="7"/>
    <g class="ph-rings"><circle cx="110" cy="99" r="8"/><circle cx="110" cy="99" r="8"/></g>
    <g class="ph-hand">
      <path d="M103 170 L103 104 C103 94 117 94 117 104 L117 134
               C117 127 129 127 129 135 C129 129 141 129 141 137
               C141 132 152 133 152 141 L152 170"/>
      <path d="M103 142 C95 134 85 137 88 146 C91 154 99 160 103 170"/>
      <path class="ph-nail" d="M106 103 C106 99 114 99 114 103"/>
    </g>
  </svg>`;
}
