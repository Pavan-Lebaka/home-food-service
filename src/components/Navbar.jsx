import React, { useState, useEffect } from 'react';
import { ShoppingCart, MessageCircle, Search, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { BRAND_INFO } from '../data/products';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({
  cartCount,
  onOpenCart,
  onWhatsAppClick,
  onOpenSearch,
  onSelectCategory
}) {
  const { t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ANNOUNCEMENTS = [
    t('ann1'),
    t('ann2'),
    t('ann3'),
    t('ann4'),
  ];

  // Auto-rotate announcement carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [ANNOUNCEMENTS.length]);

  const handlePrev = () => {
    setCurrentIdx(prev => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <>
      {/* 1. Top Announcement Bar — Pure Carousel without dark badge bg */}
      <div className="annapurna-announcement-bar">
        <div className="container announcement-carousel-row">
          <button
            type="button"
            onClick={handlePrev}
            className="announcement-arrow-btn"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="announcement-carousel-track">
            <div className="announcement-carousel-text" key={currentIdx}>
              <span>{ANNOUNCEMENTS[currentIdx]}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="announcement-arrow-btn"
            aria-label="Next announcement"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Main Sticky Storefront Navbar */}
      <header className="annapurna-main-navbar">
        <div className="container nav-layout-container">
          {/* Brand Identity on the LEFT */}
          <a href="#hero" className="store-brand-left" aria-label="Bramarambika Home Foods">
            <div className="brand-crest-svg" aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="21" cy="21" r="20" fill="#FFFFFF" stroke="#245A32" strokeWidth="1.5" />
                <circle cx="21" cy="21" r="17.5" fill="#FAF6EE" stroke="#D99A17" strokeWidth="0.8" strokeDasharray="2 2" />
                <path d="M21 7 C14 13, 10 18, 12 24 C14 29, 22 30, 26 27 C30 23, 30 16, 21 7 Z" fill="#245A32" />
                <path d="M21 11 C18 15, 15 19, 16 23 C17 26, 22 27, 24 24 C27 21, 26 16, 21 11 Z" fill="#D99A17" />
                <circle cx="21" cy="22" r="3.2" fill="#A83A24" />
              </svg>
            </div>
            <div className="brand-titles-wrap">
              <div className="brand-telugu-sub">భ్రమరాంబిక హోమ్ ఫుడ్స్</div>
              <div className="brand-main-name">Bramarambika</div>
              <div className="brand-sub-badge">HOME FOODS</div>
            </div>
          </a>

          {/* Center Navigation Links */}
          <nav className="nav-desktop-links" aria-label="Main Navigation">
            <a href="#hero" className="store-nav-link">{t('home')}</a>
            <a href="#collections" className="store-nav-link">{t('collections')}</a>
            <a href="#menu" className="store-nav-link" onClick={() => onSelectCategory && onSelectCategory('all')}>{t('catalog')}</a>
            <a href="#story" className="store-nav-link">{t('ourStory')}</a>
            <a href="#contact" className="store-nav-link">{t('contact')}</a>
          </nav>

          {/* Right Action Icons & Cart */}
          <div className="nav-actions-right">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Quick Search */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="nav-icon-action"
              aria-label="Search delicacies"
              title="Search menu"
            >
              <Search size={18} />
            </button>

            {/* Quick WhatsApp Pill */}
            <button
              type="button"
              onClick={onWhatsAppClick}
              className="nav-whatsapp-pill"
              aria-label="Order on WhatsApp"
            >
              <MessageCircle size={16} />
              <span className="pill-text">{t('whatsapp')}</span>
            </button>

            {/* Cart Trigger with Counter Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              id="nav-cart-btn"
              className="nav-cart-trigger"
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Bottom Links */}
        <div className="mobile-nav-bottom-links">
          <a href="#hero" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('home')}</a>
          <a href="#collections" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('collections')}</a>
          <a href="#menu" className="mobile-nav-link" onClick={() => { onSelectCategory && onSelectCategory('all'); setMobileMenuOpen(false); }}>{t('catalog')}</a>
          <a href="#story" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>{t('ourStory')}</a>
        </div>
      </header>
    </>
  );
}
