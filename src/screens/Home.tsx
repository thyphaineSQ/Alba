import { motion } from 'motion/react';
import { useState } from 'react';
import { AMOUNT_PRESETS, EVENTS, chf, num, signedChf, type EventItem } from '../data';
import { useApp } from '../store';
import { Avatar, CountUp, Logo, Rise, Sheet, SheetHeader, Switch, ease, stagger } from '../ui';

export function AppBody({ children, gap = 15, pad = '22px 26px 0' }: { children: React.ReactNode; gap?: number; pad?: string }) {
  return (
    <motion.div className="body scroll" style={{ gap, padding: pad, paddingBottom: 64 }} variants={stagger} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

/* ---------- projection chart ---------- */
// One linear scale: the projection lands 60% up the plot, history runs 2024 to today.
function ProjectionChart({ balance, projection }: { balance: number; projection: number }) {
  const max = Math.max(projection, balance * 1.2) / 0.65;
  const y = (v: number) => 100 - (v / max) * 92;
  const yT = y(balance), yE = y(projection), yHi = y(projection * 1.3), yLo = y(projection * 0.74);
  const curve = (end: number) => `C150,${(yT - (yT - end) * 0.15).toFixed(1)} 250,${(yT - (yT - end) * 0.55).toFixed(1)} 338,${end.toFixed(1)}`;
  const band = `M68,${yT} ${curve(yHi)} L338,${yLo.toFixed(1)} C250,${(yT - (yT - yLo) * 0.55).toFixed(1)} 150,${(yT - (yT - yLo) * 0.15).toFixed(1)} 68,${yT} Z`;

  return (
    <svg viewBox="0 0 338 104" style={{ width: '100%', height: 92, display: 'block', overflow: 'visible' }} aria-label={`Projection to 2034: about ${chf(projection)}`}>
      <defs>
        <clipPath id="reveal">
          <motion.rect x="0" y="-10" height="124" initial={{ width: 60 }} animate={{ width: 350 }} transition={{ duration: 1.4, ease, delay: 0.25 }} />
        </clipPath>
      </defs>
      <g clipPath="url(#reveal)">
        <path d={band} fill="rgba(250,91,53,.4)" style={{ transition: 'd .6s' }} />
        <path d={`M68,${yT} ${curve(yE)}`} style={{ transition: 'd .6s' }} fill="none" stroke="#FA5B35" strokeWidth="1.6" strokeDasharray="4 4" />
      </g>
      <path d={`M0,100 C25,99 45,${yT + 3} 68,${yT}`} fill="none" stroke="#16130f" strokeWidth="2" />
      <motion.circle cx="68" cy={yT} r="3.5" fill="#16130f" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.2 }} />
    </svg>
  );
}

/* ---------- event card & sheet ---------- */
export function EventCard({ e, strong, onOpen, compact }: { e: EventItem; strong?: boolean; onOpen: () => void; compact?: boolean }) {
  const { s } = useApp();
  const going = s.going.includes(e.id);
  const count = e.going + (going ? 1 : 0);
  const who = going ? (e.incl ? `incl. you and ${e.incl}` : 'incl. you') : e.incl ? `incl. ${e.incl}` : '';
  const line = e.id === 'webinar' ? `${e.when} · ${num(count)} signed up` : `${e.when} · ${count} going${who ? `, ${who}` : ''}`;
  return (
    <motion.button
      onClick={onOpen}
      whileTap={{ scale: 0.985 }}
      style={{
        display: 'flex', alignItems: 'center', gap: compact ? 13 : 14, padding: 12, borderRadius: 18, width: '100%',
        border: strong ? '1.5px solid var(--ink)' : '1px solid rgba(0,0,0,.16)',
      }}
    >
      <span style={{ width: compact ? 50 : 52, height: compact ? 54 : 56, borderRadius: 13, background: 'var(--tint)', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <span className="m" style={{ fontSize: compact ? 9.5 : 10, letterSpacing: '.1em', color: 'var(--ink-2)' }}>{e.month}</span>
        <span className="m" style={{ fontSize: compact ? 23 : 24, lineHeight: 1 }}>{e.day}</span>
      </span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: compact ? 4 : 5 }}>
        <span className="m" style={{ fontSize: compact ? 9.5 : 10, letterSpacing: '.1em', color: 'var(--accent)', background: 'var(--tint-14)', borderRadius: 100, padding: compact ? '4px 9px' : '4px 10px', alignSelf: 'flex-start' }}>{e.tag}</span>
        <span className="m" style={{ fontSize: compact ? 15 : 15.5, lineHeight: 1.25 }}>{e.title}</span>
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{line}</span>
      </span>
      {going && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', alignSelf: 'flex-start', marginTop: 4 }} aria-label="You’re going" />}
    </motion.button>
  );
}

export function EventSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { s, set, notify } = useApp();
  const e = EVENTS.find(x => x.id === id);
  const going = !!e && s.going.includes(e.id);
  const toggle = () => {
    if (!e) return;
    set({ going: going ? s.going.filter(g => g !== e.id) : [...s.going, e.id] });
    notify(going ? 'Okay, you’re off the list.' : e.id === 'webinar' ? 'Signed up. The link comes the morning of.' : 'You’re going. We’ll remind you the day before.');
  };
  return (
    <Sheet open={!!e} onClose={onClose} label={e?.title ?? 'Event'}>
      {e && (
        <>
          <SheetHeader title={e.title} sub={`${e.month === 'SEP' ? 'September' : 'October'} ${e.day} · ${e.when}`} onClose={onClose} />
          <div style={{ padding: '0 22px 26px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <span className="m" style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--accent)', background: 'var(--tint-14)', borderRadius: 100, padding: '4px 10px', alignSelf: 'flex-start' }}>{e.tag}</span>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>{e.about}</div>
            <div className="rows" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 13.5 }}><span className="muted">Where</span><span>{e.place}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 13.5 }}><span className="muted">{e.id === 'webinar' ? 'Signed up' : 'Going'}</span><span>{num(e.going + (going ? 1 : 0))}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex' }}>
                {['sophie', 'marta', 'lena'].map((p, i) => <span key={p} style={{ marginLeft: i ? -8 : 0, display: 'flex' }}><Avatar who={p} size={26} ring /></span>)}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Mostly people who started in the last two years</span>
            </div>
            <button className={`cta${going ? ' pill-soft' : ''}`} style={going ? { color: 'var(--ink)' } : undefined} onClick={toggle}>
              {going ? 'You’re going · Cancel' : e.id === 'webinar' ? 'Sign me up' : 'I’m going'}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ---------- manage payments ---------- */
function ManageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, set, notify } = useApp();
  const presets = Array.from(new Set([...AMOUNT_PRESETS, s.monthly])).sort((a, b) => a - b);
  return (
    <Sheet open={open} onClose={onClose} label="Manage payments">
      <SheetHeader title="Your monthly payment" sub="Taken on the 1st of each month" onClose={onClose} />
      <div style={{ padding: '4px 22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: s.paused ? 0.4 : 1, transition: 'opacity .25s' }}>
          {presets.map(v => (
            <motion.button
              key={v} whileTap={{ scale: 0.95 }}
              className={`amount-pill${s.monthly === v ? ' on' : ''}`}
              disabled={s.paused}
              onClick={() => { set({ monthly: v }); notify(`From 1 Oct, ${chf(v)} a month.`); }}
            >CHF {v}</motion.button>
          ))}
        </div>
        <div className="hair" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 14 }}>Pause payments</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Your money stays invested. Restart any time.</span>
          </span>
          <Switch label="Pause payments" on={s.paused} onChange={v => { set({ paused: v }); notify(v ? 'Paused. Nothing will be taken on 1 Oct.' : 'Back on. Next payment 1 Oct.'); }} />
        </div>
        <div className="small">Want your money back? Selling takes two days and costs nothing.</div>
        <button className="cta" onClick={onClose}>Done</button>
      </div>
    </Sheet>
  );
}

/* ---------- home ---------- */
export function Home() {
  const { s, d, go, reset } = useApp();
  const [event, setEvent] = useState<string | null>(null);
  const [manage, setManage] = useState(false);
  const firstName = 'Camille';
  return (
    <>
      <AppBody>
        <Rise><Logo onClick={reset} label="Alba by Swissquote, start the onboarding again" /></Rise>
        <Rise><h1 className="title">Two years in, {firstName}.</h1></Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingBottom: 20, borderBottom: '1px solid var(--rule)' }}>
          <div className="label">You have</div>
          <div style={{ fontWeight: 700, fontSize: 44, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 20 }}>CHF</span>
            <span><CountUp id="home-balance" value={d.balance} format={num} /></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 13 }}>
            <span className="green">{signedChf(d.yearGain)} this year</span>
            <span className="muted">· you paid in {chf(d.paidIn)}</span>
          </div>
        </Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingBottom: 16, borderBottom: '1px solid var(--rule)' }}>
          <div className="label">If you keep going</div>
          <ProjectionChart balance={d.balance} projection={d.projection} />
          <div style={{ position: 'relative', height: 12, fontSize: 9, letterSpacing: '.12em', color: 'var(--muted)' }}>
            <span style={{ position: 'absolute', left: 0 }}>2024</span>
            <span style={{ position: 'absolute', left: '20%', transform: 'translateX(-50%)', color: 'var(--ink)' }}>TODAY</span>
            <span style={{ position: 'absolute', right: 0 }}>2034</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-2)' }}>
              {s.paused ? 'Payments are paused. This is roughly where today’s balance lands.' : `Keep ${chf(s.monthly)} a month and this is roughly where you land.`}
            </span>
            <span className="m" style={{ fontSize: 19, whiteSpace: 'nowrap' }}>CHF <CountUp id="home-projection" value={d.projection} format={v => num(Math.round(v / 100) * 100)} /></span>
          </div>
        </Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="label">Happening soon in your area</div>
          <EventCard e={EVENTS[0]} onOpen={() => setEvent(EVENTS[0].id)} />
        </Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="label">Your circle</div>
          <button onClick={() => go('circle')} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Avatar who="amina" />
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 16, lineHeight: 1.35 }}>“Is 200 too little?”</span>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Amina · 14 answers · you answered</span>
            </span>
          </button>
        </Rise>
        <Rise style={{ marginTop: 'auto', padding: '15px 0', borderTop: '1px solid var(--rule)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)' }}>
          <span>{s.paused ? 'Payments paused' : `Next payment 1 Oct · ${chf(s.monthly)}`}</span>
          <button className="underline" style={{ color: 'var(--ink)', borderBottomColor: 'rgba(0,0,0,.3)' }} onClick={() => setManage(true)}>Manage</button>
        </Rise>
      </AppBody>
      <EventSheet id={event} onClose={() => setEvent(null)} />
      <ManageSheet open={manage} onClose={() => setManage(false)} />
    </>
  );
}
