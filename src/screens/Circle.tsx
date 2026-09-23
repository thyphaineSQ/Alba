import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { EVENTS, PEOPLE, POSTS, THREADS, type PersonId } from '../data';
import { useApp } from '../store';
import { Avatar, Logo, Rise, Sheet, SheetHeader, ease } from '../ui';
import { AppBody, EventCard, EventSheet } from './Home';

function Heart({ on }: { on: boolean }) {
  return (
    <motion.span
      key={String(on)}
      initial={on ? { scale: 0.4 } : false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 14 }}
      style={{ display: 'inline-block', color: on ? 'var(--accent)' : undefined }}
    >{on ? '♥' : '♡'}</motion.span>
  );
}

function ThreadSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const t = THREADS.find(x => x.id === id);
  return (
    <Sheet open={!!t} onClose={onClose} label="Thread">
      {t && (
        <>
          <SheetHeader title={t.q} sub={t.meta} onClose={onClose} />
          <div className="rows" style={{ padding: '0 22px 26px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {t.answers.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease, delay: 0.1 + i * 0.07 }}
                style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '14px 0' }}
              >
                <Avatar who={a.who} />
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span className="m" style={{ fontSize: 13.5 }}>{a.name}</span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{a.text}</span>
                </span>
              </motion.div>
            ))}
            <div className="small" style={{ paddingTop: 14 }}>Moderated by members who invest here. No tips, no stock picks.</div>
          </div>
        </>
      )}
    </Sheet>
  );
}

export function Circle() {
  const { s, set, notify } = useApp();
  const [draft, setDraft] = useState('');
  const [event, setEvent] = useState<string | null>(null);
  const [thread, setThread] = useState<string | null>(null);

  const post = () => {
    const text = draft.trim();
    if (!text) return;
    set({ myPosts: [{ id: `me-${Date.now()}`, text }, ...s.myPosts] });
    setDraft('');
    notify('Posted anonymously. We’ll tell you when someone answers.');
  };
  const like = (id: string) => set({ liked: s.liked.includes(id) ? s.liked.filter(l => l !== id) : [...s.liked, id] });
  const follow = (p: PersonId) => set({ follows: { ...s.follows, [p]: !s.follows[p] } });

  return (
    <>
      <AppBody gap={16} pad="20px 26px 0">
        <Rise style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>You’re anonymous here</span>
        </Rise>
        <Rise><h1 className="m" style={{ fontSize: 27, lineHeight: 1.25, margin: 0 }}>You’re not alone in this.</h1></Rise>
        <Rise>
          <form className="field" onSubmit={e => { e.preventDefault(); post(); }}>
            <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Ask the community a question…" aria-label="Ask the community a question" style={{ fontSize: 13 }} />
            <button type="submit" className="pill-btn">Ask</button>
          </form>
        </Rise>

        <Rise style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span className="label">Coming up</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{EVENTS.length} this month</span>
        </Rise>
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EVENTS.map((e, i) => <EventCard key={e.id} e={e} strong={i === 0} compact onOpen={() => setEvent(e.id)} />)}
        </Rise>

        <Rise style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span className="label">Investors to follow</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{Object.values(s.follows).filter(Boolean).length} following</span>
        </Rise>
        <Rise className="chiprow" style={{ minHeight: 196, gap: 11, alignItems: 'stretch' }}>
          {(Object.keys(PEOPLE) as PersonId[]).map(p => {
            const on = s.follows[p];
            return (
              <div key={p} style={{ width: 150, flex: 'none', display: 'flex', flexDirection: 'column', gap: 9, padding: 15, border: '1px solid var(--rule)', borderRadius: 20 }}>
                <Avatar who={p} size={40} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="m" style={{ fontSize: 14 }}>{PEOPLE[p].name}</span>
                  <span style={{ fontSize: 11.5, lineHeight: 1.35, color: 'var(--muted)' }}>{PEOPLE[p].meta}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="m green" style={{ fontSize: 13.5 }}>{PEOPLE[p].ytd}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>this year</span>
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => follow(p)}
                  className={`pill-btn${on ? ' pill-soft' : ''}`}
                  style={{ fontSize: 12.5, textAlign: 'center', padding: '9px 0', marginTop: 'auto' }}
                  aria-pressed={on}
                >{on ? 'Following' : 'Follow'}</motion.button>
              </div>
            );
          })}
        </Rise>
        <Rise style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted)' }}>Members choose to show their percentage. Nobody ever sees your amounts.</Rise>

        <Rise className="label">From your circle</Rise>
        <Rise className="rows" style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence initial={false}>
            {s.myPosts.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '14px 0' }}>
                  <span className="avatar" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tint)' }}>
                    <span className="m" style={{ fontSize: 12, color: 'var(--ink-2)' }}>You</span>
                  </span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span className="m" style={{ fontSize: 13.5 }}>You, anonymous</span><span style={{ fontSize: 11.5, color: 'var(--muted)' }}>just now</span></span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{p.text}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Waiting for answers</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {POSTS.map(p => {
            const on = s.liked.includes(p.id);
            return (
              <div key={p.id} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '14px 0' }}>
                <Avatar who={p.who} />
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span className="m" style={{ fontSize: 13.5 }}>{p.name}</span><span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.when}</span></span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{p.text}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    {p.replies} replies · <button onClick={() => like(p.id)} aria-pressed={on} aria-label="Heart" style={{ fontSize: 11.5 }}>{p.hearts + (on ? 1 : 0)} <Heart on={on} /></button>
                  </span>
                </span>
              </div>
            );
          })}
        </Rise>

        <Rise className="label">Talking about now</Rise>
        <Rise className="rows" style={{ display: 'flex', flexDirection: 'column' }}>
          {THREADS.map(t => (
            <button key={t.id} onClick={() => setThread(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', width: '100%' }}>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="m" style={{ fontSize: 14.5, lineHeight: 1.3 }}>{t.q}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.meta}</span>
              </span>
              <span className="m" style={{ fontSize: 12.5, padding: '8px 14px', borderRadius: 100, background: 'rgba(22,19,15,.07)' }}>Read</span>
            </button>
          ))}
        </Rise>
        <Rise style={{ padding: '2px 0 18px' }} className="small">Moderated by members who invest here. No tips, no stock picks.</Rise>
      </AppBody>
      <EventSheet id={event} onClose={() => setEvent(null)} />
      <ThreadSheet id={thread} onClose={() => setThread(null)} />
    </>
  );
}
