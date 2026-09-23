import { AnimatePresence, motion, type Variants } from 'motion/react';
import type { ComponentType } from 'react';
import { ChatProvider } from './chat';
import { LABELS, ONBOARDING, TABS, chf, type Screen, type Tab } from './data';
import { useApp } from './store';
import { CountUp, ease } from './ui';
import { Intro, Pace, Payment, Rhythm, Splash, Start, Themes } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Wealth } from './screens/Wealth';
import { Discover } from './screens/Discover';
import { Circle } from './screens/Circle';
import { Learn } from './screens/Learn';

const SCREENS: Record<Exclude<Screen, 'later'>, ComponentType> = {
  splash: Splash, intro: Intro, start: Start, pace: Pace, themes: Themes, rhythm: Rhythm, payment: Payment,
  home: Home, wealth: Wealth, discover: Discover, circle: Circle, learn: Learn,
};

const isTab = (s: Screen): s is Tab => (TABS as readonly string[]).includes(s);

/* ---------- transitions ---------- */
// Onboarding pushes sideways in the direction of travel; tabs cross-fade with a small lift;
// entering the app from onboarding zooms gently, like arriving somewhere.
const screenVariants: Variants = {
  enter: ({ dir, kind }: { dir: number; kind: string }) =>
    kind === 'flow' ? { x: dir * 56, opacity: 0 } : kind === 'tab' ? { y: 10, opacity: 0 } : { scale: 0.97, opacity: 0 },
  center: { x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: 0.42, ease } },
  exit: ({ dir, kind }: { dir: number; kind: string }) =>
    kind === 'flow'
      ? { x: dir * -40, opacity: 0, transition: { duration: 0.28, ease } }
      : { opacity: 0, transition: { duration: 0.16 } },
};

/* ---------- time jump ---------- */
function TimeJump() {
  const { s, d, go } = useApp();
  const monthly = s.rhythm === 'monthly';
  return (
    <motion.div
      key="later"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
      style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(22,19,15,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}
      role="dialog" aria-modal aria-label="Two years later"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 26, delay: 0.25 } }}
        exit={{ opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.25 } }}
        style={{ width: '100%', background: '#fff', borderRadius: 26, padding: '26px 24px 22px', display: 'flex', flexDirection: 'column', gap: 22, boxShadow: '0 30px 60px -20px rgba(0,0,0,.4)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="label">Prototype · time jump</div>
          <div className="m" style={{ fontSize: 28, lineHeight: 1.15 }}>Two years later.</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)', textWrap: 'pretty' }}>
            What follows is Alba in September 2026. {monthly ? `You kept ${chf(s.amount)} a month going` : `You kept adding, about ${chf(s.amount)} a month`}, found your circle and learned along the way.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative', height: 14 }}>
            <motion.span
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease, delay: 0.55 }}
              style={{ position: 'absolute', left: 6, right: 6, top: 6, height: 2, background: 'linear-gradient(90deg,#16130f,#FA5B35)', originX: 0 }}
            />
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.45 }}
              style={{ position: 'absolute', left: 0, top: 1, width: 12, height: 12, borderRadius: '50%', background: 'var(--ink)' }} />
            <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5, delay: 1.65 }}
              style={{ position: 'absolute', right: 0, top: 0, width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="m" style={{ fontSize: 14 }}>Sep 2024</span><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Your first payment</span></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', textAlign: 'right' }}><span className="m" style={{ fontSize: 14 }}>Sep 2026</span><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Today</span></span>
          </div>
        </div>
        <div className="rows" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0' }}>
            <span style={{ fontSize: 13.5 }}>Payments made</span>
            <span className="m" style={{ fontSize: 16 }}><CountUp id="later-payments" value={24} format={n => String(Math.round(n))} /></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0' }}>
            <span style={{ fontSize: 13.5 }}>Paid in</span>
            <span className="m" style={{ fontSize: 16 }}><CountUp id="later-paid" value={d.paidIn} format={chf} /></span>
          </div>
        </div>
        <button className="cta" style={{ padding: '16px 0', fontWeight: 400 }} onClick={() => go('home')}>See Alba today</button>
      </motion.div>
    </motion.div>
  );
}

/* ---------- tab bar ---------- */
const TAB_ICONS: Record<Tab, string> = {
  home: 'M4 10.5 L12 4 L20 10.5 V20 H14.5 V14.5 H9.5 V20 H4 Z',
  wealth: 'M4 19 V5 M4 19 H20 M7.5 15.5 L11 11 L14 13.5 L19 7',
  discover: 'M12 3.5 A8.5 8.5 0 1 0 12 20.5 A8.5 8.5 0 1 0 12 3.5 M15 9 L13 13 L9 15 L11 11 Z',
  circle: 'M9 11 A3 3 0 1 0 9 5 A3 3 0 1 0 9 11 M16 11.5 A2.5 2.5 0 1 0 16 6.5 A2.5 2.5 0 1 0 16 11.5 M3.5 19 C3.5 15.7 6 13.5 9 13.5 C12 13.5 14.5 15.7 14.5 19 M16.5 13.8 C18.9 14.3 20.5 16.3 20.5 19',
  learn: 'M4 5.5 C7 4.5 9.5 4.8 12 6.2 C14.5 4.8 17 4.5 20 5.5 V18 C17 17 14.5 17.3 12 18.7 C9.5 17.3 7 17 4 18 Z M12 6.2 V18.7',
};

function TabBar() {
  const { s, go } = useApp();
  const active = s.screen === 'later' ? 'home' : s.screen;
  return (
    <motion.nav
      className="tabbar" aria-label="Main"
      initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      {TABS.map(t => {
        const on = active === t;
        return (
          <button key={t} className={`tab${on ? ' on' : ''}`} onClick={() => go(t)} aria-current={on ? 'page' : undefined}>
            <motion.svg viewBox="0 0 24 24" animate={{ y: on ? -1 : 0, scale: on ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }} aria-hidden>
              <path d={TAB_ICONS[t]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            <span>{t[0].toUpperCase() + t.slice(1)}</span>
          </button>
        );
      })}
    </motion.nav>
  );
}

/* ---------- toast ---------- */
function Toast() {
  const { toast } = useApp();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast} className="toast" role="status"
          initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease }}
        ><i />{toast}</motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- app ---------- */
export default function App() {
  const { s, dir, reset } = useApp();
  const shown: Exclude<Screen, 'later'> = s.screen === 'later' ? 'home' : s.screen;
  const Current = SCREENS[shown];
  const inApp = isTab(s.screen) || s.screen === 'later';
  const kind = ONBOARDING.includes(shown) && shown !== 'splash' ? 'flow' : isTab(shown) ? (s.screen === 'later' ? 'arrive' : 'tab') : 'fade';
  const inOnboarding = ONBOARDING.includes(s.screen);

  return (
    <div className="page">
      <div className="phone">
        <AnimatePresence>
          {s.screen === 'splash' && (
            <motion.div
              key="splash-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }}
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(120% 70% at 50% 18%, #FD8E6C 0%, rgba(253,142,108,0) 60%), linear-gradient(180deg, #FA6A45 0%, #FA5B35 50%, #F2502C 100%)',
              }}
            />
          )}
        </AnimatePresence>
        <div className="statusbar" style={{ background: s.screen === 'splash' ? 'transparent' : '#fff', transition: 'background .6s' }}><span>9:41</span><span>▮▮▮</span></div>

        <ChatProvider>
          <div className="stage">
            <AnimatePresence initial={false} custom={{ dir, kind }}>
              <motion.div
                key={shown}
                className="screen"
                custom={{ dir, kind }}
                variants={screenVariants}
                initial="enter" animate="center" exit="exit"
              >
                <Current />
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence>{inApp && <TabBar key="tabs" />}</AnimatePresence>
          <AnimatePresence>{s.screen === 'later' && <TimeJump />}</AnimatePresence>
        </ChatProvider>

        <Toast />
        <div id="sheet-root" />
      </div>

      <div className="chrome">
        <button onClick={reset}>Restart</button>
        <span>{inOnboarding ? 'Onboarding' : 'App'} · {LABELS[s.screen]}</span>
      </div>
    </div>
  );
}
