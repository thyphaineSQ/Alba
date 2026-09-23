import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  AMOUNT_PRESETS, DROP_ANSWERS, HORIZONS, MAX_THEMES, MIN_AMOUNT, PACES, SITUATIONS, THEME_OPTIONS, chf, words,
} from '../data';
import { useApp } from '../store';
import { Avatar, Check, Logo, Progress, Rise, Switch, ease, stagger } from '../ui';

const Body = ({ children, gap = 16 }: { children: React.ReactNode; gap?: number }) => (
  <motion.div className="body" style={{ gap }} variants={stagger} initial="hidden" animate="show">{children}</motion.div>
);

/* ---------- splash ---------- */
export function Splash() {
  const { go } = useApp();
  return (
    <button onClick={() => go('intro')} style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }} aria-label="Tap to begin">
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <svg viewBox="0 2 28 28" style={{ width: 56, height: 56, overflow: 'visible' }} aria-hidden>
          <defs><clipPath id="horizon"><rect x="-4" y="-10" width="36" height="33.2" /></clipPath></defs>
          <g clipPath="url(#horizon)">
            <motion.path
              d="M0 21 A14 14 0 0 1 28 21 Z" fill="#fff"
              initial={{ y: 16 }} animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            />
          </g>
          <motion.rect
            x="0" y="24.2" width="28" height="2.4" fill="#fff"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0.5 }}
            transition={{ duration: 0.7, ease }}
          />
        </svg>
        <motion.span
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.55 }}
        >
          <span className="m" style={{ fontSize: 60, lineHeight: 1, letterSpacing: '-.01em' }}>Alba</span>
          <span style={{ fontSize: 15, letterSpacing: '.01em', color: '#FEDCD3' }}>by Swissquote</span>
        </motion.span>
      </span>
      <motion.span
        style={{ padding: '0 26px 34px', textAlign: 'center', fontSize: 12, width: '100%' }}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.55, 1] }} transition={{ duration: 2.4, delay: 1.1 }}
      >Tap to begin</motion.span>
    </button>
  );
}

/* ---------- intro ---------- */
const introRows = [
  {
    title: 'Invest in what matters to you',
    text: 'Whole-world funds as the base, then the themes you care about: climate, education, women-led companies.',
    art: (
      <>
        <circle cx="32" cy="34" r="17" fill="rgba(250,91,53,.34)" />
        <path d="M32 51 V28" fill="none" stroke="#16130f" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 34 C23 34 19 29 19 22 C27 22 32 26 32 34 Z" fill="#fff" stroke="#16130f" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M32 40 C41 40 45 35 45 28 C37 28 32 32 32 40 Z" fill="#FEDCD3" stroke="#16130f" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M20 51 H44" fill="none" stroke="#16130f" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Never do it alone',
    text: 'Ask anything, see what people like you did in a dip, and meet them at a Swiss meet-up.',
    art: (
      <>
        <circle cx="32" cy="32" r="19" fill="rgba(250,91,53,.34)" />
        <circle cx="24" cy="26" r="6" fill="#fff" stroke="#16130f" strokeWidth="1.4" />
        <circle cx="40" cy="29" r="5" fill="#FEDCD3" stroke="#16130f" strokeWidth="1.4" />
        <path d="M13 47 C13 39 18 35 24 35 C30 35 35 39 35 47" fill="#fff" stroke="#16130f" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M38 37 C45 37 50 41 50 47" fill="none" stroke="#16130f" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Learn as you go',
    text: 'Two minutes at a time, in plain words. Every month you understand more of what you own.',
    art: (
      <>
        <circle cx="32" cy="32" r="19" fill="rgba(250,91,53,.34)" />
        <path d="M13 21 C20 19 26 20 32 24 C38 20 44 19 51 21 V44 C44 42 38 43 32 47 C26 43 20 42 13 44 Z" fill="#fff" stroke="#16130f" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M32 24 V47" fill="none" stroke="#16130f" strokeWidth="1.4" />
        <path d="M19 27 H27 M19 33 H27 M37 30 H45 M37 36 H45" fill="none" stroke="#16130f" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
        <path d="M36 17 L40 13 L44 17" fill="none" stroke="#FA5B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 13 V20" fill="none" stroke="#FA5B35" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
];

export function Intro() {
  const { go } = useApp();
  return (
    <>
      <Body>
        <Rise className="label">What Alba is for</Rise>
        <Rise><h1 className="m" style={{ fontSize: 28, lineHeight: 1.2, margin: 0 }}>Put your money behind what you believe in.</h1></Rise>
        <Rise style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>For anyone who wants to start investing without pretending they already know how.</Rise>
        <div className="rows" style={{ display: 'flex', flexDirection: 'column' }}>
          {introRows.map(r => (
            <Rise key={r.title} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '15px 0' }}>
              <motion.svg
                viewBox="0 0 64 64" style={{ width: 64, height: 64, display: 'block', flex: 'none' }}
                variants={{ hidden: { scale: 0.8, rotate: -6 }, show: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } } }}
                aria-hidden
              >{r.art}</motion.svg>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span className="m" style={{ fontSize: 16, lineHeight: 1.25 }}>{r.title}</span>
                <span style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{r.text}</span>
              </span>
            </Rise>
          ))}
        </div>
        <Rise className="small">Built in Switzerland. Your money stays yours. Pause or take it back any time.</Rise>
      </Body>
      <div className="foot" style={{ paddingTop: 16 }}>
        <button className="cta" onClick={() => go('start')}>Start</button>
        <button className="link" onClick={() => go('home')}>I already have an account</button>
      </div>
    </>
  );
}

/* ---------- start ---------- */
const startArt = [
  <>
    <circle cx="26" cy="26" r="16" fill="rgba(250,91,53,.34)" />
    <path d="M11 22 H41 V38 H11 Z" fill="#fff" stroke="#16130f" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M11 27 H41" fill="none" stroke="#16130f" strokeWidth="1.2" />
    <circle cx="26" cy="33" r="3.5" fill="#FEDCD3" stroke="#16130f" strokeWidth="1.2" />
    <path d="M26 17 V11 M21 14 L26 10 L31 14" fill="none" stroke="#16130f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".45" />
  </>,
  <>
    <circle cx="26" cy="26" r="16" fill="rgba(250,91,53,.34)" />
    <circle cx="26" cy="26" r="13" fill="#fff" stroke="#16130f" strokeWidth="1.3" />
    <path d="M32 20 L28.5 28.5 L20 32 L23.5 23.5 Z" fill="#FEDCD3" stroke="#16130f" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M26 10 V13 M26 39 V42 M10 26 H13 M39 26 H42" fill="none" stroke="#16130f" strokeWidth="1.3" strokeLinecap="round" opacity=".5" />
  </>,
  <>
    <circle cx="26" cy="26" r="16" fill="rgba(250,91,53,.34)" />
    <path d="M12 36 L20 28 L26 32 L40 17" fill="none" stroke="#16130f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M33 17 H40 V24" fill="none" stroke="#16130f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 41 C22 38 21 34 21 31 C24 31 26 33 26 36 C26 33 28 31 31 31 C31 34 30 38 26 41 Z" fill="#FEDCD3" stroke="#16130f" strokeWidth="1.2" strokeLinejoin="round" />
  </>,
];

export function Start() {
  const { s, set, go } = useApp();
  const pick = (i: number) => {
    set({ situation: i });
    window.setTimeout(() => go('pace'), 180);
  };
  return (
    <>
      <Body>
        <Rise><Logo /></Rise>
        <Rise><h1 className="m" style={{ fontSize: 30, lineHeight: 1.15, margin: 0 }}>Where are you right now?</h1></Rise>
        <Rise className="lead">Pick the one that sounds most like you. No score, no test, and you can change it later.</Rise>
        <div className="rows" style={{ display: 'flex', flexDirection: 'column' }}>
          {SITUATIONS.map((text, i) => (
            <Rise key={text}>
              <motion.button
                onClick={() => pick(i)}
                whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', width: '100%' }}
              >
                <svg viewBox="0 0 52 52" style={{ width: 52, height: 52, flex: 'none', display: 'block' }} aria-hidden>{startArt[i]}</svg>
                <span className="m" style={{ flex: 1, fontSize: 16, lineHeight: 1.3 }}>{text}</span>
                <motion.span
                  animate={{ x: s.situation === i ? 4 : 0, color: s.situation === i ? '#FA5B35' : '#8a827a' }}
                  style={{ fontSize: 15 }}
                >→</motion.span>
              </motion.button>
            </Rise>
          ))}
        </div>
        <Rise style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0', borderTop: '1px solid var(--rule)' }}>
          <div className="label">11’400 people started here with CHF 100</div>
          <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <Avatar who="sophie" />
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, lineHeight: 1.4 }}>“I thought I needed more money first. I didn’t.”</span>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Sophie, 34, teacher, CHF 200/mo since 2024</span>
            </span>
          </div>
        </Rise>
      </Body>
      <div className="foot" style={{ paddingTop: 14 }}>
        <button className="link" style={{ fontSize: 13 }} onClick={() => go('home')}>
          <span className="underline">Just show me around first</span>
        </button>
      </div>
    </>
  );
}

/* ---------- pace ---------- */
function HorizonSlider() {
  const { s, set } = useApp();
  const track = useRef<HTMLDivElement>(null);
  const last = HORIZONS.length - 1;
  const pct = (s.horizon / last) * 100;

  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const h = Math.round(t * last);
    if (h !== s.horizon) set({ horizon: h });
  };
  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    fromPointer(e.clientX);
  };
  const onMove = (e: PointerEvent) => { if (e.buttons) fromPointer(e.clientX); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set({ horizon: Math.min(last, s.horizon + 1) });
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set({ horizon: Math.max(0, s.horizon - 1) });
  };
  const inner = s.horizon > 0 && s.horizon < last && s.horizon !== 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
      <div className="label">
        How long is this money for?
        <AnimatePresence>
          {inner && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--ink)' }}>
              {' '}· {HORIZONS[s.horizon]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div
        ref={track}
        role="slider" tabIndex={0} aria-label="How long is this money for?"
        aria-valuemin={0} aria-valuemax={last} aria-valuenow={s.horizon} aria-valuetext={HORIZONS[s.horizon]}
        onPointerDown={onDown} onPointerMove={onMove} onKeyDown={onKey}
        style={{ height: 22, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none', margin: '-10px 0' }}
      >
        <div style={{ height: 2, background: 'var(--rule)', position: 'relative', width: '100%' }}>
          {HORIZONS.map((_, i) => (
            <span key={i} style={{ position: 'absolute', left: `${(i / last) * 100}%`, top: -2, width: 1, height: 6, background: 'rgba(0,0,0,.18)' }} />
          ))}
          <motion.span
            animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            style={{ position: 'absolute', left: 0, top: 0, height: 2, background: 'var(--ink)' }}
          />
          <motion.span
            animate={{ left: `${pct}%` }} transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            whileTap={{ scale: 1.15 }}
            style={{ position: 'absolute', top: -9, width: 20, height: 20, borderRadius: '50%', background: 'var(--ink)', x: '-50%' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
        {[0, 2, last].map(i => (
          <button key={i} onClick={() => set({ horizon: i })} style={{ color: s.horizon === i ? 'var(--ink)' : undefined, transition: 'color .2s' }}>
            {HORIZONS[i]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Pace() {
  const { s, d, set, go } = useApp();
  const world = PACES[d.pace].world;
  return (
    <>
      <Body gap={15}>
        <Rise><Progress step={2} onBack={() => go('start')} /></Rise>
        <Rise><h1 className="title">If your money dropped 10% one month, what would you do?</h1></Rise>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DROP_ANSWERS.map((a, i) => (
            <Rise key={a.title}>
              <button className={`choice${s.drop === i ? ' on' : ''}`} onClick={() => set({ drop: i })} aria-pressed={s.drop === i}>
                <Check on={s.drop === i} />
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="m" style={{ fontSize: 15.5, lineHeight: 1.3 }}>{a.title}</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--muted)' }}>{a.note}</span>
                </span>
              </button>
            </Rise>
          ))}
        </div>
        <Rise><HorizonSlider /></Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: 16, borderRadius: 20, border: '1.5px solid var(--ink)' }}>
          <div className="label">Your pace</div>
          <div style={{ position: 'relative', height: 26, overflow: 'hidden' }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={d.pace}
                className="m" style={{ fontSize: 26, lineHeight: 1 }}
                initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -26, opacity: 0 }}
                transition={{ duration: 0.35, ease }}
              >{d.pace}</motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence initial={false} mode="wait">
            <motion.div key={d.pace} className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {PACES[d.pace].note}
            </motion.div>
          </AnimatePresence>
          <div style={{ height: 8, display: 'flex', gap: 3, marginTop: 2 }}>
            <motion.span animate={{ width: `${world}%` }} transition={{ duration: 0.5, ease }} style={{ borderRadius: 100, background: 'var(--ink)' }} />
            <motion.span animate={{ width: `${100 - world}%` }} transition={{ duration: 0.5, ease }} style={{ borderRadius: 100, background: 'var(--tint)' }} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{world}% world funds, {100 - world}% your themes</div>
        </Rise>
      </Body>
      <div className="foot" style={{ paddingTop: 16 }}>
        <button className="cta" onClick={() => go('themes')}>See my themes</button>
      </div>
    </>
  );
}

/* ---------- themes ---------- */
export function Themes() {
  const { s, d, set, go, notify } = useApp();
  const n = s.themes.length;
  const toggle = (id: string) => {
    if (s.themes.includes(id)) set({ themes: s.themes.filter(t => t !== id) });
    else if (n >= MAX_THEMES) notify('Four is the most. Drop one to swap it for another.');
    else set({ themes: [...s.themes, id] });
  };
  const summary = n === 0
    ? '100% whole world · no themes, and that’s fine'
    : `${d.worldPct}% whole world · ${100 - d.worldPct}% your ${n === 1 ? 'pick' : `${words[n]} picks`}`;
  return (
    <>
      <Body>
        <Rise><Progress step={3} onBack={() => go('pace')} /></Rise>
        <Rise><h1 className="title">Most of it goes to the whole world. Where should the rest go?</h1></Rise>
        <Rise className="label">Pick 2–4 · change any time</Rise>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {THEME_OPTIONS.map(t => {
            const on = s.themes.includes(t.id);
            return (
              <Rise key={t.id}>
                <button className={`choice${on ? ' on' : ''}`} style={{ alignItems: 'center', padding: '14px 15px' }} onClick={() => toggle(t.id)} aria-pressed={on}>
                  <Check on={on} />
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span className="m" style={{ fontSize: 15.5 }}>{t.name}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t.meta}</span>
                  </span>
                </button>
              </Rise>
            );
          })}
        </div>
        <Rise className="small">No strong feelings? Skip. World funds only is a real answer.</Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="label">So far</div>
          <div style={{ height: 4, display: 'flex' }}>
            <motion.span animate={{ width: `${d.worldPct}%` }} transition={{ duration: 0.5, ease }} style={{ background: 'var(--ink)' }} />
            <motion.span animate={{ width: `${100 - d.worldPct}%` }} transition={{ duration: 0.5, ease }} style={{ background: '#ddd7cf' }} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{summary}</div>
        </Rise>
      </Body>
      <div className="foot">
        <button className="cta" onClick={() => go('rhythm')}>{n === 0 ? 'Continue with world funds' : 'Continue'}</button>
      </div>
    </>
  );
}

/* ---------- rhythm & amount ---------- */
export function Rhythm() {
  const { s, set, go } = useApp();
  const [draft, setDraft] = useState(s.customAmount ? String(s.amount) : '');
  const monthly = s.rhythm === 'monthly';
  const valid = s.amount >= MIN_AMOUNT;

  const choose = (rhythm: 'monthly' | 'oneoff') => set({ rhythm, repeat: rhythm === 'monthly' });
  const preset = (v: number) => set({ amount: v, monthly: v, customAmount: false });
  const custom = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 5);
    setDraft(digits);
    const v = Number(digits) || 0;
    set({ amount: v, monthly: v, customAmount: true });
  };

  return (
    <>
      <Body gap={19}>
        <Rise><Progress step={4} onBack={() => go('themes')} /></Rise>
        <Rise><h1 className="title">How often do you want to put money in?</h1></Rise>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Rise>
            <button className={`choice${monthly ? ' on' : ''}`} onClick={() => choose('monthly')} aria-pressed={monthly}>
              <Check on={monthly} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="m" style={{ fontSize: 15.5 }}>Every month, automatically</span>
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--muted)' }}>8 in 10 members choose this, so you buy through the dips without deciding</span>
              </span>
            </button>
          </Rise>
          <Rise>
            <button className={`choice${!monthly ? ' on' : ''}`} onClick={() => choose('oneoff')} aria-pressed={!monthly}>
              <Check on={!monthly} />
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="m" style={{ fontSize: 15.5 }}>When I feel like it</span>
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--muted)' }}>one amount now, add more whenever, with no schedule</span>
              </span>
            </button>
          </Rise>
        </div>
        <Rise className="label">{monthly ? 'How much, each month?' : 'How much to start?'}</Rise>
        <Rise style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {AMOUNT_PRESETS.map(v => (
            <motion.button whileTap={{ scale: 0.95 }} key={v} className={`amount-pill${!s.customAmount && s.amount === v ? ' on' : ''}`} onClick={() => preset(v)}>
              CHF {v}
            </motion.button>
          ))}
          <motion.div layout transition={{ duration: 0.3, ease }} className={`amount-pill${s.customAmount ? ' on' : ''}`} style={{ padding: s.customAmount ? '8px 16px' : undefined }}>
            {s.customAmount ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                CHF
                <input
                  autoFocus inputMode="numeric" value={draft} onChange={e => custom(e.target.value)} aria-label="Other amount"
                  style={{ width: 62, border: 0, outline: 0, background: 'transparent', fontWeight: 500, fontSize: 16, padding: '2px 0' }}
                />
              </label>
            ) : (
              <button onClick={() => custom(draft || '')} style={{ fontWeight: 500 }}>Other</button>
            )}
          </motion.div>
        </Rise>
        <div className="hair" />
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${s.rhythm}-${valid}-${valid ? s.amount : 0}`}
              className="m" style={{ fontSize: 19 }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            >
              {!valid ? `Start from CHF ${MIN_AMOUNT}` : monthly ? `${chf(s.amount * 12)} over the next year` : `${chf(s.amount)} today`}
            </motion.div>
          </AnimatePresence>
          <div className="lead">
            {monthly ? 'Taken on the 1st. Skip or change any month. It isn’t a contract.' : 'Add more whenever you like. There is no schedule to keep.'}
          </div>
        </Rise>
        <Rise className="small">Keep money you’ll need in the next two years out of this. Start smaller if you’re unsure. Raising it later is one tap.</Rise>
      </Body>
      <div className="foot">
        <button className="cta" disabled={!valid} onClick={() => go('payment')}>Continue</button>
      </div>
    </>
  );
}

/* ---------- first payment ---------- */
export function Payment() {
  const { s, d, set, go } = useApp();
  const [busy, setBusy] = useState(false);
  const themesLabel = d.picked.length <= 2 ? d.picked.map(t => t.short).join(' + ') : `Your ${words[d.picked.length]} themes`;
  const fee = `CHF ${d.first.fee.toFixed(2)}`;
  const invest = () => {
    setBusy(true);
    window.setTimeout(() => go('later'), 1100);
  };
  return (
    <>
      <Body gap={19}>
        <Rise><Progress step={5} onBack={() => go('rhythm')} /></Rise>
        <Rise><h1 className="title">Your first {chf(s.amount)}</h1></Rise>
        <Rise className="rows" style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--rule)', paddingBottom: 4 }}>
          <Line label="Whole-world funds" value={chf(d.first.world)} />
          {d.picked.length > 0 && <Line label={themesLabel} value={chf(d.first.themes)} />}
          <Line label="Fee this month" value={fee} />
        </Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="label">If you change your mind</div>
          <div className="m" style={{ fontSize: 17, lineHeight: 1.3 }}>Pause or take it all back any time. No fee, money back in two days.</div>
        </Rise>
        <Rise style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ display: 'flex' }}>
            <Avatar who="sophie" size={30} />
            <span style={{ marginLeft: -9, display: 'flex' }}><Avatar who="marta" size={30} ring /></span>
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Sophie and Marta start their month the same way</span>
        </Rise>
        <div className="hair" />
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5 }}>Repeat monthly</span>
            <Switch label="Repeat monthly" on={s.repeat} onChange={v => set({ repeat: v, rhythm: v ? 'monthly' : 'oneoff' })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5 }}>Remind me before each payment</span>
            <Switch label="Remind me before each payment" on={s.remind} onChange={v => set({ remind: v })} />
          </div>
        </Rise>
        <Rise className="small">Not ready? Try it with pretend money for a month, with no payment.</Rise>
      </Body>
      <div className="foot">
        <motion.button className="cta" onClick={invest} disabled={busy} style={{ opacity: 1 }} whileTap={{ scale: 0.98 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={busy ? 'busy' : 'idle'} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            >
              {busy ? (<><Spinner /> Investing {chf(s.amount)}</>) : `Invest ${chf(s.amount)}`}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 0' }}>
      <span style={{ fontSize: 13.5 }}>{label}</span>
      <span className="m" style={{ fontSize: 17 }}>{value}</span>
    </div>
  );
}

export function Spinner() {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', display: 'inline-block' }}
    />
  );
}

