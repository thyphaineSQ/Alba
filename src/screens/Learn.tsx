import { animate, AnimatePresence, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ALL_VIDEOS, CHAPTERS, poster, type Chapter } from '../data';
import { useChat } from '../chat';
import { learnProgress, useApp } from '../store';
import { Logo, Mark, Rise, Sheet, SheetHeader, ease } from '../ui';
import { AppBody } from './Home';

const TINTS = ['#FEDCD3', '#E4E7F2', '#DFEEE4', '#EDE6F2', '#F2EBDC'];
const STORY_SECONDS = 8;
const pad = (n: number) => String(n).padStart(2, '0');

const PlayIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, marginLeft: 3 }} aria-hidden><path d="M8 5 L19 12 L8 19 Z" fill="#16130f" /></svg>
);

/* ---------- story viewer ---------- */
// Each video in a chapter is a story: segments on top, tap right for next, left for back,
// press and hold to pause, swipe down to close.
function StoryViewer({ chapter, start, onClose }: { chapter: Chapter; start: number; onClose: () => void }) {
  const { s, set, notify } = useApp();
  const { openChat } = useChat();
  const [index, setIndex] = useState(start);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(false);
  const progress = useMotionValue(0);
  const width = useTransform(progress, v => `${v * 100}%`);
  const timer = useRef<AnimationPlaybackControls | null>(null);
  const pressedAt = useRef(0);
  const v = chapter.videos[index];
  const isVideo = !!v.youtube;
  const last = index === chapter.videos.length - 1;

  const markWatched = useCallback((id: string) => {
    const next = [...new Set([...s.watched, id])];
    set({ watched: next });
    return next;
  }, [s.watched, set]);

  const finish = useCallback(() => {
    const watched = markWatched(v.id);
    const upNext = ALL_VIDEOS.find(x => !watched.includes(x.id));
    const chapterDone = chapter.videos.every(x => watched.includes(x.id));
    set({ currentVideo: upNext?.id ?? v.id, openChapter: upNext?.chapter.id ?? chapter.id });
    const p = learnProgress({ ...s, watched });
    notify(chapterDone
      ? upNext ? `Chapter ${chapter.n} done. Up next: Chapter ${upNext.chapter.n}, ${upNext.chapter.name}` : 'That’s the whole course. Well done.'
      : `${p.done} of ${p.total} done. Come back for the rest any time.`);
    onClose();
  }, [chapter, markWatched, notify, onClose, s, set, v.id]);

  const go = useCallback((delta: 1 | -1) => {
    if (delta === 1) {
      if (last) return finish();
      markWatched(v.id);
      set({ currentVideo: chapter.videos[index + 1].id });
    }
    if (delta === -1 && index === 0) { progress.set(0); timer.current?.play(); return; }
    setDir(delta);
    setIndex(i => i + delta);
  }, [chapter, finish, index, last, markWatched, progress, set, v.id]);

  const goRef = useRef(go);
  goRef.current = go;

  // Text stories run on a timer; the video story waits for the viewer.
  useEffect(() => {
    setPlaying(false);
    progress.set(0);
    timer.current?.stop();
    if (isVideo) return;
    timer.current = animate(progress, 1, { duration: STORY_SECONDS, ease: 'linear', onComplete: () => goRef.current(1) });
    return () => timer.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const press = () => { pressedAt.current = Date.now(); timer.current?.pause(); };
  const release = (delta: 1 | -1) => {
    const held = Date.now() - pressedAt.current > 250;
    if (held) timer.current?.play();
    else go(delta);
  };

  const tint = TINTS[index % TINTS.length];
  return (
    <motion.div
      role="dialog" aria-modal aria-label={`Chapter ${chapter.n}, ${chapter.name}`}
      initial={{ opacity: 0, scale: 0.92, borderRadius: 38 }}
      animate={{ opacity: 1, scale: 1, borderRadius: 0, transition: { type: 'spring', stiffness: 320, damping: 32 } }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.22 } }}
      drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 700) onClose(); }}
      style={{ position: 'absolute', inset: 0, background: 'var(--ink)', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', touchAction: 'none' }}
    >
      {/* segments */}
      <div style={{ display: 'flex', gap: 4, padding: '46px 14px 0' }}>
        {chapter.videos.map((x, i) => (
          <span key={x.id} style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,.28)', overflow: 'hidden' }}>
            {i < index && <span style={{ display: 'block', height: '100%', width: '100%', background: '#fff' }} />}
            {i === index && <motion.span style={{ display: 'block', height: '100%', width: isVideo ? (playing ? '100%' : '0%') : width, background: '#fff', transition: isVideo ? 'width 1.2s' : undefined }} />}
          </span>
        ))}
      </div>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 10px' }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Mark size={17} /></span>
        <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span className="m" style={{ fontSize: 13.5 }}>Chapter {chapter.n}, {chapter.name}</span>
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)' }}>Story {index + 1} of {chapter.videos.length} · {v.dur}</span>
        </span>
        <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 14 14" style={{ width: 13, height: 13 }}><path d="M2 2 L12 12 M12 2 L2 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* story */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, margin: '0 8px', borderRadius: 20, overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={v.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: `${d * 30}%`, opacity: 0, scale: 0.96 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (d: number) => ({ x: `${d * -30}%`, opacity: 0, scale: 0.96 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.38, ease }}
            style={{ position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden' }}
          >
            {isVideo ? (
              <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
                {playing ? (
                  <iframe
                    title={v.title}
                    src={`https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                ) : (
                  <>
                    <img src={poster(v)} onError={e => { e.currentTarget.style.display = 'none'; }} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.72))' }} />
                    <span style={{ position: 'absolute', left: 20, right: 20, bottom: 22, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2, pointerEvents: 'none' }}>
                      <span className="m" style={{ fontSize: 26, lineHeight: 1.15 }}>{v.title}</span>
                      <span style={{ fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,.85)' }}>{v.hook}</span>
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(165deg, ${tint} 0%, #fff 115%)`, color: 'var(--ink)', padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
                <span className="m" style={{ fontSize: 64, lineHeight: 1, color: 'rgba(22,19,15,.12)' }}>{pad(index + 1)}</span>
                <span style={{ flex: 1 }} />
                <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.12 }} className="m" style={{ fontSize: 30, lineHeight: 1.12 }}>{v.title}</motion.span>
                <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.24 }} style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 12 }}>{v.hook}</motion.span>
                <span className="label" style={{ marginTop: 22 }}>Story preview · full lesson {v.dur}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* tap zones: back on the left third, forward on the rest; hold to pause */}
        {!playing && (
          <>
            <button aria-label="Previous story" onPointerDown={press} onPointerUp={() => release(-1)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '32%', zIndex: 1 }} />
            <button aria-label="Next story" onPointerDown={press} onPointerUp={() => release(1)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '68%', zIndex: 1 }} />
          </>
        )}
        {isVideo && !playing && (
          <motion.button
            onClick={() => setPlaying(true)}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            aria-label="Play video"
            style={{ position: 'absolute', left: '50%', top: '42%', x: '-50%', y: '-50%', width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
          ><PlayIcon size={26} /></motion.button>
        )}
      </div>

      {/* Fallback for hosts whose policy blocks the YouTube player inside the page. */}
      {isVideo && (
        <a
          href={`https://www.youtube.com/shorts/${v.youtube}`} target="_blank" rel="noopener noreferrer"
          style={{ alignSelf: 'center', marginTop: 12, fontSize: 12.5, color: 'rgba(255,255,255,.7)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.3)', paddingBottom: 1 }}
        >Video not loading? Open it on YouTube ↗</a>
      )}

      {/* actions */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 14px 28px' }}>
        <button
          onClick={() => { onClose(); window.setTimeout(() => openChat(`Explain "${v.title}" simply`), 280); }}
          className="m" style={{ flex: 1, padding: '14px 0', borderRadius: 100, border: '1px solid rgba(255,255,255,.3)', fontSize: 13.5, textAlign: 'center' }}
        >Ask Alba about this</button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => go(1)}
          className="m" style={{ flex: 1, padding: '14px 0', borderRadius: 100, background: '#fff', color: 'var(--ink)', fontSize: 13.5, textAlign: 'center' }}
        >{last ? 'Finish chapter' : 'Next story'}</motion.button>
      </div>
    </motion.div>
  );
}

/* ---------- full course ---------- */
function CourseSheet({ open, onClose, onPlay }: { open: boolean; onClose: () => void; onPlay: (chapterId: string, index: number) => void }) {
  const { s, set } = useApp();
  const watched = new Set(s.watched);
  const progress = learnProgress(s);
  const current = ALL_VIDEOS.find(v => v.id === s.currentVideo) ?? ALL_VIDEOS[0];
  return (
    <Sheet open={open} onClose={onClose} label="The full course" tall>
      <SheetHeader title="The full course" sub={`${CHAPTERS.length} chapters · ${progress.done} of ${progress.total} videos done`} onClose={onClose} />
      <div style={{ padding: '0 22px 8px' }}>
        <div style={{ height: 6, borderRadius: 100, background: 'rgba(22,19,15,.08)', overflow: 'hidden' }}>
          <motion.span initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ duration: 0.8, ease, delay: 0.2 }} style={{ display: 'block', height: '100%', borderRadius: 100, background: 'var(--accent)' }} />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 22px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHAPTERS.map(c => {
          const w = c.videos.filter(v => watched.has(v.id)).length;
          const done = w === c.videos.length;
          const isCurrent = !done && c.id === current.chapter.id;
          const isOpen = s.openChapter === c.id;
          const meta = done ? `${c.videos.length} videos, done` : w ? `${w} of ${c.videos.length} watched` : `${c.videos.length} videos`;
          return (
            <div
              key={c.id}
              style={{
                display: 'flex', flexDirection: 'column', borderRadius: 18, padding: 14, flex: 'none',
                background: done ? 'var(--tint-grad)' : '#fff',
                border: isCurrent ? '1.5px solid var(--ink)' : done ? '1px solid transparent' : '1px solid var(--rule)',
              }}
            >
              <button onClick={() => set({ openChapter: isOpen ? null : c.id })} aria-expanded={isOpen} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                <span className="m" style={{
                  width: 34, height: 34, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5,
                  background: done ? 'var(--ink)' : isCurrent ? 'transparent' : 'rgba(22,19,15,.06)',
                  color: done ? '#fff' : isCurrent ? 'var(--ink)' : 'var(--muted)',
                  border: isCurrent ? '1.5px solid var(--ink)' : '1px solid transparent',
                }}>{done ? '✓' : c.n}</span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="m" style={{ fontSize: 15, lineHeight: 1.25 }}>Chapter {c.n}, {c.name}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{isCurrent ? `You’re here · ${meta}` : meta}</span>
                </span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease }} style={{ fontSize: 12, color: 'var(--muted)' }}>▼</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12, paddingTop: 4, borderTop: '1px solid rgba(0,0,0,.1)' }}>
                      {c.videos.map((v, i) => {
                        const isDone = watched.has(v.id), isCur = v.id === current.id && !isDone;
                        return (
                          <button key={v.id} onClick={() => onPlay(c.id, i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', width: '100%' }}>
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
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ---------- learn ---------- */
export function Learn() {
  const { s, set } = useApp();
  const { openChat } = useChat();
  const [story, setStory] = useState<{ chapter: string; index: number } | null>(null);
  const [course, setCourse] = useState(false);
  // Posters that failed to load fall back to the pastel card style.
  const [broken, setBroken] = useState<string[]>([]);
  const row = useRef<HTMLDivElement>(null);
  const watched = new Set(s.watched);
  const progress = learnProgress(s);
  const current = ALL_VIDEOS.find(v => v.id === s.currentVideo) ?? ALL_VIDEOS[0];
  const chapter = current.chapter;
  const curIdx = chapter.videos.findIndex(v => v.id === current.id);
  const doneInChapter = chapter.videos.filter(v => watched.has(v.id)).length;
  const viewing = CHAPTERS.find(c => c.id === story?.chapter);

  // Bring the story you're on into view.
  useEffect(() => {
    const el = row.current?.children[curIdx] as HTMLElement | undefined;
    if (el && row.current) row.current.scrollTo({ left: Math.max(0, el.offsetLeft - 26), behavior: 'smooth' });
  }, [curIdx, chapter.id]);

  return (
    <>
      <AppBody gap={16} pad="20px 26px 0">
        <Rise style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--tint-grad)', borderRadius: 100, padding: '7px 13px' }}>
            <motion.span
              animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}
            />
            <span className="m" style={{ fontSize: 12 }}>3 week streak</span>
          </span>
        </Rise>
        <Rise><h1 className="m" style={{ fontSize: 28, lineHeight: 1.2, margin: 0 }}>Five minutes a week is plenty.</h1></Rise>

        {/* current chapter */}
        <Rise style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="label">Your chapter · {chapter.n} of {CHAPTERS.length}</span>
              <span className="m" style={{ fontSize: 21 }}>{chapter.name}</span>
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', paddingBottom: 3 }}>{doneInChapter} of {chapter.videos.length} watched</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {chapter.videos.map(v => (
              <span key={v.id} style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(22,19,15,.08)', overflow: 'hidden' }}>
                <motion.span initial={false} animate={{ width: watched.has(v.id) ? '100%' : '0%' }} transition={{ duration: 0.6, ease }} style={{ display: 'block', height: '100%', background: 'var(--accent)' }} />
              </span>
            ))}
          </div>
        </Rise>

        <Rise>
          <div ref={row} className="chiprow" style={{ gap: 10, minHeight: 236, alignItems: 'stretch', paddingTop: 4, paddingBottom: 4 }}>
            {chapter.videos.map((v, i) => {
              const isDone = watched.has(v.id), isCur = v.id === current.id && !isDone;
              const photo = !!v.youtube && !broken.includes(v.id);
              return (
                <motion.button
                  key={v.id}
                  onClick={() => setStory({ chapter: chapter.id, index: i })}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.15 + i * 0.06 }}
                  whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                  aria-label={`Story ${i + 1}: ${v.title}`}
                  style={{
                    position: 'relative', width: 128, height: 228, flex: 'none', borderRadius: 18, overflow: 'hidden', textAlign: 'left',
                    background: photo ? '#000' : `linear-gradient(165deg, ${TINTS[i % TINTS.length]} 0%, #fff 130%)`,
                    outline: isCur ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: 2,
                  }}
                >
                  {photo && (
                    <>
                      <img src={poster(v)} onError={() => setBroken(b => [...b, v.id])} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.75))' }} />
                    </>
                  )}
                  <span className="m" style={{ position: 'absolute', left: 11, top: 10, fontSize: 12, color: photo ? '#fff' : 'rgba(22,19,15,.4)' }}>{pad(i + 1)}</span>
                  {isDone && (
                    <span style={{ position: 'absolute', right: 9, top: 9, width: 20, height: 20, borderRadius: '50%', background: 'var(--ink)', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  )}
                  {isCur && (
                    <span className="m" style={{ position: 'absolute', right: 8, top: 8, fontSize: 10, letterSpacing: '.08em', background: 'var(--accent)', color: '#fff', borderRadius: 100, padding: '3px 8px' }}>UP NEXT</span>
                  )}
                  {v.youtube && !isDone && (
                    <span style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)', width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayIcon size={15} /></span>
                  )}
                  <span style={{ position: 'absolute', left: 11, right: 11, bottom: 11, display: 'flex', flexDirection: 'column', gap: 4, color: photo ? '#fff' : 'var(--ink)' }}>
                    <span className="m" style={{ fontSize: 14, lineHeight: 1.22 }}>{v.title}</span>
                    <span style={{ fontSize: 11.5, color: photo ? 'rgba(255,255,255,.7)' : 'var(--muted)' }}>{v.dur}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Rise>

        <Rise>
          <button className="cta" onClick={() => setStory({ chapter: chapter.id, index: Math.max(0, curIdx) })}>
            {doneInChapter === 0 ? 'Start the chapter' : doneInChapter === chapter.videos.length ? 'Watch again' : `Continue · ${current.title}`}
          </button>
        </Rise>

        <Rise>
          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={() => setCourse(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', borderRadius: 18, border: '1px solid var(--rule)' }}
          >
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span className="m" style={{ fontSize: 15 }}>See the full course</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{progress.done} of {progress.total} done</span>
              </span>
              <span style={{ height: 4, borderRadius: 100, background: 'rgba(22,19,15,.08)', overflow: 'hidden' }}>
                <motion.span initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ duration: 0.9, ease, delay: 0.3 }} style={{ display: 'block', height: '100%', borderRadius: 100, background: 'var(--ink)' }} />
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{CHAPTERS.length} chapters, from getting started to building your own mix</span>
            </span>
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>→</span>
          </motion.button>
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

      <CourseSheet
        open={course}
        onClose={() => setCourse(false)}
        onPlay={(chapterId, index) => {
          const c = CHAPTERS.find(x => x.id === chapterId)!;
          set({ currentVideo: c.videos[index].id });
          setCourse(false);
          window.setTimeout(() => setStory({ chapter: chapterId, index }), 260);
        }}
      />
      <AnimatePresenceStory viewing={viewing} index={story?.index ?? 0} onClose={() => setStory(null)} />
    </>
  );
}

function AnimatePresenceStory({ viewing, index, onClose }: { viewing?: Chapter; index: number; onClose: () => void }) {
  const root = typeof document !== 'undefined' ? document.getElementById('sheet-root') : null;
  const node = (
    <AnimatePresence>
      {viewing && <StoryViewer key={`${viewing.id}-${index}`} chapter={viewing} start={index} onClose={onClose} />}
    </AnimatePresence>
  );
  return root ? createPortal(node, root) : node;
}
