import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Stars, OrbitControls } from '@react-three/drei'
import { FloatingLogo } from './FloatingLogo'
import { ParticleField } from './ParticleField'
import { GridFloor } from './GridFloor'
import * as THREE from 'three'

const CameraRig: React.FC = () => {
  const { camera, mouse } = useThree()

  useFrame(() => {
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03
    camera.position.y += (mouse.y * 1 + 1 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })

  return null
}

const FloatingOrbs: React.FC = () => {
  const orbRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!orbRef.current) return
    const t = state.clock.elapsedTime
    orbRef.current.children.forEach((orb, i) => {
      orb.position.y = Math.sin(t * 0.5 + i * 1.2) * 0.5 + (orb as any).userData.baseY
    })
  })

  const orbs = [
    { pos: [-4, 1, -2] as [number, number, number], size: 0.15, color: '#C8A95B', intensity: 1.2 },
    { pos: [4.5, 0.5, -3] as [number, number, number], size: 0.12, color: '#1B3C73', intensity: 0.8 },
    { pos: [-3, -1, 1] as [number, number, number], size: 0.1, color: '#E4C98A', intensity: 1.0 },
    { pos: [3, 2, -1] as [number, number, number], size: 0.08, color: '#C8A95B', intensity: 0.6 },
  ]

  return (
    <group ref={orbRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.pos} userData={{ baseY: orb.pos[1] }}>
          <sphereGeometry args={[orb.size, 16, 16]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={orb.intensity}
            transparent
            opacity={0.9}
          />
          <pointLight color={orb.color} intensity={orb.intensity * 2} distance={3} decay={2} />
        </mesh>
      ))}
    </group>
  )
}

export const HeroScene: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.2} color="#102544" />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#E4C98A" />
        <pointLight position={[-5, 3, -5]} intensity={1} color="#1B3C73" distance={15} />
        <pointLight position={[5, -2, 3]} intensity={0.8} color="#C8A95B" distance={12} />

        {/* Scene elements */}
        <ParticleField count={1500} />
        <FloatingLogo />
        <GridFloor />
        <FloatingOrbs />

        {/* Stars in background */}
        <Stars radius={80} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

        {/* Camera rig for mouse tracking */}
        <CameraRig />

        {/* Fog for depth */}
        <fog attach="fog" args={['#020817', 10, 30]} />
      </Suspense>
    </Canvas>
  )
}
