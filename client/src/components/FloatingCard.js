import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function CreditCard() {
  return (
    <group rotation={[0.1, 0.1, 0]}>
      {/* Card body */}
      <mesh>
        <boxGeometry args={[2.5, 1.5, 0.05]} />
        <meshStandardMaterial 
          color="#1e3a8a" 
          metalness={0.6} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Chip */}
      <mesh position={[0, 0.3, 0.03]}>
        <boxGeometry args={[0.4, 0.35, 0.02]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.8} 
          roughness={0.1}
        />
      </mesh>

      {/* Stripe */}
      <mesh position={[0, -0.2, 0.03]}>
        <boxGeometry args={[2.4, 0.2, 0.01]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Logo text - using a plane */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
    </group>
  );
}

export default function FloatingCard() {
  return (
    <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#3b82f6" />
        
        <CreditCard />
        <OrbitControls 
          enableZoom={false}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}
