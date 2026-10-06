import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, Sparkles, ShoppingCart, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { formatCurrency, getWhatsAppOrderUrl } from '../lib/whatsapp.js';
import { BRAND_INFO, PRODUCTS } from '../data/products.js';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart
}) {
  const { t } = useLanguage();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    notes: ''
  });

  // Strict scroll lock when cart drawer is active
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

  const deliveryFee = cartItems.length > 0 ? 100 : 0;
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const price = item.unitPrice || item.price || item.pricePerKg || 0;
    return acc + (price * item.quantity);
  }, 0);
  const grandTotal = itemsSubtotal + deliveryFee;

  // 3 popular quick picks if cart is empty
  const quickPickItems = PRODUCTS.filter(p => ['arisalu', 'avakaya', 'chicken-pickle'].includes(p.id));

  const handleWhatsAppCheckout = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    const url = getWhatsAppOrderUrl(cartItems, customerDetails);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBrowseMenu = () => {
    onClose();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#F5EBE1',
              color: 'var(--color-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="drawer-title">{t('yourOrderCart')}</h2>
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
              <div className="empty-cart-notice">
                <MessageCircle size={22} className="notice-icon" />
                <div>
                  <div className="notice-heading">{t('addItemsToOrder')}</div>
                  <div className="notice-sub">
                    {t('addItemsDesc')}
                  </div>
                </div>
              </div>

              {/* Quick Add Recommendations */}
              <div className="quick-picks-section">
                <div className="quick-picks-title">
                  {t('popularTeluguFavorites')}
                </div>
                <div className="quick-picks-list">
                  {quickPickItems.map(item => (
                    <div key={item.id} className="quick-pick-row">
                      <div className="quick-pick-left">
                        <img src={item.image} alt={item.name} className="quick-pick-img" />
                        <div>
                          <div className="quick-pick-name">{item.name}</div>
                          <div className="quick-pick-price">
                            {t('fromPrice')} ₹{item.variantPrices?.['500g'] || 150} {t('halfKgPack')}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddToCart({
                          product: item,
                          variantId: '500g',
                          variantLabel: '1/2 kg',
                          unitPrice: item.variantPrices?.['500g'] || 150,
                          quantity: 1
                        })}
                        className="quick-pick-add-btn"
                      >
                        <Plus size={13} />
                        <span>{t('addHalfKg')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleBrowseMenu}
                className="btn-browse-catalog"
              >
                <span>{t('browseFullMenu')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="cart-items-flow">
              {/* Delivery Promotion Banner */}
              <div className="cart-delivery-pill">
                <Sparkles size={14} color="#D99A17" />
                <span>{t('flatDelivery')}</span>
              </div>

              {/* Item List */}
              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const key = item.cartItemId || `${item.id}-${item.variantId || '500g'}`;
                  const itemPrice = item.unitPrice || item.price || item.pricePerKg || 0;
                  const lineTotal = itemPrice * item.quantity;
                  return (
                    <div key={key} className="cart-item-card">
                      <img src={item.image} alt={item.name} className="cart-item-img" />

                      <div className="cart-item-info">
                        <div className="cart-item-title">{item.name}</div>
                        <div className="cart-item-weight-badge">
                          {t('packSize')} <strong>{item.variantLabel || '1/2 kg'}</strong>
                        </div>
                        <div className="cart-item-price-unit">
                          ₹{itemPrice} {t('each')}
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        {/* Stepper */}
                        <div className="cart-stepper">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(key, item.quantity - 1)}
                            className="cart-stepper-btn"
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="cart-stepper-val">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(key, item.quantity + 1)}
                            className="cart-stepper-btn"
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="cart-item-total">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(key)}
                          className="cart-trash-btn"
                          aria-label={`Remove ${item.name}`}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Delivery Details Inputs */}
              <div className="cart-delivery-form">
                <div className="form-header">
                  <Sparkles size={14} color="#D99A17" />
                  <span>{t('deliveryInfo')}</span>
                </div>

                <div className="form-inputs-group">
                  <input
                    type="text"
                    placeholder={t('yourFullName')}
                    value={customerDetails.name}
                    onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="cart-input-field"
                  />

                  <input
                    type="text"
                    placeholder={t('deliveryCity')}
                    value={customerDetails.address}
                    onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                    className="cart-input-field"
                  />

                  <input
                    type="text"
                    placeholder={t('specialRequest')}
                    value={customerDetails.notes}
                    onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                    className="cart-input-field"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Totals & Checkout */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-bill-summary">
              <div className="bill-row">
                <span>{t('itemsSubtotal')}</span>
                <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="bill-row">
                <span>{t('deliveryCharge')}</span>
                <span className="delivery-badge-cost">{t('flatDeliveryCharge')}</span>
              </div>
              <div className="bill-row grand-total">
                <span>{t('totalAmount')}</span>
                <span className="total-num">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="btn-whatsapp-checkout"
              id="cart-checkout-whatsapp-btn"
            >
              <MessageCircle size={19} />
              <span>{t('sendOrderWhatsApp')}</span>
            </button>

            <div className="cart-phone-assist">
              <a href={`tel:${BRAND_INFO.phoneNumber}`} className="call-assist-link">
                <Phone size={13} />
                <span>{t('preferDirectCall')} {BRAND_INFO.phoneDisplay}</span>
              </a>
            </div>

            <div className="drawer-guarantee">
              <ShieldCheck size={14} color="var(--color-leaf-green)" />
              <span>{t('freshlyPacked')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
