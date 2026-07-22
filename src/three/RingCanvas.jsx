import { useEffect, useRef, useState } from 'react'
import RingScene from './RingScene.js'
import { gsap, stage, reducedMotion } from '../lib/motion.js'

export default function RingCanvas() {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const scene = new RingScene(canvasRef.current)
    if (scene.failed) { setFailed(true); return }

    // pause rendering when tab hidden
    const onVis = () => scene.setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)

    let tick
    if (reducedMotion) {
      // single static pose render (after env/compile settle)
      scene.setScroll(0.08)
      scene.render()
      const settle = setTimeout(() => scene.render(), 300)
      tick = null
      scene._settle = settle
    } else {
      tick = () => {
        scene.setIntro(stage.intro)
        scene.setScroll(stage.progress)
        scene.setPointer(stage.mx, stage.my)
        scene.setSection(stage.section)
        scene.render()
      }
      gsap.ticker.add(tick)
    }

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      if (tick) gsap.ticker.remove(tick)
      if (scene._settle) clearTimeout(scene._settle)
      scene.dispose()
    }
  }, [])

  if (failed) return <div className="ring-poster" aria-hidden="true" />
  return <canvas id="ring-canvas" ref={canvasRef} aria-hidden="true" />
}
