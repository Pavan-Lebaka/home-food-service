import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function StorySection() {
  const { t } = useLanguage();
  const pillars = [
    ['01', t('brassCookwareTitle'), t('brassCookwareDesc')],
    ['02', t('stoneGroundSpicesTitle'), t('stoneGroundSpicesDesc')],
    ['03', t('pureGheeOilsTitle'), t('pureGheeOilsDesc')],
    ['04', t('madeInBatchesTitle'), t('madeInBatchesDesc')]
  ];

  return (
    <section id="story" className="section-story reveal-on-scroll">
      <div className="container">
        <div className="story-heading">
          <p className="section-kicker">{t('ourRootsHeritage')}</p>
          <h2>{t('storyMainHeading')}</h2>
          <blockquote>{t('storyQuote')}</blockquote>
        </div>

        <div className="story-grid">
          <aside className="story-location-card" aria-label="Bramarambika Home Foods location">
            <span className="story-location-label">Bramarambika Home Foods</span>
            <span className="story-telugu-name" lang="te">భ్రమరాంబిక</span>
            <span className="story-location-rule" aria-hidden="true" />
            <span className="story-place">T. Kothapalem</span>
            <span className="story-place-secondary">Diviseema · Krishna District</span>
          </aside>

          <div className="story-content-wrap">
            <h3>{t('noFactoriesHeading')}</h3>
            <p>{t('noFactoriesDesc')}</p>

            <ol className="story-pill-row">
              {pillars.map(([number, title, description]) => (
                <li className="story-pillar-card" key={number}>
                  <span className="story-pillar-number">{number}</span>
                  <div>
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
