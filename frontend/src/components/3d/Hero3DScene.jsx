import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import SceneContainer from './SceneContainer';
import WarmKitchenEnvironment from './WarmKitchenEnvironment';
import PickleJarModel from './PickleJarModel';

/**
 * Mouse Parallax Rig
 * Smoothly tilts the camera or scene group towards the mouse pointer
 */
function MouseParallaxRig({ children, isMobile = false }) {
  const groupRef = useRef();
  const { mouse } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (isMobile) {
      // Gentle subtle natural breathing on mobile
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t * 0.5) * 0.15, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.08 + Math.cos(t * 0.4) * 0.03, 0.05);
    } else {
      // Mouse-driven responsive parallax
      const targetRotY = mouse.x * 0.4;
      const targetRotX = 0.08 - mouse.y * 0.25;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * 3D Hero Scene Component
 * Renders the full composition with Andhra Avakaya jar, floating ingredients,
 * wooden platform, warm cinematic kitchen lighting, and interactive controls.
 */
export default function Hero3DScene({ className = '', style = {} }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`hero-3d-scene-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isMobile ? '380px' : '520px',
        ...style
      }}
    >
      <SceneContainer
        camera={{
          position: [0, 0.4, isMobile ? 4.4 : 3.6],
          fov: isMobile ? 46 : 40
        }}
        fallbackImage="https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg"
        loadingLabel="Crafting 3D Avakaya Jar..."
      >
        <WarmKitchenEnvironment
          showShadows={true}
          shadowOpacity={0.65}
          shadowScale={4.5}
          groundY={-0.95}
        />

        <MouseParallaxRig isMobile={isMobile}>
          <Float
            speed={isMobile ? 1.2 : 1.8}
            rotationIntensity={isMobile ? 0.2 : 0.4}
            floatIntensity={isMobile ? 0.3 : 0.6}
            floatingRange={[-0.05, 0.05]}
          >
            <PickleJarModel
              isHero={true}
              pickleType="avakaya"
              floatingIngredients={true}
              autoRotate={true}
              scale={isMobile ? 1.05 : 1.2}
            />
          </Float>
        </MouseParallaxRig>

        {/* Constrained interactive OrbitControls allowing customer to touch/drag rotate */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.85}
          rotateSpeed={0.6}
          dampingFactor={0.05}
        />
      </SceneContainer>

      {/* Interactive Micro-Hint Badge */}
      <div
        className="hero-3d-hint-pill"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: isMobile ? '50%' : '20px',
          transform: isMobile ? 'translateX(50%)' : 'none',
          background: 'rgba(28, 12, 5, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(217, 154, 23, 0.4)',
          borderRadius: '24px',
          padding: '6px 14px',
          color: '#f8d7aa',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 5
        }}
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#25D366', animation: 'pulse 1.8s infinite' }} />
        <span>3D Interactive • Drag to inspect Andhra Avakaya</span>
      </div>
    </div>
  );
}
