// ─────────────────────────────────────────────────────────────
// Bilingual text. Every entry is {en, ko}. The primary language (CONFIG.lang,
// or ?lang=ko in the URL) renders large; the other renders small underneath.
// Missing translations are tagged data-missing="ko|en" and warned in the
// console, so tools/check-i18n can find them.
// ─────────────────────────────────────────────────────────────
import { CONFIG } from '../config.js?v=ecee5c41b3';

let lang = new URLSearchParams(location.search).get('lang') || CONFIG.lang;
export const getLang = () => lang;
export const otherLang = () => (lang === 'ko' ? 'en' : 'ko');

const fillVars = (s, vars) => (s ?? '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const br = (s) => s.replace(/\n/g, '<br>');

function missing(entry, which) {
  console.warn(`[i18n] missing "${which}" for`, entry);
  return `<span data-missing="${which}">⚠ ${which}</span>`;
}

/**
 * t(entry) → '<span class="t-main">…</span><span class="t-sub">…</span>'
 * opts.tag : wrapper tag for each line (default 'span', use 'small' inline)
 * opts.inline : put the secondary on the same line
 */
export function t(entry, vars = {}, opts = {}) {
  if (entry == null) return '';
  if (typeof entry === 'string') return missing(entry, otherLang()) + entry;
  const o = otherLang();
  const main = entry[lang] != null ? br(fillVars(entry[lang], vars)) : missing(entry, lang);
  if (!CONFIG.bilingual) return main;
  const sub = entry[o] != null ? br(fillVars(entry[o], vars)) : missing(entry, o);
  const cls = opts.inline ? 't-inline' : '';
  return `<span class="t-main ${cls}">${main}</span><span class="t-sub ${cls}" lang="${o}">${sub}</span>`;
}

/** Plain string in the primary language (for aria labels, titles). */
export const plain = (entry, vars = {}) => fillVars(entry?.[lang] ?? entry?.en ?? '', vars);

/** Zip parallel {en:[…], ko:[…]} lists into bilingual entries. */
export const zipLists = (lists) => (lists?.en || []).map((en, i) => ({ en, ko: lists.ko?.[i] }));

/** ₩500,000 with the Korean word (오십만원) as the secondary line. */
export function priceEntry(n, wonWords) {
  const num = `₩${n.toLocaleString('en-US')}`;
  return { en: num, ko: wonWords(n) };
}

/** Bilingual date entry for t(): { en: 'November 8, 2026', ko: '2026년 11월 8일' } */
export const dateEntry = (d) => {
  const o = { year: 'numeric', month: 'long', day: 'numeric' };
  return { en: d.toLocaleDateString('en-US', o), ko: d.toLocaleDateString('ko-KR', o) };
};
