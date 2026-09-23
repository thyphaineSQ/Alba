import { motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { chf, num, signedChf } from '../data';
import { useApp } from '../store';
import { CountUp, Logo, Rise, Sheet, SheetHeader, ease } from '../ui';
import { AppBody } from './Home';

const glyph = (d: string) => (
  <svg viewBox="0 0 38 38" style={{ width: 38, height: 38 }} aria-hidden>
    <path d={d} fill="none" stroke="#16130f" strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
  </svg>
);
const GLYPHS = {
  world: glyph('M9,19 A10,10 0 0,1 29,19 M9,19 A10,10 0 0,0 29,19 M19,9 L19,29 M9,19 L29,19'),
  swiss: glyph('M19,10 L19,28 M12,19 L26,19'),
  climate: glyph('M19,28 C10,24 10,12 19,9 C28,12 28,24 19,28 M19,28 L19,14'),
  women: glyph('M19,9 A6,6 0 1,1 19,21 A6,6 0 1,1 19,9 M19,21 L19,29 M14,25 L24,25'),
  pension: glyph('M11,15 L27,15 L27,27 L11,27 Z M11,15 L19,9 L27,15 M17,27 L17,21 L21,21 L21,27'),
};

function Holding({ icon, bg, name, note, value, gain }: { icon: ReactNode; bg: string; name: string; note: string; value: number; gain: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 0' }}>
      <span className="mark" style={{ background: bg, overflow: 'hidden' }}>{icon}</span>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span className="m" style={{ fontSize: 15.5, lineHeight: 1.25 }}>{name}</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.35 }}>{note}</span>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span className="m" style={{ fontSize: 16 }}><CountUp id={`h-${name}`} value={value} format={chf} /></span>
        <span style={{ fontSize: 12.5, fontWeight: gain < 0 ? 400 : 500, color: gain < 0 ? 'var(--muted)' : 'var(--green)' }}>{signedChf(gain)}</span>
      </span>
    </div>
  );
}

function Group({ name, total, tint, children }: { name: string; total: number; tint: string; children: ReactNode }) {
  return (
    <>
      <Rise style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 4 }}>
        <span className="m" style={{ fontSize: 16 }}>{name}</span>
        <span className="m" style={{ fontSize: 13, background: tint, borderRadius: 100, padding: '5px 12px' }}>{chf(total)}</span>
      </Rise>
      <Rise className="rows" style={{ display: 'flex', flexDirection: 'column' }}>{children}</Rise>
    </>
  );
}

export function Wealth() {
  const { s, d, set, notify } = useApp();
  const [investing, setInvesting] = useState(false);
  const h = d.holdings, g = d.gains;
  const segs = [
    { w: d.etfs, bg: 'linear-gradient(180deg,#2c2723,#16130f)' },
    { w: d.themes, bg: 'linear-gradient(180deg,#8b837a,#6f675f)' },
    { w: h.pension, bg: '#FA5B35' },
    { w: h.cash, bg: '#FEDCD3' },
  ];
  const cashToWorld = h.cash;

  return (
    <>
      <AppBody gap={17} pad="24px 26px 0">
        <Rise><Logo /></Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div className="label">Your wealth</div>
          <div className="m" style={{ fontSize: 42, lineHeight: 1 }}>CHF <CountUp id="wealth-balance" value={d.balance} format={num} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, lineHeight: 1.5 }}>
            <span className="m" style={{ background: 'var(--green-tint)', color: 'var(--green)', borderRadius: 100, padding: '3px 10px' }}>{signedChf(d.yearGain)} this year</span>
            <span className="muted">since September 2024</span>
          </div>
        </Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingBottom: 18, borderBottom: '1px solid var(--rule)' }}>
          <div style={{ height: 8, display: 'flex', gap: 3 }}>
            {segs.map((sg, i) => (
              <motion.span
                key={i}
                initial={{ flexGrow: 0 }}
                animate={{ flexGrow: sg.w }}
                transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.08 }}
                style={{ flexBasis: 0, borderRadius: 100, background: sg.bg, minWidth: sg.w ? 8 : 0, display: sg.w || i < 3 ? 'block' : 'none' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: 'var(--ink-2)' }}>
            {[['ETFs', '#16130f'], ['Themes', '#6f675f'], ['Pension 3a', '#FA5B35'], ['Cash', '#FEDCD3']].map(([l, c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, background: c }} />{l}</span>
            ))}
          </div>
        </Rise>

        <Group name="ETFs" total={d.etfs} tint="rgba(22,19,15,.06)">
          <Holding icon={GLYPHS.world} bg="#E4E7F2" name="World fund" note="Growing slowly and steadily" value={h.world} gain={g.world} />
          <Holding icon={GLYPHS.swiss} bg="#F2E7E7" name="Swiss fund" note="Flat this month, that’s normal" value={h.swiss} gain={g.swiss} />
        </Group>
        <Group name="Themes" total={d.themes} tint="rgba(111,103,95,.14)">
          <Holding icon={GLYPHS.climate} bg="#FEE6DF" name="Climate Transition" note="Held by 4’120 members" value={h.climate} gain={g.climate} />
          <Holding icon={GLYPHS.women} bg="#EDE6F2" name="Women in Leadership" note="Held by 3’540 members" value={h.women} gain={g.women} />
        </Group>
        <Group name="Pension 3a" total={h.pension} tint="var(--tint-14)">
          <Holding icon={GLYPHS.pension} bg="#FEEBE5" name="Retirement savings" note="CHF 6’400 left to save tax-free this year" value={h.pension} gain={g.pension} />
        </Group>

        <Rise style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginTop: 4, borderRadius: 18, border: '1.5px solid var(--ink)' }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span className="m" style={{ fontSize: 16 }}>Cash</span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{s.cashInvested ? 'All invested' : 'Not invested yet'}</span>
          </span>
          <span className="m" style={{ fontSize: 16 }}><CountUp id="cash" value={h.cash} format={chf} /></span>
          <button className="pill-btn" disabled={s.cashInvested} style={s.cashInvested ? { background: 'rgba(22,19,15,.07)', color: 'var(--muted)', cursor: 'default' } : undefined} onClick={() => setInvesting(true)}>
            {s.cashInvested ? 'Done ✓' : 'Invest'}
          </button>
        </Rise>
        <Rise style={{ padding: '4px 0 18px' }} className="small">{s.paused ? 'Payments paused' : `Next payment 1 Oct · ${chf(s.monthly)}`}</Rise>
      </AppBody>

      <Sheet open={investing} onClose={() => setInvesting(false)} label="Invest your cash">
        <SheetHeader title="Invest your cash" sub="It goes in at today’s price" onClose={() => setInvesting(false)} />
        <div style={{ padding: '4px 22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="m" style={{ fontSize: 34, lineHeight: 1 }}>{chf(cashToWorld)}</div>
          <div className="rows" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 13.5 }}><span className="muted">Goes into</span><span>World fund</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 13.5 }}><span className="muted">Fee</span><span>CHF {(cashToWorld * 0.008).toFixed(2)}</span></div>
          </div>
          <div className="small">Your base fund, the one that holds the whole world. You can move it later without a fee.</div>
          <button
            className="cta"
            onClick={() => {
              set({ cashInvested: true });
              setInvesting(false);
              notify(`${chf(cashToWorld)} is now in your World fund.`);
            }}
          >Invest {chf(cashToWorld)}</button>
        </div>
      </Sheet>
    </>
  );
}
