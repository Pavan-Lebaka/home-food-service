import React from 'react';
import { ContactShadows } from '@react-three/drei';

/**
 * Authentic Andhra Traditional Kitchen Lighting Environment
 * Features:
 * - Warm morning sunlight (gently highlights spices and glass jars)
 * - Terracotta/brass ambient bounce
 * - Soft rim light for glass reflection & snack silhouette
 * - Smooth contact shadows for grounding objects on platforms
 */
export default function WarmKitchenEnvironment({
  showShadows = true,
  shadowOpacity = 0.55,
  shadowScale = 5,
  groundY = -1.05
}) {
  return (
    <>
      {/* Warm ambient kitchen illumination */}
      <ambientLight intensity={0.85} color="#fff1db" />

      {/* Main directional golden sunlight */}
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.8}
        color="#fffaee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />

      {/* Warm terracotta bounce fill light from below/side */}
      <directionalLight
        position={[-3, -1, -2]}
        intensity={0.6}
        color="#d97736"
      />

      {/* Rim light for glass edges and glossy snack crust */}
      <pointLight
        position={[-3, 3, -3]}
        intensity={1.2}
        color="#ffd89b"
      />

      {/* Front soft fill for appetizing colors */}
      <pointLight
        position={[0, 1.5, 3]}
        intensity={0.5}
        color="#fff4e0"
      />

      {/* Soft natural contact shadow on table/platform */}
      {showShadows && (
        <ContactShadows
          position={[0, groundY, 0]}
          opacity={shadowOpacity}
          scale={shadowScale}
          blur={2.4}
          far={3}
          color="#220e04"
        />
      )}
    </>
  );
}
