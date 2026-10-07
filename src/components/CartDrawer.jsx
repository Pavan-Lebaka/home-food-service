import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Minus, Trash2, MessageCircle, Sparkles, ShoppingCart,
  ArrowRight, ShieldCheck, Phone, MapPin, User, Hash, AlertCircle,
  Truck, CheckCircle2, FileText
} from 'lucide-react';
import { formatCurrency, getWhatsAppOrderUrl } from '../lib/whatsapp.js';
import { BRAND_INFO, PRODUCTS } from '../data/products.js';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';

const FREE_DELIVERY_THRESHOLD = 1000;
const STANDARD_DELIVERY_FEE = 100;

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart
}) {
  const { t } = useLanguage();

  // Load customer details from localStorage if previously entered
  const [customerDetails, setCustomerDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('bramarambika_customer_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          pincode: parsed.pincode || '',
          notes: parsed.notes || ''
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      name: '',
      phone: '',
      address: '',
      pincode: '',
      notes: ''
    };
  });

  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const pincodeInputRef = useRef(null);

  // Sync customer details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bramarambika_customer_details', JSON.stringify(customerDetails));
    } catch (e) {
      // safe fallback
    }
  }, [customerDetails]);

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

  // Pricing calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const price = item.unitPrice || item.price || item.pricePerKg || 0;
    return acc + (price * item.quantity);
  }, 0);

  const isFreeDelivery = itemsSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = cartItems.length === 0 ? 0 : (isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE);
  const grandTotal = itemsSubtotal + deliveryFee;
  const amountNeededForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - itemsSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((itemsSubtotal / FREE_DELIVERY_THRESHOLD) * 100));

  // 3 popular quick picks if cart is empty
  const quickPickItems = PRODUCTS.filter(p => ['arisalu', 'avakaya', 'chicken-pickle'].includes(p.id));

  // Validate required customer booking fields
  const validateFields = (details = customerDetails) => {
    const newErrors = {};

    if (!details.name || details.name.trim().length < 2) {
      newErrors.name = true;
    }

    const cleanPhone = (details.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.phone = true;
    }

    if (!details.address || details.address.trim().length < 5) {
      newErrors.address = true;
    }

    const cleanPincode = (details.pincode || '').replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      newErrors.pincode = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    const updated = { ...customerDetails, [field]: value };
    setCustomerDetails(updated);

    // Clear individual error in real-time when corrected
    if (formSubmitted && errors[field]) {
      const nextErrors = { ...errors };
      if (field === 'name' && value.trim().length >= 2) delete nextErrors.name;
      if (field === 'phone' && value.replace(/\D/g, '').length >= 10) delete nextErrors.phone;
      if (field === 'address' && value.trim().length >= 5) delete nextErrors.address;
      if (field === 'pincode' && value.replace(/\D/g, '').length === 6) delete nextErrors.pincode;
      setErrors(nextErrors);
    }
  };

  const handleWhatsAppCheckout = () => {
    setFormSubmitted(true);
    const isValid = validateFields();

    if (!isValid) {
      // Scroll to the customer details form on mobile and focus first invalid field
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (!customerDetails.name || customerDetails.name.trim().length < 2) {
        nameInputRef.current?.focus();
      } else if ((customerDetails.phone || '').replace(/\D/g, '').length < 10) {
        phoneInputRef.current?.focus();
      } else if (!customerDetails.address || customerDetails.address.trim().length < 5) {
        addressInputRef.current?.focus();
      } else if ((customerDetails.pincode || '').replace(/\D/g, '').length !== 6) {
        pincodeInputRef.current?.focus();
      }
      return;
    }

    try {
      confetti({
        particleCount: 75,
        spread: 65,
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
                <h2 className="drawer-title">{t('yourOrderCart')}</h2>
                {cartItems.length > 0 && (
                  <span className="drawer-items-count-badge">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {t('packSize') ? 'packs' : 'items'}
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
              {/* 1. Dynamic Free Delivery Slim Banner */}
              <div className={`modern-gamify-banner ${isFreeDelivery ? 'is-unlocked' : 'is-pending'}`}>
                <div className="modern-gamify-top">
                  <div className="modern-gamify-icon">
                    {isFreeDelivery ? (
                      <CheckCircle2 size={15} color="#059669" />
                    ) : (
                      <Truck size={15} color="var(--color-terracotta)" />
                    )}
                  </div>
                  <div className="modern-gamify-text">
                    {isFreeDelivery ? (
                      <span className="gamify-highlight unlocked">
                        {t('freeDeliveryUnlocked') || '🎉 FREE Delivery Unlocked! (Saved ₹100)'}
                      </span>
                    ) : (
                      <span className="gamify-highlight">
                        {t('addMoreForFreeDelivery')?.replace('{amount}', amountNeededForFree) ||
                          `Add ₹${amountNeededForFree} more for FREE Delivery!`}
                      </span>
                    )}
                  </div>
                </div>

                {!isFreeDelivery && (
                  <div className="modern-gamify-track">
                    <div
                      className="modern-gamify-fill"
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* 2. Cart Items Modern Card List */}
              <div className="modern-cart-section">
                <div className="modern-section-header">
                  <span className="modern-section-title">{t('yourOrderCart')}</span>
                  <span className="modern-count-pill">{cartItems.length} items</span>
                </div>

                <div className="modern-cart-items-list">
                  {cartItems.map((item) => {
                    const key = item.cartItemId || `${item.id}-${item.variantId || '500g'}`;
                    const itemPrice = item.unitPrice || item.price || item.pricePerKg || 0;
                    const lineTotal = itemPrice * item.quantity;
                    return (
                      <div key={key} className="modern-cart-item-card">
                        <img src={item.image} alt={item.name} className="modern-item-thumb" />

                        <div className="modern-item-main">
                          <h4 className="modern-item-name">{item.name}</h4>
                          <div className="modern-item-meta">
                            <span className="modern-item-badge">{item.variantLabel || '1/2 kg'}</span>
                            <span className="modern-item-rate">₹{itemPrice} {t('each')}</span>
                          </div>
                        </div>

                        <div className="modern-item-controls">
                          {/* Tactile Modern Stepper */}
                          <div className="modern-stepper">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(key, item.quantity - 1)}
                              className="modern-stepper-btn minus"
                              aria-label={`Decrease ${item.name}`}
                              title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                            >
                              {item.quantity === 1 ? <Trash2 size={12} color="#DC2626" /> : <Minus size={12} />}
                            </button>
                            <span className="modern-stepper-count">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(key, item.quantity + 1)}
                              className="modern-stepper-btn plus"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="modern-item-subtotal">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add more items shortcut */}
                <button
                  type="button"
                  onClick={handleBrowseMenu}
                  className="modern-add-more-link"
                >
                  <Plus size={14} />
                  <span>{t('viewAllSpecials') || 'Add more items from menu'}</span>
                </button>
              </div>

              {/* 3. Customer & Delivery Booking Form (Modern 2-Column Responsive Card) */}
              <div
                ref={formRef}
                className={`modern-delivery-card ${formSubmitted && Object.keys(errors).length > 0 ? 'has-errors' : ''}`}
              >
                <div className="modern-delivery-header">
                  <div className="delivery-header-left">
                    <MapPin size={16} className="pin-icon" />
                    <div>
                      <h3 className="delivery-card-title">{t('deliveryInfo')}</h3>
                      <p className="delivery-card-subtitle">{t('deliveryInfoSub')}</p>
                    </div>
                  </div>
                  <span className="required-flag">* {t('requiredField') || 'Required'}</span>
                </div>

                {formSubmitted && Object.keys(errors).length > 0 && (
                  <div className="modern-form-error-banner" role="alert">
                    <AlertCircle size={14} />
                    <span>{t('pleaseFillAllDetails') || 'Please fill in Name, Phone, Address & Pincode'}</span>
                  </div>
                )}

                <div className="modern-form-grid">
                  {/* Row 1: Name and Phone (2 columns) */}
                  <div className="form-grid-row two-col">
                    <div className={`modern-field-group ${errors.name ? 'field-has-error' : ''}`}>
                      <label htmlFor="customer-name" className="modern-field-label">
                        <span>{t('yourFullName')}</span>
                        <span className="req-star">*</span>
                      </label>
                      <div className="modern-input-box">
                        <User size={14} className="input-icon" />
                        <input
                          ref={nameInputRef}
                          id="customer-name"
                          type="text"
                          placeholder="e.g. Ramesh Reddy"
                          value={customerDetails.name}
                          onChange={e => handleInputChange('name', e.target.value)}
                          className="modern-input"
                          autoComplete="name"
                        />
                      </div>
                      {errors.name && (
                        <span className="modern-error-text">{t('fieldRequiredError')} (Min 2 chars)</span>
                      )}
                    </div>

                    <div className={`modern-field-group ${errors.phone ? 'field-has-error' : ''}`}>
                      <label htmlFor="customer-phone" className="modern-field-label">
                        <span>{t('phoneNumberLabel')}</span>
                        <span className="req-star">*</span>
                      </label>
                      <div className="modern-input-box phone-box">
                        <span className="phone-prefix-tag">+91</span>
                        <input
                          ref={phoneInputRef}
                          id="customer-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="10-digit Mobile"
                          value={customerDetails.phone}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            handleInputChange('phone', digits);
                          }}
                          className="modern-input phone-input"
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone && (
                        <span className="modern-error-text">Valid 10 digits required</span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Complete Address (Full width) */}
                  <div className={`modern-field-group full-width ${errors.address ? 'field-has-error' : ''}`}>
                    <label htmlFor="customer-address" className="modern-field-label">
                      <span>{t('deliveryCity')} (Door No, Street, City)</span>
                      <span className="req-star">*</span>
                    </label>
                    <div className="modern-input-box">
                      <MapPin size={14} className="input-icon" />
                      <input
                        ref={addressInputRef}
                        id="customer-address"
                        type="text"
                        placeholder="Flat/House No, Landmark, Area, City"
                        value={customerDetails.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                        className="modern-input"
                        autoComplete="street-address"
                      />
                    </div>
                    {errors.address && (
                      <span className="modern-error-text">Please enter complete delivery address</span>
                    )}
                  </div>

                  {/* Row 3: Pincode and Notes (2 columns) */}
                  <div className="form-grid-row two-col">
                    <div className={`modern-field-group ${errors.pincode ? 'field-has-error' : ''}`}>
                      <label htmlFor="customer-pincode" className="modern-field-label">
                        <span>{t('pincodeLabel')}</span>
                        <span className="req-star">*</span>
                      </label>
                      <div className="modern-input-box">
                        <Hash size={14} className="input-icon" />
                        <input
                          ref={pincodeInputRef}
                          id="customer-pincode"
                          type="tel"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6-digit Pincode"
                          value={customerDetails.pincode}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                            handleInputChange('pincode', digits);
                          }}
                          className="modern-input"
                          autoComplete="postal-code"
                        />
                      </div>
                      {errors.pincode && (
                        <span className="modern-error-text">Valid 6 digits required</span>
                      )}
                    </div>

                    <div className="modern-field-group">
                      <label htmlFor="customer-notes" className="modern-field-label">
                        <span>{t('specialRequest')}</span>
                        <span className="optional-tag">(optional)</span>
                      </label>
                      <div className="modern-input-box">
                        <FileText size={14} className="input-icon" />
                        <input
                          id="customer-notes"
                          type="text"
                          placeholder="e.g. Less spicy, extra crisp"
                          value={customerDetails.notes}
                          onChange={e => handleInputChange('notes', e.target.value)}
                          className="modern-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Order Bill Breakdown Card */}
              <div className="modern-bill-card">
                <div className="modern-bill-header">
                  <span className="bill-title-text">Order Bill Details</span>
                  <span className="bill-trust-tag">
                    <ShieldCheck size={12} color="var(--color-leaf-green)" />
                    <span>Pure & Authentic</span>
                  </span>
                </div>

                <div className="modern-bill-table">
                  <div className="bill-table-row">
                    <span className="table-row-label">{t('itemsSubtotal')}</span>
                    <span className="table-row-value">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bill-table-row">
                    <span className="table-row-label">{t('deliveryCharge')}</span>
                    {isFreeDelivery ? (
                      <div className="free-delivery-combo">
                        <s className="strike-amount">₹100</s>
                        <span className="free-badge-pill">{t('freeDeliveryBadge') || 'FREE'}</span>
                      </div>
                    ) : (
                      <span className="standard-deliv-badge">₹100</span>
                    )}
                  </div>

                  {isFreeDelivery && (
                    <div className="modern-savings-strip">
                      <Sparkles size={13} color="#059669" />
                      <span>You saved ₹100 on Delivery! 🎉</span>
                    </div>
                  )}

                  <div className="bill-table-row grand-total-row">
                    <div className="total-label-block">
                      <span className="total-title">{t('totalAmount')}</span>
                      <span className="total-tax-note">All taxes included</span>
                    </div>
                    <span className="total-amount-display">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 5. Trust Assurances */}
              <div className="modern-cart-assurances">
                <div className="assurance-item">
                  <ShieldCheck size={14} className="assurance-icon" />
                  <span>100% Traditional Telugu Taste • Brass Vessel Cooking</span>
                </div>
                <div className="assurance-item">
                  <Truck size={14} className="assurance-icon" />
                  <span>Fresh Batches Dispatched in 24h • Pay on Delivery or UPI</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Instant WhatsApp Action */}
        {cartItems.length > 0 && (
          <div className="drawer-footer modern-sticky-footer">
            <div className="sticky-footer-summary-row">
              <div className="sticky-total-info">
                <span className="sticky-total-label">Total to Pay</span>
                <span className="sticky-total-val">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="sticky-delivery-note">
                {isFreeDelivery ? (
                  <span className="tag-free-deliv">✓ Free Delivery</span>
                ) : (
                  <span className="tag-paid-deliv">Incl. ₹100 Delivery</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="btn-whatsapp-checkout modern-checkout-btn"
              id="cart-checkout-whatsapp-btn"
            >
              <MessageCircle size={19} />
              <div className="btn-checkout-content">
                <span className="btn-main-title">{t('bookOrderWhatsApp') || 'Book Order on WhatsApp'}</span>
                <span className="btn-sub-amount">• ₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <ArrowRight size={17} />
            </button>

            <div className="cart-phone-assist">
              <a href={`tel:${BRAND_INFO.phoneNumber}`} className="call-assist-link">
                <Phone size={13} />
                <span>{t('preferDirectCall')} {BRAND_INFO.phoneDisplay}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
