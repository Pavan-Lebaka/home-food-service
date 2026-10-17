import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchOrdersApi, updateOrderApi, createShipmentApi, deleteOrderApi, clearAllOrdersApi } from '../lib/api';
import { BRAND_INFO } from '../constants/brand';
import ProductManagement from './ProductManagement';
import {
  Package, ShoppingBag, Truck, CheckCircle2, Clock,
  Search, RefreshCw, LogOut, Phone, MessageCircle,
  Copy, ExternalLink, Calendar, MapPin, AlertCircle,
  User, Check, ChevronDown, Sparkles, UtensilsCrossed, Trash2
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

  // 1. Sync activeTab with URL hash and localStorage so refresh never loses the active tab!
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
      setErrorMsg('Failed to fetch orders. Please check your network or backend server.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadOrders();

    // Listen to real-time incoming orders via Supabase Realtime channel if available
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

  // Status update handler
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderApi(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Payment status update handler
  const handlePaymentStatusToggle = async (orderId, currentPaymentStatus) => {
    const nextStatus = currentPaymentStatus === 'Paid' ? 'Pending' : 'Paid';
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderApi(orderId, { payment_status: nextStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
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
    if (!window.confirm('Are you sure you want to clear all orders? This will remove all test orders permanently.')) return;
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

  // Save Tracking / Courier details
  const handleSaveTracking = async (orderId, courierName, trackingNumber) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderApi(orderId, {
        courier_name: courierName,
        tracking_number: trackingNumber,
        status: 'Dispatched'
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    } catch (err) {
      alert('Failed to save tracking: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Copy full customer address formatted for Shiprocket
  const handleCopyShiprocketAddress = (order) => {
    const text = `Name: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}\nPincode: ${order.pincode}\nItems: ${(order.items || []).map(i => `${i.name} (${i.variant}) x${i.quantity}`).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // 1-Click Shiprocket Courier Shipment Booking
  const handleBookShiprocket = async (order) => {
    setUpdatingOrderId(order.id);
    try {
      const res = await createShipmentApi(order);
      const awb = res.data?.awbCode || res.data?.shipment?.awbCode || res.awbCode || res.data?.awb_code;
      const courier = res.data?.courierName || res.data?.shipment?.courierName || 'Delhivery Surface';

      setOrders(prev => prev.map(o => o.id === order.id ? {
        ...o,
        status: 'Shipped',
        tracking_number: awb || o.tracking_number,
        courier_name: courier
      } : o));

      alert(`🎉 Shiprocket Courier Scheduled Successfully!\n\nCourier: ${courier}\nAWB Tracking Code: ${awb || 'Assigned'}\nOrder status updated to 'Shipped'.`);
    } catch (err) {
      alert('Failed to book with Shiprocket: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Generate WhatsApp message to notify customer
  const handleSendWhatsAppNotification = (order) => {
    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    let text = `Hello ${order.customer_name},\n\nGreetings from ${BRAND_INFO.name}! 🪔\n\n`;

    if (order.status === 'Shipped') {
      text += `Your parcel has been DISPATCHED from our Andhra kitchen via ${order.courier_name || 'Express Courier'}.\n`;
      if (order.tracking_number) {
        text += `Tracking Number / AWB: ${order.tracking_number}\n`;
      }
      text += `Estimated doorstep arrival: 2–3 business days.\n\nThank you for choosing Bramarambika Home Foods! ❤️`;
    } else if (order.status === 'Preparing in Kitchen') {
      text += `Your delicacies are now being prepared fresh in our kitchen with cold-pressed oils and traditional recipes. We will seal and dispatch within 24–48 hours!\n\nDhanyavadalu! 🙏`;
    } else if (order.status === 'Ready for Pickup') {
      text += `Your order has been freshly packed with 5-layer leak-proof seal and is ready for courier pickup. It will be dispatched today!\n\nThank you! ❤️`;
    } else if (order.payment_status === 'Paid') {
      text += `We have received your payment of ₹${order.grand_total}. Our kitchen has scheduled your fresh batch preparation.\n\nThank you! 🙏`;
    } else {
      text += `We have received your order request for:\n`;
      (order.items || []).forEach(i => {
        text += `• ${i.name} (${i.variant}) x${i.quantity}\n`;
      });
      text += `\nTotal: ₹${order.grand_total}\n\nPlease share your UPI payment screenshot to +91 ${BRAND_INFO.whatsappNumber} so we can start fresh preparation!`;
    }

    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'All' ? true : order.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q
        ? true
        : (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
          (order.phone && order.phone.includes(q)) ||
          (order.pincode && order.pincode.includes(q)) ||
          (order.order_number && String(order.order_number).includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Metric stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
    const newOrders = orders.filter(o => o.status === 'New').length;
    const shippedOrders = orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length;

    return { totalOrders, totalRevenue, newOrders, shippedOrders };
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
            <span>Orders & Shipping ({orders.length})</span>
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
            {/* 2. Top Metric Cards */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <div className="metric-icon-wrap amber">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="metric-label">Total Orders</div>
                  <div className="metric-val">{stats.totalOrders}</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-icon-wrap green">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="metric-label">Total Revenue</div>
                  <div className="metric-val">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-icon-wrap red">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="metric-label">New / Action Required</div>
                  <div className="metric-val">{stats.newOrders}</div>
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="metric-icon-wrap blue">
                  <Truck size={22} />
                </div>
                <div>
                  <div className="metric-label">Dispatched / Delivered</div>
                  <div className="metric-val">{stats.shippedOrders}</div>
                </div>
              </div>
            </div>

            {/* 3. Action Toolbar (Search & Status Filters) */}
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
                {['All', 'New', 'Payment Verified', 'Preparing in Kitchen', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
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

            {/* Error message */}
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
                  <RefreshCw size={28} className="spin-icon" color="var(--color-terracotta)" />
                  <p>Loading live kitchen orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="admin-empty-state">
                  <Package size={42} color="#D97706" />
                  <h3>No Orders Right Now</h3>
                  <p>
                    {orders.length === 0
                      ? 'Your orders list is clean. Orders placed by customers on your store will appear here in real time with 1-click WhatsApp messaging and Shiprocket courier dispatch.'
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
                      onSaveTracking={handleSaveTracking}
                      onCopyAddress={handleCopyShiprocketAddress}
                      onWhatsAppNotify={handleSendWhatsAppNotification}
                      onBookShiprocket={handleBookShiprocket}
                      onDeleteOrder={handleDeleteOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Individual Order Card Component ──────────────────────────────────────────
function OrderCard({
  order,
  updating,
  copied,
  onStatusChange,
  onPaymentToggle,
  onSaveTracking,
  onCopyAddress,
  onWhatsAppNotify,
  onBookShiprocket,
  onDeleteOrder
}) {
  const [courierInput, setCourierInput] = useState(order.courier_name || 'Delhivery');
  const [awbInput, setAwbInput] = useState(order.tracking_number || '');
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

  const statusColorClass = useMemo(() => {
    switch (order.status) {
      case 'New': return 'status-badge new';
      case 'Payment Verified': return 'status-badge verified';
      case 'Preparing in Kitchen': return 'status-badge preparing';
      case 'Ready for Pickup': return 'status-badge packed';
      case 'Packed': return 'status-badge packed';
      case 'Shipped': return 'status-badge shipped';
      case 'Delivered': return 'status-badge delivered';
      case 'Cancelled': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  }, [order.status]);

  return (
    <article className="order-manage-card">
      {/* Order Card Top Bar */}
      <div className="order-card-header">
        <div className="order-header-left">
          <span className="order-id-badge">Order #{order.order_number || order.id.slice(0, 8)}</span>
          <span className="order-date-text">
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </span>
        </div>

        <div className="order-header-right">
          <span className={statusColorClass}>{order.status}</span>
          <button
            type="button"
            onClick={() => onPaymentToggle(order.id, order.payment_status)}
            className={`payment-pill ${order.payment_status === 'Paid' ? 'paid' : 'pending'}`}
            title="Click to toggle payment status"
          >
            {order.payment_status === 'Paid' ? '✓ Paid' : '⏳ Payment Pending'}
          </button>
          {onDeleteOrder && (
            <button
              type="button"
              onClick={() => onDeleteOrder(order.id)}
              className="order-delete-btn"
              title="Delete this order"
              disabled={updating}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Order Body */}
      <div className="order-card-body">
        {/* Left Column: Customer Details */}
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

          {order.payment_screenshot && (
            <div style={{ marginTop: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>📸 Payment Screenshot Attached</span>
              <a
                href={order.payment_screenshot}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, textDecoration: 'underline' }}
              >
                View Screenshot
              </a>
            </div>
          )}

          {/* Customer Action Pills */}
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
              <span>WhatsApp Customer</span>
            </button>

            <button
              type="button"
              onClick={() => onCopyAddress(order)}
              className={`action-pill-btn shiprocket ${copied ? 'copied' : ''}`}
              title="Copy formatted address to paste into Shiprocket App"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied for Shiprocket!' : 'Copy for Shiprocket'}</span>
            </button>

            <button
              type="button"
              onClick={() => onBookShiprocket(order)}
              disabled={updating}
              className="action-pill-btn shiprocket-book"
              style={{
                background: order.tracking_number ? '#ECFDF5' : '#7C3AED',
                color: order.tracking_number ? '#065F46' : '#FFFFFF',
                border: order.tracking_number ? '1px solid #A7F3D0' : 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={order.tracking_number ? `AWB: ${order.tracking_number}` : '1-Click Schedule Courier & Generate AWB via Shiprocket'}
            >
              <Truck size={13} />
              <span>{order.tracking_number ? `AWB: ${order.tracking_number}` : (updating ? 'Booking...' : '🚀 Book Shiprocket')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Ordered Items & Bill */}
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
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="order-item-row">
                <div className="item-name-info">
                  <span className="item-title">{item.name}</span>
                  {item.variant && <span className="item-variant-tag">{item.variant}</span>}
                </div>
                <div className="item-calc">
                  <span className="item-qty">x{item.quantity}</span>
                  <span className="item-total-price">₹{item.itemTotal || (item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-financial-strip">
            <div className="fin-row">
              <span>Items Subtotal:</span>
              <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="fin-row">
              <span>Delivery Fee:</span>
              <span>{Number(order.delivery_fee) === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="fin-row grand">
              <span>Grand Total:</span>
              <span className="grand-val">₹{Number(order.grand_total).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Card Footer: Dispatch & Tracking Form */}
      <div className="order-card-footer">
        <div className="status-change-block">
          <label htmlFor={`status-${order.id}`}>Update Order Status:</label>
          <select
            id={`status-${order.id}`}
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            disabled={updating}
            className="status-select"
          >
            <option value="New">New (Unprocessed)</option>
            <option value="Payment Verified">Payment Verified</option>
            <option value="Preparing in Kitchen">🥣 Preparing in Kitchen (Cooking)</option>
            <option value="Ready for Pickup">📦 Ready for Pickup (Packed & Sealed)</option>
            <option value="Shipped">🚚 Shipped (Courier In Transit)</option>
            <option value="Delivered">✅ Delivered</option>
            <option value="Cancelled">❌ Cancelled</option>
          </select>
        </div>

        <div className="tracking-dispatch-block">
          <select
            value={courierInput}
            onChange={(e) => setCourierInput(e.target.value)}
            className="courier-select"
          >
            <option value="Delhivery">Delhivery</option>
            <option value="India Post Speed Post">India Post Speed Post</option>
            <option value="DTDC">DTDC</option>
            <option value="Blue Dart">Blue Dart</option>
          </select>

          <input
            type="text"
            placeholder="Enter AWB / Tracking #"
            value={awbInput}
            onChange={(e) => setAwbInput(e.target.value)}
            className="awb-input"
          />

          <button
            type="button"
            onClick={() => onSaveTracking(order.id, courierInput, awbInput)}
            disabled={updating || !awbInput}
            className="btn-save-dispatch"
            title="Save tracking and mark as Shipped"
          >
            <Truck size={14} />
            <span>Mark Shipped</span>
          </button>
        </div>
      </div>
    </article>
  );
}
