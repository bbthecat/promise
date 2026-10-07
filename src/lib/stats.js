export function mean(values) {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

// Sample standard deviation (n - 1), as used in Thai research reports.
export function sd(values) {
  if (values.length < 2) return 0
  const m = mean(values)
  return Math.sqrt(values.reduce((a, v) => a + (v - m) ** 2, 0) / (values.length - 1))
}

export function interpret(m) {
  if (m >= 4.51) return 'มากที่สุด'
  if (m >= 3.51) return 'มาก'
  if (m >= 2.51) return 'ปานกลาง'
  if (m >= 1.51) return 'น้อย'
  if (m > 0) return 'น้อยที่สุด'
  return '—'
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d - today) / 86400000)
}

export function thaiDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}
