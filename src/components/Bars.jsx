import { motion } from 'framer-motion'

export default function Bars({ rows, tone = 'pink' }) {
  return (
    <ul className={`bars bars-${tone}`}>
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="bar-label">
            <span>{r.label}</span>
            <span className="bar-num">
              {r.count} คน <b>{r.pct.toFixed(1)}%</b>
            </span>
          </div>
          <div className="bar-track">
            <motion.span initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: 'easeOut' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
