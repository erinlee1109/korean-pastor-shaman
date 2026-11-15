// ─────────────────────────────────────────────────────────────
// 회개 목록 — the "analysis" text.
// The irony to surface: the ministry condemns shamanism while doing
// shamanism (reading faces, sensing spirits in the body, casting out for a fee).
//
// Each item is a NOUN PHRASE; the sentence is built from TEMPLATES so the
// particle (을/를) is always right. Add / remove freely.
//   weight : how likely it is to be picked (default 1)
//   heavy  : true → only used if config.includeHeavy
//   when   : optional condition key the diagnosis can match (e.g. 'cheap')
// ─────────────────────────────────────────────────────────────

export const REPENT_TEMPLATES = [
  { ko: '{x}을/를 회개하십시오', en: 'Repent of {x}' },
  { ko: '{x}을/를 철저히 회개하십시오', en: 'Repent thoroughly of {x}' },
  { ko: '{x}을/를 눈물로 회개하십시오', en: 'Repent with tears of {x}' },
  { ko: '{x}을/를 끊어내십시오', en: 'Renounce {x}' },
  { ko: '{x}에서 돌이키십시오', en: 'Turn away from {x}' },
  { ko: '{x}을/를 주님 앞에 내려놓으십시오', en: 'Lay {x} down before the Lord' },
  { ko: '{x}을/를 입술로 고백하십시오', en: 'Confess aloud {x}' },
  { ko: '{x}을/를 보혈로 씻어내십시오', en: 'Let the blood wash away {x}' },
];

export const REPENT = {
  shamanTraditional: {
    label: { ko: '무속 · 전통', en: 'Shamanism · tradition' },
    items: [
      { ko: '굿판에 참여한 것', en: 'taking part in a gut' },
      { ko: '무당을 찾아간 것', en: 'visiting a mudang' },
      { ko: '점을 본 것', en: 'having your fortune told' },
      { ko: '사주팔자와 궁합을 본 것', en: 'reading your saju and marriage compatibility' },
      { ko: '부적을 지니고 다닌 것', en: 'carrying a bujeok talisman' },
      { ko: '제사상 앞에서 절한 것', en: 'bowing before the ancestral rite table', weight: 2 },
      { ko: '고사를 지내고 돼지머리에 절한 것', en: "bowing to the pig's head at a gosa" },
      { ko: '삼신할머니께 아이를 빈 것', en: 'praying to Samsin Halmeoni for a child' },
      { ko: '성주신과 조왕신을 섬긴 것', en: 'serving the house god and the kitchen god' },
      { ko: '정화수를 떠 놓고 빈 것', en: 'praying over a bowl of clear water' },
      { ko: '서낭당에 돌을 얹은 것', en: 'placing stones at the seonangdang' },
      { ko: '장승 앞에서 소원을 빈 것', en: 'making wishes before a jangseung' },
      { ko: '손 없는 날을 골라 이사한 것', en: 'moving house on a "spirit-free day"' },
      { ko: '동지에 팥죽을 뿌린 것', en: 'scattering red-bean porridge on the winter solstice' },
      { ko: '액막이 명태를 문 위에 건 것', en: 'hanging a dried pollack over the door' },
      { ko: '작명소에서 이름을 받은 것', en: 'taking a name from a naming house' },
      { ko: '풍수를 보고 조상 묘를 쓴 것', en: 'siting the ancestral grave by pungsu' },
      { ko: '어머니가 당신을 위해 무당에게 빈 것', en: 'your mother praying to a mudang for you', weight: 2 },
      { ko: '굿에서 나온 떡을 먹은 것', en: 'eating rice cake from a gut' },
      { ko: '관상과 손금을 본 것', en: 'having your face or palm read' },
      { ko: '절에 가서 불상에 절한 것', en: 'bowing to a Buddha statue at a temple' },
    ],
  },
  shamanModern: {
    label: { ko: '무속 · 현대', en: 'Shamanism · modern' },
    items: [
      { ko: '신년 운세를 검색한 것', en: "searching for the new year's fortune" },
      { ko: '사주 카페에 간 것', en: 'going to a saju café' },
      { ko: '타로 카드를 뽑은 것', en: 'drawing tarot cards' },
      { ko: '운세 앱을 설치한 것', en: 'installing a fortune app' },
      { ko: '오늘의 띠별 운세를 읽은 것', en: 'reading your zodiac-animal horoscope' },
      { ko: 'MBTI로 사람을 판단한 것', en: 'judging people by MBTI' },
      { ko: '혈액형으로 성격을 믿은 것', en: 'believing in blood-type personality' },
      { ko: '꿈 해몽을 검색한 것', en: 'searching dream interpretations' },
      { ko: '돼지꿈을 꾸고 복권을 산 것', en: 'buying a lottery ticket after a pig dream' },
      { ko: '수능 날 교문에 엿을 붙인 것', en: 'sticking yeot on the school gate on exam day' },
      { ko: '빨간 펜으로 이름을 쓰지 않은 것', en: 'refusing to write a name in red ink' },
      { ko: '숫자 4를 피한 것', en: 'avoiding the number 4' },
      { ko: '해돋이를 보며 소원을 빈 것', en: 'wishing on the first sunrise' },
      { ko: '분수에 동전을 던진 것', en: 'throwing coins into a fountain' },
      { ko: '오방색 팔찌를 찬 것', en: 'wearing an obangsaek bracelet' },
      { ko: '개업식에 고사를 지낸 것', en: 'holding a gosa at a shop opening' },
      { ko: '새 차에 막걸리를 뿌린 것', en: 'pouring makgeolli on a new car' },
      { ko: '신점 유튜브를 본 것', en: 'watching spirit-reading videos online' },
      { ko: '무속 예능을 즐겨 본 것', en: 'enjoying shaman reality shows' },
      { ko: '행운의 키링을 단 것', en: 'hanging a lucky keyring' },
      { ko: '요가와 명상을 한 것', en: 'practising yoga and meditation' },
      { ko: '할로윈 파티에 간 것', en: 'going to a Halloween party' },
    ],
  },
  flesh: {
    label: { ko: '육신 · 정욕', en: 'Flesh · desire' },
    items: [
      { ko: '음란한 생각을 품은 것', en: 'harbouring lustful thoughts', weight: 2 },
      { ko: '혼전 성관계', en: 'sex before marriage', weight: 2 },
      { ko: '자위', en: 'masturbation' },
      { ko: '음란물을 본 것', en: 'watching pornography' },
      { ko: '짧은 옷으로 형제를 실족하게 한 것', en: 'causing a brother to stumble with short clothes' },
      { ko: '술 취함', en: 'drunkenness' },
      { ko: '담배', en: 'smoking' },
      { ko: '탐식', en: 'gluttony' },
      { ko: '늦잠과 게으름', en: 'oversleeping and sloth' },
      { ko: '외모에 집착한 것', en: 'obsessing over appearance' },
      { ko: '간음한 것', en: 'adultery' },
      { ko: '원나잇', en: 'a one-night stand' },
      { ko: '혼전 동거', en: 'living together before marriage' },
      { ko: '야한 사진을 주고받은 것', en: 'sending and receiving explicit photos' },
      { ko: '음란한 웹툰과 소설을 본 것', en: 'reading lewd webtoons and novels' },
      { ko: '야한 드라마를 즐겨 본 것', en: 'enjoying steamy dramas' },
      { ko: '문신을 한 것', en: 'getting a tattoo' },
    ],
  },
  night: {
    label: { ko: '밤 문화 · 술', en: 'Nightlife · drink' },
    items: [
      { ko: '클럽에 간 것', en: 'going to clubs', weight: 2 },
      { ko: '나이트에서 부킹한 것', en: 'getting "booked" at a nightclub' },
      { ko: '헌팅포차에서 이성을 만난 것', en: 'picking people up at a hunting pocha' },
      { ko: '룸살롱에 간 것', en: 'going to a room salon' },
      { ko: '노래방 도우미를 부른 것', en: 'calling a hostess to the noraebang' },
      { ko: '소개팅 앱을 설치한 것', en: 'installing a dating app' },
      { ko: '춤바람이 난 것', en: 'being swept up in dancing' },
      { ko: '회식에서 술을 받아 마신 것', en: 'accepting drinks at company dinners', weight: 2 },
      { ko: '폭탄주를 만든 것', en: 'mixing bomb shots' },
      { ko: '주일 전날 밤새 술을 마신 것', en: 'drinking all night before the Lord\'s day' },
      { ko: '술자리에서 음담패설을 한 것', en: 'telling dirty jokes over drinks' },
      { ko: '고스톱으로 돈을 건 것', en: 'betting money on go-stop' },
      { ko: '카지노와 경마장에 간 것', en: 'going to casinos and racetracks' },
    ],
  },
  heart: {
    label: { ko: '마음', en: 'Heart' },
    items: [
      { ko: '교만', en: 'pride' },
      { ko: '혈기를 부린 것', en: 'outbursts of anger' },
      { ko: '시기와 질투', en: 'envy and jealousy' },
      { ko: '거짓말', en: 'lying' },
      { ko: '험담', en: 'gossip' },
      { ko: '부모님께 불효한 것', en: 'failing your parents' },
      { ko: '남과 비교한 것', en: 'comparing yourself to others' },
      { ko: '용서하지 못한 것', en: 'failing to forgive' },
      { ko: '원망과 불평', en: 'grumbling and complaining' },
      { ko: '주일 성수를 하지 않은 것', en: 'not keeping the Lord\'s day holy', weight: 2 },
      { ko: '주일에 쇼핑한 것', en: 'shopping on the Lord\'s day' },
      { ko: '새벽기도에 빠진 것', en: 'missing dawn prayer' },
      { ko: '세상 노래를 즐겨 들은 것', en: 'loving worldly songs' },
      { ko: '아이돌을 우상처럼 섬긴 것', en: 'idolising pop idols' },
      { ko: '게임에 빠져 산 것', en: 'living inside games' },
    ],
  },
  money: {
    label: { ko: '물질', en: 'Money' },
    items: [
      { ko: '십일조를 떼어먹은 것', en: 'withholding your tithe', weight: 3 },
      { ko: '감사헌금에 인색했던 것', en: 'being stingy with thanksgiving offerings', weight: 2 },
      { ko: '하나님의 것을 도둑질한 것', en: 'robbing God' },
      { ko: '코인과 주식에 마음을 둔 것', en: 'setting your heart on crypto and stocks' },
      { ko: '세미나 회비를 아까워한 것', en: 'begrudging the seminar fee' },
      { ko: '백만원 대신 오십만원을 고른 것', en: 'choosing 500,000 won instead of 1,000,000', when: 'cheap', weight: 5 },
    ],
  },
  obedience: {
    // The control tells — this is where the cult reveals itself.
    label: { ko: '순종', en: 'Obedience' },
    items: [
      { ko: '목사님 말씀을 의심한 것', en: "doubting the pastor's word", weight: 2 },
      { ko: '교회 밖 사람들의 말에 귀 기울인 것', en: 'listening to people outside the church' },
      { ko: '가족의 반대를 하나님보다 앞세운 것', en: "putting your family's objections before God" },
      { ko: '인터넷에서 우리 교회를 검색한 것', en: 'searching our church online' },
      { ko: '예배에 빠진 것', en: 'missing worship' },
      { ko: '혼자서 성경을 해석한 것', en: 'interpreting scripture on your own' },
      { ko: '이 진단을 의심한 것', en: 'doubting this diagnosis', weight: 2 },
    ],
  },
  heavy: {
    // The heaviest items. Toggle with config.includeHeavy.
    label: { ko: '중죄', en: 'Grave sins' },
    items: [
      { ko: '낙태', en: 'abortion', heavy: true },
      { ko: '동성애적 생각', en: 'homosexual thoughts', heavy: true },
      { ko: '이혼', en: 'divorce', heavy: true },
    ],
  },
};

/** Flattened list with category keys attached. */
export const REPENT_ITEMS = Object.entries(REPENT).flatMap(([cat, { items }]) =>
  items.map((it) => ({ cat, weight: 1, ...it })));
