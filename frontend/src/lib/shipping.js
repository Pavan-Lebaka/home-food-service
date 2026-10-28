/**
 * Shipping & Delivery Configuration
 * Bramarambika Home Foods - Authentic Diviseema Kitchen
 *
 * Simple & Transparent Pricing:
 * - Orders below ₹2,000: Flat ₹99 delivery charge
 * - Orders ₹2,000 and above: 100% FREE Delivery
 */

export const FREE_DELIVERY_THRESHOLD = 2000;
export const FLAT_DELIVERY_FEE = 99;

/**
 * Calculate final delivery fee based on cart subtotal
 */
export function calculateDeliveryFee(itemsSubtotal = 0) {
  if (Number(itemsSubtotal) >= FREE_DELIVERY_THRESHOLD) {
    return 0; // FREE Delivery above ₹2,000
  }
  return FLAT_DELIVERY_FEE; // Flat ₹99
}
