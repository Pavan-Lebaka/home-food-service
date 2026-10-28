import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchOrdersApi, updateOrderApi, deleteOrderApi, clearAllOrdersApi } from '../lib/api';
import { BRAND_INFO } from '../constants/brand';
import ProductManagement from './ProductManagement';
import {
  Package, ShoppingBag, Truck, CheckCircle2, Clock,
  Search, RefreshCw, LogOut, Phone, MessageCircle,
  Copy, ExternalLink, Calendar, MapPin, AlertCircle,
  User, Check, ChevronDown, Sparkles, UtensilsCrossed, Trash2,
  Eye, X, ShieldCheck
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout, onBackToStore }) {
  // Read initial tab from URL hash (#products or #orders) or localStorage
  const getInitialTab = () => {
    try {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'products' || hash === 'orders') return hash;
      const saved = localStorage.getItem('bramarambika_admin_active_tab');
      if (saved === 'products' || saved === 'orders') return saved;
    } catch (e) {}
    return 'orders';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState(null);

  // Persist status filter across page refresh
  const [statusFilter, setStatusFilter] = useState(() => {
    try {
      return sessionStorage.getItem('bramarambika_admin_status_filter') || 'All';
    } catch (e) {
      return 'All';
    }
  });

  // Persist search query across page refresh
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return sessionStorage.getItem('bramarambika_admin_search_query') || '';
    } catch (e) {
      return '';
    }
  });

  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // 1. Sync activeTab with URL hash and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bramarambika_admin_active_tab', activeTab);
      if (window.location.hash !== `#${activeTab}`) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
    } catch (e) {}
  }, [activeTab]);

  // 2. Listen to browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'products' || hash === 'orders') {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. Persist status filter & search query in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('bramarambika_admin_status_filter', statusFilter);
    } catch (e) {}
  }, [statusFilter]);

  useEffect(() => {
    try {
      sessionStorage.setItem('bramarambika_admin_search_query', searchQuery);
    } catch (e) {}
  }, [searchQuery]);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchOrdersApi(statusFilter, searchQuery);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setErrorMsg('Failed to fetch orders. Please check network connection.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadOrders();

    // Listen to real-time incoming orders via Supabase Realtime channel
    try {
      const channel = supabase
        .channel('admin-orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setOrders(prev => [payload.new, ...prev]);
              try {
                if (navigator.vibrate) navigator.vibrate(200);
              } catch (e) {}
            } else if (payload.eventType === 'UPDATE') {
              setOrders(prev =>
                prev.map(ord => ord.id === payload.new.id ? payload.new : ord)
              );
            } else if (payload.eventType === 'DELETE') {
              setOrders(prev => prev.filter(ord => ord.id === payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription skipped:', e);
    }
  }, [loadOrders]);

  // Manual status update handler
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderApi(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Payment status update handler (Paid / Pending toggle)
  const handlePaymentStatusToggle = async (orderId, currentPaymentStatus) => {
    const nextStatus = currentPaymentStatus === 'Paid' ? 'Pending' : 'Paid';
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderApi(orderId, { payment_status: nextStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated, payment_status: nextStatus } : o));
    } catch (err) {
      alert('Failed to update payment status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Delete individual order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId.slice(0, 8)}?`)) return;
    setUpdatingOrderId(orderId);
    try {
      await deleteOrderApi(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Clear all test orders
  const handleClearAllOrders = async () => {
    if (!window.confirm('Are you sure you want to clear all orders? This will permanently delete test orders.')) return;
    setLoading(true);
    try {
      await clearAllOrdersApi();
      setOrders([]);
    } catch (err) {
      alert('Failed to clear orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy customer address formatted cleanly for parcel sticker
  const handleCopyAddress = (order) => {
    const text = `Customer: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}\nPincode: ${order.pincode}\nItems: ${(order.items || []).map(i => `${i.name} (${i.variant || '1kg'}) x${i.quantity}`).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Quick WhatsApp message to customer
  const handleSendWhatsAppNotification = (order) => {
    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    let text = `Hello ${order.customer_name},\n\nGreetings from ${BRAND_INFO.name}! 🪔\n\n`;

    if (order.status === 'Delivered') {
      text += `Your parcel of authentic Andhra delicacies has been DELIVERED! 🪔✨\n\nWe hope you and your family enjoy the traditional homemade taste. Please share your review or feedback with us!\n\nDhanyavadalu! 🙏`;
    } else if (order.status === 'Preparing') {
      text += `Your order (#${order.order_number || order.id.slice(0, 8)}) is now being freshly PREPARED in our kitchen with cold-pressed oils. We will notify you once dispatched!\n\nDhanyavadalu! 🙏`;
    } else if (order.payment_status === 'Paid') {
      text += `We have verified your payment of ₹${order.grand_total}. Our kitchen has scheduled your fresh batch preparation!\n\nThank you! 🙏`;
    } else {
      text += `Namaste! We received your order (#${order.order_number || order.id.slice(0, 8)}) for:\n`;
      (order.items || []).forEach(i => {
        text += `• ${i.name} (${i.variant || '1kg'}) x${i.quantity}\n`;
      });
      text += `\nItems Total: ₹${order.subtotal || order.grand_total}\nDelivery: ${Number(order.delivery_fee) === 0 ? 'FREE' : `₹${order.delivery_fee || 99}`}\nTotal Amount: ₹${order.grand_total}\nUPI ID: ${BRAND_INFO.upiId || '7793910819@ybl'}\n\nPlease share your payment receipt here so we can start kitchen preparation right away! 🙏`;
    }

    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Filtered orders with backward-compatible status normalization
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== 'All') {
        const s = (order.status || '').toLowerCase();
        if (statusFilter === 'Order Placed' && !(s === 'order placed' || s === 'new')) return false;
        if (statusFilter === 'Preparing' && !(s.includes('preparing') || s.includes('kitchen') || s === 'packed' || s.includes('pickup'))) return false;
        if (statusFilter === 'Delivered' && !(s === 'delivered' || s === 'shipped')) return false;
        if (statusFilter === 'Cancelled' && s !== 'cancelled') return false;
      }

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
        (order.phone && order.phone.includes(q)) ||
        (order.pincode && order.pincode.includes(q)) ||
        (order.order_number && String(order.order_number).includes(q))
      );
    });
  }, [orders, statusFilter, searchQuery]);

  // Metrics: Orders Placed & Amount We Got
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalAmountGot = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
    const deliveredCount = orders.filter(o => {
      const s = (o.status || '').toLowerCase();
      return s === 'delivered' || s === 'shipped';
    }).length;
    const activeCount = orders.filter(o => {
      const s = (o.status || '').toLowerCase();
      return s !== 'delivered' && s !== 'shipped' && s !== 'cancelled';
    }).length;

    return { totalOrders, totalAmountGot, deliveredCount, activeCount };
  }, [orders]);

  return (
    <div className="admin-portal-container">
      {/* 1. Admin Navigation Bar */}
      <header className="admin-top-nav">
        <div className="admin-nav-inner">
          <div className="admin-brand-cluster">
            <span className="brand-diya">🪔</span>
            <div>
              <span className="brand-title">Bramarambika</span>
              <span className="brand-badge">KITCHEN ADMIN</span>
            </div>
          </div>

          <div className="admin-user-cluster">
            <span className="user-email-pill">
              <User size={13} />
              <span>{user?.email || 'Admin'}</span>
            </span>

            <button
              type="button"
              onClick={() => window.open(BRAND_INFO.storefrontUrl, '_blank')}
              className="admin-nav-btn secondary"
              title="Open Customer Storefront"
            >
              <ExternalLink size={15} />
              <span>View Storefront</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="admin-nav-btn danger"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main-body">
        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <Package size={17} />
            <span>Orders Placed ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            <UtensilsCrossed size={17} />
            <span>Product Catalog & Stock Management</span>
          </button>
        </div>

        {activeTab === 'products' ? (
          <ProductManagement />
        ) : (
          <>
            {/* 2. Top Metric Cards: Orders Placed & Amount We Got */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <div className="metric-icon-wrap amber">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="metric-label">Orders Placed</div>
                  <div className="metric-val">{stats.totalOrders}</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-icon-wrap green">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="metric-label">Amount We Got (Total)</div>
                  <div className="metric-val">₹{stats.totalAmountGot.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-icon-wrap blue">
                  <Truck size={22} />
                </div>
                <div>
                  <div className="metric-label">Delivered Orders</div>
                  <div className="metric-val">{stats.deliveredCount}</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-icon-wrap red">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="metric-label">In Progress / New</div>
                  <div className="metric-val">{stats.activeCount}</div>
                </div>
              </div>
            </div>

            {/* 3. Action Toolbar (Search & Manual Status Filters) */}
            <div className="admin-controls-card">
              <div className="admin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, pincode, or order #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="admin-filter-pills">
                {['All', 'Order Placed', 'Preparing', 'Delivered', 'Cancelled'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                  >
                    {status}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={loadOrders}
                  className="refresh-btn"
                  title="Refresh Orders"
                >
                  <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
                  <span>Refresh</span>
                </button>

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllOrders}
                    className="clear-orders-btn"
                    title="Clear all orders (removes test orders)"
                  >
                    <Trash2 size={13} />
                    <span>Clear Orders</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="admin-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 4. Orders List */}
            <div className="admin-orders-section">
              {loading && orders.length === 0 ? (
                <div className="admin-empty-state">
                  <RefreshCw size={28} className="spin-icon" color="var(--admin-primary)" />
                  <p>Loading orders placed...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="admin-empty-state">
                  <Package size={42} color="#D97706" />
                  <h3>No Orders Found</h3>
                  <p>
                    {orders.length === 0
                      ? 'No orders placed yet. Orders placed by customers on your store will appear here with customer details, items, amount received, and manual status controls.'
                      : 'No orders match your active search or filter.'}
                  </p>
                </div>
              ) : (
                <div className="admin-orders-list">
                  {filteredOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      updating={updatingOrderId === order.id}
                      copied={copiedOrderId === order.id}
                      onStatusChange={handleStatusChange}
                      onPaymentToggle={handlePaymentStatusToggle}
                      onCopyAddress={handleCopyAddress}
                      onWhatsAppNotify={handleSendWhatsAppNotification}
                      onDeleteOrder={handleDeleteOrder}
                      onPreviewScreenshot={setPreviewScreenshotUrl}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Payment Proof Receipt Modal */}
      {previewScreenshotUrl && (
        <div
          className="screenshot-modal-backdrop"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div
            className="screenshot-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="screenshot-modal-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#15803D" />
                <span>Customer UPI Payment Receipt Verification</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewScreenshotUrl(null)}
                className="btn-close-modal"
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="screenshot-modal-img-wrap">
              <img
                src={previewScreenshotUrl}
                alt="UPI Payment Proof Receipt"
                className="screenshot-modal-img"
              />
            </div>
            <div className="screenshot-modal-footer">
              <a
                href={previewScreenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-full"
              >
                Open Full Size in New Tab ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Individual Clean Order Card Component ─────────────────────────
function OrderCard({
  order,
  updating,
  copied,
  onStatusChange,
  onPaymentToggle,
  onCopyAddress,
  onWhatsAppNotify,
  onDeleteOrder,
  onPreviewScreenshot
}) {
  const [showDetails, setShowDetails] = useState(false);

  const formattedDate = useMemo(() => {
    try {
      return new Date(order.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return order.created_at;
    }
  }, [order.created_at]);

  // Normalized display status
  const displayStatus = useMemo(() => {
    const s = (order.status || '').toLowerCase();
    if (s === 'delivered' || s === 'shipped') return 'Delivered';
    if (s.includes('preparing') || s.includes('kitchen') || s === 'packed' || s.includes('pickup')) return 'Preparing';
    if (s === 'cancelled') return 'Cancelled';
    return 'Order Placed';
  }, [order.status]);

  const statusColorClass = useMemo(() => {
    switch (displayStatus) {
      case 'Order Placed': return 'status-badge new';
      case 'Preparing': return 'status-badge preparing';
      case 'Delivered': return 'status-badge delivered';
      case 'Cancelled': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  }, [displayStatus]);

  return (
    <article className="order-manage-card">
      {/* 1. Header: Order ID, Date, Status & Payment Pill */}
      <div className="order-card-header">
        <div className="order-header-left">
          <span className="order-id-badge">Order #{order.order_number || order.id.slice(0, 8)}</span>
          <span className="order-date-text">
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </span>
        </div>

        <div className="order-header-right">
          <span className={statusColorClass}>{displayStatus}</span>
          <button
            type="button"
            onClick={() => onPaymentToggle(order.id, order.payment_status)}
            className={`payment-pill ${order.payment_status === 'Paid' ? 'paid' : 'pending'}`}
            title="Click to toggle payment status"
          >
            {order.payment_status === 'Paid' ? '✓ Paid' : '⏳ Payment Pending'}
          </button>
        </div>
      </div>

      {/* 2. Main Order Details (Two-Column Layout) */}
      <div className="order-card-body">
        {/* Left Column: Customer & Delivery Info */}
        <div className="order-customer-pane">
          <div className="customer-info-row">
            <span className="customer-name-val">{order.customer_name}</span>
            <span className="customer-phone-pill">
              <Phone size={12} />
              <span>{order.phone}</span>
            </span>
          </div>

          <div className="customer-address-block">
            <MapPin size={14} className="address-pin-icon" />
            <div>
              <p className="address-text">{order.address}</p>
              <span className="pincode-highlight">Pincode: <strong>{order.pincode}</strong></span>
            </div>
          </div>

          {order.notes && (
            <div className="order-customer-note">
              <strong>Special Note:</strong> {order.notes}
            </div>
          )}

          {/* Payment Proof Screenshot Widget */}
          {order.payment_screenshot ? (
            <div className="payment-proof-widget">
              <div className="payment-proof-left">
                <img
                  src={order.payment_screenshot}
                  alt="UPI Proof"
                  className="payment-proof-thumb"
                  onClick={() => onPreviewScreenshot(order.payment_screenshot)}
                  title="Click to view full screenshot"
                />
                <div className="payment-proof-info">
                  <span className="payment-proof-label">📸 Payment Screenshot Attached</span>
                  <span className="payment-proof-sub">Uploaded by customer at checkout</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-view-proof"
                onClick={() => onPreviewScreenshot(order.payment_screenshot)}
              >
                <Eye size={12} style={{ marginRight: '4px', display: 'inline' }} />
                Inspect Proof
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#B45309', background: '#FFFBEB', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} />
              <span>No screenshot uploaded online. Confirm via customer's WhatsApp chat.</span>
            </div>
          )}

          {/* Quick Contact & Address Copy Pills */}
          <div className="customer-action-cluster">
            <a
              href={`tel:${order.phone}`}
              className="action-pill-btn call"
              title="Call customer directly"
            >
              <Phone size={13} />
              <span>Call</span>
            </a>

            <button
              type="button"
              onClick={() => onWhatsAppNotify(order)}
              className="action-pill-btn whatsapp"
              title="Open WhatsApp chat with prefilled message"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => onCopyAddress(order)}
              className={`action-pill-btn shiprocket ${copied ? 'copied' : ''}`}
              title="Copy customer delivery address"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied Address!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Ordered Items & Bill Breakdown ("Amount We Got") */}
        <div className="order-items-pane">
          <div className="items-title-bar">
            <span>Delicacies Ordered ({(order.items || []).length} items)</span>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="toggle-items-btn"
            >
              {showDetails ? 'Show Summary' : 'View All Items'}
            </button>
          </div>

          <div className={`items-list-container ${showDetails ? 'expanded' : ''}`}>
            {(order.items || []).map((item, idx) => {
              const unitPrice = Number(item.price ?? item.unitPrice ?? item.pricePerKg ?? 0);
              const qty = Number(item.quantity ?? 1);
              const total = Number(item.itemTotal ?? (unitPrice * qty));
              const displayTotal = isNaN(total) ? 0 : total;

              return (
                <div key={idx} className="order-item-row">
                  <div className="item-name-info">
                    <span className="item-title">{item.name}</span>
                    {item.variant && <span className="item-variant-tag">{item.variant}</span>}
                  </div>
                  <div className="item-calc">
                    <span className="item-qty">x{qty}</span>
                    <span className="item-total-price">₹{displayTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Breakdown: Amount We Got */}
          <div className="order-financial-strip">
            <div className="fin-row">
              <span>Items Subtotal:</span>
              <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="fin-row">
              <span>Delivery Fee:</span>
              <span>{Number(order.delivery_fee) === 0 ? 'FREE' : `₹${order.delivery_fee || 99}`}</span>
            </div>
            <div className="fin-row grand">
              <span>Amount We Got (Total):</span>
              <span className="grand-val">₹{Number(order.grand_total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card Footer: User Manually Entering / Selecting Order Status */}
      <div className="order-card-footer">
        <div className="status-change-block">
          <label htmlFor={`status-${order.id}`}>Status:</label>
          <select
            id={`status-${order.id}`}
            value={displayStatus}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            disabled={updating}
            className="status-select"
          >
            <option value="Order Placed">📦 Order Placed</option>
            <option value="Preparing">🥣 Preparing in Kitchen</option>
            <option value="Delivered">✅ Delivered</option>
            <option value="Cancelled">❌ Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {displayStatus !== 'Delivered' && (
            <button
              type="button"
              onClick={() => onStatusChange(order.id, 'Delivered')}
              disabled={updating}
              className="btn-primary-workflow"
              style={{ background: '#15803D', padding: '6px 12px', fontSize: '0.8rem' }}
              title="Mark order as delivered"
            >
              <CheckCircle2 size={14} />
              <span>Mark Delivered</span>
            </button>
          )}

          {displayStatus === 'Order Placed' && (
            <button
              type="button"
              onClick={() => onStatusChange(order.id, 'Preparing')}
              disabled={updating}
              className="btn-secondary-workflow"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Mark order as preparing in kitchen"
            >
              <span>Mark Preparing</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onWhatsAppNotify(order)}
            className="btn-secondary-workflow whatsapp"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            title="Send WhatsApp update to customer"
          >
            <MessageCircle size={14} />
            <span>WhatsApp Update</span>
          </button>

          {onDeleteOrder && (
            <button
              type="button"
              onClick={() => onDeleteOrder(order.id)}
              className="order-delete-btn"
              title="Delete this order"
              disabled={updating}
              style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
