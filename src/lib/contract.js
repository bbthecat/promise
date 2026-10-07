export const COURSE = 'GE362785 การคิดเชิงสร้างสรรค์และการแก้ปัญหา'

export function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function newMember() {
  return { id: Math.random().toString(36).slice(2, 9), name: '', duty: '', deadline: '', status: 'todo', signedAt: null }
}

export function newContract() {
  return {
    group: '',
    project: '',
    course: COURSE,
    startDate: todayISO(),
    members: Array.from({ length: 6 }, newMember),
    lateRule: '',
    abandonRule: '',
    extraRules: [],
    confirmed: false,
    sealedAt: null,
  }
}

export const LATE_SUGGESTIONS = [
  'เลี้ยงขนมหรือชานมทั้งกลุ่ม 1 รอบ',
  'รับงานส่วนตรวจทาน/จัดรูปเล่มเพิ่ม',
  'แจ้งเหตุผลในแชทกลุ่มก่อนถึงกำหนดอย่างน้อย 1 วัน',
  'ช้าเกิน 2 วัน หัวหน้ากลุ่มแบ่งงานส่วนนั้นให้คนอื่นทำแทน',
]

export const ABANDON_SUGGESTIONS = [
  'ไม่ใส่ชื่อในรายงานส่วนที่ไม่ได้ทำ',
  'แจ้งอาจารย์ผู้สอนตามข้อเท็จจริง',
  'หักคะแนนประเมินเพื่อนร่วมกลุ่ม (peer review)',
  'คุยกันทั้งกลุ่มก่อน 1 ครั้ง ถ้ายังเงียบจึงใช้บทลงโทษ',
]

export const RULE_SUGGESTIONS = [
  'ตอบแชทกลุ่มภายใน 24 ชั่วโมง',
  'ติดธุระต้องบอกล่วงหน้า ไม่หายเงียบ',
  'อัปเดตความคืบหน้าในแชททุกสัปดาห์',
  'ตัดสินใจด้วยเสียงข้างมาก ถ้าเสมอให้หัวหน้ากลุ่มชี้ขาด',
  'ติชมที่งาน ไม่ใช่ที่ตัวคน',
]

export const STATUS = {
  todo: { label: 'ยังไม่เริ่ม', next: 'doing' },
  doing: { label: 'กำลังทำ', next: 'done' },
  done: { label: 'เสร็จแล้ว', next: 'todo' },
}
