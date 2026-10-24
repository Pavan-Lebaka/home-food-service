import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import SceneContainer from './SceneContainer';
import WarmKitchenEnvironment from './WarmKitchenEnvironment';
import PickleJarModel from './PickleJarModel';
import SnackPlateModel from './SnackPlateModel';

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
        minHeight: 0,
        ...style
      }}
    >
      <SceneContainer
        camera={{
          position: [0, (isSavourySlide || isSweetsSlide) ? 1.4 : 0.4, isMobile ? 4.4 : ((isSavourySlide || isSweetsSlide) ? 4.1 : 5.0)],
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
                floatingIngredients={false}
                autoRotate={true}
                scale={isMobile ? 1.52 : 1.5}
              />
            )}

            {isSavourySlide && (
              <SnackPlateModel
                snackId="pappu-chekkalu"
                plateType="brass"
                autoRotate={true}
                scale={isMobile ? 1.15 : 1.0}
              />
            )}

            {isSweetsSlide && (
              <SnackPlateModel
                snackId="arisalu"
                plateType="brass"
                autoRotate={true}
                scale={isMobile ? 1.15 : 1.0}
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

      {/* A quiet prompt keeps the canvas discoverable without competing with the food. */}
      <div
        className="hero-3d-hint"
        style={{
          position: 'absolute',
          bottom: '12px',
          right: isMobile ? '50%' : '20px',
          transform: isMobile ? 'translateX(50%)' : 'none',
          color: '#786d61',
          fontSize: '0.72rem',
          fontWeight: 500,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 5
        }}
      >
        <span>Drag to turn</span>
      </div>
    </div>
  );
}
