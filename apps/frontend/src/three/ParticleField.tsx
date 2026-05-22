import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export const ParticleField: React.FC<{ count?: number }> = ({ count = 2000 }) => {
  const ref = useRef<THREE.Points>(null!)
  const { mouse } = useThree()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
    ref.current.rotation.x = state.clock.elapsedTime * 0.01
    // Subtle mouse parallax
    ref.current.rotation.y += mouse.x * 0.002
    ref.current.rotation.x += mouse.y * 0.001
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#C8A95B"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}
