import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, ShieldCheck, MapPin, Phone, User, Mail,
  Truck, CheckCircle2, AlertCircle, Loader2, Copy, Check,
  Sparkles, CreditCard, ShoppingBag, Clock, FileText, ChevronRight
} from 'lucide-react';
import { BRAND_INFO } from '../data/products.js';
import { checkShiprocketRates, createOrderApi } from '../lib/api.js';
import { getWhatsAppOrderUrl } from '../lib/whatsapp.js';
import confetti from 'canvas-confetti';
import './checkout.css';

const FREE_DELIVERY_THRESHOLD = 2000;
const STANDARD_DELIVERY_FEE = 100;

export default function CheckoutPage({
  cartItems = [],
  onBackToStore,
  onClearCart
}) {
  // Saved customer profile from localStorage
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('bramarambika_customer_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          address: parsed.address || '',
          city: parsed.city || '',
          state: parsed.state || 'Andhra Pradesh',
          pincode: parsed.pincode || '',
          notes: parsed.notes || ''
        };
      }
    } catch (e) {}
    return {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: 'Andhra Pradesh',
      pincode: '',
      notes: ''
    };
  });

  // Shipping & Courier state
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [shippingData, setShippingData] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shippingError, setShippingError] = useState('');

  // Payment method: 'upi' | 'cod' | 'whatsapp'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);

  // Form errors & submission
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Calculate pricing
  const itemsSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.price || item.unitPrice || item.pricePerKg || 0;
      return acc + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const isFreeDelivery = itemsSubtotal >= FREE_DELIVERY_THRESHOLD;

  // Courier delivery fee calculation
  const deliveryFee = useMemo(() => {
    if (isFreeDelivery) return 0;
    if (selectedCourier && typeof selectedCourier.rate === 'number') {
      return selectedCourier.rate;
    }
    return STANDARD_DELIVERY_FEE;
  }, [isFreeDelivery, selectedCourier]);

  const grandTotal = itemsSubtotal + deliveryFee;

  // Save form data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bramarambika_customer_details', JSON.stringify(formData));
    } catch (e) {}
  }, [formData]);

  // Live Shiprocket Pincode serviceability lookup
  useEffect(() => {
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (cleanPin.length === 6) {
      setCheckingShipping(true);
      setShippingError('');
      checkShiprocketRates(cleanPin)
        .then((res) => {
          if (res && res.couriers && res.couriers.length > 0) {
            setShippingData(res);
            setSelectedCourier(res.couriers[0]); // default to first available courier
          } else {
            setShippingData(null);
            setSelectedCourier(null);
            setShippingError('Courier service is available via standard India Post & Surface Express.');
          }
        })
        .catch(() => {
          setShippingData(null);
          setSelectedCourier(null);
        })
        .finally(() => {
          setCheckingShipping(false);
        });
    } else {
      setShippingData(null);
      setSelectedCourier(null);
      setShippingError('');
    }
  }, [formData.pincode]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('7702808886@upi');
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2000);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name';
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) newErrors.phone = 'Please enter a valid 10-digit mobile number';
    if (!formData.address.trim()) newErrors.address = 'Please enter your delivery street address';
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Order to Backend
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cartItems.length === 0) return;

    setSubmitting(true);

    const fullAddress = `${formData.address.trim()}${formData.city ? `, ${formData.city.trim()}` : ''}${formData.state ? `, ${formData.state.trim()}` : ''}`;

    const orderPayload = {
      customer_name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: fullAddress,
      pincode: formData.pincode.trim(),
      notes: formData.notes.trim(),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        teluguName: item.teluguName || '',
        variant: item.variantLabel || '1kg',
        quantity: item.quantity,
        price: item.price || item.unitPrice || item.pricePerKg,
        image: item.image
      })),
      subtotal: itemsSubtotal,
      delivery_fee: deliveryFee,
      grand_total: grandTotal,
      courier_name: selectedCourier ? selectedCourier.name : 'Standard Express Delivery',
      estimated_delivery: selectedCourier ? selectedCourier.estimatedDays : '2-4 Days',
      payment_method: paymentMethod.toUpperCase(),
      payment_status: paymentMethod === 'upi' ? 'Verification Pending' : 'Pending'
    };

    try {
      const result = await createOrderApi(orderPayload);
      const placedOrder = result?.order || {
        ...orderPayload,
        id: 'ORD-' + Date.now().toString(36).toUpperCase()
      };

      setCreatedOrder(placedOrder);
      onClearCart && onClearCart();

      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    } catch (err) {
      alert('Order could not be saved to backend. Please check network connection: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW: EMPTY CART STATE
  // -------------------------------------------------------------
  if (cartItems.length === 0 && !createdOrder) {
    return (
      <div className="checkout-page-wrapper">
        <header className="checkout-header">
          <div className="checkout-header-inner">
            <div className="checkout-brand">
              <span className="checkout-brand-diya">🪔</span>
              <div>
                <div className="checkout-brand-title">Bramarambika Home Foods</div>
                <div className="checkout-brand-sub">Secure Kitchen Checkout</div>
              </div>
            </div>
            <button type="button" onClick={onBackToStore} className="checkout-back-link">
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </button>
          </div>
        </header>

        <div className="success-screen-wrapper">
          <div className="success-card">
            <div className="success-icon-wrap" style={{ background: '#FFF1E8', color: '#8C2F1C' }}>
              <ShoppingBag size={36} />
            </div>
            <h2 className="success-title">Your Cart is Currently Empty</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              Add some of our freshly made Andhra pickles, arisalu, or crispy savouries to proceed with checkout.
            </p>
            <button type="button" onClick={onBackToStore} className="btn-place-order" style={{ maxWidth: '300px', margin: '0 auto' }}>
              <span>Browse Authentic Specials</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ORDER SUCCESS / CONFIRMATION SCREEN
  // -------------------------------------------------------------
  if (createdOrder) {
    const whatsappOrderUrl = getWhatsAppOrderUrl(createdOrder.items || [], {
      name: createdOrder.customer_name,
      phone: createdOrder.phone,
      address: createdOrder.address,
      pincode: createdOrder.pincode,
      notes: `Order ID: ${createdOrder.id} • Courier: ${createdOrder.courier_name} (${createdOrder.estimated_delivery}) • Payment: ${createdOrder.payment_method}`
    });

    return (
      <div className="checkout-page-wrapper">
        <header className="checkout-header">
          <div className="checkout-header-inner">
            <div className="checkout-brand">
              <span className="checkout-brand-diya">🪔</span>
              <div>
                <div className="checkout-brand-title">Bramarambika Home Foods</div>
                <div className="checkout-brand-sub">Order Confirmed</div>
              </div>
            </div>
            <button type="button" onClick={onBackToStore} className="checkout-back-link">
              <ArrowLeft size={16} />
              <span>Return to Store</span>
            </button>
          </div>
        </header>

        <div className="success-screen-wrapper">
          <div className="success-card">
            <div className="success-icon-wrap">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="success-title">Thank You, {createdOrder.customer_name}!</h2>
            <p style={{ color: '#4B5563', fontSize: '1rem', marginBottom: '1rem' }}>
              Your order has been received by our kitchen and recorded in our live database.
            </p>

            <div className="order-id-chip">
              <span>Order ID:</span>
              <strong style={{ color: '#8C2F1C' }}>#{createdOrder.id}</strong>
            </div>

            {/* Delivery Tracking Step Progress */}
            <div className="tracking-timeline">
              <div className="timeline-step completed">
                <div className="timeline-dot"><Check size={18} /></div>
                <div className="timeline-label">Confirmed</div>
                <div className="timeline-sub">Kitchen Received</div>
              </div>
              <div className="timeline-step active">
                <div className="timeline-dot"><Clock size={18} /></div>
                <div className="timeline-label">Packing Fresh</div>
                <div className="timeline-sub">Sealed Jars</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-dot"><Truck size={18} /></div>
                <div className="timeline-label">{createdOrder.courier_name || 'Courier'}</div>
                <div className="timeline-sub">{createdOrder.estimated_delivery || '1-3 Days'}</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-dot"><MapPin size={18} /></div>
                <div className="timeline-label">Delivered</div>
                <div className="timeline-sub">At Doorstep</div>
              </div>
            </div>

            {/* Order Highlights Card */}
            <div style={{ background: '#FAF5EE', borderRadius: '12px', padding: '1rem 1.25rem', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid rgba(217, 154, 23, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>Delivery To:</span>
                <strong>{createdOrder.customer_name} ({createdOrder.phone})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>Address:</span>
                <span style={{ maxWidth: '60%', textAlign: 'right' }}>{createdOrder.address} - {createdOrder.pincode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#6B7280' }}>Selected Courier:</span>
                <strong>{createdOrder.courier_name} ({createdOrder.estimated_delivery})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E5E7EB', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700 }}>Total Paid / Payable:</span>
                <strong style={{ color: '#8C2F1C' }}>₹{createdOrder.grand_total?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="success-actions">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-confirm"
              >
                <span>💬 Chat on WhatsApp with Kitchen</span>
              </a>

              <button
                type="button"
                onClick={onBackToStore}
                className="btn-return-home"
              >
                <span>Continue Shopping at Bramarambika</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: MAIN CHECKOUT FORM
  // -------------------------------------------------------------
  return (
    <div className="checkout-page-wrapper">
      {/* 1. Header */}
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <div className="checkout-brand">
            <span className="checkout-brand-diya">🪔</span>
            <div>
              <div className="checkout-brand-title">Bramarambika Home Foods</div>
              <div className="checkout-brand-sub">Express Kitchen Checkout</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="checkout-security-badge">
              <ShieldCheck size={16} />
              <span>Verified Kitchen Order</span>
            </div>

            <button type="button" onClick={onBackToStore} className="checkout-back-link">
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Stepper Indicator */}
      <div className="checkout-stepper">
        <div className="step-item completed">
          <div className="step-bubble"><Check size={14} /></div>
          <span>1. Cart</span>
        </div>
        <div className="step-divider" style={{ background: '#15803D' }} />
        <div className="step-item active">
          <div className="step-bubble">2</div>
          <span>2. Delivery & Courier</span>
        </div>
        <div className="step-divider" />
        <div className="step-item">
          <div className="step-bubble">3</div>
          <span>3. Confirmation</span>
        </div>
      </div>

      {/* 3. Main Form Grid */}
      <main className="checkout-container">
        {/* Left Column: Form Details */}
        <form onSubmit={handlePlaceOrder} className="checkout-form-col">
          {/* Card 1: Contact Information */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="card-header-icon"><User size={20} /></div>
              <div>
                <h3>1. Customer Details</h3>
                <p>We need your contact information to send tracking updates & invoice.</p>
              </div>
            </div>

            <div className="checkout-form-grid">
              <div className="form-field">
                <label>Full Name <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <User size={16} className="input-icon-left" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sravanthi Reddy"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                {errors.name && <span className="form-error-text">{errors.name}</span>}
              </div>

              <div className="form-field">
                <label>Mobile Number (WhatsApp Preferred) <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <Phone size={16} className="input-icon-left" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                {errors.phone && <span className="form-error-text">{errors.phone}</span>}
              </div>

              <div className="form-field form-full">
                <label>Email Address (Optional)</label>
                <div className="form-input-wrap">
                  <Mail size={16} className="input-icon-left" />
                  <input
                    type="email"
                    placeholder="e.g. sravanthi@gmail.com (for order receipt)"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Delivery Address & Shiprocket Pincode Engine */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="card-header-icon"><MapPin size={20} /></div>
              <div>
                <h3>2. Delivery Address & Courier Partner</h3>
                <p>All items are freshly packed in food-grade sealed containers from our Andhra kitchen.</p>
              </div>
            </div>

            <div className="checkout-form-grid">
              <div className="form-field form-full">
                <label>Flat / House No. & Street Address <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <MapPin size={16} className="input-icon-left" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Sri Lakshmi Nilayam, 5th Cross"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                {errors.address && <span className="form-error-text">{errors.address}</span>}
              </div>

              <div className="form-field">
                <label>City / Town <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Vijayawada, Bangalore"
                  style={{ paddingLeft: '14px' }}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Pincode (6 Digits) <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 500081"
                    style={{ paddingLeft: '14px' }}
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                {errors.pincode && <span className="form-error-text">{errors.pincode}</span>}
              </div>
            </div>

            {/* Live Shiprocket Serviceability Box */}
            <div className="pincode-checker-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="#8C2F1C" />
                  <span>Shiprocket Courier Integration</span>
                </span>
                {checkingShipping && (
                  <span style={{ fontSize: '0.78rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Loader2 size={13} className="spin-icon" />
                    <span>Checking live rates...</span>
                  </span>
                )}
              </div>

              {shippingData && shippingData.couriers && (
                <div>
                  <div className="pincode-status-banner success">
                    <CheckCircle2 size={16} />
                    <span>Available couriers to {formData.pincode} (Origin: Andhra Kitchen {shippingData.pickupPincode})</span>
                  </div>

                  <div className="couriers-selection-list">
                    {shippingData.couriers.map((c) => {
                      const isSelected = selectedCourier?.name === c.name;
                      return (
                        <div
                          key={c.courierId || c.name}
                          onClick={() => setSelectedCourier(c)}
                          className={`courier-option-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="courier-card-top">
                            <span className="courier-name">{c.name}</span>
                            <span className={`courier-rate ${isFreeDelivery ? 'free-rate' : ''}`}>
                              {isFreeDelivery ? 'FREE' : `₹${c.rate}`}
                            </span>
                          </div>
                          <div className="courier-etd">
                            <Clock size={13} />
                            <span>Estimated: <strong>{c.estimatedDays || '1-2 Days'}</strong></span>
                          </div>
                          {c.isCodAvailable && (
                            <span className="courier-badge">COD Eligible</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!shippingData && !checkingShipping && formData.pincode.length === 6 && (
                <div className="pincode-status-banner success">
                  <CheckCircle2 size={16} />
                  <span>Standard Express Delivery available to pincode {formData.pincode} (2–4 business days).</span>
                </div>
              )}

              {formData.pincode.length < 6 && (
                <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '8px 0 0' }}>
                  💡 Enter your 6-digit delivery pincode to check real-time courier partners (Delhivery, BlueDart, DTDC).
                </p>
              )}
            </div>

            {/* Special Instructions */}
            <div className="form-field" style={{ marginTop: '1rem' }}>
              <label>Special Instructions / Kitchen Request (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Please wrap extra carefully for international luggage, or less spicy if possible..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>

          {/* Card 3: Payment Method */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="card-header-icon"><CreditCard size={20} /></div>
              <div>
                <h3>3. Select Payment Method</h3>
                <p>Choose your preferred payment method. Direct UPI receives priority dispatch.</p>
              </div>
            </div>

            <div className="payment-methods-grid">
              {/* Option 1: Direct UPI */}
              <div
                className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <input
                  type="radio"
                  name="payment_choice"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="payment-radio"
                />
                <div className="payment-info" style={{ width: '100%' }}>
                  <h4>
                    <span>⚡ Instant UPI / QR Code (GPay, PhonePe, Paytm, BHIM)</span>
                    <span className="payment-badge">Recommended</span>
                  </h4>
                  <p>Scan the kitchen QR code or send payment to our verified kitchen UPI ID.</p>

                  {paymentMethod === 'upi' && (
                    <div className="upi-pay-card">
                      <div className="upi-qr-placeholder">
                        <span>BHIM UPI</span>
                        <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>📲</span>
                        <span style={{ fontSize: '0.62rem', color: '#166534' }}>Instant Pay</span>
                      </div>
                      <div className="upi-details-wrap">
                        <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Bramarambika Kitchen Official UPI ID:</div>
                        <div className="upi-id-badge">
                          <span>7702808886@upi</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCopyUpi(); }}
                            className="copy-upi-btn"
                            title="Copy UPI ID"
                          >
                            {isCopiedUpi ? <Check size={16} color="#15803D" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '4px', fontWeight: 600 }}>
                          {isCopiedUpi ? '✅ Copied to clipboard!' : 'Pay with Google Pay, PhonePe, Paytm or Cred'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <input
                  type="radio"
                  name="payment_choice"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="payment-radio"
                />
                <div className="payment-info">
                  <h4>📦 Cash on Delivery (COD)</h4>
                  <p>Pay cash or UPI directly to the courier executive upon doorstep parcel arrival.</p>
                </div>
              </div>

              {/* Option 3: WhatsApp Direct Order */}
              <div
                className={`payment-option ${paymentMethod === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('whatsapp')}
              >
                <input
                  type="radio"
                  name="payment_choice"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                  className="payment-radio"
                />
                <div className="payment-info">
                  <h4>💬 WhatsApp Kitchen Checkout</h4>
                  <p>Place your order directly via WhatsApp with our head cook for personalized assistance.</p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column: Sticky Order Summary */}
        <aside className="checkout-summary-col">
          <div className="summary-card">
            <div className="summary-title">
              <span>Order Summary</span>
              <span className="summary-count-badge">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="summary-items-list">
              {cartItems.map((item, idx) => {
                const itemPrice = item.price || item.unitPrice || item.pricePerKg || 0;
                return (
                  <div key={`${item.id}-${item.variantId || idx}`} className="summary-item">
                    <img
                      src={item.image || '/images/default-dish.jpg'}
                      alt={item.name}
                      className="summary-item-img"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100';
                      }}
                    />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.name}</div>
                      <div className="summary-item-variant">
                        <span>{item.variantLabel || '1 kg'}</span> • <span className="summary-item-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="summary-item-price">
                      ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="summary-pricing">
              <div className="pricing-line">
                <span>Items Subtotal:</span>
                <strong>₹{itemsSubtotal.toLocaleString('en-IN')}</strong>
              </div>

              <div className="pricing-line">
                <span>
                  Courier Delivery
                  {selectedCourier ? ` (${selectedCourier.name})` : ''}:
                </span>
                {isFreeDelivery ? (
                  <strong style={{ color: '#166534' }}>FREE (Above ₹2,000) 🎉</strong>
                ) : (
                  <strong>₹{deliveryFee}</strong>
                )}
              </div>

              <div className="pricing-line">
                <span>Food-Grade Seal Packing:</span>
                <strong style={{ color: '#166534' }}>FREE</strong>
              </div>

              <div className="pricing-line total-line">
                <span>Total Amount:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quality & Trust Badges */}
            <div className="summary-trust-grid">
              <div className="trust-badge-item">
                <span>🏺</span>
                <span>Claypot Prepared</span>
              </div>
              <div className="trust-badge-item">
                <span>🌿</span>
                <span>Cold-Pressed Oil</span>
              </div>
              <div className="trust-badge-item">
                <span>📦</span>
                <span>Leakproof Jars</span>
              </div>
              <div className="trust-badge-item">
                <span>🚚</span>
                <span>All India Express</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="btn-place-order"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Confirming Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <span>(₹{grandTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.74rem', color: '#6B7280' }}>
              🔒 Guaranteed Authentic Telugu Homemade Delicacies
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
