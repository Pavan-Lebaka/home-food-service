import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import SceneContainer from './SceneContainer';
import WarmKitchenEnvironment from './WarmKitchenEnvironment';
import PickleJarModel from './PickleJarModel';
import SnackPlateModel from './SnackPlateModel';

/**
 * Floating Golden Spice Embers / Motes in 3D Space
 */
function SpiceEmbers({ count = 35 }) {
  const embers = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        pos: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ],
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        size: 0.02 + Math.random() * 0.025
      });
    }
    return pts;
  }, [count]);

  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const ember = embers[i];
      if (ember) {
        child.position.y = ember.pos[1] + Math.sin(t * ember.speed + ember.offset) * 0.3;
        child.position.x = ember.pos[0] + Math.cos(t * ember.speed * 0.8 + ember.offset) * 0.15;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {embers.map((ember, i) => (
        <mesh key={i} position={ember.pos}>
          <sphereGeometry args={[ember.size, 6, 6]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#ffb347' : (i % 2 === 0 ? '#ffd700' : '#ff7a38')}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Mouse Parallax Rig
 */
function MouseParallaxRig({ children, isMobile = false }) {
  const groupRef = useRef();
  const { mouse } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    if (isMobile) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t * 0.5) * 0.12, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.06 + Math.cos(t * 0.4) * 0.025, 0.05);
    } else {
      const targetRotY = mouse.x * 0.35;
      const targetRotX = 0.06 - mouse.y * 0.22;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * Hero 3D Scene Component
 * Dynamically presents:
 * - Slide 0 (Feast): Grand Andhra Avakaya Jar with floating spices
 * - Slide 1 (Veg Pickles): Authentic Avakaya Jaadi Jar
 * - Slide 2 (Savouries): Brass plate with crispy Pappu Chekkalu & Murukku
 * - Slide 3 (Sweets): Brass thali with pure ghee Ariselu & Sunnundalu laddus
 */
export default function Hero3DScene({ currentSlide = 0, className = '', style = {} }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine what 3D model to render based on current hero slide
  // Slide 0: Grand Avakaya Jar with floating ingredients
  // Slide 1: Veg Pickles (Gongura / Avakaya Jar)
  // Slide 2: Crispy Savouries (Pappu Chekkalu / Karapusa)
  // Slide 3: Pure Ghee Sweets (Ariselu / Sunnundalu)
  const isPickleSlide = currentSlide === 0 || currentSlide === 1;
  const isSavourySlide = currentSlide === 2;
  const isSweetsSlide = currentSlide === 3;

  return (
    <div
      className={`hero-3d-scene-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isMobile ? '380px' : '540px',
        ...style
      }}
    >
      <SceneContainer
        camera={{
          position: [0, (isSavourySlide || isSweetsSlide) ? 1.4 : 0.4, isMobile ? 4.4 : ((isSavourySlide || isSweetsSlide) ? 3.0 : 3.6)],
          fov: isMobile ? 46 : 40
        }}
        fallbackImage="https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg"
        loadingLabel="Crafting 3D Andhra Delicacy..."
      >
        <WarmKitchenEnvironment
          showShadows={true}
          shadowOpacity={0.65}
          shadowScale={(isSavourySlide || isSweetsSlide) ? 4.2 : 4.6}
          groundY={(isSavourySlide || isSweetsSlide) ? -0.1 : -0.95}
        />

        {/* Ambient floating golden spice motes */}
        <SpiceEmbers count={isMobile ? 18 : 36} />

        <MouseParallaxRig isMobile={isMobile}>
          <Float
            speed={isMobile ? 1.1 : 1.7}
            rotationIntensity={isMobile ? 0.2 : 0.35}
            floatIntensity={isMobile ? 0.25 : 0.5}
            floatingRange={[-0.04, 0.04]}
          >
            {isPickleSlide && (
              <PickleJarModel
                isHero={true}
                pickleType={currentSlide === 1 ? 'gongura' : 'avakaya'}
                floatingIngredients={true}
                autoRotate={true}
                scale={isMobile ? 1.05 : 1.2}
              />
            )}

            {isSavourySlide && (
              <SnackPlateModel
                snackId="pappu-chekkalu"
                plateType="brass"
                autoRotate={true}
                scale={isMobile ? 1.15 : 1.3}
              />
            )}

            {isSweetsSlide && (
              <SnackPlateModel
                snackId="arisalu"
                plateType="brass"
                autoRotate={true}
                scale={isMobile ? 1.15 : 1.3}
              />
            )}
          </Float>
        </MouseParallaxRig>

        {/* Constrained interactive OrbitControls allowing customer to touch/drag rotate */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.8}
          maxPolarAngle={Math.PI / 1.85}
          rotateSpeed={0.65}
          dampingFactor={0.06}
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
          background: 'rgba(22, 9, 4, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(217, 154, 23, 0.45)',
          borderRadius: '24px',
          padding: '6px 14px',
          color: '#f8d7aa',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 5
        }}
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#25D366', animation: 'pulse 1.8s infinite' }} />
        <span>3D Interactive • Touch or Drag to Inspect</span>
      </div>
    </div>
  );
}
