import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Materials, getFoodTextures } from './FoodMaterials';

/**
 * Procedural Curry Leaf Geometry
 */
function CurryLeaf({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const leafShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.4);
    shape.bezierCurveTo(0.2, -0.2, 0.25, 0.1, 0, 0.4);
    shape.bezierCurveTo(-0.25, 0.1, -0.2, -0.2, 0, -0.4);
    return shape;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <shapeGeometry args={[leafShape]} />
        <meshStandardMaterial {...Materials.curryLeaf} side={THREE.DoubleSide} />
      </mesh>
      {/* Central vein */}
      <mesh position={[0, 0, 0.005]}>
        <cylinderGeometry args={[0.005, 0.008, 0.78, 4]} />
        <meshStandardMaterial color="#2d773c" roughness={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Procedural Guntur Dried Red Chilli with curved body & calyx stem
 */
function WholeChilli({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.4, 0),
      new THREE.Vector3(0.06, -0.15, 0.03),
      new THREE.Vector3(-0.04, 0.15, -0.02),
      new THREE.Vector3(0.02, 0.38, 0.01)
    ]);
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Chilli Pod */}
      <mesh castShadow>
        <tubeGeometry args={[curve, 20, 0.045, 8, false]} />
        <meshStandardMaterial {...Materials.redChilli} />
      </mesh>
      {/* Calyx & Stem */}
      <group position={[0, -0.4, 0]}>
        <mesh>
          <coneGeometry args={[0.055, 0.06, 6]} />
          <meshStandardMaterial color="#4a5d28" roughness={0.6} />
        </mesh>
        <mesh position={[0.02, -0.05, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 5]} />
          <meshStandardMaterial color="#38491c" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Procedural Mango Slice Wedge (Raw Green Skin + Golden Pulp)
 */
function MangoSlice({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Golden Juicy Flesh */}
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 16, 1, false, 0, Math.PI * 0.75]} />
        <meshStandardMaterial {...Materials.mangoFlesh} />
      </mesh>
      {/* Outer Green Skin Arch */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.325, 0.325, 0.122, 16, 1, true, 0, Math.PI * 0.75]} />
        <meshStandardMaterial {...Materials.mangoSkin} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/**
 * Authentic Andhra Pickle Glass Jar (Avakaya / Non-Veg / Veg Pickles)
 */
export default function PickleJarModel({
  isHero = false,
  pickleType = 'avakaya', // 'avakaya', 'chicken', 'prawn', 'gongura', 'tomato'
  floatingIngredients = true,
  autoRotate = true,
  scale = 1
}) {
  const jarGroupRef = useRef();
  const floatingGroupRef = useRef();
  const oilInnerRef = useRef();
  const { woodTex, labelTex } = getFoodTextures();

  // Color customization based on pickle variety
  const oilColor = useMemo(() => {
    switch (pickleType) {
      case 'gongura':
        return '#3b4317'; // Deep dark herb gongura olive-red
      case 'chicken':
      case 'prawn':
        return '#a81c00'; // Dark rich non-veg fiery masala oil
      case 'tomato':
        return '#c03306'; // Vibrant country tomato red
      default:
        return '#ba2904'; // Monarch Avakaya Guntur red
    }
  }, [pickleType]);

  // Seeded mango/chicken chunks positions inside the jar
  const chunks = useMemo(() => {
    const list = [];
    const count = isHero ? 24 : 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
      const radius = 0.12 + Math.random() * 0.28;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.55 + Math.random() * 0.85;
      const rotX = Math.random() * Math.PI;
      const rotY = Math.random() * Math.PI;
      const sz = 0.12 + Math.random() * 0.08;
      list.push({ pos: [x, y, z], rot: [rotX, rotY, 0], scale: [sz, sz * 0.9, sz * 1.1] });
    }
    return list;
  }, [isHero]);

  // Tiny mustard seeds floating in oil
  const mustardSeeds = useMemo(() => {
    const list = [];
    const count = isHero ? 45 : 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.42;
      list.push([
        Math.cos(angle) * radius,
        -0.65 + Math.random() * 1.05,
        Math.sin(angle) * radius
      ]);
    }
    return list;
  }, [isHero]);

  // Gentle idle animation loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (autoRotate && jarGroupRef.current) {
      jarGroupRef.current.rotation.y = t * 0.25;
      // Gentle floating bob
      jarGroupRef.current.position.y = Math.sin(t * 1.2) * 0.04;
    }

    if (floatingGroupRef.current) {
      floatingGroupRef.current.rotation.y = -t * 0.18;
    }

    if (oilInnerRef.current) {
      oilInnerRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group scale={scale}>
      {/* Main Glass Jar and Platform Assembly */}
      <group ref={jarGroupRef} position={[0, 0, 0]}>
        {/* Outer Clear Glass Jar Body */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.4, 32, 1, false]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Jar Shoulder curve */}
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Jar Neck */}
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.16, 32]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Glass Rim */}
        <mesh position={[0, 1.01, 0]}>
          <torusGeometry args={[0.42, 0.024, 16, 32]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Heavy Thick Glass Base */}
        <mesh position={[0, -0.73, 0]}>
          <cylinderGeometry args={[0.54, 0.54, 0.08, 32]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Traditional Polished Brass Lid */}
        <group position={[0, 1.05, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.12, 32]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.43, 0.43, 0.04, 32]} />
            <meshStandardMaterial {...Materials.brass} roughness={0.2} />
          </mesh>
          {/* Top Brass Knob / Handle */}
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
        </group>

        {/* Branded Paper Label Band on Jar */}
        {labelTex && (
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.553, 0.553, 0.65, 32, 1, true, 0, Math.PI * 1.3]} />
            <meshStandardMaterial
              map={labelTex}
              roughness={0.6}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Inner Contents: Spiced Oil Fluid Volume */}
        <group ref={oilInnerRef}>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.51, 0.51, 1.22, 32]} />
            <meshPhysicalMaterial
              {...Materials.pickleOil}
              color={oilColor}
            />
          </mesh>

          {/* Diced Pickled Mango / Meat Chunks */}
          {chunks.map((item, idx) => (
            <mesh
              key={idx}
              position={item.pos}
              rotation={item.rot}
              scale={item.scale}
              castShadow
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                {...Materials.mangoChunk}
                color={pickleType === 'gongura' ? '#424c1e' : Materials.mangoChunk.color}
              />
            </mesh>
          ))}

          {/* Tiny Mustard / Fenugreek Seeds */}
          {mustardSeeds.map((pos, idx) => (
            <mesh key={`seed-${idx}`} position={pos}>
              <sphereGeometry args={[0.016, 6, 6]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#1b1208' : '#e6ab22'} roughness={0.5} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Traditional Wooden Cutting Board / Pedestal */}
      <group position={[0, -0.84, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.95, 0.98, 0.12, 32]} />
          <meshStandardMaterial
            {...Materials.wood}
            map={woodTex}
          />
        </mesh>
        {/* Brass Ring inlay around wooden base */}
        <mesh position={[0, 0.061, 0]}>
          <ringGeometry args={[0.88, 0.92, 32]} />
          <meshStandardMaterial {...Materials.brass} />
        </mesh>
      </group>

      {/* Surrounding Floating Ingredients (for Hero & Special Display) */}
      {floatingIngredients && (
        <group ref={floatingGroupRef} position={[0, 0, 0]}>
          {/* Floating Fresh Mango Wedge */}
          <MangoSlice
            position={[1.15, 0.45, 0.3]}
            rotation={[0.4, 0.8, -0.3]}
            scale={0.9}
          />

          {/* Floating Dried Guntur Red Chilli */}
          <WholeChilli
            position={[-1.1, 0.35, -0.2]}
            rotation={[0.6, -0.4, 1.2]}
            scale={1.1}
          />

          {/* Secondary Dried Chilli floating lower */}
          <WholeChilli
            position={[0.85, -0.3, 0.7]}
            rotation={[-0.5, 1.1, -0.4]}
            scale={0.85}
          />

          {/* Floating Fresh Curry Leaves */}
          <CurryLeaf
            position={[-0.95, -0.25, 0.6]}
            rotation={[0.8, -0.6, 0.4]}
            scale={1.2}
          />

          <CurryLeaf
            position={[0.6, 0.85, -0.5]}
            rotation={[-0.4, 0.9, -0.7]}
            scale={0.95}
          />

          <CurryLeaf
            position={[-0.4, 0.95, 0.5]}
            rotation={[0.5, 0.3, 0.8]}
            scale={1.05}
          />
        </group>
      )}
    </group>
  );
}
