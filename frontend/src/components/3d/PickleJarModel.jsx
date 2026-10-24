import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Materials } from './FoodMaterials';

function makeLabel() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eee2c8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8e3d2e';
  ctx.lineWidth = 5;
  ctx.strokeRect(9, 9, 494, 174);
  ctx.fillStyle = '#8e3d2e';
  ctx.font = '500 31px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('BRAMARAMBIKA', 256, 81);
  ctx.fillStyle = '#554839';
  ctx.font = '500 18px Arial, sans-serif';
  ctx.fillText('HOME FOODS', 256, 119);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A restrained glass jaadi study, built from lathed profiles rather than stacked cylinders. */
export default function PickleJarModel({
  pickleType = 'avakaya',
  autoRotate = true,
  scale = 1
}) {
  const jarRef = useRef();
  const { jarProfile, labelMap, pieces, seeds } = useMemo(() => {
    const profile = [
      [0.00, -0.76], [0.40, -0.76], [0.47, -0.70], [0.49, -0.61],
      [0.49, 0.25], [0.47, 0.34], [0.41, 0.41], [0.34, 0.50],
      [0.32, 0.59], [0.32, 0.68], [0.34, 0.70], [0.34, 0.75],
      [0.30, 0.75], [0.29, 0.66], [0.29, 0.56], [0.37, 0.43],
      [0.43, 0.31], [0.43, -0.59], [0.39, -0.66], [0.00, -0.66]
    ].map(([radius, height]) => new THREE.Vector2(radius, height));
    const geometry = new THREE.LatheGeometry(profile, 72);
    const positions = [];
    for (let i = 0; i < 20; i += 1) {
      const angle = i * 2.399;
      const radius = 0.10 + (i % 5) * 0.055;
      positions.push({
        position: [Math.cos(angle) * radius, -0.50 + (i % 6) * 0.15, Math.sin(angle) * radius],
        rotation: [0.18 * (i % 3), angle, 0.13 * (i % 4)],
        scale: [0.095 + (i % 3) * 0.018, 0.08 + (i % 2) * 0.024, 0.09 + (i % 4) * 0.012]
      });
    }
    const seedPositions = [];
    for (let i = 0; i < 18; i += 1) {
      const angle = i * 2.399;
      const radius = 0.08 + (i % 6) * 0.055;
      seedPositions.push([
        Math.cos(angle) * radius,
        -0.51 + ((i * 7) % 11) * 0.09,
        Math.sin(angle) * radius
      ]);
    }
    return { jarProfile: geometry, labelMap: makeLabel(), pieces: positions, seeds: seedPositions };
  }, []);

  useFrame((state) => {
    if (!jarRef.current) return;
    if (autoRotate) jarRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.22) * 0.12;
  });

  const oilColor = pickleType === 'gongura' ? '#522c18'
    : (pickleType === 'chicken' || pickleType === 'prawn') ? '#702b17'
      : '#96330f';
  const pieceColor = pickleType === 'gongura' ? '#50451e'
    : (pickleType === 'chicken' || pickleType === 'prawn') ? '#7a321c'
      : '#a64a18';

  return (
    <group ref={jarRef} scale={scale}>
      {/* A single continuous vessel profile keeps the silhouette legible and calm. */}
      <mesh geometry={jarProfile} castShadow receiveShadow renderOrder={3}>
        <meshStandardMaterial color="#fff4df" roughness={0.14} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Oil and spice pieces remain inside the glass profile. */}
      <mesh position={[0, -0.14, 0]} renderOrder={1}>
        <cylinderGeometry args={[0.415, 0.425, 0.8, 56]} />
        <meshBasicMaterial color={oilColor} toneMapped={false} transparent opacity={0.72} depthWrite={false} />
      </mesh>
      {pieces.map((piece, index) => (
        <mesh key={`piece-${index}`} position={piece.position} rotation={piece.rotation} scale={piece.scale} castShadow renderOrder={2}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={pieceColor} roughness={0.54} />
        </mesh>
      ))}
      {seeds.map((position, index) => (
        <mesh key={`seed-${index}`} position={position} scale={[1, 0.55, 0.7]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshStandardMaterial color={index % 3 === 0 ? '#d0a441' : '#261b12'} roughness={0.78} />
        </mesh>
      ))}

      {/* Quiet paper band; the copy is only the verified brand name. */}
      {labelMap && (
        <mesh position={[0, -0.08, 0.487]} renderOrder={4}>
          <planeGeometry args={[0.72, 0.27]} />
          <meshStandardMaterial map={labelMap} roughness={0.82} />
        </mesh>
      )}

      {/* Simple brass closure and foot, with no display plinth. */}
      <mesh position={[0, 0.765, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.075, 56]} />
        <meshStandardMaterial {...Materials.brass} roughness={0.48} metalness={0.68} />
      </mesh>
    </group>
  );
}
