// Content and fixed data for the Alba prototype. Copy follows the design:
// never use the em dash, "members" rather than "women", Swiss apostrophes.

export type Screen =
  | 'splash' | 'intro' | 'start' | 'pace' | 'themes' | 'rhythm' | 'payment'
  | 'later' | 'home' | 'wealth' | 'discover' | 'circle' | 'learn';

export const ONBOARDING: Screen[] = ['splash', 'intro', 'start', 'pace', 'themes', 'rhythm', 'payment'];
export const TABS = ['home', 'wealth', 'discover', 'circle', 'learn'] as const;
export type Tab = (typeof TABS)[number];

export const LABELS: Record<Screen, string> = {
  splash: 'Splash', intro: 'Welcome', start: 'Start', pace: 'Pace', themes: 'Themes', rhythm: 'Rhythm & amount',
  payment: 'First payment', later: 'Two years later', home: 'Home', wealth: 'Wealth', discover: 'Discover',
  circle: 'Circle', learn: 'Learn',
};

// A single-file preview build can inline the photos as data URIs on window.__ALBA_IMG__.
const inlineImages = (globalThis as { __ALBA_IMG__?: Record<string, string> }).__ALBA_IMG__;
export const img = (name: string) => inlineImages?.[name] ?? `${import.meta.env.BASE_URL}people/${name}.webp`;

/* ---------- money ---------- */
export const MINUS = '−';
export function num(n: number) {
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return (n < 0 ? MINUS : '') + s;
}
export const chf = (n: number) => (n < 0 ? `${MINUS}CHF ${num(-n)}` : `CHF ${num(n)}`);
export const signedChf = (n: number) => (n < 0 ? `${MINUS}CHF ${num(-n)}` : `+CHF ${num(n)}`);
export const round10 = (n: number) => Math.round(n / 10) * 10;
export const words = ['no', 'one', 'two', 'three', 'four'];

/* ---------- onboarding ---------- */
export const SITUATIONS = [
  'Money sitting in my account doing nothing',
  'I want to start, I don’t know where',
  'I invest already, I want it to mean something',
];

export const DROP_ANSWERS = [
  { title: 'Take it out, I’d rather sleep', note: 'We would keep you mostly in cash and bonds' },
  { title: 'Leave it, keep paying in', note: 'What most people here do, and what history rewards' },
  { title: 'Add more while it is cheap', note: 'More in shares, more movement month to month' },
];

export const HORIZONS = ['2 yrs', '5 yrs', '10 yrs', '20 yrs', 'Retirement'];

export type PaceId = 'Calm' | 'Steady' | 'Bold';
export const PACES: Record<PaceId, { note: string; world: number }> = {
  Calm: { note: 'Moves gently. More bonds and cash, fewer surprises.', world: 80 },
  Steady: { note: 'Grows through the dips without asking you to watch it.', world: 70 },
  Bold: { note: 'More in shares. Bigger swings, more room to grow.', world: 60 },
};
export function paceFor(drop: number, horizon: number): PaceId {
  const score = drop * 2 + horizon;
  return score <= 2 ? 'Calm' : score >= 6 ? 'Bold' : 'Steady';
}

export const THEME_OPTIONS = [
  { id: 'climate', name: 'Climate & clean energy', short: 'Climate', meta: '4’120 members · Sophie is in' },
  { id: 'education', name: 'Education & skills', short: 'Education', meta: '1’860 members · Marta is in' },
  { id: 'women', name: 'Women-led companies', short: 'Women-led', meta: '3’540 members' },
  { id: 'health', name: 'Health & ageing well', short: 'Health', meta: '2’240 members' },
  { id: 'swiss', name: 'Swiss companies', short: 'Swiss', meta: '5’900 members' },
];
export const MAX_THEMES = 4;
export const AMOUNT_PRESETS = [100, 200, 500];
export const MIN_AMOUNT = 50;
export const FEE_RATE = 0.008;

/* ---------- risk ---------- */
export type Risk = 'Calm' | 'Steady' | 'Bold';
export const RISK_BG: Record<Risk, string> = { Calm: '#EEF1F4', Steady: 'rgba(250,91,53,.45)', Bold: '#F6E3DC' };

/* ---------- discover ---------- */
export type Item = { name: string; note: string; change?: string; risk: Risk; mark: string; kind: string; about?: string };

export const THEME_CATS = [
  { id: 'all', label: 'Picked for you' },
  { id: 'industry', label: 'Industry' },
  { id: 'tech', label: 'Technology' },
  { id: 'life', label: 'Lifestyle' },
  { id: 'impact', label: 'Sustainability & Impact' },
  { id: 'econ', label: 'Economy & Politics' },
  { id: 'alt', label: 'Alternative & Crypto' },
];

const T = (name: string, note: string, change: string, risk: Risk, mark: string): Item => ({ name, note, change, risk, mark, kind: 'Theme' });
const E = (name: string, note: string, change: string, risk: Risk, mark: string): Item => ({ name, note, change, risk, mark, kind: 'ETF' });

export const PICKED: Item[] = [
  T('Climate Transition', 'You already hold this', '+0.9%', 'Steady', '#DFEEE4'),
  T('Women in Leadership', 'You already hold this', '+1.4%', 'Steady', '#EDE6F2'),
  T('Education & skills', 'Marta and 3 others in your circle hold it', '+0.5%', 'Steady', '#F2EBDC'),
  T('Clean water', 'Close to what you already back', '−0.6%', 'Calm', '#E4EEF2'),
];

export const THEME_DATA: Record<string, Item[]> = {
  industry: [
    T('Semiconductors', '2’980 members hold this', '+3.5%', 'Bold', '#E7EFF2'),
    T('Pharma & biotech', '1’740 members hold this', '+2.8%', 'Steady', '#F2E7E7'),
    T('Swiss blue chips', '5’900 members hold this', '−0.4%', 'Steady', '#F0EDE7'),
    T('Gold & materials', '860 members hold this', '+1.2%', 'Steady', '#F2EBDC'),
  ],
  tech: [
    T('AI & infrastructure', '4’480 members hold this', '+4.1%', 'Bold', '#EAE7F2'),
    T('Robotics', '1’120 members hold this', '+1.3%', 'Bold', '#E4E7F2'),
    T('Cybersecurity', '940 members hold this', '+2.2%', 'Steady', '#E7EFF2'),
  ],
  life: [
    T('Health & ageing well', '2’240 members hold this', '+0.6%', 'Calm', '#DFEEE4'),
    T('Food & wellbeing', '760 members hold this', '−1.1%', 'Steady', '#EDF2E4'),
    T('Global luxury', '1’380 members hold this', '−5.5%', 'Bold', '#F2E7EC'),
  ],
  impact: [
    T('Climate Transition', '4’120 members · Sophie is in', '+0.9%', 'Steady', '#DFEEE4'),
    T('Women in Leadership', '3’540 members hold this', '+1.4%', 'Steady', '#EDE6F2'),
    T('Education & skills', '1’860 members hold this', '+0.5%', 'Steady', '#F2EBDC'),
    T('Clean water', '620 members hold this', '−0.6%', 'Calm', '#E4EEF2'),
  ],
  econ: [
    T('Dividend payers', '3’200 members hold this', '+2.6%', 'Calm', '#EEF1F4'),
    T('Swiss economy', '2’410 members hold this', '+0.3%', 'Calm', '#F2E7E7'),
    T('Emerging markets', '1’140 members hold this', '−1.9%', 'Bold', '#E7EFF2'),
  ],
  alt: [
    T('Crypto basket', '890 members hold this', '+14.9%', 'Bold', '#F0EAE2'),
    T('Blockchain companies', '540 members hold this', '+11.3%', 'Bold', '#EAE7F2'),
  ],
};

export const ETF_CATS = [
  { id: 'world', label: 'Whole world' },
  { id: 'regions', label: 'Regions' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'bonds', label: 'Bonds & safety' },
  { id: 'dividends', label: 'Dividends' },
  { id: 'green', label: 'Sustainable' },
];

export const ETF_DATA: Record<string, Item[]> = {
  world: [
    E('World fund', '11’200 members · fee 0.12%', '+1.8%', 'Calm', '#E4E7F2'),
    E('World small companies', '1’430 members · fee 0.19%', '+2.4%', 'Steady', '#E7EFF2'),
    E('World, Swiss franc hedged', '2’060 members · fee 0.15%', '+1.1%', 'Calm', '#EEF1F4'),
    E('All-country including emerging', '980 members · fee 0.20%', '+0.7%', 'Steady', '#EAE7F2'),
  ],
  regions: [
    E('Swiss market', '6’400 members · fee 0.10%', '−0.4%', 'Calm', '#F2E7E7'),
    E('Europe', '2’150 members · fee 0.12%', '+0.9%', 'Steady', '#E4EEF2'),
    E('United States', '5’310 members · fee 0.07%', '+2.2%', 'Steady', '#EEF1F4'),
    E('Japan', '640 members · fee 0.15%', '+1.6%', 'Steady', '#F2E7EC'),
    E('Emerging markets', '1’140 members · fee 0.18%', '−1.9%', 'Bold', '#E7EFF2'),
  ],
  sectors: [
    E('Healthcare', '1’870 members · fee 0.18%', '+1.4%', 'Steady', '#DFEEE4'),
    E('Technology', '3’940 members · fee 0.20%', '+4.0%', 'Bold', '#EAE7F2'),
    E('Infrastructure', '720 members · fee 0.23%', '+0.6%', 'Steady', '#F0EDE7'),
    E('Property', '1’060 members · fee 0.24%', '−0.8%', 'Steady', '#F2EBDC'),
  ],
  bonds: [
    E('Swiss government bonds', '2’480 members · fee 0.09%', '+0.2%', 'Calm', '#EEF1F4'),
    E('Global bonds, hedged', '1’920 members · fee 0.11%', '+0.4%', 'Calm', '#E4EEF2'),
    E('Short-term bonds', '1’310 members · fee 0.10%', '+0.3%', 'Calm', '#F0EDE7'),
    E('Inflation-linked bonds', '540 members · fee 0.16%', '−0.1%', 'Calm', '#F2EBDC'),
  ],
  dividends: [
    E('Swiss dividend payers', '3’200 members · fee 0.15%', '+2.6%', 'Calm', '#F2E7E7'),
    E('Global high dividends', '1’780 members · fee 0.29%', '−0.4%', 'Steady', '#EEF1F4'),
    E('Dividend growers', '860 members · fee 0.25%', '+1.2%', 'Steady', '#E4E7F2'),
  ],
  green: [
    E('World, climate-screened', '2’640 members · fee 0.18%', '+1.5%', 'Calm', '#DFEEE4'),
    E('Clean energy', '1’210 members · fee 0.30%', '−1.1%', 'Bold', '#EDF2E4'),
    E('Green bonds', '470 members · fee 0.20%', '+0.3%', 'Calm', '#E4EEF2'),
    E('Water', '620 members · fee 0.35%', '−0.6%', 'Steady', '#E4EEF2'),
  ],
};

export const SHARES: Item[] = [
  { name: 'Swiss blue chips', note: '24 companies · buy one at a time', risk: 'Bold', mark: '#F0EDE7', kind: 'Shares' },
  { name: 'Global tech', note: 'Moves a lot, in both directions', risk: 'Bold', mark: '#EAE7F2', kind: 'Shares' },
];
export const PENSION: Item[] = [
  { name: 'Retirement savings', note: 'CHF 6’400 left to save tax-free this year', risk: 'Calm', mark: '#E8EFDC', kind: 'Pension 3a' },
  { name: '3a Sustainable', note: 'Same tax break, climate-screened', risk: 'Steady', mark: '#EDF2E4', kind: 'Pension 3a' },
];
export const CALMEST: Item[] = [
  { name: 'World fund', note: '11’200 members · most popular', risk: 'Calm', mark: '#E4E7F2', kind: 'ETF' },
  { name: 'Swiss fund', note: '6’400 members hold this', risk: 'Calm', mark: '#F2E7E7', kind: 'ETF' },
  { name: 'Health & ageing well', note: '2’240 members hold this', risk: 'Calm', mark: '#DFEEE4', kind: 'Theme' },
  { name: 'Retirement savings', note: 'Tax-free, locked until you retire', risk: 'Calm', mark: '#E8EFDC', kind: 'Pension 3a' },
];

export const FEATURED: Item = {
  name: 'Climate Transition',
  note: '4’120 members hold this, incl. Sophie',
  change: '+0.9%',
  risk: 'Steady',
  mark: '#DFEEE4',
  kind: 'Theme',
  about: '38 companies working on cleaner energy, transport and buildings.',
};

export function allItems(): Item[] {
  const seen = new Set<string>();
  const list = [FEATURED, ...PICKED, ...Object.values(THEME_DATA).flat(), ...Object.values(ETF_DATA).flat(), ...SHARES, ...PENSION];
  return list.filter(i => (seen.has(i.name) ? false : (seen.add(i.name), true)));
}

export const RISK_ABOUT: Record<Risk, string> = {
  Calm: 'Moves the least. A bad month is usually small.',
  Steady: 'Moves with the market. Some months down, most years up.',
  Bold: 'Moves a lot, in both directions. Best in small amounts.',
};

/* ---------- circle ---------- */
export const PEOPLE = {
  sophie: { name: 'Sophie, 34', meta: 'Started at 32 · Zürich', ytd: '+7.4%' },
  marta: { name: 'Marta, 29', meta: 'Answers a lot · Lausanne', ytd: '+5.9%' },
  lena: { name: 'Lena, 41', meta: 'Climate themes · Bern', ytd: '+6.8%' },
} as const;
export type PersonId = keyof typeof PEOPLE;

export const POSTS = [
  { id: 'amina', who: 'amina', name: 'Amina, 36', when: '2h ago', text: 'Markets dipped and I did nothing. Feels like progress.', replies: 14, hearts: 22 },
  { id: 'sophie', who: 'sophie', name: 'Sophie, 34', when: 'yesterday', text: 'Two years today. CHF 4’800 in, still boring, still working.', replies: 31, hearts: 88 },
  { id: 'daniel', who: 'daniel', name: 'Daniel, 44', when: '2 days ago', text: 'Asked my first question here last month. Nobody laughed.', replies: 9, hearts: 12 },
];

export type EventItem = {
  id: string; month: string; day: string; tag: string; title: string; when: string;
  going: number; incl?: string; place: string; about: string;
};
export const EVENTS: EventItem[] = [
  {
    id: 'meetup', month: 'SEP', day: '24', tag: 'MEET-UP · ZÜRICH', title: 'Coffee & first investments',
    when: '18:30', going: 14, incl: 'Sophie', place: 'Café Henrici, Niederdorf, Zürich',
    about: 'An hour of coffee and plain questions with members who started in the last few years. No pitches, no products, bring whatever you are unsure about.',
  },
  {
    id: 'webinar', month: 'OCT', day: '2', tag: 'WEBINAR · ONLINE', title: 'Pension 3a, explained without jargon',
    when: '12:15 · 45 min', going: 320, place: 'Online, link sent the morning of',
    about: 'What 3a is, what it saves you in tax each year, and how an invested 3a differs from a 3a savings account. Questions answered live.',
  },
];

export type Thread = { id: string; q: string; meta: string; answers: { who: string; name: string; text: string }[] };
export const THREADS: Thread[] = [
  {
    id: 'drop', q: '“Should I worry when prices drop?”', meta: '48 answers · Marta answered',
    answers: [
      { who: 'marta', name: 'Marta, 29', text: 'I checked the app every day in my first dip. Now I check once a month. Nothing I did in between would have helped.' },
      { who: 'lena', name: 'Lena, 41', text: 'Dips are when your monthly payment buys a little more. That is the only thing I think about now.' },
      { who: 'daniel', name: 'Daniel, 44', text: 'Only if you need the money soon. That is why I keep two years of spending outside of it.' },
    ],
  },
  {
    id: 'cash', q: '“How much do you keep in cash?”', meta: '26 answers · 3 from your circle',
    answers: [
      { who: 'sophie', name: 'Sophie, 34', text: 'Three months of rent and bills. Everything above that goes in on the 1st.' },
      { who: 'amina', name: 'Amina, 36', text: 'Six months, because I am self-employed. It lets me leave the invested part alone.' },
    ],
  },
  {
    id: '3a', q: '“Is 3a worth it if I’m self-employed?”', meta: '19 answers · new today',
    answers: [
      { who: 'amina', name: 'Amina, 36', text: 'Yes, and the limit is higher for you if you have no pension fund. Ask about the “large 3a”.' },
      { who: 'marta', name: 'Marta, 29', text: 'The tax saving alone made it worth it for me, even before any growth.' },
    ],
  },
];

/* ---------- learn ---------- */
export type Video = { id: string; title: string; dur: string; hook: string; youtube?: string };
export type Chapter = { id: string; n: number; name: string; videos: Video[] };
const V = (chapter: string, i: number, title: string, dur: string, hook: string, youtube?: string): Video => ({ id: `${chapter}-${i}`, title, dur, hook, youtube });
export const CHAPTERS: Chapter[] = [
  { id: 'basics', n: 1, name: 'Getting started', videos: [
    V('basics', 0, 'Why invest at all', '3 min', 'Cash loses a little every year. Investing is how your money keeps up, and then some.'),
    V('basics', 1, 'How much is enough to start', '4 min', 'Less than you think. Most people here started with CHF 100.'),
    V('basics', 2, 'Risk in plain words', '5 min', 'Risk is how much your money moves on the way, not whether it disappears.'),
    V('basics', 3, 'What Alba actually does with your money', '3 min', 'Where it goes, who holds it, and how to get it back in two days.'),
  ] },
  { id: 'etf', n: 2, name: 'ETFs', videos: [
    V('etf', 0, 'What is an ETF?', '4 min', 'One purchase, hundreds of companies. The simplest way to own a piece of everything.', 'gH07sH1Hq1Q'),
    V('etf', 1, 'What is inside a world ETF', '5 min', 'About 1’500 companies from 23 countries. Apple is in there, and so is Nestlé.'),
    V('etf', 2, 'Fees, why 0.12% matters over ten years', '4 min', 'Small percentages, big difference. How a fee quietly compounds against you.'),
    V('etf', 3, 'Choosing your first ETF', '6 min', 'Three questions that narrow hundreds of funds down to one or two.'),
  ] },
  { id: 'themes', n: 3, name: 'Themes and shares', videos: [
    V('themes', 0, 'What a theme really holds', '4 min', 'Behind “Climate Transition” there are 38 real companies. Here is how they are picked.'),
    V('themes', 1, 'One company versus a basket', '5 min', 'Why a single share can double or halve, and a basket rarely does.'),
    V('themes', 2, 'How much to put in a theme', '3 min', 'A simple rule: the world as your base, themes as the part you care about.'),
  ] },
  { id: 'pension', n: 4, name: 'Pension 3a and taxes', videos: [
    V('pension', 0, 'What 3a is, in two minutes', '2 min', 'A Swiss savings pot for retirement that lowers your taxes every year.'),
    V('pension', 1, 'What you save in tax each year', '4 min', 'Put in CHF 7’258 and many people save between CHF 1’000 and 2’000 in tax.'),
    V('pension', 2, 'Invested 3a versus a 3a savings account', '5 min', 'Same tax break, very different results over 30 years.'),
    V('pension', 3, 'When you can take it out', '3 min', 'Retirement, buying a home, moving abroad or starting a business.'),
  ] },
  { id: 'falls', n: 5, name: 'When markets fall', videos: [
    V('falls', 0, 'Why prices go up and down', '4 min', 'News, fear and interest rates. None of them change what you own.'),
    V('falls', 1, 'What people here did in 2022', '5 min', 'Most kept paying in. Here is what that looked like two years later.'),
    V('falls', 2, 'Doing nothing is a decision', '3 min', 'Often the best one. Why waiting it out beats guessing the bottom.'),
  ] },
  { id: 'mix', n: 6, name: 'Building your own mix', videos: [
    V('mix', 0, 'Base, themes and cash', '4 min', 'Three parts, one plan. How much of each suits your pace.'),
    V('mix', 1, 'Rebalancing without fuss', '4 min', 'Once a year, one tap, and your mix is back where you wanted it.'),
    V('mix', 2, 'Raising your monthly amount', '3 min', 'When to add more, and how to do it without feeling it.'),
  ] },
];
export const ALL_VIDEOS = CHAPTERS.flatMap(c => c.videos.map(v => ({ ...v, chapter: c })));

/* ---------- ask alba ---------- */
export const ASK: Record<Tab, { ctx: string; q: string[] }> = {
  home: { ctx: 'About your Home page', q: ['Is CHF 200 a month enough?', 'What does the projection assume?', 'Is the Zürich meet-up for beginners?'] },
  wealth: { ctx: 'About your Wealth page', q: ['Why is Women in Leadership down?', 'What should I do with my cash?', 'How much can I still put in my 3a?'] },
  discover: { ctx: 'About Discover', q: ['Which funds fit my pace?', 'ETF or theme, what’s the difference?', 'Why do fees matter so much?'] },
  circle: { ctx: 'About your Circle', q: ['Help me reply to Amina: is 200 too little?', 'What’s the circle talking about this week?', 'How do I ask my first question?'] },
  learn: { ctx: 'About Learn', q: ['Where should I pick up?', 'Explain ETFs in one minute', 'Quiz me on what I’ve watched'] },
};
