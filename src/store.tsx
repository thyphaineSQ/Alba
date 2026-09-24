import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ALL_VIDEOS, CHAPTERS, FEE_RATE, ONBOARDING, PACES, THEME_OPTIONS, paceFor, round10,
  type PaceId, type PersonId, type Screen,
} from './data';

export type State = {
  screen: Screen;
  situation: number | null;
  drop: number;
  horizon: number;
  themes: string[];
  rhythm: 'monthly' | 'oneoff';
  amount: number;
  customAmount: boolean;
  repeat: boolean;
  remind: boolean;
  // after the time jump
  monthly: number;
  paused: boolean;
  cashInvested: boolean;
  filter: 'forYou' | 'themes' | 'etfs' | 'shares' | 'pension' | 'low';
  themeCat: string;
  etfCat: string;
  openChapter: string | null;
  watched: string[];
  currentVideo: string;
  follows: Record<PersonId, boolean>;
  liked: string[];
  myPosts: { id: string; text: string }[];
  going: string[];
  mix: string[];
};

const INITIAL: State = {
  screen: 'splash',
  situation: null,
  drop: 1,
  horizon: 2,
  themes: ['climate', 'education'],
  rhythm: 'monthly',
  amount: 200,
  customAmount: false,
  repeat: true,
  remind: false,
  monthly: 200,
  paused: false,
  cashInvested: false,
  filter: 'forYou',
  themeCat: 'all',
  etfCat: 'world',
  openChapter: 'etf',
  watched: CHAPTERS[0].videos.map(v => v.id),
  currentVideo: 'etf-0',
  follows: { sophie: false, marta: true, lena: false },
  liked: [],
  myPosts: [],
  going: [],
  mix: [],
};

const KEY = 'alba-state-v1';
const ACTIVE_KEY = 'alba-last-active';
// First visit, or back after this long without activity: start again from the splash.
export const IDLE_MS = 2 * 60 * 1000;

function lastActive() {
  try { return Number(localStorage.getItem(ACTIVE_KEY)) || 0; } catch { return 0; }
}
function markActive() {
  try { localStorage.setItem(ACTIVE_KEY, String(Date.now())); } catch { /* ignore */ }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && Date.now() - lastActive() < IDLE_MS) return { ...INITIAL, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return INITIAL;
}

/* ---------- derived figures ---------- */
// The app after the time jump tells a two-year story at the amount chosen in onboarding.
// The design's reference story is CHF 200 a month; everything scales from it.
const BASE = { world: 2050, swiss: 830, climate: 710, women: 470, pension: 900, cash: 300 };
const GAIN = { world: 140, swiss: 20, climate: 70, women: -10, pension: 30 };

export function derive(s: State) {
  const pace: PaceId = paceFor(s.drop, s.horizon);
  const worldPct = s.themes.length ? PACES[pace].world : 100;
  const first = {
    world: Math.round((s.amount * worldPct) / 100),
    themes: s.amount - Math.round((s.amount * worldPct) / 100),
    fee: s.amount * FEE_RATE,
  };
  const picked = THEME_OPTIONS.filter(t => s.themes.includes(t.id));

  const k = s.amount / 200;
  const h = {
    world: round10(BASE.world * k), swiss: round10(BASE.swiss * k),
    climate: round10(BASE.climate * k), women: round10(BASE.women * k),
    pension: round10(BASE.pension * k), cash: round10(BASE.cash * k),
  };
  const g = {
    world: round10(GAIN.world * k), swiss: round10(GAIN.swiss * k),
    climate: round10(GAIN.climate * k), women: Math.min(-10, round10(GAIN.women * k)),
    pension: round10(GAIN.pension * k),
  };
  if (s.cashInvested) { h.world += h.cash; h.cash = 0; }
  const etfs = h.world + h.swiss, themes = h.climate + h.women;
  const balance = etfs + themes + h.pension + h.cash;
  const paidIn = s.amount * 24;
  const yearGain = round10(310 * k);

  // Projection to 2034 at ~4% a year, with the current monthly amount (0 when paused).
  const monthly = s.paused ? 0 : s.monthly;
  const years = 8, r = 0.04;
  const growth = Math.pow(1 + r, years);
  const projection = Math.round((balance * growth + monthly * 12 * ((growth - 1) / r)) / 100) * 100;

  return { pace, worldPct, first, picked, holdings: h, gains: g, etfs, themes, balance, paidIn, yearGain, projection };
}
export type Derived = ReturnType<typeof derive>;

export function learnProgress(s: State) {
  const watched = new Set(s.watched);
  const total = ALL_VIDEOS.length;
  const done = ALL_VIDEOS.filter(v => watched.has(v.id)).length;
  return { total, done, pct: Math.round((done / total) * 100) };
}

/* ---------- context ---------- */
type Ctx = {
  s: State;
  d: Derived;
  dir: 1 | -1;
  set: (patch: Partial<State> | ((s: State) => Partial<State>)) => void;
  go: (screen: Screen) => void;
  reset: () => void;
  toast: string | null;
  notify: (msg: string) => void;
};
const AppCtx = createContext<Ctx | null>(null);

const order = (screen: Screen) => {
  const i = ONBOARDING.indexOf(screen);
  return i >= 0 ? i : ONBOARDING.length + (screen === 'later' ? 0 : 1);
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setState] = useState<State>(load);
  const [dir, setDir] = useState<1 | -1>(1);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }, [s]);

  const set = useCallback<Ctx['set']>(patch => {
    setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const go = useCallback((screen: Screen) => {
    setState(prev => {
      setDir(order(screen) < order(prev.screen) ? -1 : 1);
      return { ...prev, screen };
    });
  }, []);

  const reset = useCallback(() => {
    setDir(-1);
    setState({ ...INITIAL });
  }, []);

  // Inactivity: after IDLE_MS with no tap, key or scroll, send the visitor back to the splash.
  // A YouTube player inside a story swallows input events, so an open player counts as activity.
  useEffect(() => {
    let timer = 0, lastWrite = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.querySelector('iframe')) { markActive(); schedule(); return; }
        reset();
        schedule();
      }, IDLE_MS);
    };
    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite > 5000) { lastWrite = now; markActive(); }
      schedule();
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActive() >= IDLE_MS) reset();
      onActivity();
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    events.forEach(e => window.addEventListener(e, onActivity, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', onVisible);
    markActive();
    schedule();
    return () => {
      window.clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, onActivity, { capture: true }));
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reset]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const d = useMemo(() => derive(s), [s]);
  const value = useMemo(() => ({ s, d, dir, set, go, reset, toast, notify }), [s, d, dir, set, go, reset, toast, notify]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
