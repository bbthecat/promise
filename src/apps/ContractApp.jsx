import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import { BowShape } from '../components/Icons.jsx'
import { ABANDON_SUGGESTIONS, LATE_SUGGESTIONS, RULE_SUGGESTIONS, STATUS, newContract, newMember } from '../lib/contract.js'
import { daysUntil, thaiDate } from '../lib/stats.js'
import { shareUrl } from '../lib/share.js'

export default function ContractApp({ contract, setContract, notify }) {
  const [sealing, setSealing] = useState(false)
  const rootRef = useRef(null)

  const update = (change) => setContract((c) => ({ ...c, ...(typeof change === 'function' ? change(c) : change) }))

  const copyLink = async () => {
    const url = shareUrl(contract)
    try {
      await navigator.clipboard.writeText(url)
      notify('คัดลอกลิงก์สัญญาแล้ว ส่งให้เพื่อนในกลุ่มได้เลย')
    } catch {
      window.prompt('คัดลอกลิงก์นี้ส่งให้เพื่อน', url)
    }
  }

  const seal = () => {
    setSealing(true)
    setTimeout(() => {
      update({ sealedAt: new Date().toISOString() })
      setSealing(false)
      rootRef.current?.closest('.window-body')?.scrollTo({ top: 0 })
      notify('ปิดผนึกสัญญาใจแล้ว')
    }, 1500)
  }

  return (
    <div className="contract" ref={rootRef}>
      {contract.sealedAt ? (
        <SealedView contract={contract} update={update} setContract={setContract} copyLink={copyLink} notify={notify} />
      ) : (
        <Editor contract={contract} update={update} setContract={setContract} copyLink={copyLink} onSeal={seal} />
      )}
      <AnimatePresence>{sealing && <SealOverlay />}</AnimatePresence>
    </div>
  )
}

/* ---------- Drafting ---------- */

function Editor({ contract, update, setContract, copyLink, onSeal }) {
  const { members } = contract
  const filled = members.filter((m) => m.name.trim())
  const signed = filled.filter((m) => m.signedAt)
  const anySigned = members.some((m) => m.signedAt)
  const rulesReady = contract.lateRule.trim() && contract.abandonRule.trim()
  const allSigned = filled.length >= 2 && signed.length === filled.length

  const blocker = !contract.group.trim()
    ? 'ตั้งชื่อกลุ่มก่อน'
    : filled.length < 2
      ? 'ใส่ชื่อสมาชิกอย่างน้อย 2 คน'
      : !rulesReady
        ? 'เขียนข้อปฏิบัติทั้ง 2 กรณีในหัวข้อที่ 2'
        : !allSigned
          ? `รออีก ${filled.length - signed.length} คนลงชื่อ`
          : !contract.confirmed
            ? 'ติ๊กยืนยันข้อตกลงด้านล่าง'
            : null

  const setMember = (id, change) =>
    update((c) => ({ members: c.members.map((m) => (m.id === id ? { ...m, ...change } : m)) }))

  const toggleSign = (m) => {
    if (m.signedAt) {
      if (window.confirm(`ยกเลิกลายเซ็นของ ${m.name}?`)) setMember(m.id, { signedAt: null })
    } else {
      setMember(m.id, { signedAt: new Date().toISOString() })
    }
  }

  const clearSignatures = () => {
    if (window.confirm('ล้างลายเซ็นทุกคนเพื่อแก้ไขข้อตกลง?'))
      update((c) => ({ members: c.members.map((m) => ({ ...m, signedAt: null })), confirmed: false }))
  }

  return (
    <>
      <div className="paper">
        <header className="paper-head">
          <h3 className="paper-title">สัญญาใจประจำกลุ่ม</h3>
          <p className="paper-note">ให้สมาชิกในกลุ่มตกลงร่วมกันก่อนเริ่มงาน</p>
        </header>

        <div className="meta-grid">
          <Field label="ชื่อกลุ่ม">
            <input value={contract.group} onChange={(e) => update({ group: e.target.value })} placeholder="เช่น กลุ่มโบว์ชมพู" disabled={anySigned} />
          </Field>
          <Field label="ชื่องาน / โครงงาน">
            <input value={contract.project} onChange={(e) => update({ project: e.target.value })} placeholder="เช่น รายงานบทที่ 1–5" disabled={anySigned} />
          </Field>
          <Field label="รายวิชา">
            <input value={contract.course} onChange={(e) => update({ course: e.target.value })} disabled={anySigned} />
          </Field>
          <Field label="วันที่ตกลงกัน">
            <input type="date" value={contract.startDate} onChange={(e) => update({ startDate: e.target.value })} disabled={anySigned} />
          </Field>
        </div>

        <section className="clause">
          <h4>
            <span className="clause-no">หัวข้อที่ 1</span> การแบ่งหน้าที่รับผิดชอบและกำหนดการส่งงาน
          </h4>
          <p className="clause-help">แต่ละคนลงชื่อในแถวของตัวเองหลังกรอกครบ ถ้าจะแก้แถวไหน ให้เจ้าของแถวยกเลิกลายเซ็นก่อน</p>
          <div className="duty-table" role="table" aria-label="ตารางแบ่งหน้าที่">
            <div className="duty-row duty-headrow" role="row">
              <span role="columnheader">#</span>
              <span role="columnheader">ชื่อผู้รับผิดชอบ</span>
              <span role="columnheader">หน้าที่ที่ได้รับมอบหมาย</span>
              <span role="columnheader">กำหนดส่ง</span>
              <span role="columnheader">ลงชื่อรับทราบ</span>
            </div>
            <AnimatePresence initial={false}>
              {members.map((m, i) => {
                const ready = m.name.trim() && m.duty.trim() && m.deadline
                return (
                  <motion.div
                    key={m.id}
                    className={`duty-row${m.signedAt ? ' is-signed' : ''}`}
                    role="row"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="duty-no" role="cell">{i + 1}</span>
                    <input role="cell" aria-label={`ชื่อคนที่ ${i + 1}`} value={m.name} placeholder="ชื่อ–สกุล" disabled={!!m.signedAt} onChange={(e) => setMember(m.id, { name: e.target.value })} />
                    <input role="cell" aria-label={`หน้าที่ของคนที่ ${i + 1}`} value={m.duty} placeholder="เช่น ทำบทที่ 2" disabled={!!m.signedAt} onChange={(e) => setMember(m.id, { duty: e.target.value })} />
                    <input role="cell" type="date" aria-label={`กำหนดส่งของคนที่ ${i + 1}`} value={m.deadline} disabled={!!m.signedAt} onChange={(e) => setMember(m.id, { deadline: e.target.value })} />
                    <span role="cell" className="sign-cell">
                      {m.signedAt ? (
                        <button className="signature" onClick={() => toggleSign(m)} title="คลิกเพื่อยกเลิกลายเซ็น">
                          <motion.span
                            className="signature-ink"
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={{ clipPath: 'inset(0 0% 0 0)' }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                          >
                            {m.name}
                          </motion.span>
                        </button>
                      ) : (
                        <button className="btn btn-sign" disabled={!ready} onClick={() => toggleSign(m)} title={ready ? 'ลงชื่อรับทราบ' : 'กรอกชื่อ หน้าที่ และกำหนดส่งให้ครบก่อน'}>
                          ลงชื่อ
                        </button>
                      )}
                      {!m.signedAt && members.length > 2 && (
                        <button className="row-remove" aria-label={`ลบแถวที่ ${i + 1}`} onClick={() => update((c) => ({ members: c.members.filter((x) => x.id !== m.id) }))}>
                          ×
                        </button>
                      )}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          {members.length < 12 && (
            <button className="btn btn-ghost add-row" onClick={() => update((c) => ({ members: [...c.members, newMember()] }))}>
              + เพิ่มสมาชิก
            </button>
          )}
        </section>

        <section className="clause">
          <h4>
            <span className="clause-no">หัวข้อที่ 2</span> บทลงโทษหรือข้อปฏิบัติเมื่อสมาชิกไม่ทำตามที่ตกลง
          </h4>
          <p className="clause-help">พวกเราในกลุ่มขอยอมรับเงื่อนไขร่วมกันดังนี้</p>
          {anySigned && (
            <p className="locked-note">
              มีคนลงชื่อแล้ว ข้อตกลงจึงถูกล็อกไว้{' '}
              <button className="link" onClick={clearSignatures}>
                ล้างลายเซ็นเพื่อแก้ไข
              </button>
            </p>
          )}
          <RuleField
            label="กรณีส่งงานช้ากว่ากำหนด"
            value={contract.lateRule}
            onChange={(v) => update({ lateRule: v })}
            suggestions={LATE_SUGGESTIONS}
            locked={anySigned}
          />
          <RuleField
            label="กรณีไม่ช่วยงานหรือละทิ้งหน้าที่"
            value={contract.abandonRule}
            onChange={(v) => update({ abandonRule: v })}
            suggestions={ABANDON_SUGGESTIONS}
            locked={anySigned}
          />
        </section>

        <section className="clause">
          <h4>
            <span className="clause-no">หัวข้อที่ 3</span> ข้อตกลงเพิ่มเติม
          </h4>
          <p className="clause-help">กติกาเล็ก ๆ ที่ช่วยให้ไม่อึดอัดใจเวลาทำงาน เลือกจากที่เพื่อนส่วนใหญ่ตอบในแบบสอบถาม หรือพิมพ์เอง</p>
          <ExtraRules rules={contract.extraRules} locked={anySigned} onChange={(extraRules) => update({ extraRules })} />
        </section>

        <label className={`confirm${contract.confirmed ? ' is-on' : ''}`}>
          <input type="checkbox" checked={contract.confirmed} onChange={(e) => update({ confirmed: e.target.checked })} />
          <span>
            ข้าพเจ้าได้อ่าน ทำความเข้าใจ และยินยอมปฏิบัติตามข้อตกลงทั้งหมด หากมีปัญหาเกิดขึ้น ยินยอมให้ใช้สัญญาฉบับนี้เป็นเกณฑ์ในการตัดสิน
          </span>
        </label>
      </div>

      <footer className="contract-bar">
        <div className="sign-progress" aria-label={`ลงชื่อแล้ว ${signed.length} จาก ${filled.length} คน`}>
          <span className="hearts" aria-hidden="true">
            {filled.map((m) => (
              <motion.span key={m.id} className={`heart${m.signedAt ? ' on' : ''}`} animate={m.signedAt ? { scale: [1, 1.5, 1] } : { scale: 1 }}>
                ♥
              </motion.span>
            ))}
          </span>
          <span>
            ลงชื่อแล้ว {signed.length}/{filled.length || 0}
            {blocker && <em className="blocker">{blocker}</em>}
          </span>
        </div>
        <div className="bar-actions">
          <button className="btn btn-ghost" onClick={copyLink}>
            คัดลอกลิงก์ให้เพื่อน
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => window.confirm('ล้างทุกช่องแล้วเริ่มสัญญาใหม่?') && setContract(newContract())}
          >
            เริ่มใหม่
          </button>
          <button className="btn btn-berry" disabled={!!blocker} onClick={onSeal}>
            ปิดผนึกสัญญา
          </button>
        </div>
      </footer>
    </>
  )
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

function RuleField({ label, value, onChange, suggestions, locked }) {
  return (
    <div className="rule">
      <Field label={label}>
        <textarea rows={2} value={value} disabled={locked} onChange={(e) => onChange(e.target.value)} placeholder="พิมพ์เอง หรือแตะตัวเลือกด้านล่าง" />
      </Field>
      {!locked && (
        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} className="chip" onClick={() => onChange(value.trim() ? `${value.trim()} และ${s}` : s)}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ExtraRules({ rules, onChange, locked }) {
  const [draft, setDraft] = useState('')
  const add = (text) => {
    const t = text.trim()
    if (!t || rules.includes(t)) return
    onChange([...rules, t])
    setDraft('')
  }
  return (
    <div className="extra">
      <ul className="extra-list">
        <AnimatePresence initial={false}>
          {rules.map((r) => (
            <motion.li key={r} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <span>♡ {r}</span>
              {!locked && (
                <button className="row-remove" aria-label={`ลบข้อตกลง ${r}`} onClick={() => onChange(rules.filter((x) => x !== r))}>
                  ×
                </button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!locked && (
        <>
          <form
            className="extra-add"
            onSubmit={(e) => {
              e.preventDefault()
              add(draft)
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="พิมพ์ข้อตกลงใหม่" aria-label="ข้อตกลงเพิ่มเติม" />
            <button className="btn btn-ghost" type="submit">
              เพิ่ม
            </button>
          </form>
          <div className="chips">
            {RULE_SUGGESTIONS.filter((s) => !rules.includes(s)).map((s) => (
              <button key={s} className="chip" onClick={() => add(s)}>
                + {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- Sealed ---------- */

function SealOverlay() {
  return (
    <motion.div className="seal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="wax"
        initial={{ scale: 2.6, rotate: -30, opacity: 0 }}
        animate={{ scale: [2.6, 0.92, 1], rotate: [-30, 4, 0], opacity: 1 }}
        transition={{ duration: 0.75, times: [0, 0.75, 1], ease: 'easeOut' }}
      >
        <WaxSeal />
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        ปิดผนึกสัญญาใจ
      </motion.p>
    </motion.div>
  )
}

function WaxSeal({ size = 120 }) {
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} aria-hidden="true">
      <path
        d="M0-54c8 0 10 6 17 7s13-3 18 2 1 11 5 17 11 6 11 14-6 10-7 17 3 13-2 18-11 1-17 5-6 11-14 11-10-6-17-7-13 3-18-2-1-11-5-17-11-6-11-14 6-10 7-17-3-13 2-18 11-1 17-5S-8-54 0-54z"
        fill="#7A1F45"
      />
      <circle r="36" fill="none" stroke="#A23A65" strokeWidth="2.5" />
      <BowShape x={0} y={-2} s={1.7} fill="#9C3360" stroke="#F2A7C3" sw={1.3} />
    </svg>
  )
}

function SealedView({ contract, update, setContract, copyLink, notify }) {
  const certRef = useRef(null)
  const members = contract.members.filter((m) => m.name.trim())
  const done = members.filter((m) => m.status === 'done').length

  const cycle = (id) =>
    update((c) => ({ members: c.members.map((m) => (m.id === id ? { ...m, status: STATUS[m.status].next } : m)) }))

  const savePng = async () => {
    try {
      const url = await toPng(certRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' })
      const a = document.createElement('a')
      a.href = url
      a.download = `สัญญาใจ-${contract.group || 'กลุ่ม'}.png`
      a.click()
      notify('บันทึกรูปสัญญาแล้ว')
    } catch {
      notify('บันทึกรูปไม่สำเร็จ ลองใช้ “พิมพ์ / PDF” แทน')
    }
  }

  const unseal = () => {
    if (window.confirm('แก้ไขสัญญาจะยกเลิกการปิดผนึกและลายเซ็นทุกคน ต้องให้ทุกคนลงชื่อใหม่ ทำต่อไหม?'))
      update((c) => ({ sealedAt: null, confirmed: false, members: c.members.map((m) => ({ ...m, signedAt: null })) }))
  }

  return (
    <>
      <div className="tracker">
        <div className="tracker-head">
          <p>
            ความคืบหน้า <b>{done}</b> จาก {members.length} งาน
          </p>
          <p className="tracker-help">แตะสถานะในตารางเพื่ออัปเดต</p>
        </div>
        <div className="tracker-bar" aria-hidden="true">
          <motion.span animate={{ width: `${members.length ? (done / members.length) * 100 : 0}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <motion.article
        className="certificate print-target"
        ref={certRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <div className="cert-seal">
          <WaxSeal size={92} />
        </div>
        <p className="cert-script">สัญญาใจ</p>
        <h3 className="cert-group">{contract.group}</h3>
        <p className="cert-meta">
          {contract.project && <>{contract.project} — </>}
          {contract.course}
          <br />
          ตกลงร่วมกันเมื่อ {thaiDate(contract.startDate)}
        </p>

        <table className="cert-table">
          <thead>
            <tr>
              <th scope="col">ผู้รับผิดชอบ</th>
              <th scope="col">หน้าที่</th>
              <th scope="col">กำหนดส่ง</th>
              <th scope="col">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const left = daysUntil(m.deadline)
              const late = m.status !== 'done' && left !== null && left < 0
              return (
                <tr key={m.id} className={late ? 'is-late' : ''}>
                  <td>
                    <span className="cert-sign">{m.name}</span>
                  </td>
                  <td>{m.duty}</td>
                  <td>
                    {thaiDate(m.deadline)}
                    {m.status !== 'done' && left !== null && (
                      <small className="countdown">{left > 0 ? `อีก ${left} วัน` : left === 0 ? 'วันนี้' : `เลยมา ${-left} วัน`}</small>
                    )}
                  </td>
                  <td>
                    <button className={`status status-${m.status}`} onClick={() => cycle(m.id)} aria-label={`สถานะงานของ ${m.name}: ${STATUS[m.status].label} แตะเพื่อเปลี่ยน`}>
                      {STATUS[m.status].label}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="cert-rules">
          <p>
            <b>ถ้าส่งงานช้ากว่ากำหนด</b> {contract.lateRule}
          </p>
          <p>
            <b>ถ้าไม่ช่วยงานหรือละทิ้งหน้าที่</b> {contract.abandonRule}
          </p>
          {contract.extraRules.length > 0 && (
            <ul>
              {contract.extraRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
        <p className="cert-foot">
          สมาชิกทั้ง {members.length} คนลงชื่อรับทราบและปิดผนึกเมื่อ{' '}
          {new Date(contract.sealedAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </motion.article>

      <footer className="contract-bar">
        <div className="bar-actions">
          <button className="btn btn-ghost" onClick={unseal}>
            แก้ไขสัญญา
          </button>
          <button className="btn btn-ghost" onClick={() => window.confirm('เริ่มสัญญาฉบับใหม่? ฉบับนี้จะถูกลบจากเครื่องนี้') && setContract(newContract())}>
            เริ่มฉบับใหม่
          </button>
        </div>
        <div className="bar-actions">
          <button className="btn btn-ghost" onClick={copyLink}>
            คัดลอกลิงก์
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            พิมพ์ / PDF
          </button>
          <button className="btn btn-berry" onClick={savePng}>
            บันทึกเป็นรูป
          </button>
        </div>
      </footer>
    </>
  )
}
