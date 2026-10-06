import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingCart, Star, Sparkles, Info } from 'lucide-react';
import { formatCurrency } from '../lib/whatsapp';
import { WEIGHT_VARIANTS, getProductVariantPrice } from '../data/products';

export default function ProductCard({ product, onAddToCart, onOpenDetails }) {
  // Default to 500g (1/2 kg) as requested
  const [selectedVariantId, setSelectedVariantId] = useState('500g');
  const [packQuantity, setPackQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant = WEIGHT_VARIANTS.find(v => v.id === selectedVariantId) || WEIGHT_VARIANTS[1];
  const unitPrice = getProductVariantPrice(product, selectedVariantId);
  const totalPrice = unitPrice * packQuantity;

  const handleVariantChange = (variantId) => {
    setSelectedVariantId(variantId);
  };

  const handleDecrement = () => {
    setPackQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrement = () => {
    setPackQuantity(prev => prev + 1);
  };

  const handleAdd = () => {
    onAddToCart({
      product,
      variantId: activeVariant.id,
      variantLabel: activeVariant.label,
      unitPrice,
      quantity: packQuantity
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1400);
  };

  return (
    <article className="annapurna-product-card" id={`product-${product.id}`}>
      {/* Top Image Frame */}
      <div className="product-card-img-wrap">
        <img
          src={product.image}
          alt={`${product.name} - ${product.tagline}`}
          className="product-card-img"
          loading="lazy"
        />

        {/* Badge Overlay */}
        {product.badge && (
          <div className="product-badge-pill">
            {product.badge === 'Hot Seller' || product.badge === 'Premium Special' ? (
              <Sparkles size={11} className="badge-sparkle-icon" />
            ) : null}
            <span>{product.badge}</span>
          </div>
        )}

        {/* Quick Details Trigger */}
        {onOpenDetails && (
          <button
            type="button"
            onClick={() => onOpenDetails(product)}
            className="quick-view-btn"
            title="View ingredients & details"
            aria-label={`View ingredients for ${product.name}`}
          >
            <Info size={15} />
            <span>Details</span>
          </button>
        )}
      </div>

      {/* Product Information Body */}
      <div className="product-card-body">
        {/* Rating row */}
        <div className="product-rating-row">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="star-filled" fill="#E67E22" color="#E67E22" />
            ))}
          </div>
          <span className="rating-score">{product.rating || '4.9'}</span>
          <span className="rating-count">({product.reviewCount || '35'})</span>
        </div>

        {/* Title & Telugu Name */}
        <h3 className="annapurna-product-title" onClick={() => onOpenDetails && onOpenDetails(product)}>
          {product.name}
        </h3>
        <div className="annapurna-product-telugu">
          {product.teluguName}
        </div>

        {/* Description Tagline */}
        <p className="product-brief-tagline">
          {product.tagline}
        </p>

        {/* Weight / Quantity Variant Selector Pills (1/4 kg, 1/2 kg, 1 kg) */}
        <div className="variant-selector-wrapper">
          <div className="variant-header-row">
            <span className="variant-label-title">Select Weight:</span>
            <span className="variant-active-name">{activeVariant.label}</span>
          </div>

          <div className="variant-pills-row" role="radiogroup" aria-label="Choose package weight">
            {WEIGHT_VARIANTS.filter(v => v.id !== '2kg').map(v => {
              const isSelected = selectedVariantId === v.id;
              const vPrice = getProductVariantPrice(product, v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVariantChange(v.id)}
                  className={`variant-pill-btn ${isSelected ? 'active' : ''}`}
                  aria-checked={isSelected}
                  role="radio"
                >
                  <span className="pill-weight">{v.label}</span>
                  <span className="pill-price">₹{vPrice}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Price Display */}
        <div className="product-pricing-bar">
          <div className="pricing-current">
            <span className="price-currency">₹</span>
            <span className="price-amount">{unitPrice.toLocaleString('en-IN')}</span>
            <span className="price-unit-sub">/ {activeVariant.label}</span>
          </div>
          {packQuantity > 1 && (
            <div className="pricing-multiplier">
              {packQuantity} × ₹{unitPrice} = <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
            </div>
          )}
        </div>

        {/* Pack Stepper & Add to Order Bar */}
        <div className="card-actions-layout">
          {/* Stepper */}
          <div className="pack-stepper" aria-label="Pack Quantity">
            <button
              type="button"
              onClick={handleDecrement}
              className="stepper-btn"
              aria-label="Decrease pack quantity"
            >
              <Minus size={13} />
            </button>
            <span className="stepper-count">{packQuantity}</span>
            <button
              type="button"
              onClick={handleIncrement}
              className="stepper-btn"
              aria-label="Increase pack quantity"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add to Cart CTA (Annapurna Style) */}
          <button
            type="button"
            onClick={handleAdd}
            className={`annapurna-add-btn ${justAdded ? 'added-state' : ''}`}
            id={`btn-add-${product.id}`}
          >
            {justAdded ? (
              <>
                <Check size={16} />
                <span>Added ✓</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
