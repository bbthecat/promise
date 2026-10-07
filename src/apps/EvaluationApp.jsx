import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStoredState } from '../lib/storage.js'
import { interpret, mean, sd } from '../lib/stats.js'
import Tabs from '../components/Tabs.jsx'
import Bars from '../components/Bars.jsx'

const SCALE = [
  { v: 5, label: 'มากที่สุด' },
  { v: 4, label: 'มาก' },
  { v: 3, label: 'ปานกลาง' },
  { v: 2, label: 'น้อย' },
  { v: 1, label: 'น้อยที่สุด' },
]

const ITEMS = [
  { key: 'reduce', q: 'การใช้ฟอร์มสัญญาใจนี้ช่วยลดความขัดแย้งเรื่องการแบ่งงานได้ในระดับใด?' },
  { key: 'satisfy', q: 'ความพึงพอใจต่อบรรยากาศการทำงานกลุ่ม หลังใช้สัญญาใจอยู่ในระดับใด?' },
]

const empty = { reduce: 0, satisfy: 0, reuse: '', why: '' }

export default function EvaluationApp({ notify }) {
  const [responses, setResponses] = useStoredState('promise.evaluation', [])
  const [tab, setTab] = useState('form')

  return (
    <div className="form-app">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'form', label: 'ทำแบบประเมิน' },
          { id: 'result', label: `สรุปผล (${responses.length})` },
        ]}
      />
      <AnimatePresence mode="wait">
        {tab === 'form' ? (
          <motion.div key="form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
            <EvalForm
              onSubmit={(r) => {
                setResponses((rs) => [...rs, { ...r, at: new Date().toISOString() }])
                notify('ส่งแบบประเมินแล้ว')
                setTab('result')
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <EvalResults responses={responses} setResponses={setResponses} onAnswer={() => setTab('form')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EvalForm({ onSubmit }) {
  const [a, setA] = useState(empty)
  const valid = a.reduce && a.satisfy && a.reuse

  return (
    <form
      className="qform"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        onSubmit(a)
        setA(empty)
      }}
    >
      <p className="qform-note">ทำหลังจากใช้สัญญาใจจนจบงานกลุ่มแล้ว</p>

      {ITEMS.map((it, i) => (
        <fieldset key={it.key}>
          <legend>
            <span className="q-no">{i + 1}</span> {it.q}
          </legend>
          <div className="scale" role="radiogroup">
            {SCALE.map((s) => (
              <label key={s.v} className={`scale-opt${a[it.key] === s.v ? ' is-on' : ''}`}>
                <input type="radio" name={it.key} checked={a[it.key] === s.v} onChange={() => setA({ ...a, [it.key]: s.v })} />
                <motion.span className="scale-num" animate={a[it.key] === s.v ? { scale: [1, 1.25, 1] } : { scale: 1 }}>
                  {s.v}
                </motion.span>
                <span className="scale-label">{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend>
          <span className="q-no">3</span> จะนำฟอร์มสัญญาใจนี้ไปใช้กับงานกลุ่มในรายวิชาอื่นหรือไม่ เพราะเหตุใด?
        </legend>
        <div className="yesno">
          {['ใช้', 'ไม่ใช้'].map((v) => (
            <label key={v} className={`opt${a.reuse === v ? ' is-on' : ''}`}>
              <input type="radio" name="reuse" checked={a.reuse === v} onChange={() => setA({ ...a, reuse: v })} />
              <span>{v}</span>
            </label>
          ))}
        </div>
        <textarea rows={3} value={a.why} onChange={(e) => setA({ ...a, why: e.target.value })} placeholder="เพราะ…" aria-label="เหตุผล" />
      </fieldset>

      <div className="qform-foot">
        {!valid && <span className="hint">ตอบให้ครบทั้ง 3 ข้อก่อนส่ง</span>}
        <button className="btn btn-ink" type="submit" disabled={!valid}>
          ส่งแบบประเมิน
        </button>
      </div>
    </form>
  )
}

function EvalResults({ responses, setResponses, onAnswer }) {
  const n = responses.length
  if (!n)
    return (
      <div className="empty">
        <p>ยังไม่มีผลประเมิน เมื่อมีคนตอบ ระบบจะคำนวณค่าเฉลี่ย (x̄) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) ให้</p>
        <button className="btn btn-ink" onClick={onAnswer}>
          เริ่มทำแบบประเมิน
        </button>
      </div>
    )

  const yes = responses.filter((r) => r.reuse === 'ใช้').length
  const reasons = responses.filter((r) => r.why.trim())

  return (
    <div className="results">
      <p className="results-n">ผู้ประเมิน {n} คน</p>
      <table className="stat-table">
        <thead>
          <tr>
            <th scope="col">รายการประเมิน</th>
            <th scope="col">x̄</th>
            <th scope="col">S.D.</th>
            <th scope="col">ระดับ</th>
          </tr>
        </thead>
        <tbody>
          {ITEMS.map((it) => {
            const vals = responses.map((r) => r[it.key])
            const m = mean(vals)
            return (
              <tr key={it.key}>
                <td>{it.q.replace('?', '')}</td>
                <td className="num">{m.toFixed(2)}</td>
                <td className="num">{sd(vals).toFixed(2)}</td>
                <td>
                  <span className="level">{interpret(m)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="others">เกณฑ์: 4.51–5.00 มากที่สุด, 3.51–4.50 มาก, 2.51–3.50 ปานกลาง, 1.51–2.50 น้อย, 1.00–1.50 น้อยที่สุด</p>

      {ITEMS.map((it) => (
        <div key={it.key}>
          <h4>{it.key === 'reduce' ? 'ช่วยลดความขัดแย้งเรื่องการแบ่งงาน' : 'ความพึงพอใจต่อบรรยากาศ'}</h4>
          <Bars
            tone={it.key === 'reduce' ? 'pink' : 'ink'}
            rows={SCALE.map((s) => {
              const count = responses.filter((r) => r[it.key] === s.v).length
              return { label: `${s.v} ${s.label}`, count, pct: (count / n) * 100 }
            })}
          />
        </div>
      ))}

      <h4>จะนำไปใช้ในรายวิชาอื่น</h4>
      <Bars rows={[{ label: 'ใช้', count: yes, pct: (yes / n) * 100 }, { label: 'ไม่ใช้', count: n - yes, pct: ((n - yes) / n) * 100 }]} />
      {reasons.length > 0 && (
        <ul className="quotes">
          {reasons.map((r, i) => (
            <li key={i}>
              <span>
                <b>{r.reuse}</b> “{r.why.trim()}”
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="results-foot">
        <button className="btn btn-ghost" onClick={() => window.confirm('ลบผลประเมินทั้งหมดบนเครื่องนี้?') && setResponses([])}>
          ล้างผลประเมิน
        </button>
        <button className="btn btn-ink" onClick={onAnswer}>
          เพิ่มผู้ประเมิน
        </button>
      </div>
    </div>
  )
}
