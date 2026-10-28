import React, { useEffect } from 'react';
import {
  X, Plus, Minus, Trash2, MessageCircle, ShoppingCart,
  ArrowRight, ShieldCheck, Truck, ShoppingBag, ArrowUpRight
} from 'lucide-react';
import { getWhatsAppOrderUrl } from '../lib/whatsapp.js';
import { BRAND_INFO } from '../data/products.js';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductsContext';
import { PRODUCTS } from '../data/products';
import {
  FREE_DELIVERY_THRESHOLD,
  FLAT_DELIVERY_FEE,
  calculateDeliveryFee
} from '../lib/shipping.js';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  onProceedToCheckout
}) {
  const { t } = useLanguage();
  const { products } = useProducts();

  // Scroll lock when cart drawer is active
  useEffect(() => {
    if (!isOpen) return;
    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Pricing calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const price = item.unitPrice || item.price || item.pricePerKg || 0;
    return acc + (price * item.quantity);
  }, 0);

  const isFreeDelivery = itemsSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = calculateDeliveryFee(itemsSubtotal);
  const grandTotal = itemsSubtotal + deliveryFee;

  // Quick picks if cart is empty (Authentic classics: Chicken Pickle, Avakaya, Arisalu)
  const candidateItems = ((products && products.length) ? products : PRODUCTS).filter(p =>
    ['chicken-pickle', 'avakaya-pickle', 'arisalu', 'sunnundalu', 'pappu-chekkalu'].includes(p.id)
  );
  const quickPickItems = candidateItems.slice(0, 3);

  const handleBrowseMenu = () => {
    onClose();
    setTimeout(() => {
      const menuEl = document.getElementById('specials-menu') || document.getElementById('menu') || document.querySelector('.products-section');
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    }, 150);
  };

  const handleQuickWhatsApp = () => {
    const url = getWhatsAppOrderUrl(cartItems, {});
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Mobile Drag Indicator Handle */}
        <div className="cart-drawer-handle" />

        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="drawer-header-icon-wrap">
              <ShoppingCart size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="drawer-title">{t('yourOrderCart') || 'Your Order Cart'}</h2>
                {cartItems.length > 0 && (
                  <span className="drawer-items-count-badge">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
                  </span>
                )}
              </div>
              <div className="drawer-subtitle">
                {BRAND_INFO.name}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close cart drawer">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-wrapper">
              {/* 1. Warm, Heartfelt Empty State Hero Card */}
              <div className="cart-empty-hero-card">
                <div className="empty-cart-icon-halo">
                  <ShoppingBag size={32} className="empty-cart-icon" />
                </div>
                <h3 className="empty-cart-title">{t('emptyCartTitle') || 'Your Cart is Empty'}</h3>
                <p className="empty-cart-sub">
                  {t('emptyCartSub') || 'Our village kitchen prepares fresh batches daily with pure cold-pressed oil and cow ghee. Choose your favorite Andhra delicacies to get started!'}
                </p>
                <button
                  type="button"
                  onClick={handleBrowseMenu}
                  className="empty-cart-browse-btn"
                >
                  <span>{t('exploreDelicacies') || 'Explore Kitchen Specials'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* 2. Popular Kitchen Specialties (Compact, polished cards) */}
              <div className="empty-quickpicks-section">
                <div className="quickpicks-header-row">
                  <span className="quickpicks-diya">🪔</span>
                  <span className="quickpicks-title-text">Explore the product range</span>
                </div>
                <div className="quickpicks-compact-list">
                  {quickPickItems.map(item => (
                    <div key={item.id} className="quickpick-compact-card">
                      <div className="quickpick-thumb-box">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="quickpick-thumb-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = item.category === 'pindi-vantalu' ? 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220634/bramarambika_foods/arisalu.jpg' : 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg';
                          }}
                        />
                      </div>
                      <div className="quickpick-details">
                        <div className="quickpick-name">{item.name}</div>
                        {item.teluguName && (
                          <div className="quickpick-telugu">{item.teluguName}</div>
                        )}
                        <div className="quickpick-price-row">
                          <span className="quickpick-price">₹{item.pricePerKg}</span>
                          <span className="quickpick-unit">/ 1 kg</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddToCart && onAddToCart({ product: item, variantId: '1kg', variantLabel: '1 kg', unitPrice: item.pricePerKg, quantity: 1 })}
                        className="quickpick-add-btn"
                        title={`Add 1kg ${item.name} to cart`}
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="cart-active-flow">
              {/* Cart items */}
              <div className="modern-cart-items-section">
                <div className="items-list-header">
                  <span className="header-label">Selected Items ({cartItems.length})</span>
                  <span className="header-sub">Order summary</span>
                </div>

                <div className="cart-items-scroll-list">
                  {cartItems.map((item, index) => {
                    const itemUnitPrice = item.unitPrice || item.price || item.pricePerKg || 0;
                    const lineTotal = itemUnitPrice * item.quantity;
                    const itemCartKey = item.cartItemId || `${item.id}-${item.variantId || index}`;

                    return (
                      <div key={itemCartKey} className="modern-cart-item-row">
                        <div className="modern-item-media">
                          <img
                            src={item.image || 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg'}
                            alt={item.name}
                            className="modern-item-thumbnail"
                            onError={(e) => {
                              e.target.src = 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg';
                            }}
                          />
                        </div>

                        <div className="modern-item-details">
                          <div className="modern-item-top">
                            <div>
                              <h4 className="modern-item-name">{item.name}</h4>
                              {item.teluguName && (
                                <div className="modern-item-telugu">{item.teluguName}</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(itemCartKey)}
                              className="modern-item-delete-btn"
                              title="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="modern-item-pack-pill">
                            <span>Pack: {item.variantLabel || '1 kg'}</span>
                            <span className="pill-dot">•</span>
                            <span>₹{itemUnitPrice} / pack</span>
                          </div>

                          <div className="modern-item-bottom">
                            <div className="modern-stepper-wrap">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(itemCartKey, item.quantity - 1)}
                                className="modern-step-btn"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="modern-step-val">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(itemCartKey, item.quantity + 1)}
                                className="modern-step-btn"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="modern-item-subtotal">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleBrowseMenu}
                  className="modern-add-more-link"
                >
                  <Plus size={14} />
                  <span>{t('viewAllSpecials') || 'Add more authentic delicacies from menu'}</span>
                </button>
              </div>

              {/* Cart subtotal and delivery note */}
              <div className="modern-bill-card">
                <div className="modern-bill-header">
                  <span className="bill-title-text">Order Bill Details</span>
                  <span className="bill-trust-tag">
                    <ShieldCheck size={12} color="var(--color-leaf-green)" />
                    <span>Cart summary</span>
                  </span>
                </div>

                <div className="modern-bill-table">
                  <div className="bill-table-row">
                    <span className="table-row-label">Items Subtotal</span>
                    <span className="table-row-value">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bill-table-row">
                    <span className="table-row-label">Delivery Fee</span>
                    <span className="table-row-value" style={isFreeDelivery ? { color: '#166534', fontWeight: 700 } : {}}>
                      {isFreeDelivery ? 'FREE 🎉' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="bill-table-row grand-total-row">
                    <div className="total-label-block">
                      <span className="total-title">Total Amount</span>
                      <span className="total-tax-note">
                        {isFreeDelivery ? '✓ FREE delivery applied' : 'Standard courier delivery included'}
                      </span>
                    </div>
                    <span className="total-amount-display">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {!isFreeDelivery && (
                  <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#8C2F1C', fontWeight: 600 }}>
                    💡 Add ₹{(FREE_DELIVERY_THRESHOLD - itemsSubtotal).toLocaleString('en-IN')} more to get <strong>FREE Delivery</strong>!
                  </div>
                )}
              </div>

              {/* 4. Trust Badges */}
              <div className="modern-cart-assurances">
                <div className="assurance-item">
                  <ShieldCheck size={14} className="assurance-icon" />
                  <span>Product and pack details shown above</span>
                </div>
                <div className="assurance-item">
                  <Truck size={14} className="assurance-icon" />
                  <span>Confirm delivery details with the kitchen on WhatsApp</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer with Dual Checkout Options */}
        {cartItems.length > 0 && (
          <div className="drawer-footer modern-sticky-footer">
            <div className="sticky-footer-summary-row">
              <div className="sticky-total-info">
                <span className="sticky-total-label">Total Amount</span>
                <span className="sticky-total-val">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="sticky-delivery-note">
                <span className={isFreeDelivery ? "tag-free-deliv" : "tag-paid-deliv"}>
                  {isFreeDelivery ? '🎉 FREE Delivery' : `Standard Delivery ₹${deliveryFee}`}
                </span>
              </div>
            </div>

            {/* Primary Action: Go to Dedicated Checkout Page with WhatsApp Confirmation */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToCheckout && onProceedToCheckout();
              }}
              className="modern-checkout-btn"
              id="cart-proceed-checkout-btn"
            >
              <div className="btn-checkout-content">
                <span className="btn-main-title">Proceed to Order & Confirmation</span>
                <span className="btn-sub-amount">• ₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <ArrowRight size={18} />
            </button>

            <div className="cart-order-reassurance">
              💬 Share your delivery address with the kitchen on WhatsApp
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
