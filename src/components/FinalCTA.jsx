import React from 'react';
import { MessageCircle, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { BRAND_INFO } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export default function FinalCTA({ onWhatsAppClick, cartCount }) {
  const { t } = useLanguage();

  return (
    <section id="contact" className="section-final-cta reveal-on-scroll">
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {/* Decorative Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(217, 154, 23, 0.22)',
          border: '1px solid rgba(217, 154, 23, 0.45)',
          color: '#FFE082',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          letterSpacing: '0.04em'
        }}>
          <Sparkles size={16} />
          <span>{t('dailyFreshBatches')}</span>
        </div>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '1rem',
          fontFamily: 'var(--font-serif)',
          lineHeight: 1.25
        }}>
          {t('readyToOrder')}
        </h2>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#e4f0e6',
          maxWidth: '650px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          {t('ctaSubtitle')}
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <button
            onClick={onWhatsAppClick}
            className="btn-whatsapp"
            style={{ fontSize: '1.1rem', padding: '1rem 2.2rem' }}
            id="final-cta-whatsapp-btn"
            type="button"
          >
            <MessageCircle size={22} />
            <span>
              {cartCount > 0
                ? `${t('reviewOrderSendWhatsApp')} (${cartCount})`
                : t('orderOnWhatsApp')}
            </span>
          </button>

          <a
            href={`tel:${BRAND_INFO.phoneNumber}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.95rem 1.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Phone size={18} />
            <span>{t('callUs')}: {BRAND_INFO.phoneDisplay}</span>
          </a>
        </div>

        {/* Contact Numbers Row */}
        <div style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          padding: '1.25rem 2rem',
          background: 'rgba(0, 0, 0, 0.18)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-turmeric-light)', fontWeight: '700' }}>WhatsApp:</span>
            <button
              onClick={onWhatsAppClick}
              style={{ color: '#fff', textDecoration: 'underline', font: 'inherit', padding: 0 }}
            >
              {BRAND_INFO.whatsappDisplay}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-turmeric-light)', fontWeight: '700' }}>Phone:</span>
            <a href={`tel:${BRAND_INFO.phoneNumber}`} style={{ color: '#fff' }}>
              {BRAND_INFO.phoneDisplay}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#4ade80" />
            <span style={{ color: '#e4f0e6' }}>{t('allIndiaDesc')}</span>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          {t('availableHours')}
        </div>
      </div>
    </section>
  );
}
