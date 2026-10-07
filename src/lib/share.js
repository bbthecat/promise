// Contracts travel inside the URL hash so a group can open the same promise on every phone.
function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code) {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeContract(contract) {
  return toBase64Url(JSON.stringify(contract))
}

export function readSharedContract() {
  const match = window.location.hash.match(/^#c=(.+)$/)
  if (!match) return null
  try {
    return JSON.parse(fromBase64Url(match[1]))
  } catch {
    return null
  }
}

export function shareUrl(contract) {
  return `${window.location.origin}${window.location.pathname}#c=${encodeContract(contract)}`
}
