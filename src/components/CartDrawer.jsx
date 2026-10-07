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
              {/* 1. Dynamic Delivery Charge & Free Delivery Gamification Bar */}
              <div className={`delivery-gamify-card ${isFreeDelivery ? 'unlocked' : 'pending'}`}>
                <div className="delivery-gamify-header">
                  <div className="gamify-icon-pill">
                    {isFreeDelivery ? (
                      <CheckCircle2 size={16} color="#059669" />
                    ) : (
                      <Truck size={16} color="var(--color-terracotta)" />
                    )}
                  </div>
                  <div className="gamify-text-wrap">
                    {isFreeDelivery ? (
                      <div className="gamify-title unlocked-text">
                        {t('freeDeliveryUnlocked') || '🎉 You unlocked FREE Delivery! (Saved ₹100)'}
                      </div>
                    ) : (
                      <div className="gamify-title">
                        {t('addMoreForFreeDelivery')?.replace('{amount}', amountNeededForFree) ||
                          `Add ₹${amountNeededForFree} more for FREE Delivery!`}
                      </div>
                    )}
                    <div className="gamify-subtext">
                      {isFreeDelivery
                        ? 'Applied on orders above ₹1,000'
                        : 'Free delivery above ₹1,000 • Flat ₹100 below ₹1,000'}
                    </div>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="gamify-progress-track">
                  <div
                    className={`gamify-progress-fill ${isFreeDelivery ? 'fill-complete' : ''}`}
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>

              {/* 2. Cart Items List */}
              <div className="cart-section-label">
                <span>{t('yourOrderCart')}</span>
                <span className="items-count-tag">{cartItems.length} items</span>
              </div>

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

              {/* 3. Customer & Delivery Details Section — Prominently Visible & Required */}
              <div
                ref={formRef}
                className={`cart-delivery-card ${formSubmitted && Object.keys(errors).length > 0 ? 'has-errors' : ''}`}
              >
                <div className="delivery-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="var(--color-terracotta)" />
                    <div>
                      <h3 className="delivery-card-title">{t('deliveryInfo')}</h3>
                      <p className="delivery-card-sub">{t('deliveryInfoSub')}</p>
                    </div>
                  </div>
                  <span className="required-badge">
                    * {t('requiredField') || 'Required'}
                  </span>
                </div>

                {/* Validation alert banner if submitted with missing fields */}
                {formSubmitted && Object.keys(errors).length > 0 && (
                  <div className="form-error-alert" role="alert">
                    <AlertCircle size={16} />
                    <span>{t('pleaseFillAllDetails')}</span>
                  </div>
                )}

                <div className="delivery-form-fields">
                  {/* Full Name Field */}
                  <div className={`form-field-row ${errors.name ? 'field-error' : ''}`}>
                    <label htmlFor="customer-name" className="field-label">
                      <span>{t('yourFullName')}</span>
                      <span className="star-required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <User size={16} className="field-icon" />
                      <input
                        ref={nameInputRef}
                        id="customer-name"
                        type="text"
                        placeholder="e.g. Ramesh Reddy"
                        value={customerDetails.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        className="cart-input-field"
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && (
                      <span className="field-error-msg">{t('fieldRequiredError')} (Min 2 letters)</span>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div className={`form-field-row ${errors.phone ? 'field-error' : ''}`}>
                    <label htmlFor="customer-phone" className="field-label">
                      <span>{t('phoneNumberLabel')}</span>
                      <span className="star-required">*</span>
                    </label>
                    <div className="input-with-icon phone-input-wrap">
                      <div className="phone-prefix">+91</div>
                      <input
                        ref={phoneInputRef}
                        id="customer-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit Mobile Number"
                        value={customerDetails.phone}
                        onChange={e => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange('phone', digitsOnly);
                        }}
                        className="cart-input-field"
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && (
                      <span className="field-error-msg">Please enter a valid 10-digit mobile number</span>
                    )}
                  </div>

                  {/* Complete Delivery Address Field */}
                  <div className={`form-field-row ${errors.address ? 'field-error' : ''}`}>
                    <label htmlFor="customer-address" className="field-label">
                      <span>{t('deliveryCity')}</span>
                      <span className="star-required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <MapPin size={16} className="field-icon textarea-icon" />
                      <textarea
                        ref={addressInputRef}
                        id="customer-address"
                        rows={2}
                        placeholder="House / Flat No, Street, Landmark, Area, City"
                        value={customerDetails.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                        className="cart-input-field cart-textarea-field"
                        autoComplete="street-address"
                      />
                    </div>
                    {errors.address && (
                      <span className="field-error-msg">Please enter your complete delivery address</span>
                    )}
                  </div>

                  {/* Pincode Field */}
                  <div className={`form-field-row ${errors.pincode ? 'field-error' : ''}`}>
                    <label htmlFor="customer-pincode" className="field-label">
                      <span>{t('pincodeLabel')}</span>
                      <span className="star-required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Hash size={16} className="field-icon" />
                      <input
                        ref={pincodeInputRef}
                        id="customer-pincode"
                        type="tel"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit Pincode (e.g. 500034)"
                        value={customerDetails.pincode}
                        onChange={e => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                          handleInputChange('pincode', digitsOnly);
                        }}
                        className="cart-input-field"
                        autoComplete="postal-code"
                      />
                    </div>
                    {errors.pincode && (
                      <span className="field-error-msg">Please enter a valid 6-digit postal pincode</span>
                    )}
                  </div>

                  {/* Special Cooking / Delivery Notes (Optional) */}
                  <div className="form-field-row">
                    <label htmlFor="customer-notes" className="field-label">
                      <span>{t('specialRequest')}</span>
                    </label>
                    <div className="input-with-icon">
                      <FileText size={16} className="field-icon" />
                      <input
                        id="customer-notes"
                        type="text"
                        placeholder="e.g. Less spicy, extra crisp, festive packing"
                        value={customerDetails.notes}
                        onChange={e => handleInputChange('notes', e.target.value)}
                        className="cart-input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Bill Details Breakdown Card */}
              <div className="cart-bill-summary-card">
                <div className="bill-card-title">Order Bill Details</div>
                <div className="bill-breakdown-list">
                  <div className="bill-row">
                    <span>{t('itemsSubtotal')}</span>
                    <span className="bill-val">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bill-row">
                    <span>{t('deliveryCharge')}</span>
                    {isFreeDelivery ? (
                      <div className="delivery-free-indicator">
                        <span className="original-strike">₹100</span>
                        <span className="free-badge">{t('freeDeliveryBadge') || 'FREE'}</span>
                      </div>
                    ) : (
                      <span className="delivery-badge-cost">₹100</span>
                    )}
                  </div>

                  {isFreeDelivery && (
                    <div className="bill-savings-banner">
                      <Sparkles size={14} color="#059669" />
                      <span>You saved ₹100 on Delivery! 🎉</span>
                    </div>
                  )}

                  <div className="bill-row grand-total">
                    <div className="total-label-wrap">
                      <span>{t('totalAmount')}</span>
                      <span className="tax-inclusive-tag">All taxes included</span>
                    </div>
                    <span className="total-num">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 5. Trust Assurances */}
              <div className="cart-trust-badges">
                <div className="cart-trust-item">
                  <ShieldCheck size={16} color="var(--color-leaf-green)" />
                  <span>100% Traditional Telugu Recipes • Brass Vessel Cooking</span>
                </div>
                <div className="cart-trust-item">
                  <Truck size={16} color="var(--color-terracotta)" />
                  <span>Fresh Batches Dispatched in 24 Hours in Leakproof Packaging</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Instant WhatsApp Action */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Quick Bill Row in Sticky Footer for glanceability */}
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
              className="btn-whatsapp-checkout"
              id="cart-checkout-whatsapp-btn"
            >
              <MessageCircle size={20} />
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
