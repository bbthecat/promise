import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Folder, FileIcon, HeroBow } from './components/Icons.jsx'
import Window from './components/Window.jsx'
import Dock from './components/Dock.jsx'
import MenuBar from './components/MenuBar.jsx'
import ContractApp from './apps/ContractApp.jsx'
import SurveyApp from './apps/SurveyApp.jsx'
import EvaluationApp from './apps/EvaluationApp.jsx'
import AboutApp from './apps/AboutApp.jsx'
import ResultsApp from './apps/ResultsApp.jsx'
import TeamApp from './apps/TeamApp.jsx'
import { useStoredState } from './lib/storage.js'
import { newContract } from './lib/contract.js'
import { readSharedContract } from './lib/share.js'

const APPS = [
  {
    id: 'about',
    label: 'about project',
    title: 'about project — ที่มาของโครงงาน',
    dockLabel: 'เกี่ยวกับโครงงาน',
    icon: <FileIcon />,
    dockGlyph: 'A',
    pos: { left: 11, top: 17 },
    width: 640,
    height: 560,
  },
  {
    id: 'survey',
    label: 'แบบสอบถาม',
    title: 'แบบสอบถามสภาพปัญหาและความขัดแย้ง',
    dockLabel: 'แบบสอบถาม',
    icon: <Folder variant="pink" />,
    dockGlyph: <ListGlyph />,
    pos: { left: 15, top: 58 },
    width: 620,
    height: 600,
  },
  {
    id: 'results',
    label: 'ผลการวิจัย',
    title: 'ผลการวิจัย — สรุป อภิปราย ข้อเสนอแนะ',
    dockLabel: 'ผลการวิจัย',
    icon: <Folder variant="ribbon" />,
    dockGlyph: <TargetGlyph />,
    pos: { left: 61, top: 4 },
    width: 640,
    height: 580,
  },
  {
    id: 'team',
    label: 'ทีมผู้จัดทำ',
    title: 'ทีมผู้จัดทำ',
    dockLabel: 'ทีมผู้จัดทำ',
    icon: <Folder variant="gingham" />,
    dockGlyph: <DotsGlyph />,
    pos: { left: 80, top: 7 },
    width: 560,
    height: 540,
  },
  {
    id: 'evaluate',
    label: 'แบบประเมินผล',
    title: 'แบบประเมินผลการลดความขัดแย้ง',
    dockLabel: 'แบบประเมินผล',
    icon: <Folder variant="bows" />,
    dockGlyph: <StarGlyph />,
    pos: { left: 82, top: 52 },
    width: 620,
    height: 600,
  },
  {
    id: 'contract',
    label: 'สัญญาใจ.doc',
    title: 'สัญญาใจ.doc',
    dockLabel: 'สัญญาใจประจำกลุ่ม',
    icon: <FileIcon tone="pink" mark="heart" />,
    dockGlyph: <HeartGlyph />,
    pos: { left: 74, top: 76 },
    width: 920,
    height: 680,
  },
]

const byId = Object.fromEntries(APPS.map((a) => [a.id, a]))

function useCompact() {
  const query = '(max-width: 760px)'
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setCompact(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return compact
}

export default function App() {
  const deskRef = useRef(null)
  const zTop = useRef(10)
  const compact = useCompact()
  const [windows, setWindows] = useState([])
  const [contract, setContract] = useStoredState('promise.contract', newContract)
  const [toast, setToast] = useState(null)

  const notify = useCallback((msg) => {
    setToast({ msg, key: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const open = useCallback(
    (id, origin) => {
      setWindows((ws) => {
        const z = ++zTop.current
        const existing = ws.find((w) => w.id === id)
        if (existing) return ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w))
        const app = byId[id]
        const desk = deskRef.current?.getBoundingClientRect() ?? { width: 1200, height: 800 }
        const cascade = ws.length * 26
        const left = Math.max(12, (desk.width - app.width) / 2 + cascade - 40)
        const height = Math.min(app.height, desk.height - 96)
        const top = Math.max(12, Math.min(40 + cascade, desk.height - height - 84))
        return [...ws, { id, z, left, top, origin, minimized: false, maximized: false }]
      })
    },
    []
  )

  const patch = (id, change) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...change(w) } : w)))
  const focus = (id) => {
    const top = windows.reduce((m, w) => Math.max(m, w.z), 0)
    const w = windows.find((x) => x.id === id)
    if (w && w.z === top) return
    patch(id, () => ({ z: ++zTop.current }))
  }
  const close = (id) => setWindows((ws) => ws.filter((w) => w.id !== id))

  // A shared link (#c=...) opens straight into that group's contract.
  useEffect(() => {
    const shared = readSharedContract()
    if (shared) {
      setContract(shared)
      history.replaceState(null, '', window.location.pathname)
      open('contract')
      notify(`เปิดสัญญาใจของกลุ่ม${shared.group ? ` “${shared.group}”` : ''} จากลิงก์แล้ว`)
    }
  }, [open, notify, setContract])

  // Escape closes the window on top.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      const visible = windows.filter((w) => !w.minimized)
      if (!visible.length) return
      const top = visible.reduce((a, b) => (a.z > b.z ? a : b))
      close(top.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [windows])

  const visible = windows.filter((w) => !w.minimized)
  const activeId = visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : null

  const appProps = { contract, setContract, notify, openApp: open }

  return (
    <MotionConfig reducedMotion="user">
    <div className="screen">
      <MenuBar activeTitle={activeId ? byId[activeId].title : null} />
      <main className="desktop" ref={deskRef}>
        <Hero onStart={() => open('contract')} />

        <ul className="icons" aria-label="ไฟล์บนเดสก์ท็อป">
          {APPS.map((app, i) => (
            <DesktopIcon key={app.id} app={app} index={i} compact={compact} boundsRef={deskRef} onOpen={open} />
          ))}
        </ul>

        <AnimatePresence>
          {windows.map((w) => {
            const app = byId[w.id]
            const Body = { contract: ContractApp, survey: SurveyApp, evaluate: EvaluationApp, about: AboutApp, results: ResultsApp, team: TeamApp }[w.id]
            return (
              <Window
                key={w.id}
                win={w}
                app={app}
                active={w.id === activeId}
                compact={compact}
                boundsRef={deskRef}
                onFocus={() => focus(w.id)}
                onClose={() => close(w.id)}
                onMinimize={() => patch(w.id, () => ({ minimized: true }))}
                onToggleMax={() => patch(w.id, (x) => ({ maximized: !x.maximized }))}
              >
                <Body {...appProps} />
              </Window>
            )
          })}
        </AnimatePresence>
      </main>

      <Dock items={APPS} openIds={windows.map((w) => w.id)} onOpen={(id) => open(id)} />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            className="toast"
            role="status"
            initial={{ y: 20, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 10, opacity: 0, x: '-50%' }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  )
}

function Hero({ onStart }) {
  const word = 'promise'
  return (
    <section className="hero" aria-labelledby="hero-title">
      <motion.p className="hero-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
        welcome to our
      </motion.p>
      <h1 id="hero-title" className="hero-word" aria-label="promise สัญญาใจ">
        <span className="hero-letters" aria-hidden="true">
          {word.split('').map((ch, i) => (
            <motion.span
              key={i}
              initial={{ y: '0.6em', opacity: 0, rotate: 6 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
        <HeroBow />
      </h1>
      <motion.p className="hero-thai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}>
        สัญญาใจประจำกลุ่ม
      </motion.p>
      <motion.div className="hero-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.5 }}>
        <button className="btn btn-ink" onClick={onStart}>
          เขียนสัญญาใจของกลุ่ม
        </button>
        <p className="hero-hint">ตกลงหน้าที่ กำหนดส่ง และกติกาให้ชัดก่อนเริ่มงาน แล้วให้ทุกคนลงชื่อ</p>
      </motion.div>
    </section>
  )
}

function DesktopIcon({ app, index, compact, boundsRef, onOpen }) {
  const dragged = useRef(false)
  const handleOpen = (e) => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const desk = boundsRef.current.getBoundingClientRect()
    onOpen(app.id, { x: r.left + r.width / 2 - desk.left, y: r.top + r.height / 2 - desk.top })
  }

  return (
    <motion.li
      className="desk-icon-wrap"
      style={compact ? undefined : { left: `${app.pos.left}%`, top: `${app.pos.top}%` }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2 + index * 0.07, type: 'spring', stiffness: 420, damping: 20 }}
      drag={!compact}
      dragConstraints={boundsRef}
      dragMomentum={false}
      dragElastic={0.05}
      onDragStart={() => (dragged.current = true)}
    >
      <button className="desk-icon" onClick={handleOpen}>
        <span className="desk-icon-art">{app.icon}</span>
        <span className="desk-icon-label">{app.label}</span>
      </button>
    </motion.li>
  )
}

function HeartGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20c-6-4-9-7.3-9-11a4.5 4.5 0 0 1 9-1.6A4.5 4.5 0 0 1 21 9c0 3.7-3 7-9 11z" fill="currentColor" />
    </svg>
  )
}
function ListGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18h4M11 6h9M11 12h9M11 18h9" />
    </svg>
  )
}
function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="currentColor" />
    </svg>
  )
}
function TargetGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  )
}
function DotsGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      {[6, 12, 18].flatMap((y) => [6, 12, 18].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.9" />))}
    </svg>
  )
}
