import React from 'react';
import { BookOpen, Home, Clock, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WhyUs() {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: <BookOpen size={24} strokeWidth={2} />,
      title: t('coldPressedTitle'),
      desc: t('coldPressedDesc'),
      color: 'var(--color-terracotta)'
    },
    {
      icon: <Home size={24} strokeWidth={2} />,
      title: t('stoneGround'),
      desc: t('stoneGroundDesc'),
      color: 'var(--color-leaf-green)'
    },
    {
      icon: <Clock size={24} strokeWidth={2} />,
      title: t('noPreservativesTitle'),
      desc: t('noPreservativesDesc'),
      color: 'var(--color-turmeric)'
    },
    {
      icon: <Heart size={24} strokeWidth={2} />,
      title: t('BuffaloGhee'),
      desc: t('BuffaloGheeDesc'),
      color: 'var(--color-terracotta)'
    }
  ];

  return (
    <section id="why-us" className="section-why reveal-on-scroll">
      <div className="container">
        <div className="why-us-header reveal-on-scroll">
          <div className="section-pre-pill">
            <ShieldCheck size={14} />
            <span>{t('bramarambikaPromise')}</span>
          </div>

          <h2 className="why-us-title">
            {t('whyChooseUs')}
          </h2>

          <p className="why-us-subtitle">
            {t('whySubtitle')}
          </p>
        </div>

        <div className="features-grid">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="feature-card reveal-on-scroll"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="feature-icon-circle" style={{ color: pillar.color }}>
                {pillar.icon}
              </div>
              <h3 className="feature-title">{pillar.title}</h3>
              <p className="feature-desc">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
