import { useEffect, useState } from 'react'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — keep working in memory */
  }
}

export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => load(key, typeof initial === 'function' ? initial() : initial))
  useEffect(() => save(key, value), [key, value])
  return [value, setValue]
}
