import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Check, MessageCircle, Star, Sparkles, ShieldCheck, Box, Image as ImageIcon } from 'lucide-react';
import { WEIGHT_VARIANTS, getProductVariantPrice } from '../data/products';
import { formatCurrency, getWhatsAppOrderUrl } from '../lib/whatsapp';

const Product3DViewer = React.lazy(() => import('./3d/Product3DViewer'));

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedVariantId, setSelectedVariantId] = useState('500g');
  const [packQuantity, setPackQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'photo'

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
          {/* Left: Product Media with 3D / Photo Mode Switcher */}
          <div className="modal-image-col">
            {/* View Mode Switcher Pill */}
            <div className="modal-view-mode-bar" style={{
              display: 'flex',
              gap: '6px',
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 10,
              background: 'rgba(20, 10, 5, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '4px',
              borderRadius: '20px',
              border: '1px solid rgba(217, 154, 23, 0.3)'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === '3d' ? '#D99A17' : 'transparent',
                  color: viewMode === '3d' ? '#211005' : '#f5e1c4',
                  transition: 'all 0.2s ease'
                }}
              >
                <Box size={13} />
                <span>3D View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('photo')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'photo' ? '#D99A17' : 'transparent',
                  color: viewMode === 'photo' ? '#211005' : '#f5e1c4',
                  transition: 'all 0.2s ease'
                }}
              >
                <ImageIcon size={13} />
                <span>Photo</span>
              </button>
            </div>

            {viewMode === '3d' ? (
              <React.Suspense fallback={<div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8d7aa' }}>Loading 3D Experience...</div>}>
                <Product3DViewer product={product} />
              </React.Suspense>
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className="modal-product-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = product.category === 'pindi-vantalu' ? 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220634/bramarambika_foods/arisalu.jpg' : 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg';
                }}
              />
            )}

            {product.badge && (
              <div className="modal-badge-tag">
                <Sparkles size={12} />
                <span>{product.badge}</span>
              </div>
            )}
          </div>

          {/* Right: Details & Variant Selection */}
          <div className="modal-info-col">
            <div className="modal-category-hint">{product.categoryLabel}</div>
            <h2 className="modal-product-title">{product.name}</h2>
            <div className="modal-telugu-title">{product.teluguName}</div>

            {/* Rating */}
            <div className="modal-rating-row">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="star-filled" fill="#E67E22" color="#E67E22" />
                ))}
              </div>
              <span className="rating-score">{product.rating || '4.9'}</span>
              <span className="rating-count">({product.reviewCount || '35'} Customer Reviews)</span>
            </div>

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
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-count">{packQuantity}</span>
                <button
                  type="button"
                  onClick={() => setPackQuantity(prev => prev + 1)}
                  className="stepper-btn"
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

            <div className="modal-trust-footer">
              <ShieldCheck size={16} color="var(--color-leaf-green)" />
              <span>100% Traditional Village Kitchen Recipe • Sealed Leak-Proof Packaging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
