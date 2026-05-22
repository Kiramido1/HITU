import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const GridFloor: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
      float line = min(grid.x, grid.y);
      float gridColor = 1.0 - min(line, 1.0);

      // Scan line effect
      float scanLine = fract(vUv.y - uTime * 0.15);
      float glow = smoothstep(0.98, 1.0, scanLine) * 0.8;

      // Radial fade
      float fade = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));

      vec3 goldColor = vec3(0.784, 0.663, 0.357); // #C8A95B
      vec3 finalColor = goldColor * (gridColor * 0.3 + glow) * fade;

      gl_FragColor = vec4(finalColor, (gridColor * 0.2 + glow * 0.4) * fade);
    }
  `

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{ uTime: { value: 0 } }}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
