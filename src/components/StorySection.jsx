import React from 'react';
import { Sparkles, Utensils, Heart, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StorySection() {
  const { t } = useLanguage();

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
          {/* Story Visual */}
          <div className="story-image-wrap reveal-on-scroll">
            <img
              src="/images/story.jpg"
              alt="Traditional Telugu village home kitchen with grandmother cooking with brass cookware and stone grinding"
              loading="lazy"
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
