import React from 'react';
import { ArrowDown, MessageCircle, Sparkles, ShieldCheck, Heart, Leaf, PackageCheck } from 'lucide-react';
import { BRAND_INFO } from '../data/products';

export default function Hero({ onWhatsAppClick }) {
  return (
    <section id="hero" className="annapurna-hero-section">
      <div className="container">
        <div className="hero-split-grid">
          {/* Left Column: Brand Narrative & CTA */}
          <div className="hero-content-col">
            <div className="hero-origin-pill">
              <Sparkles size={13} />
              <span>Village Kitchen Soul • Andhra Heritage</span>
            </div>

            <h1 className="hero-store-title">
              Traditional Telugu Taste, <br />
              <span className="hero-highlight-phrase">Homemade With Love.</span>
            </h1>

            <p className="hero-store-subtitle">
              Authentic Pindi Vantalu, pure desi ghee sweets, and sun-ripened Andhra pickles prepared using cold-pressed oils, stone-ground masalas, and generational family recipes.
            </p>

            <div className="hero-weight-prompt">
              <PackageCheck size={16} color="var(--color-leaf-green)" />
              <span>Custom pack sizes available: <strong>250 g</strong>, <strong>1/2 kg</strong>, and <strong>1 kg</strong> packs</span>
            </div>

            {/* CTAs */}
            <div className="hero-cta-buttons">
              <a href="#collections" className="btn-hero-primary" id="hero-view-menu-btn">
                <span>Explore Collections</span>
                <ArrowDown size={17} />
              </a>

              <button
                onClick={onWhatsAppClick}
                className="btn-hero-whatsapp"
                id="hero-whatsapp-btn"
                type="button"
              >
                <MessageCircle size={18} />
                <span>Order on WhatsApp</span>
              </button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="hero-trust-highlights">
              <div className="trust-pill-item">
                <Leaf size={16} className="trust-icon" />
                <span>100% Homemade</span>
              </div>
              <div className="trust-pill-item">
                <ShieldCheck size={16} className="trust-icon" />
                <span>No Preservatives</span>
              </div>
              <div className="trust-pill-item">
                <Heart size={16} className="trust-icon" />
                <span>Cold-Pressed Oils</span>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Imagery */}
          <div className="hero-media-col">
            <div className="hero-banner-card">
              <img
                src="/images/hero.jpg"
                alt="Traditional Andhra feast with Arisalu, Sunnundalu, Karapusa, and Avakaya pickles"
                className="hero-banner-img"
                loading="eager"
              />

              {/* Floating Quality Stamp */}
              <div className="hero-floating-badge">
                <div className="badge-stamp-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="badge-stamp-title">Daily Fresh Batches</div>
                  <div className="badge-stamp-sub">Traditional Stone Ground</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
