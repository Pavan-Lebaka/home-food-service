import React from 'react';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';

/**
 * Authentic Andhra Traditional Kitchen Lighting Environment
 * Features:
 * - Procedural HDRI Studio Lightformers (window sunlight, soft fill, warm terracotta bounce)
 *   which gives glass realistic reflections and brass high specular gloss without external downloads.
 * - Directional golden sunlight casting soft contact shadows
 * - Rim light to highlight food silhouette and glass rims
 */
export default function WarmKitchenEnvironment({
  showShadows = true,
  shadowOpacity = 0.65,
  shadowScale = 5,
  groundY = -1.05
}) {
  return (
    <>
      {/* Procedural High-Fidelity Studio Environment for Glass Refraction & Metallic Brass Highlights */}
      <Environment resolution={256}>
        {/* Soft overhead warm skylight */}
        <Lightformer
          form="ring"
          intensity={3}
          scale={4}
          position={[0, 6, -1]}
          target={[0, 0, 0]}
          color="#fff6e8"
        />
        {/* Warm golden morning sun window streak */}
        <Lightformer
          form="rect"
          intensity={4}
          scale={[5, 2.5]}
          position={[4, 3, 2]}
          target={[0, 0, 0]}
          color="#ffc87d"
        />
        {/* Crisp white edge reflection on glass rim */}
        <Lightformer
          form="rect"
          intensity={2.2}
          scale={[2.5, 5]}
          position={[-4, 2, -2]}
          target={[0, 0, 0]}
          color="#ffffff"
        />
        {/* Warm terracotta ground fill bounce */}
        <Lightformer
          form="circle"
          intensity={1.8}
          scale={3.5}
          position={[0, -2, 1]}
          color="#d96f30"
        />
      </Environment>

      {/* Warm ambient kitchen illumination */}
      <ambientLight intensity={0.75} color="#fff2dc" />

      {/* Main directional golden sunlight */}
      <directionalLight
        position={[4, 6, 3]}
        intensity={2.0}
        color="#fffbf2"
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
        intensity={0.65}
        color="#d97736"
      />

      {/* Rim light for glass edges and glossy snack crust */}
      <pointLight
        position={[-3, 2.8, -3]}
        intensity={1.2}
        color="#ffd89b"
      />

      {/* Front soft fill for appetizing colors */}
      <pointLight
        position={[0, 1.2, 3]}
        intensity={0.6}
        color="#fff4e0"
      />

      {/* Soft natural contact shadow on table/platform */}
      {showShadows && (
        <ContactShadows
          position={[0, groundY, 0]}
          opacity={shadowOpacity}
          scale={shadowScale}
          blur={2.4}
          far={3.2}
          color="#1e0a02"
        />
      )}
    </>
  );
}
