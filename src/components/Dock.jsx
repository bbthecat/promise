import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function DockItem({ mouseX, label, open, onClick, children }) {
  const ref = useRef(null)
  const distance = useTransform(mouseX, (mx) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r || mx === Infinity) return 999
    return mx - (r.left + r.width / 2)
  })
  const size = useSpring(useTransform(distance, [-110, 0, 110], [40, 60, 40], { clamp: true }), {
    stiffness: 420,
    damping: 28,
  })

  return (
    <motion.button ref={ref} className="dock-item" style={{ width: size, height: size }} onClick={onClick} aria-label={label}>
      {children}
      <span className="dock-tip" role="tooltip">{label}</span>
      {open && <span className="dock-dot" aria-hidden="true" />}
    </motion.button>
  )
}

export default function Dock({ items, openIds, onOpen }) {
  const mouseX = useMotionValue(Infinity)
  const today = new Date()
  const month = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()

  return (
    <motion.nav
      className="dock"
      aria-label="แอปบนด็อก"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 26 }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {items.map((it) => (
        <DockItem key={it.id} mouseX={mouseX} label={it.dockLabel} open={openIds.includes(it.id)} onClick={() => onOpen(it.id)}>
          <span className={`tile tile-${it.id}`}>{it.dockGlyph}</span>
        </DockItem>
      ))}
      <span className="dock-sep" aria-hidden="true" />
      <DockItem mouseX={mouseX} label={`กำหนดส่งงาน · วันนี้ ${today.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`} onClick={() => onOpen('contract')}>
        <span className="tile tile-cal">
          <small>{month}</small>
          <b>{today.getDate()}</b>
        </span>
      </DockItem>
    </motion.nav>
  )
}
