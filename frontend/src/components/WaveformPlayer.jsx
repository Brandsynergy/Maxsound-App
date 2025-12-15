import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function WaveformPlayer({ url, height = 100 }) {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#2C6DB6',
      progressColor: '#4A9FDB',
      cursorColor: '#FF3B30',
      cursorWidth: 2,
      height,
      normalize: true,
      interact: true,
      dragToSeek: true,
      url,
      mediaControls: false,
    })

    wavesurferRef.current = ws

    ws.on('ready', () => {
      setIsReady(true)
      setDuration(ws.getDuration())
    })

    ws.on('audioprocess', () => {
      setCurrent(ws.getCurrentTime())
    })

    ws.on('finish', () => {
      setIsPlaying(false)
      setCurrent(duration)
    })

    return () => {
      ws.destroy()
    }
  }, [url, height])

  const toggle = () => {
    if (!wavesurferRef.current) return
    wavesurferRef.current.playPause()
    setIsPlaying(wavesurferRef.current.isPlaying())
  }

  const fmt = (t) => {
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    const m = Math.floor(t / 60).toString()
    return `${m}:${s}`
  }

  return (
    <div>
      <div ref={containerRef} className="rounded overflow-hidden bg-black" />
      <div className="mt-3 flex items-center justify-between text-sm text-white/80">
        <span>{fmt(current)}</span>
        <button
          onClick={toggle}
          className="px-3 py-1 rounded bg-white text-purple-700 font-medium hover:bg-gray-100"
          disabled={!isReady}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span>{fmt(duration)}</span>
      </div>
    </div>
  )
}