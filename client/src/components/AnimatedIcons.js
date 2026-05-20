import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function AnimatedArrow({ direction = 'up', color = '#22c55e' }) {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 2) * 0.1;
  });

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.5);
    shape.lineTo(0.3, 0);
    shape.lineTo(0.1, 0);
    shape.lineTo(0.1, -0.5);
    shape.lineTo(-0.1, -0.5);
    shape.lineTo(-0.1, 0);
    shape.lineTo(-0.3, 0);
    shape.closePath();
    return shape;
  }, []);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} rotation={[direction === 'up' ? 0 : Math.PI, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
    </Float>
  );
}

export function Coin3D() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 2;
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>
    </Float>
  );
}

export function CreditIcon() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere args={[0.4, 32, 32]}>
        <MeshDistortMaterial color="#22c55e" speed={2} distort={0.3} />
      </Sphere>
    </Float>
  );
}

export function DebitIcon() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere args={[0.4, 32, 32]}>
        <MeshDistortMaterial color="#ef4444" speed={2} distort={0.3} />
      </Sphere>
    </Float>
  );
}

export function Scene3DIcon({ type = 'credit' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ width: '50px', height: '50px' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      {type === 'credit' ? <CreditIcon /> : <DebitIcon />}
    </Canvas>
  );
}
