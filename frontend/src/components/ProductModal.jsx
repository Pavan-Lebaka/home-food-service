import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Check, MessageCircle } from 'lucide-react';
import { WEIGHT_VARIANTS, getProductVariantPrice } from '../data/products';
import { getWhatsAppOrderUrl } from '../lib/whatsapp';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedVariantId, setSelectedVariantId] = useState('500g');
  const [packQuantity, setPackQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Strict scroll lock when product modal is active
  useEffect(() => {
    if (!product) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
    };
  }, [product]);

  if (!product) return null;

  const activeVariant = WEIGHT_VARIANTS.find(v => v.id === selectedVariantId) || WEIGHT_VARIANTS[1];
  const unitPrice = getProductVariantPrice(product, selectedVariantId);
  const totalPrice = unitPrice * packQuantity;

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
      onClose();
    }, 1000);
  };

  const handleDirectWhatsApp = () => {
    const singleCartItem = [{
      id: product.id,
      cartItemId: `${product.id}-${activeVariant.id}`,
      name: product.name,
      variantLabel: activeVariant.label,
      unitPrice,
      price: unitPrice,
      quantity: packQuantity
    }];
    const url = getWhatsAppOrderUrl(singleCartItem);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="product-modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close details modal">
          <X size={20} />
        </button>

        <div className="modal-grid-layout">
          <div className="modal-image-col">
            <img
              src={product.image}
              alt={product.name}
              className="modal-product-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = product.category === 'pindi-vantalu' 
                  ? 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220634/bramarambika_foods/arisalu.jpg' 
                  : 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg';
              }}
            />
          </div>

          {/* Right: Details & Variant Selection */}
          <div className="modal-info-col">
            <div className="modal-category-hint">{product.categoryLabel}</div>
            <h2 className="modal-product-title">{product.name}</h2>
            <div className="modal-telugu-title">{product.teluguName}</div>

            <p className="modal-desc">{product.description}</p>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="modal-ingredients-box">
                <span className="ingredients-label">Fresh Ingredients: </span>
                <span className="ingredients-text">{product.ingredients}</span>
              </div>
            )}

            {/* Weight / Variant Selector */}
            <div className="modal-variants-section">
              <div className="variant-header-row">
                <span className="variant-label-title">Choose Weight Package:</span>
                <span className="variant-active-name">{activeVariant.displayLabel || activeVariant.label}</span>
              </div>

              <div className="modal-variant-pills">
                {WEIGHT_VARIANTS.map(v => {
                  const isSelected = selectedVariantId === v.id;
                  const vPrice = getProductVariantPrice(product, v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`modal-variant-btn ${isSelected ? 'active' : ''}`}
                    >
                      <span className="v-label">{v.label}</span>
                      <span className="v-price">₹{vPrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="modal-price-row">
              <div className="modal-current-price">
                <span className="currency">₹</span>
                <span className="amount">{unitPrice}</span>
                <span className="unit-label">/ {activeVariant.label}</span>
              </div>

              <div className="pack-stepper">
                <button
                  type="button"
                  onClick={() => setPackQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                  className="stepper-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-count">{packQuantity}</span>
                <button
                  type="button"
                  onClick={() => setPackQuantity(prev => prev + 1)}
                  className="stepper-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions-group">
              <button
                type="button"
                onClick={handleAdd}
                className={`modal-add-btn ${justAdded ? 'added' : ''}`}
              >
                {justAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Order ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add {packQuantity > 1 ? `${packQuantity} packs` : ''} • ₹{totalPrice}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="modal-whatsapp-btn"
              >
                <MessageCircle size={18} />
                <span>Quick WhatsApp Order</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
