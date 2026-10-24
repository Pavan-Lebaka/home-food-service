import React from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function ProductShelf({
  title,
  subtitle,
  badgeText,
  products = [],
  onAddToCart,
  onOpenDetails,
  onViewCategory,
  viewCategoryText
}) {
  const { t } = useLanguage();
  if (products.length === 0) return null;

  return (
    <section className="product-shelf-block" aria-label={title}>
      <div className="shelf-header">
        <div className="shelf-header-info">
          {badgeText && <p className="shelf-badge-pill">{badgeText}</p>}
          <h3 className="shelf-title">{title}</h3>
          {subtitle && <p className="shelf-subtitle">{subtitle}</p>}
        </div>
        {onViewCategory && (
          <button type="button" onClick={onViewCategory} className="shelf-view-category-btn">
            <span>{viewCategoryText || t('viewCategory')}</span>
            <span className="shelf-count-badge">{products.length}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={`product-shelf-track ${products.length === 2 ? 'two-item-shelf' : ''}`} role="list" aria-label={`${title} products`}>
        {products.map((product) => (
          <div className="shelf-item-card-wrapper" key={product.id} role="listitem">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetails={onOpenDetails}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
