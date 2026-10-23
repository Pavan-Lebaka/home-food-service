import React, { useState } from 'react';
import { Sparkles, Utensils, Heart, Award, Box, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SceneContainer from './3d/SceneContainer';
import WarmKitchenEnvironment from './3d/WarmKitchenEnvironment';
import PickleJarModel from './3d/PickleJarModel';
import { OrbitControls, Float } from '@react-three/drei';

export default function StorySection() {
  const { t } = useLanguage();
  const [show3DStory, setShow3DStory] = useState(false);

  return (
    <section id="story" className="section-story reveal-on-scroll">
      <div className="container">
        <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge-traditional" style={{ marginBottom: '0.75rem' }}>
            <Heart size={14} color="var(--color-terracotta)" />
            <span>{t('ourRootsHeritage')}</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: '1rem' }}>
            {t('storyMainHeading')}
          </h2>

          <blockquote style={{
            fontSize: '1.2rem',
            color: 'var(--color-dark-brown-soft)',
            fontStyle: 'italic',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            {t('storyQuote')}
          </blockquote>

          <div className="kolam-divider">
            <span className="kolam-symbol">──────── ◇ ────────</span>
          </div>
        </div>

        <div className="story-grid">
          {/* Story Visual with 3D Heritage Artifact Viewer */}
          <div className="story-image-wrap reveal-on-scroll" style={{ position: 'relative', overflow: 'hidden', minHeight: '380px' }}>
            {/* View Mode Toggle */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              display: 'flex',
              gap: '6px',
              background: 'rgba(25, 11, 5, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '4px',
              borderRadius: '20px',
              border: '1px solid rgba(217, 154, 23, 0.35)'
            }}>
              <button
                type="button"
                onClick={() => setShow3DStory(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: show3DStory ? '#D99A17' : 'transparent',
                  color: show3DStory ? '#1a0b04' : '#f5e1c4'
                }}
              >
                <Box size={13} />
                <span>3D Jaadi</span>
              </button>
              <button
                type="button"
                onClick={() => setShow3DStory(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: !show3DStory ? '#D99A17' : 'transparent',
                  color: !show3DStory ? '#1a0b04' : '#f5e1c4'
                }}
              >
                <ImageIcon size={13} />
                <span>Photo</span>
              </button>
            </div>

            {show3DStory ? (
              <div style={{ height: '380px', width: '100%', background: 'radial-gradient(circle at center, #2e1208 0%, #150602 100%)' }}>
                <SceneContainer
                  camera={{ position: [0, 0.5, 3.2], fov: 42 }}
                  loadingLabel="Preparing 3D Heritage Jaadi..."
                >
                  <WarmKitchenEnvironment
                    showShadows={true}
                    shadowOpacity={0.65}
                    shadowScale={3.5}
                    groundY={-0.88}
                  />
                  <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <PickleJarModel
                      pickleType="avakaya"
                      isHero={false}
                      floatingIngredients={false}
                      autoRotate={true}
                      scale={1.15}
                    />
                  </Float>
                  <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.88}
                    rotateSpeed={0.7}
                  />
                </SceneContainer>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(20, 8, 3, 0.8)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(217, 154, 23, 0.35)',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  color: '#f8d7aa',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}>
                  360° Heritage Ceramic Jaadi
                </div>
              </div>
            ) : (
              <>
                <img
                  src="https://res.cloudinary.com/z2iepqai/image/upload/v1792220657/bramarambika_foods/story.jpg"
                  alt="Traditional Telugu village home kitchen with grandmother cooking with brass cookware and stone grinding"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220644/bramarambika_foods/hero.jpg';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(58, 36, 23, 0.85))',
                  padding: '1.5rem',
                  color: '#ffffff'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-turmeric-light)' }}>
                    {t('generationalCraft')}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.95 }}>
                    {t('generationalCraftDesc')}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Story Text & Four Heritage Pillars */}
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-dark-brown)' }}>
              {t('noFactoriesHeading')}
            </h3>

            <p style={{ color: 'var(--color-dark-brown-soft)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {t('noFactoriesDesc')}
            </p>
            <p>
              {t('whoWeAre')}
            </p>

            <div className="story-pill-row">
              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Utensils size={18} color="var(--color-terracotta)" />
                  <h4>{t('brassCookwareTitle')}</h4>
                </div>
                <p>{t('brassCookwareDesc')}</p>
              </div>

              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} color="var(--color-turmeric)" />
                  <h4>{t('stoneGroundSpicesTitle')}</h4>
                </div>
                <p>{t('stoneGroundSpicesDesc')}</p>
              </div>

              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Award size={18} color="var(--color-leaf-green)" />
                  <h4>{t('pureGheeOilsTitle')}</h4>
                </div>
                <p>{t('pureGheeOilsDesc')}</p>
              </div>

              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Heart size={18} color="var(--color-terracotta)" />
                  <h4>{t('madeInBatchesTitle')}</h4>
                </div>
                <p>{t('madeInBatchesDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
