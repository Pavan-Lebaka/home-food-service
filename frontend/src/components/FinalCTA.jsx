import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { BRAND_INFO } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export default function FinalCTA({ onWhatsAppClick, cartCount }) {
  const { t } = useLanguage();

  return (
    <section id="contact" className="section-final-cta">
      <div className="container final-contact-content">
        <p className="section-kicker">Orders &amp; enquiries</p>
        <h2>{t('readyToOrder')}</h2>
        <p className="final-contact-copy">Review prices and pack sizes in the catalogue, then send your order request through WhatsApp. The kitchen will confirm the next steps with you.</p>

        <div className="final-contact-actions">
          <button type="button" onClick={onWhatsAppClick} className="final-contact-primary" id="final-cta-whatsapp-btn">
            <MessageCircle size={18} />
            <span>{cartCount > 0 ? `${t('reviewOrderSendWhatsApp')} (${cartCount})` : t('orderOnWhatsApp')}</span>
          </button>
          <a href={`tel:${BRAND_INFO.phoneNumber}`} className="final-contact-secondary">
            <Phone size={17} />
            <span>{t('callUs')}: {BRAND_INFO.phoneDisplay}</span>
          </a>
        </div>

        <div className="final-contact-details">
          <span>WhatsApp <button type="button" onClick={onWhatsAppClick}>{BRAND_INFO.whatsappDisplay}</button></span>
          <span>Phone <a href={`tel:${BRAND_INFO.phoneNumber}`}>{BRAND_INFO.phoneDisplay}</a></span>
          <span className="final-contact-hours">{t('availableHours')}</span>
        </div>
        <p className="final-order-note">Review and send your order through WhatsApp to complete your request.</p>
      </div>
    </section>
  );
}
