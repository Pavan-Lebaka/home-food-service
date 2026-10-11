import React, { useEffect } from 'react';
import { X, MessageCircle, Download, Sparkles } from 'lucide-react';
import { BRAND_INFO } from '../data/products';
import { getPromoClaimWhatsAppUrl } from '../lib/whatsapp';

export default function BannerModal({ isOpen, onClose, selectedGift }) {

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

  const whatsappUrl = getPromoClaimWhatsAppUrl(selectedGift?.name || selectedGift || '');

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
            src="/images/Banner.jpg"
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
              href="/images/Banner.jpg"
              download="Bramarambika_Home_Foods_Offer.jpg"
              className="banner-btn-secondary"
              title="Download Banner Poster"
            >
              <Download size={16} />
              <span>Download</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="banner-btn-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Claim Offer on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
