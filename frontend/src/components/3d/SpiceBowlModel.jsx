import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Materials, getFoodTextures } from './FoodMaterials';

/**
 * Traditional Brass Katori / Bowl containing textured Podi / Spice Powder
 * Includes floating curry leaves and roasted red chillies
 */
export default function SpiceBowlModel({
  podiType = 'karampodi',
  autoRotate = true,
  scale = 1
}) {
  const groupRef = useRef();
  const { noiseTex } = getFoodTextures();

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group scale={scale}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Traditional Brass Katori (Deep Bowl) */}
        <group position={[0, -0.2, 0]}>
          {/* Bowl Outer Shell */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.75, 0.42, 0.45, 32, 1, true]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
          {/* Rounded Bowl Bottom */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
          {/* Rolled Top Rim */}
          <mesh position={[0, 0.225, 0]}>
            <torusGeometry args={[0.75, 0.035, 12, 32]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
        </group>

        {/* Mounded Spice Powder Mass inside bowl */}
        <group position={[0, -0.05, 0]}>
          {/* Mounded Heap */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.71, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
            <meshStandardMaterial
              {...Materials.spicePowder}
              bumpMap={noiseTex}
              bumpScale={0.06}
            />
          </mesh>

          {/* Whole Roasted Red Chilli Garnish sitting in powder */}
          <group position={[0.1, 0.28, 0]} rotation={[0.4, 0.6, -0.5]} scale={0.75}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.045, 0.45, 8]} />
              <meshStandardMaterial {...Materials.redChilli} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <coneGeometry args={[0.04, 0.08, 8]} />
              <meshStandardMaterial {...Materials.redChilli} />
            </mesh>
          </group>

          {/* Crispy Roasted Curry Leaf resting on powder */}
          <mesh position={[-0.18, 0.28, 0.1]} rotation={[-0.3, 0.5, 0.2]} scale={0.7} castShadow>
            <cylinderGeometry args={[0.1, 0.08, 0.005, 16]} />
            <meshStandardMaterial {...Materials.curryLeaf} />
          </mesh>

          {/* Roasted Cumin / Garlic bits */}
          {[...Array(12)].map((_, i) => {
            const ang = (i / 12) * Math.PI * 2;
            const r = 0.2 + (i % 3) * 0.12;
            return (
              <mesh
                key={i}
                position={[Math.cos(ang) * r, 0.22 + (i % 2) * 0.03, Math.sin(ang) * r]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <boxGeometry args={[0.025, 0.015, 0.04]} />
                <meshStandardMaterial color="#3d2612" roughness={0.7} />
              </mesh>
            );
          })}
        </group>

        {/* Floating roasted aroma ingredients */}
        <group position={[0.85, 0.4, -0.2]} rotation={[0.3, 0.8, -0.4]} scale={0.8}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
            <meshStandardMaterial {...Materials.redChilli} />
          </mesh>
        </group>

        <mesh position={[-0.8, 0.35, 0.3]} rotation={[0.6, -0.4, 0.5]} scale={0.75} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.005, 16]} />
          <meshStandardMaterial {...Materials.curryLeaf} />
        </mesh>
      </group>
    </group>
  );
}
