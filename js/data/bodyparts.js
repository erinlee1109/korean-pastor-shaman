// ─────────────────────────────────────────────────────────────
// Body-part registry. Edit drawings here; everything else reads from it.
//
// Each part:
//   id, label {ko,en}, viewBox
//   outline   : [svg path d]       — the figure, drawn in "pen"
//   decor     : [{d, kind}]        — extra marks (kind: 'hatch' fills with hatch pattern)
//   channels  : [{d, r?, pitch?}]  — where coils can run. ABSOLUTE M/L/C/Q/Z ONLY.
//   knots     : [[x,y]]            — where spirits nest
//   meter     : {top, bottom, clip}— optional gauge fill (the 34~5% bowls)
//   notes     : [{ko,en}]          — handwritten observations that may appear
//   service   : 'camera' | 'touch' — which ritual can produce it
//
// Tip: open assets.html to see every part with spirits while you edit.
// ─────────────────────────────────────────────────────────────

const HEAD_FRONT_OUTLINE = 'M50 88 C50 26 150 26 150 88 C150 160 130 214 100 214 C70 214 50 160 50 88 Z';
const HEART_BOWL = 'M25 45 L175 45 C175 120 145 160 100 160 C55 160 25 120 25 45 Z';
const SPIRIT_BOWL = 'M25 40 L175 40 C175 112 148 148 100 148 C52 148 25 112 25 40 Z';
const GOBLET = 'M40 30 L160 30 C160 110 140 148 116 158 L113 198 C126 203 142 209 147 224 L53 224 C58 209 74 203 87 198 L84 158 C60 148 40 110 40 30 Z';

/** Mirror an absolute "x y" path left↔right inside a viewBox of width w. */
const mirrorX = (d, w = 200) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${w - x} ${y}`);
const HAND_L = 'M40 210 L38 142 C30 132 24 120 24 104 L24 62 C24 51 37 51 37 62 L37 98 L39 50 C39 39 52 39 52 50 L52 96 L54 42 C54 31 67 31 67 42 L67 96 L69 50 C69 40 81 40 81 50 L81 112 C86 102 95 96 99 103 C102 110 92 124 87 138 C83 150 82 160 82 172 L82 210';
const LEG_L = 'M48 14 L96 14 L93 106 C91 120 89 128 89 140 L86 206 L62 206 C62 172 58 142 56 122 C50 92 46 52 48 14 Z';

export const BODY_PARTS = [
  {
    id: 'head-front',
    label: { ko: '머리', en: 'Head' },
    service: 'camera',
    viewBox: '0 0 200 240',
    outline: [
      HEAD_FRONT_OUTLINE,
      'M50 104 C37 100 37 136 52 138',
      'M150 104 C163 100 163 136 148 138',
      'M82 210 L80 238 M118 210 L120 238',
    ],
    channels: [
      { d: 'M40 70 C70 50 130 50 160 70' },              // crown band
      { d: 'M100 52 L100 172' },                         // centre line
      { d: 'M58 150 C74 202 126 202 142 150' },          // jaw
      { d: 'M60 104 C84 94 116 94 140 104', r: 4.5 },    // brow
    ],
    knots: [[64, 64], [136, 64], [100, 112], [100, 180], [72, 104], [128, 104]],
    // face-landmark → head mapping (normalised 0..1 inside face box → viewBox)
    faceBox: { x: 56, y: 40, w: 88, h: 170 },
    notes: [
      { ko: '정수리에 눌림이 있음', en: 'pressure at the crown' },
      { ko: '미간에 묶인 것이 보임', en: 'something bound between the brows' },
      { ko: '생각이 엉켜 있음', en: 'the thoughts are tangled' },
      { ko: '이마에 무거움이 있음', en: 'a heaviness across the forehead' },
      { ko: '눈이 흐려져 있음', en: 'the eyes are clouded' },
      { ko: '기도할 때 생각이 흩어짐', en: 'the mind scatters in prayer' },
    ],
  },
  {
    id: 'head-back',
    label: { ko: '뒷머리', en: 'Back of head' },
    service: 'camera',
    viewBox: '0 0 200 240',
    outline: [
      'M100 22 C145 22 168 58 168 102 C168 145 140 178 100 178 C60 178 32 145 32 102 C32 58 55 22 100 22 Z',
      'M78 172 L76 234 M122 172 L124 234',
    ],
    channels: [
      { d: 'M28 80 C70 68 130 68 172 80' },
      { d: 'M28 126 C70 138 130 138 172 126' },
      { d: 'M58 34 C90 70 120 140 140 176' },
      { d: 'M146 40 C126 90 86 150 60 170' },
      { d: 'M72 204 C90 212 110 212 128 204', r: 4 },
    ],
    knots: [[54, 76], [146, 78], [100, 130], [70, 158], [134, 152]],
    notes: [
      { ko: '뒤에서 따라오는 영이 있음', en: 'a spirit follows from behind' },
      { ko: '지난 기억이 묶여 있음', en: 'old memories are tied here' },
      { ko: '목덜미가 굳어 있음', en: 'the nape is stiff' },
      { ko: '뒤에서 속삭이는 것이 있음', en: 'something whispers from behind' },
      { ko: '아버지 쪽에서 내려온 것', en: 'came down the father\'s line' },
    ],
  },
  {
    id: 'head-side',
    label: { ko: '옆머리', en: 'Side of head' },
    service: 'camera',
    viewBox: '0 0 200 240',
    outline: [
      'M120 24 C166 30 176 80 168 120 C162 160 146 182 142 232',
      'M86 232 C88 206 80 196 70 193 C60 190 56 181 59 171 C53 167 53 161 57 157 C51 151 51 146 56 141 C46 137 41 131 46 125 L53 113 C48 90 56 40 120 24',
      'M118 100 C132 92 138 114 124 124',
    ],
    channels: [
      { d: 'M52 64 C90 42 142 50 172 82' },
      { d: 'M124 116 C142 146 146 184 144 228' },
      { d: 'M58 122 C80 128 100 114 118 108', r: 4 },
    ],
    knots: [[122, 110], [82, 52], [150, 160]],
    notes: [
      { ko: '귀로 들어오는 소리에 매여 있음', en: 'bound to what enters the ears' },
      { ko: '말씀보다 세상 소리를 들음', en: 'hears the world more than the Word' },
      { ko: '잠이 얕고 꿈이 많음', en: 'sleep is shallow, dreams are many' },
    ],
  },
  {
    id: 'heart-bowl',
    label: { ko: '심장(피)', en: 'Heart (blood)' },
    service: 'touch',
    viewBox: '0 0 200 180',
    outline: [HEART_BOWL],
    meter: { top: 45, bottom: 160, clip: HEART_BOWL },
    channels: [{ d: 'M30 52 C70 60 130 60 170 52', r: 4 }],
    knots: [[100, 100]],
    notes: [
      { ko: '피가 탁하고 부족함', en: 'the blood is thin and clouded' },
      { ko: '마음이 차가움', en: 'the heart has gone cold' },
      { ko: '바닥에 원망이 가라앉아 있음', en: 'resentment has settled at the bottom' },
      { ko: '그릇에 금이 가 있음', en: 'the bowl is cracked' },
      { ko: '채워도 금방 새어 나감', en: 'it leaks as soon as it is filled' },
    ],
  },
  {
    id: 'spirit-bowl',
    label: { ko: '심령', en: 'Spirit' },
    service: 'touch',
    viewBox: '0 0 200 180',
    outline: [SPIRIT_BOWL, 'M80 148 L78 170 L122 170 L120 148'],
    meter: { top: 40, bottom: 148, clip: SPIRIT_BOWL },
    channels: [{ d: 'M30 48 C70 56 130 56 170 48', r: 4 }],
    knots: [[100, 96]],
    notes: [
      { ko: '심령이 반도 차지 않음', en: 'the spirit is not even half full' },
      { ko: '은혜가 말라 가고 있음', en: 'grace is drying up' },
      { ko: '세상 것으로 차 있음', en: 'filled with the world instead' },
      { ko: '새벽기도가 필요함', en: 'dawn prayer is needed' },
      { ko: '한때는 가득 찼었음', en: 'it was full once, long ago' },
    ],
  },
  {
    id: 'face-neck',
    label: { ko: '얼굴·목', en: 'Face · Neck' },
    service: 'touch',
    viewBox: '0 0 200 240',
    outline: [GOBLET],
    decor: [{ d: 'M44 30 L156 30 L156 42 L44 42 Z', kind: 'hatch' }],
    channels: [
      { d: 'M56 70 C70 60 86 60 96 72', r: 4 },
      { d: 'M104 72 C114 60 130 60 144 70', r: 4 },
      { d: 'M100 76 L100 114', r: 3.5 },
      { d: 'M68 126 C84 138 116 138 132 126', r: 4 },
      { d: 'M52 92 C58 108 62 120 70 128', r: 3.5 },
      { d: 'M148 92 C142 108 138 120 130 128', r: 3.5 },
      { d: 'M100 150 L100 216', r: 4.5 },
    ],
    knots: [[74, 66], [126, 66], [100, 130], [100, 206]],
    notes: [
      { ko: '입술에 거짓이 맺혀 있음', en: 'falsehood gathers on the lips' },
      { ko: '목이 막혀 있음', en: 'the throat is blocked' },
      { ko: '찬양이 나오지 않음', en: 'praise will not come out' },
      { ko: '얼굴이 마음을 가리고 있음', en: 'the face hides the heart' },
      { ko: '남을 찌르는 말이 맺힘', en: 'words that wound gather here' },
    ],
  },
  {
    id: 'back',
    label: { ko: '등', en: 'Back' },
    service: 'touch',
    viewBox: '0 0 200 220',
    outline: ['M86 18 L86 48 L22 54 L22 72 L56 70 L62 206 L138 206 L144 70 L178 72 L178 54 L114 48 L114 18'],
    decor: [
      { d: 'M24 54 L56 52 L56 60 L24 62 Z', kind: 'hatch' },
      { d: 'M144 52 L176 54 L176 62 L144 60 Z', kind: 'hatch' },
    ],
    channels: [
      { d: 'M40 62 C80 100 118 150 132 200' },
      { d: 'M160 62 C120 100 82 150 68 200' },
      { d: 'M28 64 L172 64', r: 4.5 },
      { d: 'M64 196 C88 204 112 204 136 196', r: 4 },
    ],
    knots: [[100, 46], [70, 96], [130, 96], [100, 128]],
    notes: [
      { ko: '등에 짐을 지고 있음', en: 'carrying a load on the back' },
      { ko: '집안의 짐에 눌려 있음', en: 'pressed down by a family burden' },
      { ko: '어깨 사이에 붙어 있는 것이 있음', en: 'something clings between the shoulders' },
      { ko: '하나님 앞에 똑바로 서지 못함', en: 'cannot stand straight before God' },
    ],
  },
  {
    id: 'waist',
    label: { ko: '허리', en: 'Waist' },
    service: 'touch',
    viewBox: '0 0 200 220',
    outline: ['M50 20 L150 20 C148 80 130 110 125 150 C135 165 135 200 115 210 L100 190 L85 210 C65 200 65 165 75 150 C70 110 52 80 50 20 Z'],
    channels: [
      { d: 'M56 30 C90 80 114 140 120 200' },
      { d: 'M144 30 C110 80 86 140 80 200' },
      { d: 'M52 34 L148 34', r: 4.5 },
    ],
    knots: [[80, 40], [120, 40], [100, 106]],
    notes: [
      { ko: '허리가 묶여 굽어 있음', en: 'the waist is bound and bent' },
      { ko: '가계의 저주에 묶여 있음', en: 'tied by a generational curse' },
      { ko: '힘이 빠져 있음', en: 'the strength has drained away' },
      { ko: '정욕이 감겨 있음', en: 'desire is coiled here' },
    ],
  },
  {
    id: 'chest',
    label: { ko: '가슴·배', en: 'Chest · Belly' },
    service: 'touch',
    viewBox: '0 0 200 220',
    outline: ['M70 18 C70 38 42 44 30 60 L36 204 L164 204 L170 60 C158 44 130 38 130 18'],
    channels: [
      { d: 'M44 90 C80 78 120 78 156 90' },
      { d: 'M100 48 L100 196' },
      { d: 'M60 150 C80 172 120 172 140 150' },
    ],
    knots: [[74, 92], [126, 92], [100, 160]],
    notes: [
      { ko: '태중에서부터 들어온 영', en: 'a spirit that entered in the womb' },
      { ko: '예배 때 숨이 막힘', en: 'breath fails in worship' },
      { ko: '배 속에 분이 쌓여 있음', en: 'anger is stored in the belly' },
      { ko: '어릴 때부터의 외로움', en: 'a loneliness since childhood' },
      { ko: '태중에서 어머니의 슬픔이 전해짐', en: 'the mother\'s grief passed on in the womb' },
    ],
  },
  {
    id: 'hands',
    label: { ko: '손', en: 'Hands' },
    service: 'touch',
    viewBox: '0 0 200 220',
    outline: [HAND_L, mirrorX(HAND_L)],
    channels: [
      { d: 'M28 118 C46 130 66 130 82 122', r: 4 },
      { d: mirrorX('M28 118 C46 130 66 130 82 122'), r: 4 },
      { d: 'M60 40 L60 196', r: 3.5 },
      { d: mirrorX('M60 40 L60 196'), r: 3.5 },
      { d: 'M40 196 L82 196', r: 3.5 },
    ],
    knots: [[56, 136], [144, 136], [60, 44], [140, 44]],
    notes: [
      { ko: '손바닥의 줄이 엉켜 있음', en: 'the lines of the palm are tangled' },
      { ko: '손을 꽉 쥐고 놓지 못함', en: 'the hands clench and will not let go' },
      { ko: '부정한 것을 만진 손', en: 'hands that have touched what is unclean' },
      { ko: '손끝이 차가움', en: 'the fingertips are cold' },
    ],
  },
  {
    id: 'legs',
    label: { ko: '다리·무릎', en: 'Legs · Knees' },
    service: 'touch',
    viewBox: '0 0 200 220',
    outline: [LEG_L, mirrorX(LEG_L)],
    channels: [
      { d: 'M72 20 C70 80 74 140 74 200', r: 4.5 },
      { d: mirrorX('M72 20 C70 80 74 140 74 200'), r: 4.5 },
      { d: 'M54 118 L92 118', r: 3.5 },
      { d: mirrorX('M54 118 L92 118'), r: 3.5 },
    ],
    knots: [[72, 118], [128, 118], [72, 40], [128, 40]],
    notes: [
      { ko: '기도할 때 무릎이 꿇어지지 않음', en: 'the knees will not bend in prayer' },
      { ko: '엉뚱한 곳으로 다니는 다리', en: 'legs that wander to the wrong places' },
      { ko: '무릎에 힘이 없음', en: 'there is no strength in the knees' },
    ],
  },
  {
    id: 'feet',
    label: { ko: '발', en: 'Feet' },
    service: 'touch',
    viewBox: '0 0 200 220',
    outline: [
      'M66 30 C44 30 40 76 45 116 C48 158 55 198 75 203 C92 203 95 172 92 136 C90 96 92 30 66 30 Z',
      'M134 30 C156 30 160 76 155 116 C152 158 145 198 125 203 C108 203 105 172 108 136 C110 96 108 30 134 30 Z',
    ],
    channels: [
      { d: 'M44 184 C58 200 84 200 96 184', r: 4 },
      { d: 'M104 184 C116 200 142 200 156 184', r: 4 },
      { d: 'M66 40 C62 90 70 140 72 180', r: 3.5 },
    ],
    knots: [[70, 192], [130, 192]],
    notes: [
      { ko: '두리번거리며 조금씩 앞으로 나아가는 모습', en: 'looking around, inching forward' },
      { ko: '세상을 향해 걷고 있음', en: 'walking toward the world' },
      { ko: '예배 가는 발이 무거움', en: 'the feet are heavy on the way to worship' },
      { ko: '가다가 되돌아섬', en: 'turns back halfway' },
    ],
  },
];

export const PART_BY_ID = Object.fromEntries(BODY_PARTS.map((p) => [p.id, p]));
export const partsFor = (service) => BODY_PARTS.filter((p) => p.service === service);
