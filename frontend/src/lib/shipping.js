/**
 * Shipping & Delivery Configuration & Calculators
 * Bramarambika Home Foods - Authentic Diviseema Kitchen
 */

export const FREE_DELIVERY_THRESHOLD = 2000;
export const DEFAULT_STANDARD_FEE = 60;

export const DEFAULT_COURIER = {
  courierId: 1,
  name: 'Delhivery Surface',
  rate: 60,
  estimatedDays: '1-2 Days',
  isCodAvailable: true
};

/**
 * Realistic regional fallback couriers based on Indian postal zones
 * Used when backend/Shiprocket API is pending, unreachable, or in preview
 */
export function getLocalFallbackCouriers(pincode = '521120') {
  const pin = String(pincode || '').trim().replace(/\D/g, '');
  const isAP_Telangana = /^(50|51|52|53)/.test(pin);
  const isSouth = /^(56|57|58|59|60|61|62|63|64|67|68|69)/.test(pin);

  const baseRate = isAP_Telangana ? 60 : (isSouth ? 80 : 100);
  const surfaceDays = isAP_Telangana ? '1-2 Days' : (isSouth ? '2-3 Days' : '3-4 Days');
  const airDays = isAP_Telangana ? 'Next Day' : (isSouth ? '1-2 Days' : '2-3 Days');

  return {
    isLive: false,
    pickupPincode: '521120',
    deliveryPincode: pin || '521120',
    message: isAP_Telangana
      ? 'Express delivery from Krishna District kitchen'
      : 'Pan-India secure food-grade parcel delivery',
    couriers: [
      {
        courierId: 1,
        name: 'Delhivery Surface',
        rate: baseRate,
        estimatedDays: surfaceDays,
        isCodAvailable: true
      },
      {
        courierId: 2,
        name: 'DTDC Express Air',
        rate: baseRate + 25,
        estimatedDays: airDays,
        isCodAvailable: false
      },
      {
        courierId: 3,
        name: 'BlueDart Prime',
        rate: baseRate + 45,
        estimatedDays: airDays,
        isCodAvailable: true
      }
    ]
  };
}

/**
 * Calculate final delivery fee based on cart subtotal and courier rate
 * Free delivery above FREE_DELIVERY_THRESHOLD (₹2,000)
 */
export function calculateDeliveryFee(itemsSubtotal, courierRate = DEFAULT_STANDARD_FEE) {
  if (itemsSubtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0; // FREE Delivery applied
  }
  const rate = Number(courierRate);
  return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_STANDARD_FEE;
}

/**
 * Smart selection: auto-pick the fastest, best-value courier
 */
export function findBestCourier(couriers = [], isCod = false) {
  if (!couriers || couriers.length === 0) return DEFAULT_COURIER;

  let pool = couriers;
  if (isCod) {
    const codEligible = couriers.filter(c => c.isCodAvailable);
    if (codEligible.length > 0) pool = codEligible;
  }

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

  return sorted[0] || DEFAULT_COURIER;
}
