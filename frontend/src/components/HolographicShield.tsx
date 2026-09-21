import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Fresnel Holographic Shield Halo
const ShieldHaloShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00F0FF') },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.2);
      float pulse = 0.85 + 0.15 * sin(uTime * 2.5);
      gl_FragColor = vec4(uColor, fresnel * pulse * 1.8);
    }
  `,
};

function HologramCore() {
  const outerWireRef = useRef<THREE.Mesh>(null!);
  const innerIcosaRef = useRef<THREE.Mesh>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
    }
    if (outerWireRef.current) {
      outerWireRef.current.rotation.y = t * 0.25;
      outerWireRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
    if (innerIcosaRef.current) {
      innerIcosaRef.current.rotation.y = -t * 0.35;
      innerIcosaRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <group>
      {/* 1. Inner Refractive Crystal Sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhysicalMaterial
          color="#0B132B"
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          ior={1.4}
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* 2. Concentric Orbital Rings */}
      <mesh ref={innerIcosaRef}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.6} />
      </mesh>

      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.7, 0.015, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
      </mesh>

      {/* 3. Outer Fresnel Holographic Shield Halo */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.4, 2]} />
        <shaderMaterial
          ref={shaderRef}
          attach="material"
          args={[ShieldHaloShader]}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          wireframe={true}
        />
      </mesh>
    </group>
  );
}

export const HolographicShield: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[360px] md:h-[440px] flex items-center justify-center">
      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 5, 4]} intensity={1.5} color="#00F0FF" />
          <pointLight position={[-4, -3, -2]} intensity={0.8} color="#818cf8" />
          <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
            <HologramCore />
          </Float>
        </Canvas>
      ) : (
        <div className="w-48 h-48 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center animate-pulse-glow">
          <div className="w-32 h-32 rounded-full border border-indigo-400/40" />
        </div>
      )}

      {/* Centered Hologram Data Pipeline Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="px-4 py-2 rounded-xl bg-[#080B11]/80 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_24px_rgba(0,240,255,0.2)] text-center max-w-[240px]">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block">
            PRIVATE DATA
          </span>
          <span className="text-cyan-400 text-xs my-0.5 block font-bold">↓</span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 block">
            ZK PROCESSING
          </span>
          <span className="text-cyan-400 text-xs my-0.5 block font-bold">↓</span>
          <span className="text-[10px] font-mono font-semibold text-emerald-400 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            VERIFIED RESULT
          </span>
        </div>
      </div>
    </div>
  );
};
