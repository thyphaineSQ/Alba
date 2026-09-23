import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ALL_VIDEOS, CHAPTERS, img } from '../data';
import { useChat } from '../chat';
import { learnProgress, useApp } from '../store';
import { Logo, Rise, Sheet, SheetHeader, ease } from '../ui';
import { AppBody } from './Home';

const TINT_SOFT = 'var(--tint-grad)';
const PlayIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, marginLeft: 3 }} aria-hidden><path d="M8 5 L19 12 L8 19 Z" fill="#16130f" /></svg>
);

function Player({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { s, set, notify } = useApp();
  const v = ALL_VIDEOS.find(x => x.id === id);
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [id]);

  const watched = !!v && s.watched.includes(v.id);
  const idx = v ? v.chapter.videos.findIndex(x => x.id === v.id) : 0;
  const markWatched = () => {
    if (!v) return;
    const next = [...new Set([...s.watched, v.id])];
    const upNext = ALL_VIDEOS.find(x => !next.includes(x.id));
    set({ watched: next, currentVideo: upNext?.id ?? v.id, openChapter: upNext?.chapter.id ?? s.openChapter });
    const p = learnProgress({ ...s, watched: next });
    notify(upNext ? `Nice. ${p.done} of ${p.total} done. Up next: ${upNext.title}` : 'That’s the whole path. Well done.');
    onClose();
  };

  return (
    <Sheet open={!!v} onClose={onClose} label={v?.title ?? 'Lesson'} tall>
      {v && (
        <>
          <SheetHeader title={v.title} sub={`Chapter ${v.chapter.n}, ${v.chapter.name}, video ${idx + 1} of ${v.chapter.videos.length} · ${v.dur}`} onClose={onClose} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', height: '100%', aspectRatio: '9/16', maxWidth: '100%', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
                {playing && v.youtube ? (
                  <iframe
                    title={v.title}
                    src={`https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                ) : (
                  <>
                    <img src={img('lesson-still')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {playing ? (
                      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>Preview lesson. Only “What is an ETF?” has full video in this demo.</span>
                        <span style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,.35)', overflow: 'hidden' }}>
                          <motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 6, ease: 'linear' }} style={{ display: 'block', height: '100%', background: '#fff' }} />
                        </span>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => setPlaying(true)}
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        aria-label="Play"
                        style={{ position: 'absolute', left: '50%', top: '50%', x: '-50%', y: '-50%', width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      ><PlayIcon size={24} /></motion.button>
                    )}
                  </>
                )}
              </div>
            </div>
            <button className={`cta${watched ? ' pill-soft' : ''}`} style={watched ? { color: 'var(--ink)' } : undefined} onClick={watched ? onClose : markWatched}>
              {watched ? 'Watched ✓' : 'Mark as watched'}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

export function Learn() {
  const { s, set } = useApp();
  const { openChat } = useChat();
  const [playing, setPlaying] = useState<string | null>(null);
  const watched = new Set(s.watched);
  const progress = learnProgress(s);
  const current = ALL_VIDEOS.find(v => v.id === s.currentVideo) ?? ALL_VIDEOS[0];
  const curIdx = current.chapter.videos.findIndex(v => v.id === current.id);

  return (
    <>
      <AppBody gap={16} pad="20px 26px 0">
        <Rise style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, background: TINT_SOFT, borderRadius: 100, padding: '7px 13px' }}>
            <motion.span
              animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}
            />
            <span className="m" style={{ fontSize: 12 }}>3 week streak</span>
          </span>
        </Rise>
        <Rise><h1 className="m" style={{ fontSize: 28, lineHeight: 1.2, margin: 0 }}>Five minutes a week is plenty.</h1></Rise>

        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 17, borderRadius: 22, background: 'var(--ink)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="label" style={{ color: 'rgba(255,255,255,.6)' }}>Continue</span>
            <span className="m" style={{ fontSize: 11.5, padding: '5px 11px', borderRadius: 100, background: 'var(--tint)', color: 'var(--ink)' }}>{current.dur.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              onClick={() => setPlaying(current.id)}
              initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: 0.98 }}
              style={{ position: 'relative', width: 196, aspectRatio: '9/16', borderRadius: 14, overflow: 'hidden', background: '#000' }}
              aria-label={`Play ${current.title}`}
            >
              <motion.img
                src={img('lesson-still')} alt=""
                variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }} transition={{ duration: 0.5, ease }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <motion.span
                variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
                style={{ position: 'absolute', left: '50%', top: '50%', x: '-50%', y: '-50%', width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              ><PlayIcon /></motion.span>
            </motion.button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="m" style={{ fontSize: 17, lineHeight: 1.3 }}>{current.title}</span>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.65)' }}>Chapter {current.chapter.n}, {current.chapter.name}, video {curIdx + 1} of {current.chapter.videos.length}</span>
            </motion.div>
          </AnimatePresence>
        </Rise>

        <Rise style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span className="m" style={{ fontSize: 21 }}>Your path</span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{progress.done} of {progress.total} done</span>
        </Rise>
        <Rise style={{ height: 6, minHeight: 6, borderRadius: 100, background: 'rgba(22,19,15,.08)', overflow: 'hidden' }}>
          <motion.span
            initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ duration: 0.9, ease, delay: 0.2 }}
            style={{ display: 'block', height: '100%', borderRadius: 100, background: 'var(--accent)' }}
          />
        </Rise>

        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHAPTERS.map(c => {
            const w = c.videos.filter(v => watched.has(v.id)).length;
            const done = w === c.videos.length;
            const isCurrent = !done && c.videos.some(v => v.id === current.id);
            const open = s.openChapter === c.id;
            const meta = done ? `${c.videos.length} videos, done` : w ? `${w} of ${c.videos.length} watched` : isCurrent ? `${c.videos.length} videos, not started` : `${c.videos.length} videos`;
            return (
              <motion.div
                key={c.id}
                layout="position"
                style={{
                  display: 'flex', flexDirection: 'column', borderRadius: 18, padding: 14,
                  background: done ? TINT_SOFT : '#fff',
                  border: isCurrent ? '1.5px solid var(--ink)' : done ? '1px solid transparent' : '1px solid var(--rule)',
                  transition: 'background .3s, border-color .3s',
                }}
              >
                <button onClick={() => set({ openChapter: open ? null : c.id })} aria-expanded={open} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                  <span
                    className="m"
                    style={{
                      width: 34, height: 34, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5,
                      background: done ? 'var(--ink)' : isCurrent ? 'transparent' : 'rgba(22,19,15,.06)',
                      color: done ? '#fff' : isCurrent ? 'var(--ink)' : 'var(--muted)',
                      border: isCurrent ? '1.5px solid var(--ink)' : '1px solid transparent',
                    }}
                  >{done ? '✓' : c.n}</span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span className="m" style={{ fontSize: 15, lineHeight: 1.25 }}>Chapter {c.n}, {c.name}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{meta}</span>
                  </span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease }} style={{ fontSize: 12, color: 'var(--muted)' }}>▼</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12, paddingTop: 4, borderTop: '1px solid rgba(0,0,0,.1)' }}>
                        {c.videos.map(v => {
                          const isDone = watched.has(v.id), isCur = v.id === current.id && !isDone;
                          return (
                            <button key={v.id} onClick={() => { set({ currentVideo: v.id }); setPlaying(v.id); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', width: '100%' }}>
                              <span style={{
                                width: 26, height: 26, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                                background: isDone ? 'rgba(22,19,15,.08)' : isCur ? 'var(--ink)' : 'rgba(22,19,15,.05)',
                                color: isCur ? '#fff' : 'var(--muted)',
                              }}>{isDone ? '✓' : isCur ? '▶' : ''}</span>
                              <span className="m" style={{ flex: 1, fontSize: 13.5, lineHeight: 1.3, color: isDone || isCur ? 'var(--ink)' : 'var(--ink-2)' }}>{v.title}</span>
                              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{v.dur}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </Rise>

        <Rise className="label">Ask anything</Rise>
        <Rise style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 20 }}>
          {['What is a fund?', 'Why 3a?', 'Can I stop?'].map(q => (
            <motion.button
              key={q} whileTap={{ scale: 0.95 }} onClick={() => openChat(q)}
              className="m" style={{ fontSize: 12.5, padding: '10px 15px', borderRadius: 100, border: '1px solid rgba(0,0,0,.18)', color: 'var(--ink-2)' }}
            >{q}</motion.button>
          ))}
        </Rise>
      </AppBody>
      <Player id={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
