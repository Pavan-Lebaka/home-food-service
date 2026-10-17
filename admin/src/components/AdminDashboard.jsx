import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchOrdersApi, updateOrderApi, createShipmentApi, deleteOrderApi, clearAllOrdersApi } from '../lib/api';
import { BRAND_INFO } from '../constants/brand';
import ProductManagement from './ProductManagement';
import {
  Package, ShoppingBag, Truck, CheckCircle2, Clock,
  Search, RefreshCw, LogOut, Phone, MessageCircle,
  Copy, ExternalLink, Calendar, MapPin, AlertCircle,
  User, Check, ChevronDown, ChevronUp, Sparkles, UtensilsCrossed, Trash2,
  Eye, X, ArrowRight, ShieldCheck, HelpCircle
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
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(true);
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
        status: 'Shipped'
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    } catch (err) {
      alert('Failed to save tracking: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Copy full customer address formatted for Courier / Shiprocket
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

      const isLive = res.data?.isLive ?? res.isLive ?? false;
      if (!isLive) {
        alert(`⚠️ Staging / Simulated Mode: AWB assigned (${awb}), but this was NOT sent to your live Shiprocket dashboard because SHIPROCKET_PASSWORD is not configured in backend/.env or Render!\n\nTo push live orders to your real Shiprocket dashboard, please add your SHIPROCKET_PASSWORD.`);
      } else {
        alert(`🎉 Live Shiprocket Order Created Successfully!\n\nCourier: ${courier}\nAWB Tracking Code: ${awb || 'Assigned'}\nOrder is now visible in your live Shiprocket dashboard.`);
      }
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
        text += `Track live here: https://shiprocket.co/tracking/${order.tracking_number}\n`;
      }
      text += `Estimated doorstep arrival: 2–3 business days.\n\nThank you for choosing Bramarambika Home Foods! ❤️`;
    } else if (order.status === 'Preparing in Kitchen') {
      text += `Your delicacies are now being prepared fresh in our Andhra kitchen with cold-pressed oils and traditional recipes. We will pack in 5-layer leak-proof containers and dispatch within 24–48 hours!\n\nDhanyavadalu! 🙏`;
    } else if (order.status === 'Ready for Pickup') {
      text += `Your order has been freshly packed with 5-layer leak-proof seal and is ready for courier pickup. It will be dispatched today!\n\nThank you! ❤️`;
    } else if (order.status === 'Delivered') {
      text += `We hope your parcel of traditional delicacies arrived safely and in great taste! 🪔✨\n\nPlease let us know how you liked them. Your review means the world to our kitchen team!\n\nDhanyavadalu! 🙏`;
    } else if (order.payment_status === 'Paid') {
      text += `We have verified your payment of ₹${order.grand_total}. Our kitchen has scheduled your fresh batch preparation.\n\nThank you! 🙏`;
    } else {
      text += `Namaste! We received your order request (#${order.order_number || order.id.slice(0, 8)}) for:\n`;
      (order.items || []).forEach(i => {
        text += `• ${i.name} (${i.variant}) x${i.quantity}\n`;
      });
      text += `\nTotal: ₹${order.grand_total}\n\nCould you kindly share your UPI payment screenshot to this WhatsApp number so we can start fresh preparation right away? 🙏`;
    }

    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
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

            {/* Step-by-Step Order Lifecycle Guide */}
            {showWorkflowGuide && (
              <div className="kitchen-workflow-guide">
                <div className="guide-header">
                  <div className="guide-title">
                    <Sparkles size={18} color="#D97706" />
                    <span>What to do when an order is placed? (Simple 4-Step Guide)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWorkflowGuide(false)}
                    style={{ background: 'none', border: 'none', color: '#92400E', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Hide Guide ✕
                  </button>
                </div>
                <div className="guide-steps-grid">
                  <div className="guide-step-card">
                    <div className="guide-step-num">1</div>
                    <div className="guide-step-text">
                      <h4>Verify UPI Payment</h4>
                      <p>Click "Inspect Proof" to review the UPI receipt. Then click <strong>"✓ Confirm Payment"</strong> to approve kitchen preparation.</p>
                    </div>
                  </div>
                  <div className="guide-step-card">
                    <div className="guide-step-num">2</div>
                    <div className="guide-step-text">
                      <h4>Fresh Kitchen Prep</h4>
                      <p>Prepare fresh in Andhra kitchen. Once packed in 5-layer leak-proof containers, click <strong>"📦 Mark Packed"</strong>.</p>
                    </div>
                  </div>
                  <div className="guide-step-card">
                    <div className="guide-step-num">3</div>
                    <div className="guide-step-text">
                      <h4>Ship & Send Tracking</h4>
                      <p>Click <strong>"🚀 Book Shiprocket"</strong> or enter manual AWB. Then 1-click WhatsApp tracking link to customer!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                {['All', 'New', 'Preparing in Kitchen', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
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

                {!showWorkflowGuide && (
                  <button
                    type="button"
                    onClick={() => setShowWorkflowGuide(true)}
                    className="refresh-btn"
                    title="Show step-by-step order workflow guide"
                  >
                    <HelpCircle size={14} />
                    <span>Workflow Guide</span>
                  </button>
                )}

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
                      onPreviewScreenshot={setPreviewScreenshotUrl}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* High-Resolution UPI Payment Screenshot Modal */}
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

// ─── Individual Clean Step-by-Step Order Card Component ─────────────────────────
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
  onDeleteOrder,
  onPreviewScreenshot
}) {
  const [courierInput, setCourierInput] = useState(order.courier_name || 'Delhivery');
  const [awbInput, setAwbInput] = useState(order.tracking_number || '');
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Map order status to 1-5 step index
  const stepIndex = useMemo(() => {
    switch (order.status) {
      case 'New': return 1;
      case 'Payment Verified':
      case 'Preparing in Kitchen': return 2;
      case 'Ready for Pickup':
      case 'Packed': return 3;
      case 'Shipped': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  }, [order.status]);

  const statusColorClass = useMemo(() => {
    switch (order.status) {
      case 'New': return 'status-badge new';
      case 'Payment Verified': return 'status-badge verified';
      case 'Preparing in Kitchen': return 'status-badge preparing';
      case 'Ready for Pickup':
      case 'Packed': return 'status-badge packed';
      case 'Shipped': return 'status-badge shipped';
      case 'Delivered': return 'status-badge delivered';
      case 'Cancelled': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  }, [order.status]);

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
          <span className={statusColorClass}>{order.status}</span>
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

      {/* 2. Visual Progress Stepper (1 -> 2 -> 3 -> 4 -> 5) */}
      <div className="order-stepper-container">
        <div className="order-stepper-track">
          <div className={`order-step-node ${stepIndex >= 1 ? (stepIndex === 1 ? 'active' : 'completed') : ''}`}>
            <span className="order-step-dot">{stepIndex > 1 ? '✓' : '1'}</span>
            <span>1. Verify Pay</span>
          </div>
          <span className="order-step-arrow">→</span>

          <div className={`order-step-node ${stepIndex >= 2 ? (stepIndex === 2 ? 'active' : 'completed') : ''}`}>
            <span className="order-step-dot">{stepIndex > 2 ? '✓' : '2'}</span>
            <span>2. Kitchen Cooking</span>
          </div>
          <span className="order-step-arrow">→</span>

          <div className={`order-step-node ${stepIndex >= 3 ? (stepIndex === 3 ? 'active' : 'completed') : ''}`}>
            <span className="order-step-dot">{stepIndex > 3 ? '✓' : '3'}</span>
            <span>3. Pack & Seal</span>
          </div>
          <span className="order-step-arrow">→</span>

          <div className={`order-step-node ${stepIndex >= 4 ? (stepIndex === 4 ? 'active' : 'completed') : ''}`}>
            <span className="order-step-dot">{stepIndex > 4 ? '✓' : '4'}</span>
            <span>4. Dispatched</span>
          </div>
          <span className="order-step-arrow">→</span>

          <div className={`order-step-node ${stepIndex >= 5 ? 'completed' : ''}`}>
            <span className="order-step-dot">{stepIndex >= 5 ? '✓' : '5'}</span>
            <span>5. Delivered</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Next Recommended Action Bar (Removes Confusion!) */}
      <div className="order-next-step-bar">
        <div className="next-action-prompt">
          <span className="next-action-label">Next Action:</span>
          <span className="next-action-status-text">
            {order.status === 'New' && 'Verify UPI payment receipt & start kitchen preparation'}
            {(order.status === 'Payment Verified' || order.status === 'Preparing in Kitchen') && 'Fresh cooking in progress. Seal & pack when ready to ship'}
            {(order.status === 'Ready for Pickup' || order.status === 'Packed') && 'Package sealed with 5-layer leak proof. Ready for courier pickup'}
            {order.status === 'Shipped' && `In transit via ${order.courier_name || 'Courier'}${order.tracking_number ? ` (AWB: ${order.tracking_number})` : ''}`}
            {order.status === 'Delivered' && 'Order successfully delivered to customer! 🎉'}
            {order.status === 'Cancelled' && 'This order has been cancelled.'}
          </span>
        </div>

        <div className="next-action-buttons-wrap">
          {/* Step 1 Actions (New) */}
          {order.status === 'New' && (
            <>
              <button
                type="button"
                onClick={() => {
                  onStatusChange(order.id, 'Preparing in Kitchen');
                  if (order.payment_status !== 'Paid') onPaymentToggle(order.id, 'Pending');
                }}
                disabled={updating}
                className="btn-primary-workflow"
                title="Mark Payment Verified and start preparing in kitchen"
              >
                <Check size={14} />
                <span>✓ Confirm Payment & Start Cooking</span>
              </button>

              <button
                type="button"
                onClick={() => onWhatsAppNotify(order)}
                className="btn-secondary-workflow whatsapp"
                title="Send WhatsApp message asking customer for UPI screenshot"
              >
                <MessageCircle size={14} />
                <span>Ping for Payment</span>
              </button>
            </>
          )}

          {/* Step 2 Actions (Preparing / Payment Verified) */}
          {(order.status === 'Payment Verified' || order.status === 'Preparing in Kitchen') && (
            <>
              <button
                type="button"
                onClick={() => onStatusChange(order.id, 'Ready for Pickup')}
                disabled={updating}
                className="btn-primary-workflow amber"
                title="Cooking complete, 5-layer leak-proof packed and ready for courier pickup"
              >
                <Package size={14} />
                <span>📦 Mark Packed & Ready to Ship</span>
              </button>

              <button
                type="button"
                onClick={() => onWhatsAppNotify(order)}
                className="btn-secondary-workflow whatsapp"
                title="Notify customer on WhatsApp that fresh cooking is in progress"
              >
                <MessageCircle size={14} />
                <span>Send Prep Update</span>
              </button>
            </>
          )}

          {/* Step 3 Actions (Ready for Pickup / Packed) */}
          {(order.status === 'Ready for Pickup' || order.status === 'Packed') && (
            <>
              <button
                type="button"
                onClick={() => onBookShiprocket(order)}
                disabled={updating}
                className="btn-primary-workflow purple"
                title="1-Click schedule courier pickup and generate AWB tracking code via Shiprocket"
              >
                <Truck size={14} />
                <span>{updating ? 'Booking Shiprocket...' : '🚀 Book Shiprocket Courier'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="btn-secondary-workflow"
                title="Enter manual AWB / Courier details"
              >
                <span>Manual Dispatch ✎</span>
              </button>
            </>
          )}

          {/* Step 4 Actions (Shipped) */}
          {order.status === 'Shipped' && (
            <>
              <button
                type="button"
                onClick={() => onWhatsAppNotify(order)}
                className="btn-secondary-workflow whatsapp"
                title="Send WhatsApp message with live courier tracking link & ETA"
              >
                <MessageCircle size={14} />
                <span>📲 WhatsApp Tracking to Customer</span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(order.id, 'Delivered')}
                disabled={updating}
                className="btn-primary-workflow"
                title="Mark order as delivered"
              >
                <CheckCircle2 size={14} />
                <span>✅ Mark Delivered</span>
              </button>
            </>
          )}

          {/* Step 5 Actions (Delivered) */}
          {order.status === 'Delivered' && (
            <button
              type="button"
              onClick={() => onWhatsAppNotify(order)}
              className="btn-secondary-workflow whatsapp"
              title="Send a thank you note and request review"
            >
              <Sparkles size={14} />
              <span>Ask for Feedback</span>
            </button>
          )}

          {/* Toggle Advanced / Manual overrides */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-toggle-advanced"
            title="Toggle manual status and courier options"
          >
            <span>{showAdvanced ? 'Hide Options ▲' : '⚙ More Options ▼'}</span>
          </button>
        </div>
      </div>

      {/* 4. Main Order Details (Clean 2-Column Split) */}
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
              <span>No screenshot uploaded online. Verify via customer's WhatsApp message.</span>
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
              <span>WhatsApp Chat</span>
            </button>

            <button
              type="button"
              onClick={() => onCopyAddress(order)}
              className={`action-pill-btn shiprocket ${copied ? 'copied' : ''}`}
              title="Copy formatted address to paste into Courier App"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied Address!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Ordered Items & Bill Summary */}
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

          <div className="order-financial-strip">
            <div className="fin-row">
              <span>Items Subtotal:</span>
              <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="fin-row">
              <span>Delivery Fee:</span>
              <span>{Number(order.delivery_fee) === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="fin-row grand">
              <span>Grand Total:</span>
              <span className="grand-val">₹{Number(order.grand_total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Collapsible Advanced Options Drawer */}
      {showAdvanced && (
        <div className="advanced-options-drawer">
          <div className="status-change-block">
            <label htmlFor={`status-${order.id}`}>Override Status:</label>
            <select
              id={`status-${order.id}`}
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              disabled={updating}
              className="status-select"
            >
              <option value="New">1. New (Payment Pending)</option>
              <option value="Payment Verified">2. Payment Verified</option>
              <option value="Preparing in Kitchen">2b. 🥣 Preparing in Kitchen</option>
              <option value="Ready for Pickup">3. 📦 Ready for Pickup (Packed)</option>
              <option value="Shipped">4. 🚚 Shipped (In Transit)</option>
              <option value="Delivered">5. ✅ Delivered</option>
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
              <option value="Trackon">Trackon</option>
            </select>

            <input
              type="text"
              placeholder="Manual AWB Tracking #"
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              className="awb-input"
            />

            <button
              type="button"
              onClick={() => onSaveTracking(order.id, courierInput, awbInput)}
              disabled={updating || !awbInput}
              className="btn-save-dispatch"
              title="Save manual tracking and set status to Shipped"
            >
              <Truck size={14} />
              <span>Save Tracking</span>
            </button>
          </div>

          {onDeleteOrder && (
            <button
              type="button"
              onClick={() => onDeleteOrder(order.id)}
              className="order-delete-btn"
              title="Delete this order"
              disabled={updating}
              style={{ marginLeft: 'auto', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} />
              <span>Delete Order</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}
