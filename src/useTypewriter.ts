import { useEffect, useState } from 'react'

interface TypewriterResult {
  displayed: string
  done: boolean
}

// Reveals `text` one character at a time after `startDelay`, then every `speed` ms.
export function useTypewriter(
  text: string,
  speed = 38,
  startDelay = 600,
): TypewriterResult {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)

    let index = 0
    let interval: ReturnType<typeof setInterval>

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))
        if (index >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      clearInterval(interval)
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}
