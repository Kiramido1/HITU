import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

export const AnimatedBackground: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawnParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 1 + 0.3),
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      life: 0,
      maxLife: Math.random() * 200 + 100,
    })

    // Seed initial particles
    for (let i = 0; i < 60; i++) {
      const p = spawnParticle()
      p.y = Math.random() * canvas.height
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    // Grid params
    const GRID = 60
    const GOLD = 'rgba(200,169,91,'
    const BLUE = 'rgba(27,60,115,'

    let tick = 0

    const draw = () => {
      tick++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Animated grid
      const offset = (tick * 0.3) % GRID
      ctx.lineWidth = 0.5
      for (let x = -GRID; x < canvas.width + GRID; x += GRID) {
        ctx.beginPath()
        ctx.strokeStyle = `${GOLD}0.04)`
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = -GRID + offset; y < canvas.height + GRID; y += GRID) {
        ctx.beginPath()
        ctx.strokeStyle = `${GOLD}0.04)`
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Diagonal accent lines
      if (tick % 3 === 0) {
        for (let i = 0; i < 3; i++) {
          const x = (Math.random() * canvas.width * 2) - canvas.width / 2
          ctx.beginPath()
          ctx.strokeStyle = `${GOLD}0.02)`
          ctx.lineWidth = 1
          ctx.moveTo(x, 0)
          ctx.lineTo(x + canvas.height * 0.5, canvas.height)
          ctx.stroke()
        }
      }

      // Particles
      if (particles.length < 80 && Math.random() < 0.3) {
        particles.push(spawnParticle())
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++

        const progress = p.life / p.maxLife
        const alpha = p.opacity * (1 - progress)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${GOLD}${alpha})`
        ctx.fill()

        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
        }
      }

      // Radial glow overlay (subtle)
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.3, 0,
        canvas.width / 2, canvas.height * 0.3, canvas.width * 0.6
      )
      grad.addColorStop(0, `${BLUE}0.08)`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className ?? ''}`}
    />
  )
}
