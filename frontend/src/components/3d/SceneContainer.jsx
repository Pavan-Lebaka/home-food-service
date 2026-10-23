import React, { Component, Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, AlertCircle } from 'lucide-react';

/**
 * Checks if the current client browser supports WebGL
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Custom Error Boundary for 3D Scenes
 */
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[3D Scene] WebGL render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="scene-fallback-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '260px',
          background: 'radial-gradient(circle at center, #2e1208 0%, #150602 100%)',
          color: '#f8d7aa',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid rgba(217, 154, 23, 0.2)'
        }}>
          {this.props.fallbackImage ? (
            <img
              src={this.props.fallbackImage}
              alt="Traditional Food View"
              style={{ maxWidth: '85%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px', marginBottom: '0.75rem' }}
            />
          ) : (
            <AlertCircle size={32} color="#D99A17" style={{ marginBottom: '0.5rem' }} />
          )}
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Interactive 3D Preview</p>
          <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
            Viewing authentic handmade traditional recipe
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Elegant Traditional Kitchen 3D Loading Placeholder
 */
export function SceneLoader({ label = 'Setting up 3D Scene...' }) {
  return (
    <div className="scene-loading-overlay" style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(46, 18, 8, 0.7) 0%, rgba(18, 7, 3, 0.95) 100%)',
      backdropFilter: 'blur(4px)',
      color: '#f8d7aa',
      zIndex: 10,
      borderRadius: 'inherit',
      pointerEvents: 'none'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '3px solid rgba(217, 154, 23, 0.2)',
        borderTopColor: '#D99A17',
        animation: 'spin 1.2s linear infinite',
        marginBottom: '12px'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
        <Sparkles size={14} color="#D99A17" />
        <span>{label}</span>
      </div>
    </div>
  );
}

/**
 * Reusable WebGL Scene Container with:
 * - WebGL availability detection
 * - prefers-reduced-motion support
 * - Error boundary & graceful image fallback
 * - Suspense loading indicator
 * - Proper aspect ratio & non-blocking interaction
 */
export default function SceneContainer({
  children,
  camera = { position: [0, 1.2, 3.8], fov: 42 },
  className = '',
  style = {},
  fallbackImage,
  loadingLabel = 'Cooking 3D Experience...',
  shadows = true,
  interactive = true,
  ...canvasProps
}) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (!hasWebGL) {
    return (
      <div className={`scene-fallback-wrapper ${className}`} style={{ width: '100%', height: '100%', minHeight: '260px', ...style }}>
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt="Traditional Delicacy"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f8d7aa' }}>
            WebGL not available on this device
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`scene-canvas-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '260px',
        overflow: 'hidden',
        pointerEvents: interactive ? 'auto' : 'none',
        ...style
      }}
    >
      <SceneErrorBoundary fallbackImage={fallbackImage}>
        <Suspense fallback={<SceneLoader label={loadingLabel} />}>
          <Canvas
            shadows={shadows}
            camera={camera}
            dpr={[1, 1.75]} // Crisp on Retina without draining mobile GPU
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance'
            }}
            {...canvasProps}
          >
            {children}
          </Canvas>
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
