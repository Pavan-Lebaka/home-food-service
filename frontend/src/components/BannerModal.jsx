import React, { useEffect } from 'react';
import { X, Download, Sparkles } from 'lucide-react';
import { BRAND_INFO } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export default function BannerModal({ isOpen, onClose, selectedGift, onSelectCategory }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scroll
    const origBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origBodyOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectItems = () => {
    onClose();
    if (onSelectCategory) {
      onSelectCategory('all');
    }
    setTimeout(() => {
      const menuEl = document.getElementById('menu');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

  return (
    <div className="banner-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Official Promotional Banner">
      <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="banner-modal-topbar">
          <div className="banner-modal-title-wrap">
            <Sparkles size={18} color="var(--color-turmeric)" />
            <span className="banner-modal-title">
              Bramarambika Home Foods — Official Festival & First Order Offer
            </span>
          </div>
          <button
            type="button"
            className="banner-modal-close-btn"
            onClick={onClose}
            aria-label="Close poster view"
          >
            <X size={20} />
          </button>
        </div>

        {/* Banner Graphic Viewport */}
        <div className="banner-modal-image-container">
          <img
            src="https://res.cloudinary.com/z2iepqai/image/upload/v1792220630/bramarambika_foods/banner.jpg"
            alt="Bramarambika Home Foods - Traditional Telugu Taste, Homemade with Love. Surprise gift of village authentic food for first order: Junnu, Country Eggs, or Original Honey. Murukulu, Chekkalu, Ravva Laddu, Sunnundalu, Kajjikayalu."
            className="banner-modal-full-img"
          />
        </div>

        {/* Modal Bottom Actions Strip */}
        <div className="banner-modal-bottom-bar">
          <div className="banner-modal-offer-summary">
            <span className="gift-highlight-icon">🎁</span>
            <div className="summary-texts">
              <span className="summary-headline">First Order Surprise Gift Offer</span>
              <span className="summary-details">Choose Junnu, Country Eggs, or Forest Honey on WhatsApp: <strong>{BRAND_INFO.whatsappDisplay}</strong></span>
            </div>
          </div>

          <div className="banner-modal-actions">
            <a
              href="https://res.cloudinary.com/z2iepqai/image/upload/v1792220630/bramarambika_foods/banner.jpg"
              download="Bramarambika_Home_Foods_Offer.jpg"
              className="banner-btn-secondary"
              title="Download Banner Poster"
            >
              <Download size={16} />
              <span>Download</span>
            </a>

            <button
              type="button"
              onClick={handleSelectItems}
              className="banner-btn-whatsapp"
              aria-label="Select items to claim offer"
            >
              <Sparkles size={18} />
              <span>{t('selectItemsToClaim')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
