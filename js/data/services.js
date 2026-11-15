// ─────────────────────────────────────────────────────────────
// Service menu (first page): a price list of spiritual services.
// Nothing is charged; buttons only *look* like payment.
//   flow     : which ritual screen runs ('camera' | 'touch' | null = unavailable)
//   status   : 'open' | 'soldout' | 'restricted'  (scarcity is part of the con)
// ─────────────────────────────────────────────────────────────

export const SERVICES = [
  {
    id: 'basic',
    flow: 'camera',
    price: 500000,
    name: { ko: '영 진단', en: 'Spirit Diagnosis' },
    blurb: {
      ko: '성령께서 당신의 얼굴을 보시고 머리에 붙은 영들을 드러내십니다.',
      en: 'The Spirit looks upon your face and reveals what clings to your head.',
    },
    includes: { ko: ['머리 진단', '영 목록 10가지', '회개 기도문'], en: ['Head reading', '10 spirits named', 'Prayer of repentance'] },
    status: 'open',
  },
  {
    id: 'premium',
    flow: 'touch',
    price: 1000000,
    badge: { ko: '은혜 충만', en: 'Overflowing grace' },
    name: { ko: '심령 전신 진단', en: 'Full-Body Spirit Diagnosis' },
    blurb: {
      ko: '터치패드 위 손끝에 임하는 성령의 압력으로 영·혼·육 전신을 진단합니다.',
      en: 'Lay your hand on the touchpad: through the pressure of the Spirit on your fingertip, we diagnose spirit, soul and body.',
    },
    blurbPhone: {
      ko: '화면 위 손끝에 임하는 성령의 압력으로 영·혼·육 전신을 진단합니다.',
      en: 'Press the screen with your finger: through the pressure of the Spirit on your fingertip, we diagnose spirit, soul and body.',
    },
    includes: { ko: ['영·혼·육 7부위 진단', '심령 충만도 측정', '깊은 회개', '세력 내보냄'], en: ['7 body regions', 'Spirit fullness gauge', 'Deep repentance', 'Casting out'] },
    status: 'open',
  },
  {
    id: 'couple',
    flow: null,
    price: 1800000,
    name: { ko: '부부 영 진단', en: 'Couples Diagnosis' },
    blurb: { ko: '부부가 함께 받으면 은혜가 배가 됩니다.', en: 'Grace doubles when received together.' },
    status: 'soldout',
  },
  {
    id: 'gift',
    flow: null,
    price: 3000000,
    name: { ko: '은사 접목 (영안 열림)', en: 'Gift Grafting (Opening the Spiritual Eye)' },
    blurb: { ko: '목사·사모·전도사 등 교역자만 가능', en: 'Ordained ministers only' },
    status: 'restricted',
  },
];

// Offered on the result page — "the work is not finished".
export const AFTERCARE = [
// `working` shows while the offering is "received"; `done` is the line on the receipt.
  { id: 'cast', price: 300000, name: { ko: '세력 내보냄', en: 'Casting out' },
    working: { ko: '세력을 내보내는 중…', en: 'Casting out the powers…' },
    done: { ko: '드러난 세력이 떠나가기 시작했습니다.', en: 'What was revealed has begun to leave.' } },
  { id: 'womb', price: 500000, name: { ko: '태아기 치유', en: 'Womb-memory healing' },
    working: { ko: '태중의 기억을 치유하는 중…', en: 'Healing what was carried from the womb…' },
    done: { ko: '태중의 상처에 치유가 시작되었습니다.', en: 'Healing has begun on the wounds of the womb.' } },
  { id: 'thanks', price: 100000, name: { ko: '감사 헌금', en: 'Thanksgiving offering' },
    working: { ko: '감사를 올려드리는 중…', en: 'Lifting up your thanks…' },
    done: { ko: '하나님께서 당신의 감사를 받으셨습니다.', en: 'God has received your thanks.' } },
];
