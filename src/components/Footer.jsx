import React from 'react';
import { MessageCircle, Phone, MapPin, Sparkles, Heart } from 'lucide-react';
import { BRAND_INFO } from '../data/products';
import { getDirectWhatsAppChatUrl } from '../lib/whatsapp';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Sparkles size={20} color="var(--color-turmeric-light)" />
              <h3 style={{ margin: 0, letterSpacing: '0.04em' }}>BRAMARAMBIKA HOME FOODS</h3>
            </div>
            <p className="footer-tagline">
              Traditional Telugu Taste • Homemade with Love
            </p>
            <p style={{ color: '#bca690', fontSize: '0.9rem', maxWidth: '420px', lineHeight: 1.6 }}>
              Crafted in an authentic Andhra village home kitchen. Pure ingredients, slow-simmered brass cooking, and stone-ground spices delivered right to your doorstep.
            </p>
          </div>

          {/* Quick Categories Column */}
          <div>
            <h4 style={{ color: 'var(--color-turmeric-light)', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: '700' }}>
              {t('ourCategories')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#d1bfa8' }}>
              <li>
                <a href="#pindi-vantalu-section" style={{ transition: 'color 0.2s ease' }}>
                  • {t('pindiVantaluFull')}
                </a>
              </li>
              <li>
                <a href="#veg-pickles-section" style={{ transition: 'color 0.2s ease' }}>
                  • {t('vegPicklesFull')}
                </a>
              </li>
              <li>
                <a href="#non-veg-pickles-section" style={{ transition: 'color 0.2s ease' }}>
                  • {t('nonVegPicklesFull')}
                </a>
              </li>
              <li>
                <a href="#story" style={{ transition: 'color 0.2s ease' }}>
                  • {t('ourHeritageStory')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Orders Column */}
          <div>
            <h4 style={{ color: 'var(--color-turmeric-light)', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: '700' }}>
              {t('orderAndInquiries')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <a
                href={getDirectWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#25D366',
                  fontWeight: '600'
                }}
              >
                <MessageCircle size={18} />
                <span>WhatsApp: {BRAND_INFO.whatsappDisplay}</span>
              </a>

              <a
                href={`tel:${BRAND_INFO.phoneNumber}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ffffff',
                  fontWeight: '500'
                }}
              >
                <Phone size={18} color="var(--color-turmeric-light)" />
                <span>Phone: {BRAND_INFO.phoneDisplay}</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bca690', fontSize: '0.875rem' }}>
                <MapPin size={18} color="var(--color-terracotta)" />
                <span>Andhra Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span>{t('copyright')}</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {t('madeWith')} <Heart size={14} color="var(--color-terracotta)" fill="var(--color-terracotta)" /> {t('forTelugu')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
