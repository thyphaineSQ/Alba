import { animate, AnimatePresence, motion, useDragControls, useMotionValue, type Variants } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { img, RISK_BG, type Item } from './data';

export const ease = [0.2, 0.7, 0.2, 1] as const;

/* ---------- entrance choreography ---------- */
// Screens stagger their top-level blocks in; each block rises a few pixels.
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};
export const rise: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

export function Rise({ children, className, style, as = 'div' }: { children: ReactNode; className?: string; style?: CSSProperties; as?: 'div' | 'section' }) {
  const C = as === 'div' ? motion.div : motion.section;
  return <C variants={rise} className={className} style={style}>{children}</C>;
}

/* ---------- brand ---------- */
export function Mark({ size = 20, color = '#FA5B35' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 2 28 28" style={{ width: size, height: size, flex: 'none' }} aria-hidden>
      <path d="M0 21 A14 14 0 0 1 28 21 Z" fill={color} />
      <rect x="0" y="24.2" width="28" height="2.4" fill={color} />
    </svg>
  );
}

export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }} aria-label="Alba by Swissquote">
      <Mark />
      <span className="m" style={{ fontSize: 21, lineHeight: 1, letterSpacing: '-.01em' }}>Alba</span>
      <span style={{ fontSize: 12, lineHeight: 1, color: 'var(--faint)', marginLeft: 2, alignSelf: 'flex-end', paddingBottom: 2 }}>by Swissquote</span>
    </div>
  );
}

/* ---------- small pieces ---------- */
export function Avatar({ who, size = 36, ring }: { who: string; size?: number; ring?: boolean }) {
  return (
    <span className="avatar" style={{ width: size, height: size, border: ring ? '1.5px solid #fff' : undefined }}>
      <img src={img(who)} alt="" loading="lazy" />
    </span>
  );
}

export function Check({ on }: { on: boolean }) {
  return (
    <span className="check" aria-hidden>
      <AnimatePresence initial={false}>
        {on && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 26 }}
          >✓</motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`switch${on ? ' on' : ''}`} onClick={() => onChange(!on)}>
      <motion.span layout transition={{ type: 'spring', stiffness: 700, damping: 35 }} className="knob" />
    </button>
  );
}

export function Progress({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--muted)' }}>
      <button onClick={onBack}>Back</button>
      <span style={{ flex: 1, height: 1, background: 'var(--rule)', position: 'relative' }}>
        <motion.span
          initial={{ width: `${((step - 1) / 5) * 100}%` }}
          animate={{ width: `${(step / 5) * 100}%` }}
          transition={{ duration: 0.6, ease }}
          style={{ position: 'absolute', left: 0, top: 0, height: 1, background: 'var(--ink)' }}
        />
      </span>
      <span style={{ fontSize: 11 }}>0{step}/05</span>
    </div>
  );
}

export function RiskPill({ risk, style }: { risk: Item['risk']; style?: CSSProperties }) {
  return <span className="risk" style={{ background: RISK_BG[risk], ...style }}>{risk}</span>;
}

export function ItemRow({ item, onOpen }: { item: Item; onOpen: (i: Item) => void }) {
  const neg = item.change?.startsWith('−');
  return (
    <button onClick={() => onOpen(item)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', width: '100%' }}>
      <span className="mark" style={{ background: item.mark }} />
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span className="m" style={{ fontSize: 15.5, lineHeight: 1.25 }}>{item.name}</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.35 }}>{item.note}</span>
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        {item.change && <span className="m" style={{ fontSize: 13, color: neg ? 'var(--muted)' : 'var(--green)' }}>{item.change}</span>}
        <RiskPill risk={item.risk} style={item.change ? undefined : { fontSize: 11.5, padding: '5px 11px' }} />
      </span>
    </button>
  );
}

/* ---------- numbers ---------- */
const counted = new Set<string>();
// Counts a figure up the first time it is shown in a session, then stays still.
export function CountUp({ id, value, format }: { id: string; value: number; format: (n: number) => string }) {
  const first = !counted.has(id);
  const [shown, setShown] = useState(first ? value * 0.82 : value);
  const prev = useRef(shown);
  useEffect(() => {
    counted.add(id);
    const controls = animate(prev.current, value, {
      duration: first ? 1.1 : 0.6,
      ease,
      onUpdate: v => { prev.current = v; setShown(v); },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{format(shown)}</>;
}

/* ---------- sheets ---------- */
export function Sheet({ open, onClose, children, label, tall }: { open: boolean; onClose: () => void; children: ReactNode; label: string; tall?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Rendered into the phone-level layer so sheets cover the tab bar and escape screen transforms.
  const root = typeof document !== 'undefined' ? document.getElementById('sheet-root') : null;
  const node = (
    <AnimatePresence>
      {open && <SheetBody onClose={onClose} label={label} tall={tall}>{children}</SheetBody>}
    </AnimatePresence>
  );
  return root ? createPortal(node, root) : node;
}

function SheetBody({ onClose, children, label, tall }: { onClose: () => void; children: ReactNode; label: string; tall?: boolean }) {
  const controls = useDragControls();
  const y = useMotionValue(0);
  return (
    <motion.div className="overlay" role="dialog" aria-modal aria-label={label} initial="hidden" animate="show" exit="hidden">
      <motion.div
        className="backdrop"
        onClick={onClose}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        className="sheet"
        style={{ y, height: tall ? '86%' : undefined }}
        variants={{ hidden: { y: '100%' }, show: { y: 0 } }}
        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.9 }}
        onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose(); }}
      >
        <div className="grabber" onPointerDown={e => controls.start(e)}><span /></div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function SheetHeader({ title, sub, onClose, icon }: { title: ReactNode; sub?: ReactNode; onClose: () => void; icon?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px' }}>
      {icon}
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="m" style={{ fontSize: 16 }}>{title}</span>
        {sub && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</span>}
      </span>
      <button className="close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 14 14" style={{ width: 12, height: 12 }}><path d="M2 2 L12 12 M12 2 L2 12" stroke="#16130f" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

export function Sparkle({ size = 24, small = true }: { size?: number; small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} aria-hidden>
      <path d="M12 3 C12.6 8.2 15.8 11.4 21 12 C15.8 12.6 12.6 15.8 12 21 C11.4 15.8 8.2 12.6 3 12 C8.2 11.4 11.4 8.2 12 3 Z" fill="#fff" />
      {small && <path d="M19 3 C19.2 4.6 19.9 5.3 21.5 5.5 C19.9 5.7 19.2 6.4 19 8 C18.8 6.4 18.1 5.7 16.5 5.5 C18.1 5.3 18.8 4.6 19 3 Z" fill="#fff" />}
    </svg>
  );
}
