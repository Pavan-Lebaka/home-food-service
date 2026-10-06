import React from 'react';
import { FEATURED_COLLECTIONS } from '../data/products';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeaturedCollections({ onSelectCategory }) {
  return (
    <section className="collections-showcase-section" id="collections">
      <div className="container">
        {/* Section Heading */}
        <div className="collections-header">
          <div className="collection-pill-tag">
            <Sparkles size={14} />
            <span>Generational Telugu Recipes</span>
          </div>
          <h2 className="collections-main-title">
            Our Collections
          </h2>
          <p className="collections-subtitle">
            Explore authentic Andhra home kitchen delicacies crafted in small, fresh batches.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="collections-cards-grid">
          {FEATURED_COLLECTIONS.map(col => {
            const targetCat = col.categoryTarget || col.id;
            return (
              <div
                key={col.id}
                className="collection-card"
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
                    alt={col.title}
                    className="collection-img"
                    loading="lazy"
                  />
                  <div className="collection-tag-badge">
                    {col.tag}
                  </div>
                </div>

                <div className="collection-card-details">
                  <h3 className="collection-card-title">{col.title}</h3>
                  <p className="collection-card-sub">{col.subtitle}</p>
                  <div className="collection-card-action">
                    <span className="collection-price-hint">{col.startingPrice}</span>
                    <span className="collection-explore-btn">
                      Explore <ArrowRight size={14} />
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
