import React, { useState } from 'react';
import { Plus, Check, Star, Sparkles, Info } from 'lucide-react';
import { WEIGHT_VARIANTS, getProductVariantPrice } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export default function ProductCard({ product, onAddToCart, onOpenDetails }) {
  const { t } = useLanguage();
  // Default to 500g (1/2 kg)
  const [selectedVariantId, setSelectedVariantId] = useState('500g');
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant = WEIGHT_VARIANTS.find(v => v.id === selectedVariantId) || WEIGHT_VARIANTS[1];
  const unitPrice = getProductVariantPrice(product, selectedVariantId);

  const handleVariantChange = (e, variantId) => {
    e.stopPropagation();
    setSelectedVariantId(variantId);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart({
      product,
      variantId: activeVariant.id,
      variantLabel: activeVariant.label,
      unitPrice,
      quantity: 1
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  return (
    <article
      className="compact-product-card"
      id={`product-${product.id}`}
      onClick={() => onOpenDetails && onOpenDetails(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenDetails && onOpenDetails(product);
        }
      }}
    >
      {/* Product Image Frame */}
      <div className="compact-card-media">
        <img
          src={product.image}
          alt={`${product.name} - ${product.tagline}`}
          className="compact-card-img"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="compact-media-badges">
          {product.badge ? (
            <span className="compact-badge-pill">
              {product.badge === 'Hot Seller' || product.badge === 'Premium Special' ? (
                <Sparkles size={10} className="badge-sparkle-icon" />
              ) : null}
              {product.badge}
            </span>
          ) : <span />}

          <div className="compact-rating-pill">
            <Star size={11} fill="#E67E22" color="#E67E22" />
            <span>{product.rating || '4.9'}</span>
          </div>
        </div>

        {/* Quick Details Trigger */}
        {onOpenDetails && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="compact-info-btn"
            title="View ingredients & details"
            aria-label={`View ingredients for ${product.name}`}
          >
            <Info size={13} />
          </button>
        )}
      </div>

      {/* Product Information Body */}
      <div className="compact-card-body">
        {/* Title & Telugu Name */}
        <div className="compact-title-group">
          <h3 className="compact-product-title">
            {product.name}
          </h3>
          <div className="compact-product-telugu">
            {product.teluguName}
          </div>
        </div>

        {/* Weight Variant Selector Segmented Pills */}
        <div
          className="compact-variant-selector"
          role="radiogroup"
          aria-label="Choose weight"
          onClick={(e) => e.stopPropagation()}
        >
          {WEIGHT_VARIANTS.filter(v => v.id !== '2kg').map(v => {
            const isSelected = selectedVariantId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={(e) => handleVariantChange(e, v.id)}
                className={`compact-variant-pill ${isSelected ? 'active' : ''}`}
                aria-checked={isSelected}
                role="radio"
              >
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Bottom Price & Add to Cart Row */}
        <div className="compact-card-footer" onClick={(e) => e.stopPropagation()}>
          <div className="compact-pricing">
            <span className="compact-price-val">₹{unitPrice}</span>
            <span className="compact-price-size">/{activeVariant.label}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`compact-add-btn ${justAdded ? 'added' : ''}`}
            id={`btn-add-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check size={13} />
                <span>{t('added')}</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>{t('add')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
