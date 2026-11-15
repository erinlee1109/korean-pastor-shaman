// Korean helpers.

/** true if the last Hangul syllable has a final consonant (받침). */
export function hasBatchim(word) {
  const ch = word.trim().slice(-1);
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}

/** Attach the right particle: josa('굿', '을/를') → '굿을' */
export function josa(word, pair = '을/를') {
  const [withB, withoutB] = pair.split('/');
  return word + (hasBatchim(word) ? withB : withoutB);
}

/** Simple template fill: fill('{x}을/를 회개하십시오', {x:'점'}) handles josa after {x}. */
export function fill(template, vars) {
  return template.replace(/\{(\w+)\}(을\/를|이\/가|은\/는|과\/와|으로\/로)?/g, (_, k, pair) => {
    const v = vars[k] ?? '';
    return pair ? josa(v, pair) : v;
  });
}

const DIGITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
/** 500000 → '오십만원', 1800000 → '백팔십만원' (만 units only, art-piece prices). */
export function wonWords(n) {
  const man = Math.floor(n / 10000);
  const part = (x) => {
    const units = [['천', 1000], ['백', 100], ['십', 10], ['', 1]];
    let s = '';
    for (const [u, v] of units) {
      const d = Math.floor(x / v) % 10;
      if (!d) continue;
      s += (d === 1 && u ? '' : DIGITS[d]) + u;
    }
    return s;
  };
  return (man ? part(man) + '만' : '') + '원';
}
