import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FEATURED_COLLECTIONS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export default function FeaturedCollections({ onSelectCategory }) {
  const { t } = useLanguage();

  return (
    <section className="collections-showcase-section" id="collections">
      <div className="container">
        <div className="collections-header reveal-on-scroll">
          <p className="section-kicker">{t('ourCollectionsPill')}</p>
          <h2 className="collections-main-title">{t('ourCollectionsTitle')}</h2>
          <p className="collections-subtitle">{t('ourCollectionsSubtitle')}</p>
        </div>

        <div className="collections-cards-grid">
          {FEATURED_COLLECTIONS.map((collection, index) => {
            const target = collection.categoryTarget || collection.id;
            const titleMap = {
              'non-veg-pickles': { title: t('colNonVegTitle'), sub: t('colNonVegSub') },
              'veg-pickles': { title: t('colVegTitle'), sub: t('colVegSub') },
              'pindi-vantalu': { title: t('colSweetsTitle'), sub: t('colSweetsSub') },
              'pindi-vantalu-hot': { title: t('colSavouriesTitle'), sub: t('colSavouriesSub') }
            };
            const localized = titleMap[collection.id] || {};

            return (
              <button
                className="collection-card reveal-on-scroll"
                key={collection.id}
                type="button"
                onClick={() => onSelectCategory(target)}
              >
                <span className="collection-index">0{index + 1}</span>
                <span className="collection-card-main">
                  <span className="collection-card-title">{localized.title || collection.title}</span>
                  <span className="collection-card-sub">{localized.sub || collection.subtitle}</span>
                  <span className="collection-card-action">
                    <span className="collection-price-hint">{collection.startingPrice}</span>
                    <span className="collection-explore-btn">{t('shopCollection')} <ArrowUpRight size={16} /></span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
