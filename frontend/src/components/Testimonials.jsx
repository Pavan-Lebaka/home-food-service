import React from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { TESTIMONIALS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="testimonials-section reveal-on-scroll" id="testimonials">
      <div className="container">
        <div className="testimonials-header reveal-on-scroll">
          <div className="section-pre-pill">
            <MessageSquare size={14} />
            <span>{t('customerLove')}</span>
          </div>
          <h2 className="testimonials-title">
            {t('testimonialsTitle')}
          </h2>
          <p className="testimonials-subtitle">
            {t('testimonialsSubtitle')}
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={item.id}
              className="testimonial-card reveal-on-scroll"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="testimonial-top-row">
                <div className="rating-stars">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#E67E22" color="#E67E22" />
                  ))}
                </div>
                <div className="verified-badge">
                  <CheckCircle size={13} color="var(--color-leaf-green)" />
                  <span>{t('verifiedBuyer')}</span>
                </div>
              </div>

              <h3 className="testimonial-quote-title">"{item.title}"</h3>
              <p className="testimonial-body-text">{item.text}</p>

              <div className="testimonial-footer-meta">
                <div className="author-name">{item.name}</div>
                <div className="author-loc">{item.location} • <span className="product-tag">{item.product}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
