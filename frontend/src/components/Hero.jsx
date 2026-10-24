import React, { Suspense, lazy, useState, useRef, useCallback } from 'react';
import { Sparkles, Leaf, ShieldCheck, Heart, PackageCheck, Gift, ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StaticFallback from './3d/StaticFallback';

const Hero3DScene = lazy(() => import('./3d/Hero3DScene'));

const SLIDES = [
  {
    id: 1,
    tagKey: 'heroSlide1Tag',
    titleKey: 'heroSlide1Title',
    subKey: 'heroSlide1Sub',
    ctaKey: 'heroSlide1Cta',
    categoryTarget: 'all',
    accentColor: '#D99A17'
  },
  {
    id: 2,
    tagKey: 'heroSlide2Tag',
    titleKey: 'heroSlide2Title',
    subKey: 'heroSlide2Sub',
    ctaKey: 'heroSlide2Cta',
    categoryTarget: 'veg-pickles',
    accentColor: '#A83A24'
  },
  {
    id: 3,
    tagKey: 'heroSlide4Tag',
    titleKey: 'heroSlide4Title',
    subKey: 'heroSlide4Sub',
    ctaKey: 'heroSlide4Cta',
    categoryTarget: 'pindi-vantalu',
    accentColor: '#2F5D3A'
  },
  {
    id: 4,
    tagKey: 'heroSlide3Tag',
    titleKey: 'heroSlide3Title',
    subKey: 'heroSlide3Sub',
    ctaKey: 'heroSlide3Cta',
    categoryTarget: 'pindi-vantalu',
    accentColor: '#D99A17'
  }
];

export default function Hero({ onWhatsAppClick, onSelectCategory }) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const totalSlides = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Handle touch swipes for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeSlideData = SLIDES[currentSlide];
  const handlePrimaryCta = () => {
    onWhatsAppClick?.();
  };

  const handleSecondaryCta = () => {
    if (activeSlideData.categoryTarget) {
      onSelectCategory?.(activeSlideData.categoryTarget);
    } else {
      onSelectCategory?.('all');
    }
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="hero-carousel-section"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Highlights Carousel"
    >
      {/* A quiet paper backdrop keeps the 3D food scene legible. */}
      <div className="hero-editorial-backdrop" />

      {/* Editorial copy paired with a lazily loaded, animated 3D scene. */}
      <div className="container hero-content-container">
        {/* Left Side: Brand Heading, Badges, Weight Prompts & Ordering Buttons */}
        <div className="hero-slide-caption-wrap">
          {/* Plain editorial eyebrow */}
          <div className="hero-slide-tag-pill reveal-on-scroll is-revealed">
            <span>{t(activeSlideData.tagKey)}</span>
          </div>

          {/* Title */}
          <h1 className="hero-carousel-title key-fade">
            {t(activeSlideData.titleKey)}
          </h1>

          {/* Subtitle */}
          <p className="hero-carousel-subtitle key-fade">
            {t(activeSlideData.subKey)}
          </p>

          {/* Weight Prompt */}
          <div className="hero-weight-prompt-pill">
            <PackageCheck size={16} color="var(--color-leaf-green)" />
            <span>{t('heroPackSizes')}</span>
          </div>

          {/* Hero Action Buttons */}
          <div className="hero-cta-button-row">
            <button
              type="button"
              onClick={handlePrimaryCta}
              className={`hero-cta-btn-primary ${activeSlideData.isPromo ? 'promo-pulse-btn' : ''}`}
            >
              {activeSlideData.isPromo ? (
                <>
                  <Gift size={18} />
                  <span>{t('heroPromoCta')}</span>
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  <span>{t('orderOnWhatsApp')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSecondaryCta}
              className="hero-cta-btn-secondary"
            >
              <span>{t('exploreCollections')}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div className="hero-slide-dots-bar" aria-label="Slide indicators">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`hero-dot-btn ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="hero-illustration-wrap">
          <Suspense fallback={<StaticFallback className="hero-static-illustration" />}>
            <Hero3DScene currentSlide={currentSlide} className="hero-3d-scene" />
          </Suspense>
        </div>
      </div>

      {/* Store information strip */}
      <div className="hero-trust-bar">
        <div className="container">
          <div className="hero-trust-grid">
            <div className="trust-bar-item">
              <Leaf size={18} className="trust-icon" />
              <span>Andhra pickles &amp; sweets</span>
            </div>
            <div className="trust-bar-item">
              <ShieldCheck size={18} className="trust-icon" />
              <span>250 g to 2 kg packs</span>
            </div>
            <div className="trust-bar-item">
              <Heart size={18} className="trust-icon" />
              <span>Browse the full catalogue</span>
            </div>
            <div className="trust-bar-item">
              <Sparkles size={18} className="trust-icon" />
              <span>Order through WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
