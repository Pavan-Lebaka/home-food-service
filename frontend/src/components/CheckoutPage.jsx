import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, ShieldCheck, MapPin, Phone, User,
  Truck, CheckCircle2, AlertCircle, Loader2, Copy, Check,
  Sparkles, CreditCard, ShoppingBag, Clock, FileText, ChevronRight, ChevronDown,
  Smartphone, UploadCloud, Camera
} from 'lucide-react';
import { BRAND_INFO } from '../data/products.js';
import { checkShiprocketRates, createOrderApi, uploadImageApi } from '../lib/api.js';
import { getWhatsAppOrderUrl } from '../lib/whatsapp.js';
import confetti from 'canvas-confetti';
import './checkout.css';

const FREE_DELIVERY_THRESHOLD = 2000;
const STANDARD_DELIVERY_FEE = 100;

// Smart scoring function to dynamically auto-select the best, cheapest, and fastest courier
function findBestCourier(couriers = [], isCod = false) {
  if (!couriers || couriers.length === 0) return null;

  let pool = couriers;
  if (isCod) {
    const codEligible = couriers.filter(c => c.isCodAvailable);
    if (codEligible.length > 0) pool = codEligible;
  }

  // Priority scoring:
  // 1. Delivery speed (Next day / 1-2 days)
  // 2. Cost / Reliability (lowest freight rate)
  const sorted = [...pool].sort((a, b) => {
    const getSpeedScore = (c) => {
      const str = (c.estimatedDays || '').toLowerCase();
      if (str.includes('next')) return 1;
      if (str.includes('1-2') || str.includes('1')) return 2;
      if (str.includes('2-3') || str.includes('2')) return 3;
      return 4;
    };
    const speedDiff = getSpeedScore(a) - getSpeedScore(b);
    if (speedDiff !== 0) return speedDiff;

    return (a.rate || 0) - (b.rate || 0);
  });

  return sorted[0];
}

export default function CheckoutPage({
  cartItems = [],
  onBackToStore,
  onClearCart
}) {
  // Start with clean empty customer details
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Andhra Pradesh',
    pincode: '',
    notes: ''
  });

  // Clear any legacy cached details from browser on load
  useEffect(() => {
    try {
      localStorage.removeItem('bramarambika_customer_details');
    } catch (e) { }
  }, []);

  // Shipping & Courier state
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [shippingData, setShippingData] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shippingError, setShippingError] = useState('');

  // Payment method: strictly WhatsApp
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [formWarning, setFormWarning] = useState('');

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG/JPG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPaymentScreenshot(reader.result);
    };
    reader.readAsDataURL(file);
  };

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

  // Flat standard delivery fee: Free above ₹2,000, flat ₹100 below ₹2,000
  const deliveryFee = useMemo(() => {
    return isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;
  }, [isFreeDelivery]);

  const grandTotal = itemsSubtotal + deliveryFee;

  // Clean navigation back to store
  const handleBackToStore = () => {
    setCreatedOrder(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: 'Andhra Pradesh',
      pincode: '',
      notes: ''
    });
    try {
      localStorage.removeItem('bramarambika_customer_details');
    } catch (e) { }
    onBackToStore && onBackToStore();
  };

  // Live Shiprocket Pincode serviceability lookup & dynamic best courier selection
  useEffect(() => {
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (cleanPin.length === 6) {
      setCheckingShipping(true);
      setShippingError('');
      checkShiprocketRates(cleanPin)
        .then((res) => {
          if (res && res.couriers && res.couriers.length > 0) {
            setShippingData(res);
            // DYNAMIC AUTO-SELECTION of the cheapest, fastest, best courier
            const best = findBestCourier(res.couriers, paymentMethod === 'cod');
            setSelectedCourier(best);
          } else {
            setShippingData(null);
            setSelectedCourier({
              name: 'Express Courier Network',
              estimatedDays: '1-2 Days',
              isCodAvailable: true
            });
          }
        })
        .catch(() => {
          setShippingData(null);
          setSelectedCourier({
            name: 'Standard Express Courier',
            estimatedDays: '2-3 Days',
            isCodAvailable: true
          });
        })
        .finally(() => {
          setCheckingShipping(false);
        });
    } else {
      setShippingData(null);
      setSelectedCourier(null);
      setShippingError('');
    }
  }, [formData.pincode, paymentMethod]);

  const handleInputChange = (field, val) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'pincode' && val.length === 6) {
        const p = val;
        if (p.startsWith('500') || p.startsWith('501') || p.startsWith('502')) {
          if (!prev.city) updated.city = 'Hyderabad';
          updated.state = 'Telangana';
        } else if (p.startsWith('520') || p.startsWith('521')) {
          if (!prev.city) updated.city = 'Vijayawada';
          updated.state = 'Andhra Pradesh';
        } else if (p.startsWith('530') || p.startsWith('531')) {
          if (!prev.city) updated.city = 'Visakhapatnam';
          updated.state = 'Andhra Pradesh';
        } else if (p.startsWith('522')) {
          if (!prev.city) updated.city = 'Guntur';
          updated.state = 'Andhra Pradesh';
        } else if (p.startsWith('518')) {
          if (!prev.city) updated.city = 'Kurnool';
          updated.state = 'Andhra Pradesh';
        } else if (p.startsWith('517')) {
          if (!prev.city) updated.city = 'Tirupati';
          updated.state = 'Andhra Pradesh';
        } else if (p.startsWith('560')) {
          if (!prev.city) updated.city = 'Bengaluru';
          updated.state = 'Karnataka';
        } else if (p.startsWith('600')) {
          if (!prev.city) updated.city = 'Chennai';
          updated.state = 'Tamil Nadu';
        }
      }
      return updated;
    });
    if (formWarning) setFormWarning('');
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(`${BRAND_INFO.whatsappNumber}@upi`);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2000);
  };

  // Validate form with auto-scroll to first invalid input
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name';
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) newErrors.phone = 'Please enter a valid 10-digit mobile number';
    if (!formData.address.trim()) newErrors.address = 'Please enter your delivery street address';
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code';

    setErrors(newErrors);
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      const targetEl = document.getElementById(`field-${firstField}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => targetEl.focus(), 300);
      }
      setFormWarning('⚠️ Please fill in your delivery details above (Name, Phone & Address) to place order.');
      return false;
    }

    setFormWarning('');
    return true;
  };

  // Submit Order to Backend
  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateForm()) return;
    if (cartItems.length === 0) return;

    setSubmitting(true);

    const fullAddress = `${formData.address.trim()}${formData.city ? `, ${formData.city.trim()}` : ''}${formData.state ? `, ${formData.state.trim()}` : ''}`;

    // 1. Upload screenshot to Cloudinary CDN if attached as base64
    let finalReceiptUrl = paymentScreenshot;
    if (paymentScreenshot && typeof paymentScreenshot === 'string' && paymentScreenshot.startsWith('data:image/')) {
      try {
        const uploaded = await uploadImageApi(paymentScreenshot, `receipt_${Date.now()}`);
        if (uploaded) {
          finalReceiptUrl = uploaded;
        }
      } catch (err) {
        console.warn('Screenshot upload skipped, backend will handle:', err);
      }
    }

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
      estimated_delivery: '3-5 Days (1-2d fresh prep + 2-3d transit)',
      payment_method: 'WHATSAPP_UPI',
      payment_status: finalReceiptUrl ? 'Screenshot Submitted' : 'Verification Pending',
      payment_screenshot: finalReceiptUrl
    };

    try {
      const result = await createOrderApi(orderPayload);
      const placedOrder = result?.order || {
        ...orderPayload,
        id: 'ORD-' + Date.now().toString(36).toUpperCase()
      };

      setCreatedOrder(placedOrder);
      onClearCart && onClearCart();

      // Automatically open pre-filled WhatsApp confirmation with screenshot link
      const waUrl = getWhatsAppOrderUrl(placedOrder.items || orderPayload.items || [], {
        orderId: placedOrder.id,
        name: placedOrder.customer_name,
        phone: placedOrder.phone,
        address: placedOrder.address,
        pincode: placedOrder.pincode,
        courierName: placedOrder.courier_name,
        estimatedDelivery: placedOrder.estimated_delivery,
        deliveryFee: placedOrder.delivery_fee,
        paymentMethod: placedOrder.payment_method,
        notes: placedOrder.notes,
        paymentScreenshot: placedOrder.payment_screenshot || finalReceiptUrl
      });

      try {
        const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          // If browser popup blocker intercepts, redirect directly in tab
          window.location.href = waUrl;
        }
      } catch (err) {
        window.location.href = waUrl;
      }

      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) { }
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
      orderId: createdOrder.id,
      name: createdOrder.customer_name,
      phone: createdOrder.phone,
      address: createdOrder.address,
      pincode: createdOrder.pincode,
      courierName: createdOrder.courier_name,
      estimatedDelivery: createdOrder.estimated_delivery,
      deliveryFee: createdOrder.delivery_fee,
      paymentMethod: createdOrder.payment_method,
      notes: createdOrder.notes
    });

    return (
      <div className="checkout-page-wrapper">
        <header className="checkout-header">
          <div className="checkout-header-inner">
            <div className="checkout-brand">
              <span className="checkout-brand-diya">🪔</span>
              <div>
                <div className="checkout-brand-title">Bramarambika Home Foods</div>
                <div className="checkout-brand-sub">Order Acknowledgment</div>
              </div>
            </div>
            <button type="button" onClick={handleBackToStore} className="checkout-back-link">
              <ArrowLeft size={16} />
              <span>Return to Store</span>
            </button>
          </div>
        </header>

        <div className="success-screen-wrapper">
          <div className="success-card">
            <div className="success-icon-wrap" style={{ background: '#DCFCE7', color: '#15803D' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 className="success-title">Order Received & Acknowledged!</h2>
            <p style={{ color: '#4B5563', fontSize: '1rem', marginBottom: '1rem' }}>
              Thank you, <strong>{createdOrder.customer_name}</strong>! Your order has been registered in our kitchen management system.
            </p>

            <div className="order-id-chip" style={{ background: '#FFF9F6', border: '1.5px dashed #8C2F1C', padding: '8px 16px', borderRadius: '10px', display: 'inline-block', marginBottom: '1.25rem' }}>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Official Kitchen Order ID: </span>
              <strong style={{ color: '#8C2F1C', fontSize: '1.05rem', letterSpacing: '0.5px' }}>#{createdOrder.id}</strong>
            </div>

            {/* Delivery Tracking Step Progress */}
            <div className="tracking-timeline">
              <div className="timeline-step completed">
                <div className="timeline-dot"><Check size={18} /></div>
                <div className="timeline-label">Registered</div>
                <div className="timeline-sub">Kitchen Database</div>
              </div>
              <div className="timeline-step active">
                <div className="timeline-dot"><Clock size={18} /></div>
                <div className="timeline-label">WhatsApp Notice</div>
                <div className="timeline-sub">Confirmation Sent</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-dot"><Truck size={18} /></div>
                <div className="timeline-label">{createdOrder.courier_name || 'Courier'}</div>
                <div className="timeline-sub">{createdOrder.estimated_delivery || '1-3 Days'}</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-dot"><MapPin size={18} /></div>
                <div className="timeline-label">Delivered</div>
                <div className="timeline-sub">Doorstep Delivery</div>
              </div>
            </div>

            {/* Order Receipt Card */}
            <div style={{ background: '#FAF5EE', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid rgba(217, 154, 23, 0.25)' }}>
              <h4 style={{ margin: '0 0 10px', color: '#8C2F1C', fontSize: '0.95rem', fontWeight: 800 }}>
                📋 Order Receipt Summary
              </h4>

              {/* Items Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
                {(createdOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#374151' }}>
                      {idx + 1}. {item.name} ({item.variant || '1kg'}) × {item.quantity}
                    </span>
                    <strong style={{ color: '#1F2937' }}>
                      ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Customer:</span>
                <strong>{createdOrder.customer_name} ({createdOrder.phone})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Delivery Address:</span>
                <span style={{ maxWidth: '65%', textAlign: 'right', color: '#374151' }}>
                  {createdOrder.address} - {createdOrder.pincode}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Courier Partner:</span>
                <strong>{createdOrder.courier_name} ({createdOrder.estimated_delivery})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Payment Mode:</span>
                <strong style={{ color: '#15803D' }}>{createdOrder.payment_method}</strong>
              </div>

              {createdOrder.payment_screenshot && (
                <div style={{ margin: '10px 0 6px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>📸 Payment Proof Attached</span>
                  <a
                    href={createdOrder.payment_screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    View Receipt
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E5E7EB', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700 }}>Total Amount:</span>
                <strong style={{ color: '#8C2F1C' }}>₹{createdOrder.grand_total?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* WhatsApp Confirmation Box */}
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <span>💬 WhatsApp Order Confirmation</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534', lineHeight: 1.45 }}>
                Click below to send your structured order confirmation to our WhatsApp kitchen number (<strong>{BRAND_INFO.whatsappNumber}</strong>). Our team will confirm the dispatch date!
              </p>
              {createdOrder.payment_screenshot && (
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
                  ✓ Your payment receipt link is included in the message. You can also send the photo file directly in the chat!
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-confirm"
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
                }}
              >
                <span>📲 Send Order Confirmation to Kitchen WhatsApp ({BRAND_INFO.whatsappNumber})</span>
              </a>

              <button
                type="button"
                onClick={handleBackToStore}
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
      {/* 1. Sleek Modern Header */}
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <div className="checkout-brand">
            <span className="checkout-brand-diya">🪔</span>
            <div className="checkout-brand-info">
              <div className="checkout-brand-title">Bramarambika Home Foods</div>
              <div className="checkout-brand-sub">Express Kitchen Checkout</div>
            </div>
          </div>

          <div className="checkout-header-right">
            <div className="checkout-security-badge" title="Verified Kitchen Order">
              <ShieldCheck size={15} />
              <span>Verified Order</span>
            </div>

            <button type="button" onClick={handleBackToStore} className="checkout-back-link" title="Return to store">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Sleek Non-Wrapping Stepper */}
      <div className="checkout-stepper">
        <div className="step-item completed">
          <div className="step-bubble"><Check size={13} /></div>
          <span>Cart</span>
        </div>
        <div className="step-divider completed" />
        <div className="step-item active">
          <div className="step-bubble">2</div>
          <span>Checkout</span>
        </div>
        <div className="step-divider" />
        <div className="step-item">
          <div className="step-bubble">3</div>
          <span>Confirmation</span>
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
              <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                <label>Full Name <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <User size={16} className="input-icon-left" />
                  <input
                    id="field-name"
                    type="text"
                    required
                    placeholder="e.g. Sravanthi Reddy"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                {errors.name && <span className="form-error-text">{errors.name}</span>}
              </div>

              <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
                <label>Mobile Number (WhatsApp Preferred) <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <Phone size={16} className="input-icon-left" />
                  <input
                    id="field-phone"
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
            </div>
          </div>

          {/* Card 2: Delivery Address */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="card-header-icon"><MapPin size={20} /></div>
              <div>
                <h3>2. Delivery Address</h3>
                <p>All items are freshly packed in food-grade sealed containers from our Andhra kitchen.</p>
              </div>
            </div>

            <div className="checkout-form-grid">
              <div className={`form-field form-full ${errors.address ? 'has-error' : ''}`}>
                <label>Flat / House No. & Street Address <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <MapPin size={16} className="input-icon-left" />
                  <input
                    id="field-address"
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
                  id="field-city"
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Vijayawada, Bangalore"
                  style={{ paddingLeft: '14px' }}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className={`form-field ${errors.pincode ? 'has-error' : ''}`}>
                <label>Pincode (6 Digits) <span className="required">*</span></label>
                <div className="form-input-wrap">
                  <input
                    id="field-pincode"
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

            {/* Fresh Kitchen Preparation & Delivery Timeline */}
            <div className="kitchen-timeline-box">
              <div className="timeline-header">
                <span className="timeline-diya">🪔</span>
                <div>
                  <h4>Cooked Fresh on Order — Authentic Telugu Kitchen</h4>
                  <p>We do not stock pre-made warehouse items. Delicacies are prepared fresh upon your order.</p>
                </div>
              </div>

              <div className="timeline-stages">
                <div className="stage-item">
                  <div className="stage-num">1</div>
                  <div className="stage-content">
                    <span className="stage-label">Fresh Cooking & Packaging</span>
                    <span className="stage-time">1 – 2 Business Days</span>
                  </div>
                </div>

                <div className="stage-arrow">→</div>

                <div className="stage-item">
                  <div className="stage-num">2</div>
                  <div className="stage-content">
                    <span className="stage-label">Kitchen Pickup & Dispatch</span>
                    <span className="stage-time">Delhivery / Blue Dart Express</span>
                  </div>
                </div>

                <div className="stage-arrow">→</div>

                <div className="stage-item">
                  <div className="stage-num">3</div>
                  <div className="stage-content">
                    <span className="stage-label">Doorstep Arrival</span>
                    <span className="stage-time">3 – 5 Days Total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Pay via UPI & Confirm Order */}
          <div className="checkout-card checkout-pay-card">
            <div className="checkout-card-header">
              <div className="card-header-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 style={{ color: '#166534' }}>3. Payment & Confirmation</h3>
                <p>Pay securely via UPI and confirm instantly on WhatsApp.</p>
              </div>
            </div>

            <div className="pay-card-body">
              {/* Part A: UPI Payment Section */}
              <div className="pay-flow-section">
                <div className="pay-section-header">
                  <Smartphone size={18} className="pay-section-icon" />
                  <span className="pay-section-heading">Make payment in any UPI app for this UPI ID</span>
                </div>

                <div className="upi-pay-card">
                  {/* Amount highlight row */}
                  <div className="upi-amount-row">
                    <span className="upi-amount-label">Payable Amount</span>
                    <span className="upi-amount-value">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* UPI ID display & copy row */}
                  <div className="upi-address-box">
                    <div className="upi-address-info">
                      <span className="upi-address-label">Official Kitchen UPI ID</span>
                      <span className="upi-address-text">{BRAND_INFO.whatsappNumber}@upi</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className={`btn-copy-upi ${isCopiedUpi ? 'copied' : ''}`}
                      title="Copy UPI ID"
                    >
                      {isCopiedUpi ? <Check size={15} /> : <Copy size={15} />}
                      <span>{isCopiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                    </button>
                  </div>

                  {/* Quick 1-Tap UPI Launch Buttons */}
                  <div className="upi-apps-launch-label">Tap to open UPI app on phone:</div>
                  <div className="upi-apps-grid">
                    <a
                      href={`upi://pay?pa=${BRAND_INFO.whatsappNumber}@upi&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link gpay-link"
                    >
                      <span className="upi-dot" style={{ background: '#4285F4' }} />
                      <span>Google Pay</span>
                    </a>
                    <a
                      href={`phonepe://pay?pa=${BRAND_INFO.whatsappNumber}@upi&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link phonepe-link"
                    >
                      <span className="upi-dot" style={{ background: '#5f259f' }} />
                      <span>PhonePe</span>
                    </a>
                    <a
                      href={`paytmmp://pay?pa=${BRAND_INFO.whatsappNumber}@upi&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link paytm-link"
                    >
                      <span className="upi-dot" style={{ background: '#00baf2' }} />
                      <span>Paytm</span>
                    </a>
                    <a
                      href={`upi://pay?pa=${BRAND_INFO.whatsappNumber}@upi&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link anyupi-link"
                    >
                      <span className="upi-dot" style={{ background: '#15803D' }} />
                      <span>Any UPI App</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Part B: Attach Payment Screenshot */}
              <div className="pay-flow-section">
                <div className="pay-section-header">
                  <Camera size={18} className="pay-section-icon" />
                  <span className="pay-section-heading">Attach Payment Screenshot</span>
                  <span className="optional-tag">Optional</span>
                </div>

                <label className="screenshot-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    style={{ display: 'none' }}
                  />
                  {paymentScreenshot ? (
                    <div className="screenshot-attached-state">
                      <img src={paymentScreenshot} alt="Payment Proof" className="screenshot-attached-thumb" />
                      <div className="screenshot-attached-details">
                        <div className="screenshot-attached-title">
                          <CheckCircle2 size={16} color="#15803D" />
                          <span>Payment Screenshot Attached</span>
                        </div>
                        <span className="screenshot-change-text">Tap to choose a different image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="screenshot-empty-state">
                      <div className="camera-icon-wrapper">
                        <UploadCloud size={22} color="#15803D" />
                      </div>
                      <div className="screenshot-empty-text">
                        <span className="primary-prompt">Tap to attach payment screenshot</span>
                        <span className="secondary-prompt">Select photo from gallery (or send in WhatsApp later)</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Kitchen Guarantee Info */}
              <div className="pay-flow-section pay-cta-section">
                <div className="kitchen-guarantee-note" style={{ margin: 0 }}>
                  <span className="note-emoji">💬</span>
                  <p>
                    Your order details, delivery address, and payment screenshot will be shared directly with our kitchen head on WhatsApp for prompt preparation & dispatch.
                  </p>
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
                      src={item.image || 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg'}
                      alt={item.name}
                      className="summary-item-img"
                      onError={(e) => {
                        e.target.src = 'https://res.cloudinary.com/z2iepqai/image/upload/v1792220635/bramarambika_foods/avakaya.jpg';
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

            {/* Validation Warning Notice if user clicks without filling address */}
            {formWarning && (
              <div className="checkout-form-warning-banner">
                <AlertCircle size={18} className="warning-icon-shake" />
                <span>{formWarning}</span>
              </div>
            )}

            {/* Single Primary Submit Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="btn-place-order"
              style={{ background: '#15803D' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Placing Order & Opening WhatsApp...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order on WhatsApp</span>
                  <span>(₹{grandTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>
              💬 Direct kitchen confirmation on +91 {BRAND_INFO.whatsappNumber}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
