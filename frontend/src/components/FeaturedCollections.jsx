import React from 'react';
import { FEATURED_COLLECTIONS } from '../data/products';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FeaturedCollections({ onSelectCategory }) {
  const { t } = useLanguage();

  return (
    <section className="collections-showcase-section" id="collections">
      <div className="container">
        {/* Section Heading */}
        <div className="collections-header reveal-on-scroll">
          <div className="collection-pill-tag">
            <Sparkles size={14} />
            <span>{t('ourCollectionsPill')}</span>
          </div>
          <h2 className="collections-main-title">
            {t('ourCollectionsTitle')}
          </h2>
          <p className="collections-subtitle">
            {t('ourCollectionsSubtitle')}
          </p>
        </div>

        {/* Collections Grid */}
        <div className="collections-cards-grid">
          {FEATURED_COLLECTIONS.map((col, idx) => {
            const targetCat = col.categoryTarget || col.id;
            const titleMap = {
              'non-veg-pickles': { title: t('colNonVegTitle'), sub: t('colNonVegSub'), tag: t('colNonVegTag') },
              'veg-pickles': { title: t('colVegTitle'), sub: t('colVegSub'), tag: t('colVegTag') },
              'pindi-vantalu': { title: t('colSweetsTitle'), sub: t('colSweetsSub'), tag: t('colSweetsTag') },
              'pindi-vantalu-hot': { title: t('colSavouriesTitle'), sub: t('colSavouriesSub'), tag: t('colSavouriesTag') }
            };
            const localized = titleMap[col.id] || {};
            const cardTitle = localized.title || col.title;
            const cardSub = localized.sub || col.subtitle;
            const cardTag = localized.tag || col.tag;

            return (
              <div
                key={col.id}
                className="collection-card reveal-on-scroll"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => onSelectCategory(targetCat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectCategory(targetCat);
                  }
                }}
              >
                <div className="collection-img-wrap">
                  <img
                    src={col.image}
                    alt={cardTitle}
                    className="collection-img"
                    loading="lazy"
                  />
                  <div className="collection-tag-badge">
                    {cardTag}
                  </div>
                </div>

                <div className="collection-card-details">
                  <h3 className="collection-card-title">{cardTitle}</h3>
                  <p className="collection-card-sub">{cardSub}</p>
                  <div className="collection-card-action">
                    <span className="collection-price-hint">{col.startingPrice}</span>
                    <span className="collection-explore-btn">
                      {t('shopCollection')} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
