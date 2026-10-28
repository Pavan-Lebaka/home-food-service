import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, MapPin, Phone, User,
  Truck, CheckCircle2, AlertCircle, Loader2, Copy, Check,
  Sparkles, CreditCard, ShoppingBag, Clock, FileText, ChevronRight, ChevronDown,
  Smartphone, UploadCloud, Camera, MessageCircle, PackageCheck, ShieldCheck, ShoppingCart
} from 'lucide-react';
import { BRAND_INFO } from '../data/products.js';
import { checkShiprocketRates, createOrderApi, uploadImageApi } from '../lib/api.js';
import {
  FREE_DELIVERY_THRESHOLD,
  DEFAULT_STANDARD_FEE,
  DEFAULT_COURIER,
  getLocalFallbackCouriers,
  calculateDeliveryFee,
  findBestCourier
} from '../lib/shipping.js';
import { getWhatsAppOrderUrl } from '../lib/whatsapp.js';
import confetti from 'canvas-confetti';
import './checkout.css';

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

  // Shipping & Courier state - initialized with valid courier so delivery charges always apply
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [shippingData, setShippingData] = useState(() => getLocalFallbackCouriers('521120'));
  const [selectedCourier, setSelectedCourier] = useState(DEFAULT_COURIER);
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
  const deliveryFee = calculateDeliveryFee(itemsSubtotal, selectedCourier?.rate ?? DEFAULT_STANDARD_FEE);
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

  // Live Shiprocket Pincode serviceability lookup & dynamic courier selection
  useEffect(() => {
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (cleanPin.length === 6) {
      setCheckingShipping(true);
      setShippingError('');
      checkShiprocketRates(cleanPin)
        .then((res) => {
          if (res && res.couriers && res.couriers.length > 0) {
            setShippingData(res);
            const best = findBestCourier(res.couriers, paymentMethod === 'cod');
            setSelectedCourier(best);
          } else {
            const fallback = getLocalFallbackCouriers(cleanPin);
            setShippingData(fallback);
            setSelectedCourier(findBestCourier(fallback.couriers, paymentMethod === 'cod'));
          }
        })
        .catch(() => {
          const fallback = getLocalFallbackCouriers(cleanPin);
          setShippingData(fallback);
          setSelectedCourier(findBestCourier(fallback.couriers, paymentMethod === 'cod'));
        })
        .finally(() => {
          setCheckingShipping(false);
        });
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
    navigator.clipboard.writeText(BRAND_INFO.upiId || '7793910819@ybl');
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
    if (!formData.city.trim()) newErrors.city = 'Please enter your city or town';
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
      setFormWarning('Please complete the required contact and delivery details above to continue.');
      return false;
    }

    setFormWarning('');
    return true;
  };

  // Submit Order to Backend
  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;
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
      items: cartItems.map(item => {
        const itemPrice = Number(item.price ?? item.unitPrice ?? item.pricePerKg ?? 0);
        const qty = Number(item.quantity ?? 1);
        return {
          id: item.id,
          name: item.name,
          teluguName: item.teluguName || '',
          variant: item.variantLabel || item.variant || '1kg',
          quantity: qty,
          price: itemPrice,
          unitPrice: itemPrice,
          itemTotal: itemPrice * qty,
          image: item.image
        };
      }),
      subtotal: itemsSubtotal,
      delivery_fee: deliveryFee ?? 0,
      grand_total: grandTotal,
      courier_name: selectedCourier?.name || null,
      estimated_delivery: selectedCourier?.estimatedDays || null,
      payment_method: 'WHATSAPP_UPI',
      payment_status: finalReceiptUrl ? 'Screenshot Submitted' : 'Verification Pending',
      payment_screenshot: finalReceiptUrl
    };

    try {
      const result = await createOrderApi(orderPayload);
      const placedOrder = result?.order || orderPayload;

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
        deliveryFee: placedOrder.delivery_fee ?? deliveryFee,
        paymentMethod: placedOrder.payment_method,
        notes: placedOrder.notes,
        paymentScreenshot: placedOrder.payment_screenshot || finalReceiptUrl
      });

      try {
        const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          // Fallback via anchor with target="_blank" so the current page is NEVER replaced
          const a = document.createElement('a');
          a.href = waUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err) {
        console.warn('Auto-open WhatsApp blocked; customer can use on-screen WhatsApp button:', err);
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
                <div className="checkout-brand-sub">Order request</div>
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
      deliveryFee: createdOrder.delivery_fee ?? deliveryFee,
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
            <h2 className="success-title">Order request saved</h2>
            <p style={{ color: '#4B5563', fontSize: '1rem', marginBottom: '1rem' }}>
              Thank you, <strong>{createdOrder.customer_name}</strong>. Your website request has been saved. Send it to the kitchen on WhatsApp to continue; the kitchen still needs to confirm your order.
            </p>

            {createdOrder.id && <div className="order-id-chip" style={{ background: '#FFF9F6', border: '1.5px dashed #8C2F1C', padding: '8px 16px', borderRadius: '10px', display: 'inline-block', marginBottom: '1.25rem' }}>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Website reference: </span>
              <strong style={{ color: '#8C2F1C', fontSize: '1.05rem', letterSpacing: '0.5px' }}>#{createdOrder.id}</strong>
            </div>}

            <div className="tracking-timeline request-next-steps">
              <div className="timeline-step completed"><div className="timeline-dot"><Check size={18} /></div><div className="timeline-label">Request saved</div><div className="timeline-sub">Website reference only</div></div>
              <div className="timeline-step active"><div className="timeline-dot"><MessageCircle size={18} /></div><div className="timeline-label">Send on WhatsApp</div><div className="timeline-sub">Kitchen confirmation is still needed</div></div>
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
              {createdOrder.courier_name && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Courier Partner:</span>
                <strong>{createdOrder.courier_name} ({createdOrder.estimated_delivery})</strong>
              </div>}
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

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Delivery Fee:</span>
                <strong style={Number(createdOrder.delivery_fee) === 0 ? { color: '#166534' } : {}}>
                  {Number(createdOrder.delivery_fee) === 0 ? 'FREE (Above ₹2,000) 🎉' : `₹${Number(createdOrder.delivery_fee).toLocaleString('en-IN')}`}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E5E7EB', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700 }}>Total Amount:</span>
                <strong style={{ color: '#8C2F1C' }}>₹{createdOrder.grand_total?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* WhatsApp Confirmation Box */}
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <span>💬 Continue your order on WhatsApp</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534', lineHeight: 1.45 }}>
                Click below, then send the prepared order request to <strong>{BRAND_INFO.whatsappNumber}</strong>. Opening WhatsApp alone does not place or confirm the order. The kitchen will confirm availability, payment and delivery details with you.
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
                <span>📲 Send Order Request to WhatsApp ({BRAND_INFO.whatsappNumber})</span>
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
              <div className="checkout-brand-sub">Review & send by WhatsApp</div>
            </div>
          </div>

          <div className="checkout-header-right">
            <div className="checkout-security-badge" title="Continue your order on WhatsApp">
              <MessageCircle size={15} />
              <span>Order request</span>
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
                <p>The kitchen can use these details to follow up about your request.</p>
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
                <p>Share your address so the kitchen can confirm delivery availability and details.</p>
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

              <div className={`form-field ${errors.city ? 'has-error' : ''}`}>
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
                {errors.city && <span className="form-error-text">{errors.city}</span>}
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

            {/* Courier Selection & Serviceability */}
            <div className="pincode-checker-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#8C2F1C" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>
                    Select Courier Delivery Partner
                  </span>
                </div>
                {isFreeDelivery ? (
                  <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
                    🎉 FREE Delivery Applied
                  </span>
                ) : (
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px' }}>
                    Orders above ₹2,000 ship FREE
                  </span>
                )}
              </div>

              {checkingShipping && (
                <div className="pincode-status-banner loading">
                  <Loader2 size={15} className="spin-icon" />
                  <span>Checking courier rates for pincode {formData.pincode}...</span>
                </div>
              )}

              {/* Courier Selection Cards */}
              <div className="couriers-selection-list">
                {(shippingData?.couriers || [DEFAULT_COURIER]).map((c) => {
                  const isSelected = (selectedCourier?.name === c.name) || (!selectedCourier && c.courierId === 1);
                  const effectiveRate = isFreeDelivery ? 0 : c.rate;
                  const isAir = c.name.toLowerCase().includes('air') || c.name.toLowerCase().includes('prime');
                  return (
                    <div
                      key={c.courierId || c.name}
                      onClick={() => setSelectedCourier(c)}
                      className={`courier-option-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="courier-card-top">
                        <span className="courier-name">{c.name}</span>
                        <span className={`courier-rate ${isFreeDelivery ? 'free-rate' : ''}`}>
                          {isFreeDelivery ? 'FREE 🎉' : `₹${effectiveRate}`}
                        </span>
                      </div>
                      <div className="courier-etd">
                        <Clock size={13} />
                        <span>Estimated: <strong>{c.estimatedDays || '1-2 Days'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span className="courier-speed-badge">
                          {isAir ? '⚡ Express Air' : '🚚 Surface Express'}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '0.72rem', color: '#8C2F1C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={12} /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isFreeDelivery && (
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#8C2F1C', fontWeight: 600 }}>
                  💡 Add ₹{(FREE_DELIVERY_THRESHOLD - itemsSubtotal).toLocaleString('en-IN')} more to your cart to get <strong>FREE Delivery</strong>!
                </div>
              )}
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
                <p>Review the amount and continue on WhatsApp. The kitchen will confirm payment and order details with you.</p>
              </div>
            </div>

            <div className="pay-card-body">
              {/* Part A: UPI Payment Section */}
              <div className="pay-flow-section">
                <div className="pay-section-header">
                  <Smartphone size={18} className="pay-section-icon" />
                  <span className="pay-section-heading">Make payment in any UPI app</span>
                </div>

                <div className="upi-pay-card">
                  {/* Amount highlight row */}
                  <div className="upi-amount-row">
                    <span className="upi-amount-label">
                      {isFreeDelivery ? 'Total amount (FREE Delivery applied)' : 'Total amount (including delivery)'}
                    </span>
                    <span className="upi-amount-value">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {/* UPI ID display & copy row */}
                  <div className="upi-address-box">
                    <div className="upi-address-info">
                      <span className="upi-address-label">Official Kitchen UPI ID</span>
                      <span className="upi-address-text">{BRAND_INFO.upiId || '7793910819@ybl'}</span>
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

                  <div className="upi-apps-launch-label">Tap to open UPI app on phone:</div>
                  <div className="upi-apps-grid">
                    <a
                      href={`upi://pay?pa=${BRAND_INFO.upiId || '7793910819@ybl'}&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link gpay-link"
                    >
                      <span className="upi-dot" style={{ background: '#4285F4' }} />
                      <span>Google Pay</span>
                    </a>
                    <a
                      href={`phonepe://pay?pa=${BRAND_INFO.upiId || '7793910819@ybl'}&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link phonepe-link"
                    >
                      <span className="upi-dot" style={{ background: '#5f259f' }} />
                      <span>PhonePe</span>
                    </a>
                    <a
                      href={`paytmmp://pay?pa=${BRAND_INFO.upiId || '7793910819@ybl'}&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
                      className="upi-app-link paytm-link"
                    >
                      <span className="upi-dot" style={{ background: '#00baf2' }} />
                      <span>Paytm</span>
                    </a>
                    <a
                      href={`upi://pay?pa=${BRAND_INFO.upiId || '7793910819@ybl'}&pn=Bramarambika+Foods&am=${grandTotal}&cu=INR&tn=Order+Delicacies`}
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
                <span>Delivery Fee ({selectedCourier?.name || 'Standard Courier'}):</span>
                <strong>
                  {isFreeDelivery ? (
                    <span style={{ color: '#166534' }}>FREE (Above ₹2,000) 🎉</span>
                  ) : (
                    `₹${deliveryFee.toLocaleString('en-IN')}`
                  )}
                </strong>
              </div>

              <div className="pricing-line total-line">
                <span>Total Amount:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              {!isFreeDelivery ? (
                <p className="checkout-delivery-note">
                  * Add ₹{(FREE_DELIVERY_THRESHOLD - itemsSubtotal).toLocaleString('en-IN')} more to unlock <strong>FREE Delivery</strong>.
                </p>
              ) : (
                <p className="checkout-delivery-note" style={{ color: '#166534', fontWeight: 600 }}>
                  ✓ FREE Delivery applied on this order.
                </p>
              )}
            </div>

            {/* Store navigation and ordering information */}
            <div className="summary-trust-grid">
              <div className="trust-badge-item">
                <PackageCheck size={14} className="trust-badge-icon" />
                <span>Product Details</span>
              </div>
              <div className="trust-badge-item">
                <ShieldCheck size={14} className="trust-badge-icon" />
                <span>Pack Options</span>
              </div>
              <div className="trust-badge-item">
                <ShoppingCart size={14} className="trust-badge-icon" />
                <span>Cart Summary</span>
              </div>
              <div className="trust-badge-item">
                <MessageCircle size={14} className="trust-badge-icon" />
                <span>WhatsApp Request</span>
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
                  <span>Saving request and opening WhatsApp...</span>
                </>
              ) : (
                <>
                  <span>Continue to WhatsApp order request</span>
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
