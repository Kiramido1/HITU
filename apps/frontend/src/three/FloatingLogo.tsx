import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

export const FloatingLogo: React.FC = () => {
  const gearRef = useRef<THREE.Group>(null!)
  const outerRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!gearRef.current) return
    // Gentle mouse tracking
    const t = state.clock.elapsedTime
    gearRef.current.rotation.y = Math.sin(t * 0.3) * 0.4
    gearRef.current.rotation.x = Math.sin(t * 0.2) * 0.15

    // Outer ring counter-rotation
    if (outerRef.current) outerRef.current.rotation.z = t * 0.5
    if (innerRef.current) innerRef.current.rotation.z = -t * 0.8
  })

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: '#C8A95B',
    metalness: 0.8,
    roughness: 0.2,
    emissive: '#C8A95B',
    emissiveIntensity: 0.15,
  })

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: '#1B3C73',
    metalness: 0.3,
    roughness: 0.1,
    transparent: true,
    opacity: 0.6,
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={gearRef} position={[0, 0.5, 0]}>
        {/* Outer rotating ring */}
        <mesh ref={outerRef}>
          <torusGeometry args={[2, 0.06, 8, 64]} />
          <meshStandardMaterial
            color="#C8A95B"
            emissive="#C8A95B"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Inner ring */}
        <mesh ref={innerRef}>
          <torusGeometry args={[1.5, 0.04, 8, 48]} />
          <meshStandardMaterial
            color="#E4C98A"
            emissive="#E4C98A"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Gear teeth (8 spokes) */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 1.85,
                Math.sin(angle) * 1.85,
                0,
              ]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.35, 0.12, 0.1]} />
              <meshStandardMaterial
                color="#C8A95B"
                emissive="#C8A95B"
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          )
        })}

        {/* Center disc */}
        <mesh>
          <cylinderGeometry args={[0.8, 0.8, 0.12, 32]} />
          <meshStandardMaterial
            color="#102544"
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Center hole */}
        <mesh>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 24]} />
          <meshStandardMaterial
            color="#C8A95B"
            emissive="#C8A95B"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Glowing point light inside */}
        <pointLight color="#C8A95B" intensity={2} distance={5} decay={2} />
      </group>
    </Float>
  )
}
