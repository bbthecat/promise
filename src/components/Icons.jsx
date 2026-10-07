import { useId } from 'react'
import { motion } from 'framer-motion'

/* A small bow drawn as an SVG group so it can sit on folders, files and the hero. */
export function BowShape({ x = 0, y = 0, s = 1, fill = '#F2A7C3', stroke = '#7A1F45', sw = 1.6 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      <path d="M0 0C-4-6-12-9-13-4s5 9 13 4z" />
      <path d="M0 0c4-6 12-9 13-4s-5 9-13 4z" />
      <path d="M-1 1l-4 10 3.5-1.4L0 12.5 1.6 1z" />
      <circle r="2.4" />
    </g>
  )
}

/* Hero bow: loops draw themselves in, then it settles with a little wiggle on hover. */
export function HeroBow({ delay = 0.9 }) {
  const draw = (i) => ({
    initial: { pathLength: 0, fillOpacity: 0 },
    animate: { pathLength: 1, fillOpacity: 1 },
    transition: {
      pathLength: { delay: delay + i * 0.18, duration: 0.6, ease: 'easeInOut' },
      fillOpacity: { delay: delay + 0.7 + i * 0.1, duration: 0.4 },
    },
  })
  return (
    <motion.svg
      className="hero-bow"
      viewBox="-30 -24 60 52"
      aria-hidden="true"
      whileHover={{ rotate: [0, -12, 10, -6, 0], transition: { duration: 0.7 } }}
    >
      <g fill="#F5B9CF" stroke="#B2416D" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <motion.path d="M0 0C-6-11-22-16-24-7s9 16 24 7z" {...draw(0)} />
        <motion.path d="M0 0c6-11 22-16 24-7s-9 16-24 7z" {...draw(1)} />
        <motion.path d="M-2 2l-9 20 7-2.6 3 6.6L3 2z" {...draw(2)} />
        <motion.path d="M5 2l7 19-7-2-2 6-1-23z" {...draw(2.4)} />
        <motion.circle r="4.4" {...draw(3)} />
        <motion.path d="M-17-6c4-1 8 1 11 4M17-6c-4-1-8 1-11 4" fill="none" {...draw(3.2)} />
      </g>
    </motion.svg>
  )
}

const FOLDER_BACK = 'M3 10a4 4 0 0 1 4-4h16l5 5h31a4 4 0 0 1 4 4v4H3z'
const FOLDER_FRONT = 'M2 17a3 3 0 0 1 3-3h56a3 3 0 0 1 3 3v29a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z'

export function Folder({ variant = 'pink' }) {
  const id = useId().replace(/:/g, '')
  const palettes = {
    pink: { back: '#E995B4', front: '#F4B3CB' },
    gingham: { back: '#3A373C', front: '#4A474D' },
    ribbon: { back: '#232125', front: '#2E2B2F' },
    bows: { back: '#232125', front: '#2E2B2F' },
    berry: { back: '#5E1534', front: '#7A1F45' },
  }
  const p = palettes[variant]
  return (
    <svg viewBox="0 0 66 52" className="icon-svg" aria-hidden="true">
      <defs>
        <pattern id={`dots${id}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="0.9" fill="#fff" opacity="0.85" />
        </pattern>
        <pattern id={`dark${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.6" fill="#fff" opacity="0.18" />
        </pattern>
        <pattern id={`ging${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#4A474D" />
          <rect width="3" height="6" fill="#8D8992" opacity="0.55" />
          <rect width="6" height="3" fill="#8D8992" opacity="0.55" />
          <rect width="3" height="3" fill="#222" opacity="0.6" />
        </pattern>
      </defs>
      <path d={FOLDER_BACK} fill={p.back} />
      <path d={FOLDER_FRONT} fill={p.front} />
      {variant === 'pink' && (
        <>
          <path d={FOLDER_FRONT} fill={`url(#dots${id})`} />
          <path d="M2 19h62" stroke="#fff" strokeDasharray="1.5 1.5" opacity="0.9" />
          <BowShape x={55} y={9} s={0.42} fill="#fff" stroke="#C9C3C7" sw={2} />
        </>
      )}
      {variant === 'gingham' && (
        <>
          <path d={FOLDER_FRONT} fill={`url(#ging${id})`} />
          <BowShape x={12} y={8} s={0.42} fill="#fff" stroke="#9A969C" sw={2} />
        </>
      )}
      {variant === 'ribbon' && (
        <>
          <rect x="29" y="14" width="7" height="36" fill="#F2A7C3" />
          <BowShape x={32.5} y={12} s={0.5} fill="#F2A7C3" stroke="#B2416D" sw={2} />
          <BowShape x={12} y={24} s={0.32} fill="#F2A7C3" stroke="#B2416D" sw={2} />
          <BowShape x={54} y={24} s={0.32} fill="#F2A7C3" stroke="#B2416D" sw={2} />
        </>
      )}
      {variant === 'bows' && (
        <>
          <path d={FOLDER_FRONT} fill={`url(#dark${id})`} />
          {[15, 33, 51].map((bx) => (
            <BowShape key={bx} x={bx} y={20} s={0.36} fill="#F2A7C3" stroke="#B2416D" sw={2} />
          ))}
        </>
      )}
      {variant === 'berry' && (
        <>
          <path d={FOLDER_FRONT} fill={`url(#dark${id})`} />
          <path d="M33 40c-6-4-10-7.5-10-11.5a5 5 0 0 1 10-1.5 5 5 0 0 1 10 1.5c0 4-4 7.5-10 11.5z" fill="#F2A7C3" />
        </>
      )}
    </svg>
  )
}

export function FileIcon({ tone = 'ink', mark }) {
  const stroke = tone === 'pink' ? '#E07BA0' : '#151515'
  const fill = tone === 'pink' ? '#FDF1F5' : '#fff'
  return (
    <svg viewBox="0 0 40 48" className="icon-svg file" aria-hidden="true">
      <path d="M6 3h19l10 10v30a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M25 3v8a2 2 0 0 0 2 2h8" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
      {mark === 'heart' && (
        <path d="M20 37c-5-3.4-8-6.2-8-9.4a4 4 0 0 1 8-1.3 4 4 0 0 1 8 1.3c0 3.2-3 6-8 9.4z" fill="#F2A7C3" stroke={stroke} strokeWidth="1.6" />
      )}
      {mark === 'lines' && (
        <g stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
          <path d="M11 24h18M11 30h18M11 36h11" />
        </g>
      )}
    </svg>
  )
}
