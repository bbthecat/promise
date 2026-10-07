import { useEffect, useState } from 'react'

export default function MenuBar({ activeTitle }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="menubar">
      <div className="menubar-left">
        <img src="/bow.svg" alt="" width="16" height="16" />
        <strong>สัญญาใจ</strong>
        {activeTitle && <span className="menubar-app">{activeTitle}</span>}
      </div>
      <time className="menubar-clock" dateTime={now.toISOString()}>
        {now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
        {now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
      </time>
    </div>
  )
}
