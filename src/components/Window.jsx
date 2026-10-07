import { useEffect } from 'react'
import { motion, useDragControls, useMotionValue, animate } from 'framer-motion'

export default function Window({ win, app, active, compact, boundsRef, onFocus, onClose, onMinimize, onToggleMax, children }) {
  const controls = useDragControls()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const maximized = win.maximized || compact

  // Snap drag offset back when the window fills the desktop.
  useEffect(() => {
    if (maximized) {
      animate(x, 0, { duration: 0.25 })
      animate(y, 0, { duration: 0.25 })
    }
  }, [maximized, x, y])

  // On phones windows sit above the dock, like a full-screen app.
  const zIndex = compact ? 3500 + win.z : win.z
  const style = maximized
    ? { x, y, zIndex }
    : { x, y, zIndex, left: win.left, top: win.top, width: app.width, height: app.height }

  // Origin of the open animation is the icon that was clicked.
  const originX = win.origin && !maximized ? `${win.origin.x - win.left}px` : '50%'
  const originY = win.origin && !maximized ? `${win.origin.y - win.top}px` : '50%'

  return (
    <motion.section
      role="dialog"
      aria-label={app.title}
      className={`window${maximized ? ' is-max' : ''}${active ? ' is-active' : ''}`}
      style={{ ...style, transformOrigin: `${originX} ${originY}` }}
      initial={{ opacity: 0, scale: 0.2 }}
      animate={win.minimized ? { opacity: 0, scale: 0.1, pointerEvents: 'none' } : { opacity: 1, scale: 1, pointerEvents: 'auto' }}
      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      drag={!maximized}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={boundsRef}
      dragElastic={0.04}
      onPointerDown={onFocus}
    >
      <header
        className="window-bar"
        onPointerDown={(e) => !maximized && controls.start(e)}
        onDoubleClick={() => !compact && onToggleMax()}
      >
        <div className="lights">
          <button className="light close" aria-label="ปิดหน้าต่าง" onClick={onClose} />
          <button className="light min" aria-label="ย่อหน้าต่าง" onClick={onMinimize} />
          {!compact && <button className="light max" aria-label="ขยายเต็มจอ" onClick={onToggleMax} />}
        </div>
        <h2 className="window-title">{app.title}</h2>
      </header>
      <div className="window-body">{children}</div>
    </motion.section>
  )
}
