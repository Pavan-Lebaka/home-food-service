import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../lib/whatsapp';

export default function FloatingCart({ cartItems, onOpenCart }) {
  if (!cartItems || cartItems.length === 0) return null;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const p = item.unitPrice || item.price || item.pricePerKg || 0;
    return acc + (p * item.quantity);
  }, 0);
  const isFreeDelivery = itemsSubtotal >= 1000;
  const deliveryFee = isFreeDelivery ? 0 : 100;
  const grandTotal = itemsSubtotal + deliveryFee;

  return (
    <>
      {/* Desktop Floating Cart Pill (Bottom Right) */}
      <aside
        className="floating-cart-desktop"
        onClick={onOpenCart}
        role="button"
        tabIndex={0}
        aria-label="View order cart"
        id="desktop-floating-cart"
      >
        <div className="floating-cart-left">
          <div className="floating-cart-icon-wrap">
            <ShoppingCart size={20} />
            <span className="floating-cart-count-badge">{totalItemsCount}</span>
          </div>
          <div className="floating-cart-text">
            <div className="floating-cart-label">
              {isFreeDelivery ? 'Free Delivery' : 'Your Order'}
            </div>
            <div className="floating-cart-total">{formatCurrency(grandTotal)}</div>
          </div>
        </div>

        <div className="floating-cart-action-btn">
          <span>Checkout</span>
          <ArrowRight size={15} />
        </div>
      </aside>

      {/* Mobile Sticky Order Bar (Bottom Fixed) */}
      <div
        className="mobile-sticky-order-bar"
        onClick={onOpenCart}
        role="button"
        tabIndex={0}
        aria-label="View order cart"
        id="mobile-sticky-order-bar"
      >
        <div className="mobile-bar-left">
          <span className="mobile-badge-count">{totalItemsCount} packs</span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className="mobile-amount-val">{formatCurrency(grandTotal)}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: isFreeDelivery ? '#86EFAC' : '#E5E7EB' }}>
              {isFreeDelivery ? '🎉 Free Delivery' : '+ ₹100 Delivery'}
            </span>
          </div>
        </div>

        <div className="mobile-bar-btn">
          <span>View Cart & Order</span>
          <ArrowRight size={15} />
        </div>
      </div>
    </>
  );
}
