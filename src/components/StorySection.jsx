import React from 'react';
import { Sparkles, Utensils, Heart, Award } from 'lucide-react';

export default function StorySection() {
  return (
    <section id="story" className="section-story">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge-traditional" style={{ marginBottom: '0.75rem' }}>
            <Heart size={14} color="var(--color-terracotta)" />
            <span>Our Roots & Heritage</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: '1rem' }}>
            Made the Traditional Way
          </h2>

          <blockquote style={{
            fontSize: '1.2rem',
            color: 'var(--color-dark-brown-soft)',
            fontStyle: 'italic',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            “From our home kitchen to your dining table, Bramarambika Home Foods brings you traditional Telugu flavours prepared with care and authentic recipes.”
          </blockquote>

          <div className="kolam-divider">
            <span className="kolam-symbol">──────── ◇ ────────</span>
          </div>
        </div>

        <div className="story-grid">
          {/* Story Visual */}
          <div className="story-image-wrap">
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
                Generational Kitchen Craft
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.95 }}>
                Preserving authentic taste with slow cooking in brass vessels & stone grinding.
              </div>
            </div>
          </div>

          {/* Story Text & Four Heritage Pillars */}
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-dark-brown)' }}>
              No Factories. No Shortcuts. Just Pure Home Taste.
            </h3>

            <p style={{ color: 'var(--color-dark-brown-soft)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              In an era of commercial mass production, we take immense pride in preserving Andhra Pradesh’s rich culinary traditions. Every batch of Arisalu, Chekkalu, and Nilva Pachallu is prepared right in our home kitchen using the exact hand methods passed down by our grandmothers.
            </p>

            <div className="story-pill-row">
              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Utensils size={18} color="var(--color-terracotta)" />
                  <h4>Brass Cookware</h4>
                </div>
                <p>Cooked slowly in heavy brass vessels for even heat and unparalleled aroma.</p>
              </div>

              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} color="var(--color-turmeric)" />
                  <h4>Stone-Ground Spices</h4>
                </div>
                <p>Hand-pounded mustard, chillies, and garlic on traditional grinding stones.</p>
              </div>

              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Award size={18} color="var(--color-leaf-green)" />
                  <h4>Pure Ghee & Oils</h4>
                </div>
                <p>Pure cow ghee and wood-pressed gingelly oil, free from adulteration.</p>
              </div>

              <div className="story-pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Heart size={18} color="var(--color-terracotta)" />
                  <h4>Made in Batches</h4>
                </div>
                <p>Freshly prepared in small daily batches so you receive peak crunch and aroma.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
