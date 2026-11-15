// ─────────────────────────────────────────────────────────────
// 영 목록 — names of the spirits "found" (like the numbered 영 진단 sheet).
//   parts : body parts where this spirit is likely to be "seen"
//   signal: optional sensor cue that makes it more likely
//           camera → blendshape keys (see config.faceCues)
//           touch  → 'light' | 'heavy' | 'shaky' | 'steady' | 'short' | 'long'
// ─────────────────────────────────────────────────────────────

export const SPIRITS = [
  { ko: '음란의 영', en: 'Spirit of lust', parts: ['waist', 'chest', 'face-neck'], signal: ['heavy', 'mouthOpen'] },
  { ko: '교만의 영', en: 'Spirit of pride', parts: ['head-front', 'face-neck'], signal: ['smile', 'squint'] },
  { ko: '혈기의 영', en: 'Spirit of rage', parts: ['heart-bowl', 'head-front'], signal: ['frown', 'heavy'] },
  { ko: '거짓의 영', en: 'Spirit of lies', parts: ['face-neck', 'head-side'], signal: ['eyeDart'] },
  { ko: '탐심의 영', en: 'Spirit of greed', parts: ['chest', 'heart-bowl'] },
  { ko: '시기와 질투의 영', en: 'Spirit of envy', parts: ['heart-bowl', 'head-side'] },
  { ko: '게으름의 영', en: 'Spirit of sloth', parts: ['feet', 'back'], signal: ['light', 'short'] },
  { ko: '술의 영', en: 'Spirit of drink', parts: ['face-neck', 'chest'] },
  { ko: '우울의 영', en: 'Spirit of gloom', parts: ['head-back', 'spirit-bowl'], signal: ['frown', 'light'] },
  { ko: '두려움의 영', en: 'Spirit of fear', parts: ['back', 'feet'], signal: ['shaky', 'eyeWide'] },
  { ko: '근심의 영', en: 'Spirit of worry', parts: ['head-front', 'spirit-bowl'], signal: ['browRaise'] },
  { ko: '의심의 영', en: 'Spirit of doubt', parts: ['head-front', 'head-side'], signal: ['squint'] },
  { ko: '미혹의 영', en: 'Spirit of deception', parts: ['head-side', 'face-neck'] },
  { ko: '분열의 영', en: 'Spirit of division', parts: ['back', 'waist'] },
  { ko: '무당의 영', en: 'Spirit of the mudang', parts: ['head-back', 'heart-bowl'], weight: 2 },
  { ko: '점술의 영', en: 'Spirit of divination', parts: ['head-front'] },
  { ko: '조상신의 영', en: 'Ancestral spirit', parts: ['back', 'head-back'], weight: 2 },
  { ko: '우상의 영', en: 'Spirit of idols', parts: ['chest', 'face-neck'] },
  { ko: '질병의 영', en: 'Spirit of sickness', parts: ['chest', 'waist'] },
  { ko: '가계에 흐르는 저주', en: 'Generational curse', parts: ['heart-bowl', 'back'] },
  { ko: '불순종의 영', en: 'Spirit of disobedience', parts: ['feet', 'head-side'], signal: ['steady'] },
  { ko: '비교의 영', en: 'Spirit of comparison', parts: ['head-side', 'heart-bowl'] },
  { ko: '스마트폰의 영', en: 'Spirit of the smartphone', parts: ['head-front', 'face-neck'] },
  { ko: '외로움의 영', en: 'Spirit of loneliness', parts: ['spirit-bowl', 'back'] },
  { ko: '수치의 영', en: 'Spirit of shame', parts: ['face-neck', 'waist'] },
  { ko: '태중에서 들어온 영', en: 'Spirit that entered in the womb', parts: ['chest', 'waist'] },
];
