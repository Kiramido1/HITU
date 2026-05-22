import { useEffect, useRef, useState } from 'react'

// Count-up animation hook
export function useCountUp(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = performance.now()
      const update = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) frameRef.current = requestAnimationFrame(update)
      }
      frameRef.current = requestAnimationFrame(update)
    }, delay)
    return () => {
      clearTimeout(timer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, delay])

  return count
}

// Intersection observer hook
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = (val: T | ((prev: T) => T)) => {
    try {
      const newVal = val instanceof Function ? val(value) : val
      setValue(newVal)
      localStorage.setItem(key, JSON.stringify(newVal))
    } catch (e) {
      console.error(e)
    }
  }

  return [value, set] as const
}

// Debounce hook
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Window size hook
export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

// Mouse position hook
export function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}
