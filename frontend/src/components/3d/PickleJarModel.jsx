import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Materials, getFoodTextures } from './FoodMaterials';

/**
 * Organic Curry Leaf Geometry with realistic natural curvature
 */
function CurryLeaf({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const leafCurve = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.42);
    shape.bezierCurveTo(0.18, -0.22, 0.22, 0.12, 0, 0.42);
    shape.bezierCurveTo(-0.22, 0.12, -0.18, -0.22, 0, -0.42);
    return shape;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <shapeGeometry args={[leafCurve]} />
        <meshPhysicalMaterial {...Materials.curryLeaf} side={THREE.DoubleSide} />
      </mesh>
      {/* Central Leaf Spine */}
      <mesh position={[0, 0, 0.006]}>
        <cylinderGeometry args={[0.006, 0.009, 0.82, 6]} />
        <meshStandardMaterial color="#226632" roughness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Procedural Guntur Dried Red Chilli with smooth curved body & calyx stem
 */
function WholeChilli({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.42, 0),
      new THREE.Vector3(0.08, -0.16, 0.04),
      new THREE.Vector3(-0.05, 0.16, -0.02),
      new THREE.Vector3(0.02, 0.42, 0.01)
    ]);
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow>
        <tubeGeometry args={[curve, 24, 0.048, 10, false]} />
        <meshPhysicalMaterial {...Materials.redChilli} />
      </mesh>
      {/* Calyx & Stem */}
      <group position={[0, -0.42, 0]}>
        <mesh>
          <coneGeometry args={[0.06, 0.07, 8]} />
          <meshStandardMaterial color="#3f5422" roughness={0.5} />
        </mesh>
        <mesh position={[0.02, -0.06, 0]} rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.012, 0.012, 0.09, 6]} />
          <meshStandardMaterial color="#324519" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Organic Mango Slice Wedge (Green Rind + Golden Flesh)
 */
function MangoSlice({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Golden Juicy Flesh */}
      <mesh castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.13, 20, 1, false, 0, Math.PI * 0.72]} />
        <meshStandardMaterial {...Materials.mangoFlesh} />
      </mesh>
      {/* Outer Green Skin Arch */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.346, 0.346, 0.132, 20, 1, true, 0, Math.PI * 0.72]} />
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
  pickleType = 'avakaya',
  floatingIngredients = true,
  autoRotate = true,
  scale = 1
}) {
  const jarGroupRef = useRef();
  const floatingGroupRef = useRef();
  const oilInnerRef = useRef();
  const { woodTex, labelTex } = getFoodTextures();

  // Spiced oil color based on variety
  const oilColor = useMemo(() => {
    switch (pickleType) {
      case 'gongura':
        return '#384414'; // Dark Gongura sorrel green-red
      case 'chicken':
      case 'prawn':
        return '#9e1800'; // Rich non-veg masala oil
      case 'tomato':
        return '#b82a03'; // Vibrant country tomato red
      default:
        return '#c22802'; // Monarch Avakaya Guntur red
    }
  }, [pickleType]);

  // Organic rounded mango/meat chunks inside jar
  const chunks = useMemo(() => {
    const list = [];
    const count = isHero ? 22 : 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4);
      const radius = 0.12 + Math.random() * 0.26;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -0.52 + Math.random() * 0.88;
      const sz = 0.11 + Math.random() * 0.07;
      list.push({
        pos: [x, y, z],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: [sz * 1.1, sz * 0.85, sz * 1.05]
      });
    }
    return list;
  }, [isHero]);

  // Mustard & Fenugreek seeds suspended in oil
  const mustardSeeds = useMemo(() => {
    const list = [];
    const count = isHero ? 48 : 24;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.44;
      list.push([
        Math.cos(angle) * radius,
        -0.62 + Math.random() * 1.05,
        Math.sin(angle) * radius
      ]);
    }
    return list;
  }, [isHero]);

  // Animation frame loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (autoRotate && jarGroupRef.current) {
      jarGroupRef.current.rotation.y = t * 0.22;
      jarGroupRef.current.position.y = Math.sin(t * 1.2) * 0.035;
    }

    if (floatingGroupRef.current) {
      floatingGroupRef.current.rotation.y = -t * 0.15;
    }

    if (oilInnerRef.current) {
      oilInnerRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
    }
  });

  return (
    <group scale={scale}>
      {/* Main Glass Jar and Platform Assembly */}
      <group ref={jarGroupRef} position={[0, 0, 0]}>
        {/* Outer Clear Glass Jar Body with Refraction */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.36, 36, 1, false]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Jar Shoulder curve */}
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.55, 36, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Jar Neck */}
        <mesh position={[0, 0.90, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.16, 36]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Glass Rim */}
        <mesh position={[0, 0.99, 0]}>
          <torusGeometry args={[0.42, 0.025, 16, 36]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Heavy Thick Glass Base with slight bevel */}
        <mesh position={[0, -0.71, 0]}>
          <cylinderGeometry args={[0.54, 0.52, 0.08, 36]} />
          <meshPhysicalMaterial {...Materials.glass} />
        </mesh>

        {/* Traditional Polished Brass Lid with Knurled Rim & Knob */}
        <group position={[0, 1.04, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.46, 0.46, 0.11, 36]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.44, 0.44, 0.03, 36]} />
            <meshStandardMaterial {...Materials.brass} roughness={0.18} />
          </mesh>
          {/* Top Brass Knob / Handle */}
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.075, 20, 20]} />
            <meshStandardMaterial {...Materials.brass} />
          </mesh>
        </group>

        {/* Branded Telugu Paper Label Band */}
        {labelTex && (
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.554, 0.554, 0.65, 36, 1, true, 0, Math.PI * 1.3]} />
            <meshStandardMaterial
              map={labelTex}
              roughness={0.5}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Inner Contents: Translucent Spiced Oil Fluid */}
        <group ref={oilInnerRef}>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.51, 0.51, 1.20, 32]} />
            <meshPhysicalMaterial
              {...Materials.pickleOil}
              color={oilColor}
            />
          </mesh>

          {/* Organic Rounded Pickled Mango / Meat Chunks */}
          {chunks.map((item, idx) => (
            <mesh
              key={idx}
              position={item.pos}
              rotation={item.rot}
              scale={item.scale}
              castShadow
            >
              {/* Dodecahedron provides organic, rounded, realistic chunk shape */}
              <dodecahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                {...Materials.mangoChunk}
                color={pickleType === 'gongura' ? '#3d481a' : (pickleType === 'chicken' ? '#8a2007' : Materials.mangoChunk.color)}
              />
            </mesh>
          ))}

          {/* Golden & Black Mustard / Fenugreek Seeds */}
          {mustardSeeds.map((pos, idx) => (
            <mesh key={`seed-${idx}`} position={pos}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#1a1005' : '#f0b728'}
                roughness={0.4}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Traditional Wooden Cutting Board / Pedestal */}
      <group position={[0, -0.84, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.96, 1.0, 0.14, 36]} />
          <meshStandardMaterial
            {...Materials.wood}
            map={woodTex}
          />
        </mesh>
        {/* Brass Inlay Ring around wooden pedestal */}
        <mesh position={[0, 0.071, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.88, 0.93, 36]} />
          <meshStandardMaterial {...Materials.brass} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Surrounding Floating Ingredients (for Hero & Special Display) */}
      {floatingIngredients && (
        <group ref={floatingGroupRef} position={[0, 0, 0]}>
          {/* Floating Fresh Mango Wedge */}
          <MangoSlice
            position={[1.2, 0.42, 0.3]}
            rotation={[0.4, 0.8, -0.3]}
            scale={0.95}
          />

          {/* Floating Dried Guntur Red Chilli */}
          <WholeChilli
            position={[-1.15, 0.32, -0.2]}
            rotation={[0.6, -0.4, 1.2]}
            scale={1.1}
          />

          {/* Secondary Dried Chilli floating lower */}
          <WholeChilli
            position={[0.9, -0.32, 0.7]}
            rotation={[-0.5, 1.1, -0.4]}
            scale={0.85}
          />

          {/* Floating Fresh Curry Leaves */}
          <CurryLeaf
            position={[-0.98, -0.22, 0.6]}
            rotation={[0.8, -0.6, 0.4]}
            scale={1.25}
          />

          <CurryLeaf
            position={[0.65, 0.88, -0.5]}
            rotation={[-0.4, 0.9, -0.7]}
            scale={1.0}
          />

          <CurryLeaf
            position={[-0.42, 0.96, 0.5]}
            rotation={[0.5, 0.3, 0.8]}
            scale={1.1}
          />
        </group>
      )}
    </group>
  );
}
