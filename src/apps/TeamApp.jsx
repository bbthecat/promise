import { motion } from 'framer-motion'

const TEAM = [
  { name: 'นายปฏิภาณ ปานทะเล', id: '673380411-3' },
  { name: 'นายอาณัฐ อารีย์', id: '673380432-5' },
  { name: 'นายณัฐชา อรรคฮาต', id: '673380582-6' },
  { name: 'นายณัฐภัทร ฉ่ำตะคุ', id: '673380583-4' },
  { name: 'นายรัชชานนท์ ประดับแก้ว', id: '673380599-9' },
  { name: 'นางสาวอมลวรรณ พิมพิชัย', id: '673380608-4' },
]

const initial = (name) => name.replace(/^(นางสาว|นาย|นาง)/, '').trim().charAt(0)

export default function TeamApp() {
  return (
    <div className="doc team">
      <p className="doc-lead">
        สาขาวิทยาการคอมพิวเตอร์ วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
        <br />
        รายวิชา GE362785 Creative Thinking and Problem Solving
      </p>
      <ul className="people">
        {TEAM.map((p, i) => (
          <motion.li key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}>
            <span className={`avatar a${i % 3}`} aria-hidden="true">
              {initial(p.name)}
            </span>
            <span>
              <b>{p.name}</b>
              <small>{p.id}</small>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
