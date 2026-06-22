// ===================
// © AngelaMos | 2026
// MemeScatter.tsx
// ===================

import { useEffect, useRef, useState } from 'react'
import styles from './meme-scatter.module.scss'

const IMAGES = [
  '/memes/m01.jpg',
  '/memes/m02.jpg',
  '/memes/m03.jpg',
  '/memes/m04.jpg',
  '/memes/m05.jpg',
  '/memes/m06.jpg',
  '/memes/m07.jpg',
  '/memes/m08.jpg',
  '/memes/m09.webp',
  '/memes/m10.jpeg',
  '/memes/m11.jpg',
  '/memes/m12.jpg',
] as const

const VIDEOS = ['/memes/funny.mp4', '/memes/yo.mp4'] as const

// Distance (px) or flick speed (px/ms) past which a drag becomes a fling.
const FLING_DISTANCE = 55
const FLING_SPEED = 0.45

interface Placement {
  id: string
  src: string
  kind: 'img' | 'video'
  top: number
  left: number
  size: number
  rot: number
  delay: number
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function generate(): Placement[] {
  const sources: { src: string; kind: 'img' | 'video' }[] = [
    ...IMAGES.map((src) => ({ src, kind: 'img' as const })),
    ...VIDEOS.map((src) => ({ src, kind: 'video' as const })),
  ]

  return sources.map((s, i) => ({
    id: `${i}-${Math.floor(rand(0, 1_000_000))}`,
    src: s.src,
    kind: s.kind,
    top: rand(1, 86),
    left: rand(1, 88),
    size: s.kind === 'video' ? rand(150, 230) : rand(70, 150),
    rot: rand(-24, 24),
    delay: rand(0, 4),
  }))
}

type DragMode = 'idle' | 'drag' | 'snap' | 'flung'

interface MemeItemProps {
  item: Placement
  onDismiss: (id: string) => void
}

function MemeItem({ item, onDismiss }: MemeItemProps): React.ReactElement {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [mode, setMode] = useState<DragMode>('idle')
  const start = useRef({ x: 0, y: 0 })
  const last = useRef({ x: 0, y: 0, t: 0 })
  const velocity = useRef({ x: 0, y: 0 })

  const handleDown = (e: React.PointerEvent): void => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY }
    last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp }
    velocity.current = { x: 0, y: 0 }
    setMode('drag')
  }

  const handleMove = (e: React.PointerEvent): void => {
    if (mode !== 'drag') return
    const dt = e.timeStamp - last.current.t || 16
    velocity.current = {
      x: (e.clientX - last.current.x) / dt,
      y: (e.clientY - last.current.y) / dt,
    }
    last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp }
    setOffset({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })
  }

  const handleUp = (): void => {
    if (mode !== 'drag') return
    const distance = Math.hypot(offset.x, offset.y)
    const speed = Math.hypot(velocity.current.x, velocity.current.y)

    if (distance > FLING_DISTANCE || speed > FLING_SPEED) {
      const mag = distance || 1
      const ux = offset.x / mag
      const uy = offset.y / mag
      const throwBy = 1700
      setOffset({ x: offset.x + ux * throwBy, y: offset.y + uy * throwBy })
      setMode('flung')
      window.setTimeout(() => onDismiss(item.id), 520)
    } else {
      setMode('snap')
      setOffset({ x: 0, y: 0 })
      window.setTimeout(() => setMode('idle'), 260)
    }
  }

  const className = [
    styles.item,
    mode !== 'idle' && styles.dragging,
    mode === 'snap' && styles.snapping,
    mode === 'flung' && styles.flung,
  ]
    .filter(Boolean)
    .join(' ')

  const style: React.CSSProperties = {
    top: `${item.top}%`,
    left: `${item.left}%`,
    width: `${item.size}px`,
    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${item.rot}deg)`,
    animationDelay: `${item.delay}s`,
  }

  return (
    <div
      className={className}
      style={style}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {item.kind === 'video' ? (
        <video
          className={styles.media}
          src={item.src}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img className={styles.media} src={item.src} alt="" draggable={false} />
      )}
    </div>
  )
}

export function MemeScatter(): React.ReactElement {
  const [items, setItems] = useState<Placement[]>(generate)
  const staticRef = useRef<HTMLVideoElement | null>(null)

  // Browsers block autoplay with audio until the user interacts, so the
  // pinned clip starts muted and gets its sound on the first gesture.
  useEffect(() => {
    const unmute = (): void => {
      const video = staticRef.current
      if (video !== null) {
        video.muted = false
        video.volume = 0.7
        void video.play().catch(() => undefined)
      }
      document.removeEventListener('pointerdown', unmute)
      document.removeEventListener('keydown', unmute)
    }
    document.addEventListener('pointerdown', unmute)
    document.addEventListener('keydown', unmute)
    return () => {
      document.removeEventListener('pointerdown', unmute)
      document.removeEventListener('keydown', unmute)
    }
  }, [])

  const dismiss = (id: string): void => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      <video
        ref={staticRef}
        className={styles.pinned}
        src="/memes/static.mp4"
        autoPlay
        muted
        loop
        playsInline
        onClick={(e) => {
          const video = e.currentTarget
          video.muted = !video.muted
          if (!video.muted) {
            video.volume = 0.7
          }
        }}
      />
      {items.map((it) => (
        <MemeItem key={it.id} item={it} onDismiss={dismiss} />
      ))}
    </div>
  )
}
