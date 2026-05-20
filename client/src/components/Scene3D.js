import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';

function AnimatedCube() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.2}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <MeshDistortMaterial
          color="#2563eb"
          speed={2}
          distort={0.3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function TorusRing() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.5;
    meshRef.current.rotation.z = t * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.8, 0.15, 16, 100]} />
        <meshStandardMaterial color="#22c55e" metalness={0.9} roughness={0.1} />
      </mesh>
    </Float>
  );
}

function SphereOrbit() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.x = Math.cos(t * 0.8) * 2.5;
    meshRef.current.position.z = Math.sin(t * 0.8) * 2.5;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <MeshWobbleMaterial color="#f59e0b" speed={1} distort={0.3} />
    </mesh>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />

      <AnimatedCube />
      <TorusRing />
      <SphereOrbit />
    </Canvas>
  );
}

export default Scene;
