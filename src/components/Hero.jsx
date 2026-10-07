import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Leaf, ShieldCheck, Heart, PackageCheck, Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SLIDES = [
  {
    id: 1,
    tagKey: 'heroSlide1Tag',
    titleKey: 'heroSlide1Title',
    subKey: 'heroSlide1Sub',
    ctaKey: 'heroSlide1Cta',
    categoryTarget: 'all',
    image: '/images/hero.jpg', // Authentic Andhra Feast: Arisalu, Karapusa, Kajjikayalu, Boondhi, Avakaya jar
    accentColor: '#D99A17',
    icon: Sparkles
  },
  {
    id: 2,
    tagKey: 'heroSlide2Tag',
    titleKey: 'heroSlide2Title',
    subKey: 'heroSlide2Sub',
    ctaKey: 'heroSlide2Cta',
    categoryTarget: 'veg-pickles',
    image: '/images/veg-pickles.jpg', // Authentic Ceramic Jaadi Jars with Avakaya, Gongura, Tomato, Allam
    accentColor: '#A83A24',
    icon: Flame
  },
  {
    id: 3,
    tagKey: 'heroSlide4Tag',
    titleKey: 'heroSlide4Title',
    subKey: 'heroSlide4Sub',
    ctaKey: 'heroSlide4Cta',
    categoryTarget: 'pindi-vantalu',
    image: '/images/savouries.jpg', // Authentic Crispy Pindi Vantalu: Chekkalu, Murukku, Spices
    accentColor: '#2F5D3A',
    icon: Leaf
  },
  {
    id: 4,
    tagKey: 'heroSlide3Tag',
    titleKey: 'heroSlide3Title',
    subKey: 'heroSlide3Sub',
    ctaKey: 'heroSlide3Cta',
    categoryTarget: 'pindi-vantalu',
    image: '/images/sweets.jpg', // Pure Ghee Sweets: Sunnundalu, Kajjikayalu, Ravva Laddu on Banana Leaf
    accentColor: '#D99A17',
    icon: Sparkles
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

  // Continuous Autoplay timer: resets on slide change, advances automatically every 4.2s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4200);

    return () => clearInterval(timer);
  }, [currentSlide, totalSlides]);

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
  const IconComponent = activeSlideData.icon;

  return (
    <section
      id="hero"
      className="hero-carousel-section"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Highlights Carousel"
    >
      {/* Background Slides Track */}
      <div className="hero-slides-viewport">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`hero-carousel-slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
            >
              <div
                className="hero-slide-bg"
                style={{
                  backgroundImage: `url(${slide.image})`
                }}
              />
              <div className="hero-slide-overlay" />
            </div>
          );
        })}
      </div>

      {/* Hero Content Area */}
      <div className="container hero-content-container">
        <div className="hero-slide-caption-wrap">
          {/* Pill Badge */}
          <div className="hero-slide-tag-pill reveal-on-scroll is-revealed">
            <IconComponent size={14} color={activeSlideData.accentColor} />
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
        </div>
      </div>

      {/* Trust Highlights Bottom Strip */}
      <div className="hero-trust-bar">
        <div className="container">
          <div className="hero-trust-grid">
            <div className="trust-bar-item">
              <Leaf size={18} className="trust-icon" />
              <span>{t('hundredHomemade')}</span>
            </div>
            <div className="trust-bar-item">
              <ShieldCheck size={18} className="trust-icon" />
              <span>{t('noPreservatives')}</span>
            </div>
            <div className="trust-bar-item">
              <Heart size={18} className="trust-icon" />
              <span>{t('coldPressedOils')}</span>
            </div>
            <div className="trust-bar-item">
              <Sparkles size={18} className="trust-icon" />
              <span>{t('dailyFreshBatches')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
