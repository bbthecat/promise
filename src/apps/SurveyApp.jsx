import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStoredState } from '../lib/storage.js'
import Tabs from '../components/Tabs.jsx'
import Bars from '../components/Bars.jsx'

const Q1 = ['การแบ่งหน้าที่รับผิดชอบไม่เท่ากัน', 'สมาชิกติดต่อยาก / ตามตัวไม่เจอ', 'การส่งงานล่าช้ากว่ากำหนด', 'สมาชิกไม่เข้าใจเนื้องานที่ทำ']
const Q2 = ['พูดคุยและเคลียร์ใจกันตรง ๆ ทันที', 'ปล่อยผ่านไปเพราะไม่อยากให้เสียบรรยากาศ', 'ให้หัวหน้ากลุ่มเป็นคนตัดสินใจและแก้ปัญหา']

const empty = { q1: [], q1Other: '', q2: '', q2Other: '', q3: '' }

export default function SurveyApp({ contract, setContract, notify }) {
  const [responses, setResponses] = useStoredState('promise.survey', [])
  const [tab, setTab] = useState('form')

  return (
    <div className="form-app">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'form', label: 'ตอบแบบสอบถาม' },
          { id: 'result', label: `ผลสำรวจ (${responses.length})` },
        ]}
      />
      <AnimatePresence mode="wait">
        {tab === 'form' ? (
          <motion.div key="form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
            <SurveyForm
              onSubmit={(r) => {
                setResponses((rs) => [...rs, { ...r, at: new Date().toISOString() }])
                notify('ส่งคำตอบแล้ว ขอบคุณที่ช่วยกันสำรวจ')
                setTab('result')
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <SurveyResults responses={responses} setResponses={setResponses} contract={contract} setContract={setContract} notify={notify} onAnswer={() => setTab('form')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SurveyForm({ onSubmit }) {
  const [a, setA] = useState(empty)
  const toggle = (opt) => setA((s) => ({ ...s, q1: s.q1.includes(opt) ? s.q1.filter((x) => x !== opt) : [...s.q1, opt] }))
  const q1Count = a.q1.length + (a.q1Other.trim() ? 1 : 0)
  const valid = q1Count > 0 && (a.q2 && (a.q2 !== 'other' || a.q2Other.trim()))

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
      <p className="qform-note">ทำก่อนเริ่มงานกลุ่ม ใช้เวลาประมาณ 5 นาที คำตอบเก็บไว้ในเครื่องนี้ ส่งต่อให้เพื่อนตอบทีละคนได้</p>

      <fieldset>
        <legend>
          <span className="q-no">1</span> ปัญหาใดที่พบเจอบ่อยที่สุดในการทำงานกลุ่ม? <small>เลือกได้หลายข้อ</small>
        </legend>
        {Q1.map((opt) => (
          <label key={opt} className={`opt${a.q1.includes(opt) ? ' is-on' : ''}`}>
            <input type="checkbox" checked={a.q1.includes(opt)} onChange={() => toggle(opt)} />
            <span>{opt}</span>
          </label>
        ))}
        <input className="other" value={a.q1Other} onChange={(e) => setA({ ...a, q1Other: e.target.value })} placeholder="อื่น ๆ โปรดระบุ" aria-label="ปัญหาอื่น ๆ" />
      </fieldset>

      <fieldset>
        <legend>
          <span className="q-no">2</span> เมื่อเกิดความขัดแย้งในกลุ่ม คุณและเพื่อนจัดการกับปัญหาอย่างไร? <small>เลือก 1 ข้อ</small>
        </legend>
        {[...Q2, 'other'].map((opt) => (
          <label key={opt} className={`opt${a.q2 === opt ? ' is-on' : ''}`}>
            <input type="radio" name="q2" checked={a.q2 === opt} onChange={() => setA({ ...a, q2: opt })} />
            <span>{opt === 'other' ? 'อื่น ๆ' : opt}</span>
          </label>
        ))}
        {a.q2 === 'other' && <input className="other" autoFocus value={a.q2Other} onChange={(e) => setA({ ...a, q2Other: e.target.value })} placeholder="โปรดระบุ" aria-label="วิธีจัดการอื่น ๆ" />}
      </fieldset>

      <fieldset>
        <legend>
          <span className="q-no">3</span> กฎหรือข้อตกลงเรื่องใดที่คิดว่าจำเป็นที่สุด เพื่อไม่ให้อึดอัดใจเวลาทำงานกลุ่ม?
        </legend>
        <textarea rows={3} value={a.q3} onChange={(e) => setA({ ...a, q3: e.target.value })} placeholder="เช่น ตอบแชทกลุ่มภายใน 24 ชั่วโมง" aria-label="คำตอบข้อ 3" />
      </fieldset>

      <div className="qform-foot">
        {!valid && <span className="hint">ตอบข้อ 1 และข้อ 2 ก่อนส่ง</span>}
        <button className="btn btn-ink" type="submit" disabled={!valid}>
          ส่งคำตอบ
        </button>
      </div>
    </form>
  )
}

function SurveyResults({ responses, setResponses, contract, setContract, notify, onAnswer }) {
  const n = responses.length
  if (!n)
    return (
      <div className="empty">
        <p>ยังไม่มีคำตอบ ให้สมาชิกตอบบนเครื่องนี้ทีละคน แล้วผลจะสรุปเป็นความถี่และร้อยละที่นี่</p>
        <button className="btn btn-ink" onClick={onAnswer}>
          เริ่มตอบแบบสอบถาม
        </button>
      </div>
    )

  const q1Rows = [...Q1, 'อื่น ๆ'].map((opt) => {
    const count = responses.filter((r) => (opt === 'อื่น ๆ' ? r.q1Other?.trim() : r.q1.includes(opt))).length
    return { label: opt, count, pct: (count / n) * 100 }
  })
  const q2Rows = [...Q2, 'other'].map((opt) => {
    const count = responses.filter((r) => r.q2 === opt).length
    return { label: opt === 'other' ? 'อื่น ๆ' : opt, count, pct: (count / n) * 100 }
  })
  const q3 = responses.map((r) => r.q3.trim()).filter(Boolean)
  const others = responses.map((r) => r.q1Other?.trim()).filter(Boolean)
  const locked = contract.sealedAt || contract.members.some((m) => m.signedAt)

  const addToContract = (text) => {
    if (locked) return notify('สัญญามีคนลงชื่อแล้ว ล้างลายเซ็นก่อนจึงจะเพิ่มข้อตกลงได้')
    if (contract.extraRules.includes(text)) return notify('ข้อนี้อยู่ในสัญญาแล้ว')
    setContract((c) => ({ ...c, extraRules: [...c.extraRules, text] }))
    notify('เพิ่มลงหัวข้อที่ 3 ของสัญญาใจแล้ว')
  }

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [['เวลา', 'ข้อ1', 'ข้อ1 อื่นๆ', 'ข้อ2', 'ข้อ3']].concat(
      responses.map((r) => [r.at, r.q1.join(' | '), r.q1Other, r.q2 === 'other' ? r.q2Other : r.q2, r.q3])
    )
    const blob = new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'แบบสอบถาม-สัญญาใจ.csv'
    a.click()
  }

  return (
    <div className="results">
      <p className="results-n">ผู้ตอบ {n} คน แสดงเป็นจำนวนคนและร้อยละของผู้ตอบ</p>
      <h4>ปัญหาที่พบบ่อยที่สุด</h4>
      <Bars rows={q1Rows.sort((a, b) => b.count - a.count)} />
      {others.length > 0 && <p className="others">อื่น ๆ: {others.join(', ')}</p>}

      <h4>วิธีจัดการเมื่อเกิดความขัดแย้ง</h4>
      <Bars rows={q2Rows} tone="ink" />

      <h4>ข้อตกลงที่อยากให้มี</h4>
      {q3.length ? (
        <ul className="quotes">
          {q3.map((t, i) => (
            <li key={i}>
              <span>“{t}”</span>
              <button className="chip" onClick={() => addToContract(t)}>
                + ใส่ในสัญญา
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="others">ยังไม่มีคำตอบข้อนี้</p>
      )}

      <div className="results-foot">
        <button className="btn btn-ghost" onClick={exportCsv}>
          ดาวน์โหลด CSV
        </button>
        <button className="btn btn-ghost" onClick={() => window.confirm('ลบคำตอบทั้งหมดบนเครื่องนี้?') && setResponses([])}>
          ล้างคำตอบ
        </button>
        <button className="btn btn-ink" onClick={onAnswer}>
          เพิ่มคำตอบ
        </button>
      </div>
    </div>
  )
}
