import { useEffect, useRef } from 'react'

export function useGameLoop(
  onFrame: (deltaSeconds: number) => void,
  active: boolean,
  speedMultiplier: number,
) {
  const callbackRef = useRef(onFrame)
  callbackRef.current = onFrame

  useEffect(() => {
    if (!active) return

    let frameId = 0
    let previous = performance.now()

    const frame = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05) * speedMultiplier
      previous = now
      callbackRef.current(delta)
      frameId = requestAnimationFrame(frame)
    }

    frameId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(frameId)
  }, [active, speedMultiplier])
}
