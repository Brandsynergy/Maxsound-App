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

    // Use a MediaElement to ensure CORS works reliably with remote URLs
    const media = new Audio()
    media.src = url
    media.crossOrigin = 'anonymous'
    media.preload = 'auto'

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
      media, // bind to our audio element
    })

    wavesurferRef.current = ws

    const onReady = () => {
      setIsReady(true)
      setDuration(ws.getDuration())
    }

    const onAudioProcess = () => setCurrent(ws.getCurrentTime())
    const onFinish = () => {
      setIsPlaying(false)
      setCurrent(ws.getDuration())
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    ws.on('ready', onReady)
    ws.on('audioprocess', onAudioProcess)
    ws.on('finish', onFinish)
    ws.on('play', onPlay)
    ws.on('pause', onPause)

    return () => {
      ws.un('ready', onReady)
      ws.un('audioprocess', onAudioProcess)
      ws.un('finish', onFinish)
      ws.un('play', onPlay)
      ws.un('pause', onPause)
      ws.destroy()
    }
  }, [url, height])

  const toggle = () => {
    const ws = wavesurferRef.current
    if (!ws) return
    ws.playPause()
    setIsPlaying(ws.isPlaying())
  }

  const fmt = (t) => {
    if (!isFinite(t)) return '0:00'
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
          className="px-3 py-1 rounded bg-white text-purple-700 font-medium hover:bg-gray-100 disabled:opacity-50"
          disabled={!isReady}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span>{fmt(duration)}</span>
      </div>
    </div>
  )
}
