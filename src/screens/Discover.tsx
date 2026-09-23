import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import {
  CALMEST, ETF_CATS, ETF_DATA, FEATURED, PENSION, PICKED, RISK_ABOUT, SHARES, THEME_CATS, THEME_DATA, allItems, type Item,
} from '../data';
import { useApp, type State } from '../store';
import { Avatar, ItemRow, Logo, RiskPill, Rise, Sheet, SheetHeader, ease } from '../ui';
import { AppBody } from './Home';

const FILTERS: { id: State['filter']; label: string }[] = [
  { id: 'forYou', label: 'For you' },
  { id: 'themes', label: 'Themes' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'shares', label: 'Shares' },
  { id: 'pension', label: 'Pension 3a' },
  { id: 'low', label: 'Low risk' },
];

function List({ items, onOpen, k }: { items: Item[]; onOpen: (i: Item) => void; k: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={k}
        className="rows" style={{ display: 'flex', flexDirection: 'column' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease }}
      >
        {items.map(i => <ItemRow key={i.name} item={i} onOpen={onOpen} />)}
      </motion.div>
    </AnimatePresence>
  );
}

function SubChips({ cats, value, onPick, group }: { cats: { id: string; label: string }[]; value: string; onPick: (id: string) => void; group: string }) {
  return (
    <LayoutGroup id={group}>
      <div className="chiprow" style={{ gap: 7, minHeight: 42, padding: 0, margin: 0 }}>
        {cats.map(c => (
          <button key={c.id} className={`subchip${value === c.id ? ' on' : ''}`} onClick={() => onPick(c.id)}>
            {value === c.id && <motion.span layoutId="bg" className="chip-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div className="label">{label}</div>
      {children}
    </motion.div>
  );
}

export function ItemSheet({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const { s, set, notify } = useApp();
  const inMix = !!item && s.mix.includes(item.name);
  const held = !!item && ['Climate Transition', 'Women in Leadership', 'World fund', 'Swiss fund', 'Retirement savings'].includes(item.name);
  const neg = item?.change?.startsWith('−');
  return (
    <Sheet open={!!item} onClose={onClose} label={item?.name ?? 'Details'}>
      {item && (
        <>
          <SheetHeader
            icon={<span className="mark" style={{ background: item.mark, width: 44, height: 44, borderRadius: 13 }} />}
            title={item.name}
            sub={item.kind}
            onClose={onClose}
          />
          <div style={{ padding: '4px 22px 26px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>{item.about ?? item.note}</div>
            <div className="rows" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
              {item.change && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 13.5 }}>
                  <span className="muted">Last 30 days</span>
                  <span className="m" style={{ color: neg ? 'var(--muted)' : 'var(--green)' }}>{item.change}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', fontSize: 13.5, gap: 12 }}>
                <span className="muted">How much it moves</span>
                <RiskPill risk={item.risk} />
              </div>
              <div style={{ padding: '0 0 12px', fontSize: 12.5, color: 'var(--muted)', borderTop: 0 }}>{RISK_ABOUT[item.risk]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex' }}>
                {['sophie', 'marta', 'lena'].map((p, i) => <span key={p} style={{ marginLeft: i ? -8 : 0, display: 'flex' }}><Avatar who={p} size={26} ring /></span>)}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Members like you hold this</span>
            </div>
            {held ? (
              <div className="small" style={{ textAlign: 'center', padding: '8px 0' }}>You already hold this. It’s in your Wealth tab.</div>
            ) : (
              <button
                className={`cta${inMix ? ' pill-soft' : ''}`}
                style={inMix ? { color: 'var(--ink)' } : undefined}
                onClick={() => {
                  set({ mix: inMix ? s.mix.filter(m => m !== item.name) : [...s.mix, item.name] });
                  notify(inMix ? `${item.name} is out of your mix.` : `${item.name} joins your mix from the next payment.`);
                }}
              >{inMix ? 'In your mix · Remove' : 'Add to my monthly mix'}</button>
            )}
            <div className="small" style={{ textAlign: 'center' }}>From CHF 50 · Calm, Steady and Bold describe movement, not quality.</div>
          </div>
        </>
      )}
    </Sheet>
  );
}

export function Discover() {
  const { s, set } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Item | null>(null);
  const f = s.filter;
  const q = query.trim().toLowerCase();
  const results = useMemo(
    () => (q ? allItems().filter(i => `${i.name} ${i.note} ${i.kind} ${i.risk}`.toLowerCase().includes(q)) : []),
    [q],
  );
  const themeItems = s.themeCat === 'all' ? PICKED : THEME_DATA[s.themeCat] ?? [];

  return (
    <>
      <AppBody gap={16}>
        <Rise><Logo /></Rise>
        <Rise><h1 className="m" style={{ fontSize: 27, lineHeight: 1.25, margin: 0 }}>Find something you believe in.</h1></Rise>
        <Rise>
          <label style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', borderRadius: 100, background: 'var(--field)' }}>
            <svg viewBox="0 0 16 16" style={{ width: 16, height: 16, flex: 'none' }} aria-hidden>
              <circle cx="7" cy="7" r="5" fill="none" stroke="#8a827a" strokeWidth="1.5" />
              <path d="M10.7 10.7 L14.5 14.5" stroke="#8a827a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a theme, fund or company"
              style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', fontSize: 13.5 }}
              className="search"
            />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search" style={{ color: 'var(--muted)', fontSize: 13 }}>Clear</button>}
          </label>
        </Rise>

        {q ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="label">{results.length ? `${results.length} result${results.length > 1 ? 's' : ''}` : 'Nothing yet'}</div>
            {results.length ? (
              <div className="rows" style={{ display: 'flex', flexDirection: 'column' }}>
                {results.map(i => <ItemRow key={i.name} item={i} onOpen={setOpen} />)}
              </div>
            ) : (
              <div className="small">No match for “{query}”. Try a theme like climate, a region like Japan, or a word like bonds.</div>
            )}
          </motion.div>
        ) : (
          <>
            <Rise>
              <LayoutGroup id="filters">
                <div className="chiprow">
                  {FILTERS.map(c => (
                    <button key={c.id} className={`chip${f === c.id ? ' on' : ''}`} onClick={() => set({ filter: c.id })}>
                      {f === c.id
                        ? <motion.span layoutId="chip" className="chip-bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
                        : <span className="chip-ring" />}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </Rise>

            <Rise style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {f === 'forYou' && (
                  <Section key="featured" label="Popular with members like you">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13, padding: 17, borderRadius: 22, background: 'var(--tint-grad)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ width: 44, height: 44, borderRadius: 13, background: '#FC8A6E', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                          <svg viewBox="0 0 44 44" style={{ width: 44, height: 44 }} aria-hidden>
                            <path d="M22,33 L22,19" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M22,23 C15,23 12,19 12,14 C18,14 22,17 22,23 Z" fill="#fff" opacity=".92" />
                            <path d="M22,27 C29,27 32,23 32,18 C26,18 22,21 22,27 Z" fill="#fff" opacity=".7" />
                          </svg>
                        </span>
                        <span className="m" style={{ fontSize: 11.5, padding: '5px 11px', borderRadius: 100, background: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap' }}>Steady</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span className="m" style={{ fontSize: 23, lineHeight: 1.2 }}>Climate Transition</span>
                        <span className="lead">38 companies working on cleaner energy, transport and buildings.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'flex' }}>
                          {['sophie', 'marta', 'lena'].map((p, i) => <span key={p} style={{ marginLeft: i ? -8 : 0, display: 'flex' }}><Avatar who={p} size={26} ring /></span>)}
                        </span>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}><span className="m">4’120 members</span> hold this, incl. Sophie</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button className="pill-btn" style={{ padding: '12px 20px', fontSize: 13.5 }} onClick={() => setOpen(FEATURED)}>Take a look</button>
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>From CHF 50</span>
                      </div>
                    </div>
                  </Section>
                )}
                {(f === 'forYou' || f === 'themes') && (
                  <Section key="themes" label="By theme">
                    <SubChips group="themecats" cats={THEME_CATS} value={s.themeCat} onPick={id => set({ themeCat: id })} />
                    <List k={s.themeCat} items={themeItems} onOpen={setOpen} />
                  </Section>
                )}
                {(f === 'forYou' || f === 'etfs') && (
                  <Section key="etfs" label="ETFs & funds">
                    <SubChips group="etfcats" cats={ETF_CATS} value={s.etfCat} onPick={id => set({ etfCat: id })} />
                    <List k={s.etfCat} items={ETF_DATA[s.etfCat] ?? []} onOpen={setOpen} />
                  </Section>
                )}
                {(f === 'forYou' || f === 'shares') && (
                  <Section key="shares" label="Single shares"><List k="shares" items={SHARES} onOpen={setOpen} /></Section>
                )}
                {(f === 'forYou' || f === 'pension') && (
                  <Section key="pension" label="Pension 3a"><List k="pension" items={PENSION} onOpen={setOpen} /></Section>
                )}
                {f === 'low' && (
                  <Section key="calm" label="Moves the least"><List k="calm" items={CALMEST} onOpen={setOpen} /></Section>
                )}
              </AnimatePresence>
            </Rise>
          </>
        )}
        <Rise style={{ padding: '4px 0 18px' }} className="small">Calm, Steady and Bold describe how much a holding moves, not how good it is.</Rise>
      </AppBody>
      <ItemSheet item={open} onClose={() => setOpen(null)} />
    </>
  );
}
