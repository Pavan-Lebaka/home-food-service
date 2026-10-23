import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Materials, getFoodTextures } from './FoodMaterials';

/**
 * Procedural Snack Item Meshes
 */

// Ariselu: Puffed golden disc with sesame seed coating
function AriseluMesh({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const { sesameTex } = getFoodTextures();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
        <meshStandardMaterial
          {...Materials.jaggerySweet}
          map={sesameTex}
          bumpScale={0.03}
        />
      </mesh>
      {/* Slightly rounded puffed center */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
        <meshStandardMaterial {...Materials.jaggerySweet} map={sesameTex} />
      </mesh>
    </group>
  );
}

// Pappu Chekkalu: Crispy rice cracker with visible chana dal lentils & curry leaf bits
function PappuChekkaluMesh({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const dalPoints = useMemo(() => [
    [0.15, 0.02, 0.1],
    [-0.12, 0.02, 0.16],
    [0.08, 0.02, -0.18],
    [-0.16, 0.02, -0.1],
    [0.02, 0.02, 0.05]
  ], []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 32]} />
        <meshStandardMaterial {...Materials.goldenSavoury} />
      </mesh>
      {/* Embedded Yellow Chana Dal pieces */}
      {dalPoints.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, i * 0.8, 0]}>
          <boxGeometry args={[0.07, 0.025, 0.05]} />
          <meshStandardMaterial color="#ecc546" roughness={0.4} />
        </mesh>
      ))}
      {/* Tiny embedded green curry leaf bits */}
      <mesh position={[0.1, 0.021, -0.08]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.04, 0.005, 0.06]} />
        <meshStandardMaterial {...Materials.curryLeaf} />
      </mesh>
      <mesh position={[-0.08, 0.021, 0.05]} rotation={[0, -0.6, 0]}>
        <boxGeometry args={[0.05, 0.005, 0.03]} />
        <meshStandardMaterial {...Materials.curryLeaf} />
      </mesh>
    </group>
  );
}

// Karapusa / Murukku: Crispy extruded savoury ribbons
function KarapusaMesh({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const spiralCurve = useMemo(() => {
    const points = [];
    for (let i = 0; i < 40; i++) {
      const angle = i * 0.45;
      const r = 0.06 + (i * 0.008);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.sin(i * 0.8) * 0.02;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow>
        <tubeGeometry args={[spiralCurve, 45, 0.028, 6, false]} />
        <meshStandardMaterial {...Materials.goldenSavoury} roughness={0.5} />
      </mesh>
    </group>
  );
}

// Sunnundalu / Ravva Laddu: Traditional spherical sweet laddu
function LadduMesh({ position = [0, 0, 0], isRavva = false, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          {...(isRavva ? Materials.ravvaLaddu : Materials.sunnundaluLaddu)}
        />
      </mesh>
      {/* Roasted cashew garnish on top */}
      <mesh position={[0.02, 0.24, 0]} rotation={[0.4, 0.2, 0.3]}>
        <boxGeometry args={[0.1, 0.04, 0.06]} />
        <meshStandardMaterial color="#f7ecd5" roughness={0.3} />
      </mesh>
    </group>
  );
}

// Kajjikayalu: Crescent hand-pinched fried dumpling
function KajjikayaluMesh({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.09, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...Materials.goldenSavoury} />
      </mesh>
      {/* Fluted crimped seal edge */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.34, 0.02, 8, 24, Math.PI]} />
        <meshStandardMaterial {...Materials.goldenSavoury} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Mysore Pak: Melt-in-mouth ghee gram flour fudge block
function MysorePakMesh({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.18, 0.3]} />
        <meshStandardMaterial {...Materials.mysorePak} />
      </mesh>
      {/* Darker caramelized inner center stripe */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.422, 0.06, 0.302]} />
        <meshStandardMaterial color="#c27d1b" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Karam Boondhi: Crisp savoury pearl cluster
function BoondhiCluster({ position = [0, 0, 0], scale = 1 }) {
  const pearls = useMemo(() => {
    const list = [];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.3;
      list.push([
        Math.cos(angle) * r,
        Math.random() * 0.1,
        Math.sin(angle) * r
      ]);
    }
    return list;
  }, []);

  return (
    <group position={position} scale={scale}>
      {pearls.map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial {...Materials.goldenSavoury} color={idx % 4 === 0 ? '#b83b16' : '#d68c28'} />
        </mesh>
      ))}
      {/* Roasted Peanut in boondhi */}
      <mesh position={[0.05, 0.06, 0.04]} rotation={[0.4, 0.8, 0.2]}>
        <capsuleGeometry args={[0.04, 0.06, 8, 8]} />
        <meshStandardMaterial color="#8a3c1b" roughness={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Traditional Brass Thali or Banana Leaf Snack Platter
 */
export default function SnackPlateModel({
  snackId = 'arisalu',
  plateType = 'brass', // 'brass' or 'banana-leaf'
  autoRotate = true,
  scale = 1
}) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group scale={scale}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Serving Surface: Traditional Brass Thali or Banana Leaf */}
        {plateType === 'brass' ? (
          <group position={[0, -0.06, 0]}>
            {/* Hammered Brass Plate Base */}
            <mesh receiveShadow castShadow>
              <cylinderGeometry args={[0.9, 0.86, 0.04, 40]} />
              <meshStandardMaterial {...Materials.brass} />
            </mesh>
            {/* Raised Rolled Brass Rim */}
            <mesh position={[0, 0.035, 0]}>
              <torusGeometry args={[0.9, 0.035, 16, 40]} />
              <meshStandardMaterial {...Materials.brass} />
            </mesh>
          </group>
        ) : (
          <group position={[0, -0.04, 0]}>
            {/* Fresh Green Banana Leaf Platter */}
            <mesh receiveShadow castShadow>
              <cylinderGeometry args={[0.92, 0.92, 0.02, 40]} />
              <meshStandardMaterial {...Materials.bananaLeaf} />
            </mesh>
            {/* Leaf Midrib / Spine line */}
            <mesh position={[0, 0.012, 0]}>
              <boxGeometry args={[0.02, 0.005, 1.8]} />
              <meshStandardMaterial color="#21521a" roughness={0.4} />
            </mesh>
          </group>
        )}

        {/* Dynamic Snack Composition based on product selection */}
        {snackId === 'arisalu' && (
          <group position={[0, 0.04, 0]}>
            <AriseluMesh position={[0, 0, 0]} />
            <AriseluMesh position={[-0.32, 0.03, -0.2]} rotation={[0.1, 0.5, 0.05]} scale={0.9} />
            <AriseluMesh position={[0.28, 0.03, 0.22]} rotation={[-0.05, -0.4, 0.08]} scale={0.92} />
          </group>
        )}

        {snackId === 'pappu-chekkalu' && (
          <group position={[0, 0.02, 0]}>
            <PappuChekkaluMesh position={[0, 0, 0]} />
            <PappuChekkaluMesh position={[-0.34, 0.02, -0.18]} rotation={[0.08, 0.7, 0.04]} scale={0.95} />
            <PappuChekkaluMesh position={[0.3, 0.02, 0.2]} rotation={[-0.04, -0.6, 0.06]} scale={0.92} />
          </group>
        )}

        {(snackId === 'karapusa' || snackId === 'murukku') && (
          <group position={[0, 0.02, 0]}>
            <KarapusaMesh position={[0, 0, 0]} scale={1.2} />
            <KarapusaMesh position={[-0.25, 0.03, 0.2]} rotation={[0, 1.2, 0]} scale={0.9} />
            <KarapusaMesh position={[0.22, 0.03, -0.22]} rotation={[0, -1.5, 0]} scale={0.95} />
          </group>
        )}

        {(snackId === 'sunnundalu' || snackId === 'ravva-laddu') && (
          <group position={[0, 0.16, 0]}>
            <LadduMesh position={[-0.26, 0, -0.16]} isRavva={snackId === 'ravva-laddu'} />
            <LadduMesh position={[0.26, 0, -0.16]} isRavva={snackId === 'ravva-laddu'} />
            <LadduMesh position={[0, 0, 0.28]} isRavva={snackId === 'ravva-laddu'} />
            {/* Pyramid peak laddu */}
            <LadduMesh position={[0, 0.32, -0.02]} isRavva={snackId === 'ravva-laddu'} scale={0.95} />
          </group>
        )}

        {snackId === 'kajjikayalu' && (
          <group position={[0, 0.05, 0]}>
            <KajjikayaluMesh position={[-0.15, 0, 0]} rotation={[0, 0.4, 0]} />
            <KajjikayaluMesh position={[0.22, 0.04, 0.1]} rotation={[0, -0.6, 0.1]} scale={0.95} />
          </group>
        )}

        {snackId === 'mysore-pak' && (
          <group position={[0, 0.09, 0]}>
            <MysorePakMesh position={[-0.2, 0, -0.1]} rotation={[0, 0.3, 0]} />
            <MysorePakMesh position={[0.22, 0, 0.15]} rotation={[0, -0.4, 0]} />
            <MysorePakMesh position={[0, 0.16, 0.02]} rotation={[0, 0.8, 0]} scale={0.92} />
          </group>
        )}

        {snackId === 'karam-boondhi' && (
          <group position={[0, 0.02, 0]}>
            <BoondhiCluster position={[0, 0, 0]} scale={1.2} />
          </group>
        )}

        {snackId === 'bellam-gavvalu' && (
          <group position={[0, 0.03, 0]}>
            {/* Clusters of caramelized sweet shells */}
            {[...Array(9)].map((_, i) => {
              const ang = (i / 9) * Math.PI * 2;
              const r = 0.12 + (i % 3) * 0.12;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(ang) * r, 0.03 + (i % 2) * 0.02, Math.sin(ang) * r]}
                  rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.4]}
                  castShadow
                >
                  <torusGeometry args={[0.08, 0.04, 8, 16, Math.PI * 1.3]} />
                  <meshStandardMaterial {...Materials.jaggerySweet} />
                </mesh>
              );
            })}
          </group>
        )}
      </group>
    </group>
  );
}
