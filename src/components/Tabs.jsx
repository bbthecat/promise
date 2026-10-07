import { useId } from 'react'
import { motion } from 'framer-motion'

export default function Tabs({ items, value, onChange }) {
  const group = useId()
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => (
        <button key={it.id} role="tab" aria-selected={value === it.id} className="tab" onClick={() => onChange(it.id)}>
          {value === it.id && <motion.span layoutId={`pill${group}`} className="tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="tab-label">{it.label}</span>
        </button>
      ))}
    </div>
  )
}
