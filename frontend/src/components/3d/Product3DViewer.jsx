import React, { useRef, useState, useEffect } from 'react';
import { OrbitControls, Float } from '@react-three/drei';
import SceneContainer from './SceneContainer';
import WarmKitchenEnvironment from './WarmKitchenEnvironment';
import PickleJarModel from './PickleJarModel';
import SnackPlateModel from './SnackPlateModel';
import SpiceBowlModel from './SpiceBowlModel';

/**
 * Universal Reusable 3D Product Viewer
 * Renders appropriate authentic 3D model according to product category and item ID.
 */
export default function Product3DViewer({
  product,
  interactive = true,
  autoRotate = true,
  scale = 1,
  className = '',
  style = {}
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!product) return null;

  const isPickle = product.category === 'veg-pickles' || product.category === 'non-veg-pickles';
  const isSnack = product.category === 'pindi-vantalu' || (!isPickle && !product.id?.includes('podi'));
  const isPodi = product.id?.includes('podi') || product.name?.toLowerCase().includes('podi') || product.category === 'podis';

  // Specific pickle variety key
  let pickleType = 'avakaya';
  if (product.id?.includes('chicken')) pickleType = 'chicken';
  else if (product.id?.includes('prawn')) pickleType = 'prawn';
  else if (product.id?.includes('gongura')) pickleType = 'gongura';
  else if (product.id?.includes('tomato')) pickleType = 'tomato';
  else if (product.id?.includes('allam')) pickleType = 'allam';

  return (
    <div
      className={`product-3d-viewer-box ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '280px',
        ...style
      }}
    >
      <SceneContainer
        camera={{
          position: [0, isSnack ? 1.6 : 0.8, isSnack ? 2.8 : 3.2],
          fov: 42
        }}
        fallbackImage={product.image}
        loadingLabel={`Preparing 3D ${product.name}...`}
        interactive={interactive}
      >
        <WarmKitchenEnvironment
          showShadows={true}
          shadowOpacity={0.6}
          shadowScale={isSnack ? 3.8 : 3.2}
          groundY={isSnack ? -0.1 : -0.85}
        />

        <Float
          speed={autoRotate ? 1.4 : 0}
          rotationIntensity={0.2}
          floatIntensity={0.3}
          floatingRange={[-0.03, 0.03]}
        >
          {isPickle && (
            <PickleJarModel
              pickleType={pickleType}
              isHero={false}
              floatingIngredients={false}
              autoRotate={autoRotate}
              scale={scale * 1.15}
            />
          )}

          {isSnack && (
            <SnackPlateModel
              snackId={product.id}
              plateType="brass"
              autoRotate={autoRotate}
              scale={scale * 1.25}
            />
          )}

          {isPodi && (
            <SpiceBowlModel
              podiType={product.id}
              autoRotate={autoRotate}
              scale={scale * 1.3}
            />
          )}
        </Float>

        {interactive && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2.4}
            maxDistance={4.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.9}
            rotateSpeed={0.7}
            dampingFactor={0.06}
          />
        )}
      </SceneContainer>

      {/* Floating 3D Badge Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(20, 8, 3, 0.8)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(217, 154, 23, 0.35)',
          borderRadius: '16px',
          padding: '4px 10px',
          color: '#f8d7aa',
          fontSize: '0.7rem',
          fontWeight: 600,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          zIndex: 4
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e67e22' }} />
        <span>3D Model • Touch & Drag to Spin</span>
      </div>
    </div>
  );
}
