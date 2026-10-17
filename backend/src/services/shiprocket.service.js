import { env } from '../config/env.js';
import { shiprocketAxios } from '../config/shiprocket.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Acquire or reuse valid Shiprocket auth token
   */
  async getAuthToken() {
    // If token exists and has > 1 hour remaining before expiry (valid 10 days)
    if (this.token && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    if (!env.SHIPROCKET_EMAIL || !env.SHIPROCKET_PASSWORD) {
      return null;
    }

    try {
      const response = await shiprocketAxios.post('/auth/login', {
        email: env.SHIPROCKET_EMAIL,
        password: env.SHIPROCKET_PASSWORD
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Shiprocket tokens last 10 days; set expiry 9 days ahead
        this.tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
        return this.token;
      }
    } catch (err) {
      console.warn('[ShiprocketService] Authentication failed:', err.response?.data?.message || err.message);
    }

    return null;
  }

  /**
   * Check Courier Serviceability & Shipping Rates for customer pincode
   */
  async checkServiceability({ deliveryPincode, weight = 1, cod = 0 }) {
    const token = await this.getAuthToken();

    if (token) {
      try {
        const response = await shiprocketAxios.get('/courier/serviceability/', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            pickup_postcode: env.SHIPROCKET_PICKUP_PINCODE,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: cod ? 1 : 0
          }
        });

        const data = response.data?.data;
        if (data && data.available_courier_companies) {
          return {
            isLive: true,
            pickupPincode: env.SHIPROCKET_PICKUP_PINCODE,
            deliveryPincode,
            couriers: data.available_courier_companies.map(c => ({
              courierId: c.courier_company_id,
              name: c.courier_name,
              rate: c.rate,
              etd: c.etd,
              estimatedDays: c.estimated_delivery_days,
              isCodAvailable: Boolean(c.cod)
            }))
          };
        }
      } catch (err) {
        console.warn('[ShiprocketService] Serviceability API error:', err.response?.data?.message || err.message);
      }
    }

    // Realistic fallback estimator when Shiprocket API keys are pending
    return this.getSimulatedCouriers(deliveryPincode, weight);
  }

  /**
   * Push Order to Shiprocket for courier shipment generation
   */
  async createShipment(order) {
    const token = await this.getAuthToken();

    if (!token) {
      // Return simulated shipment details so the admin workflow does not break
      const mockAwb = 'AWB' + Math.floor(1000000000 + Math.random() * 9000000000);
      return {
        isLive: false,
        message: 'Shipment created in staging/simulated mode (add Shiprocket credentials to .env for live booking)',
        shipmentId: 'SHP-' + Date.now().toString(36).toUpperCase(),
        awbCode: mockAwb,
        courierName: 'Delhivery Surface (Simulated)',
        pickupLocation: env.SHIPROCKET_PICKUP_LOCATION
      };
    }

    try {
      const payload = {
        order_id: String(order.id),
        order_date: new Date().toISOString().slice(0, 10),
        pickup_location: env.SHIPROCKET_PICKUP_LOCATION,
        billing_customer_name: order.customer_name || 'Customer',
        billing_last_name: '',
        billing_address: order.address || 'Address',
        billing_city: 'City',
        billing_pincode: order.pincode,
        billing_state: 'Andhra Pradesh',
        billing_country: 'India',
        billing_email: 'orders@bramarambika.in',
        billing_phone: order.phone,
        shipping_is_billing: true,
        order_items: (order.items || []).map((item, idx) => ({
          name: item.name || `Food Item ${idx + 1}`,
          sku: `SKU-${idx + 1}`,
          units: item.quantity || 1,
          selling_price: item.price || 100
        })),
        payment_method: order.payment_status === 'Paid' ? 'Prepaid' : 'COD',
        sub_total: order.subtotal || order.grand_total,
        length: 20,
        breadth: 15,
        height: 10,
        weight: 1
      };

      const response = await shiprocketAxios.post('/orders/create/adhoc', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[ShiprocketService] Live order created in Shiprocket:', response.data);

      return {
        isLive: true,
        shipmentId: response.data?.shipment_id,
        orderId: response.data?.order_id,
        awbCode: response.data?.awb_code || `SR-${response.data?.shipment_id}`,
        courierName: response.data?.courier_name || 'Shiprocket Express',
        ...response.data
      };
    } catch (err) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        err.response?.data?.message || 'Shiprocket order creation failed: ' + err.message
      );
    }
  }

  /**
   * Track Shipment by AWB Code
   */
  async trackShipment(awbCode) {
    const token = await this.getAuthToken();

    if (token) {
      try {
        const response = await shiprocketAxios.get(`/courier/track/awb/${awbCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return {
          isLive: true,
          ...response.data
        };
      } catch (err) {
        console.warn('[ShiprocketService] Tracking API error:', err.message);
      }
    }

    return {
      isLive: false,
      awbCode,
      status: 'In Transit',
      currentLocation: 'Kurnool Distribution Hub, AP',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      history: [
        { time: new Date().toISOString(), status: 'Order Packed at Bramarambika Kitchen' },
        { time: new Date(Date.now() - 3600000).toISOString(), status: 'Manifest Generated & Picked Up' }
      ]
    };
  }

  /**
   * Realistic domestic courier estimates based on Indian postal regions
   */
  getSimulatedCouriers(pincode, weight = 1) {
    const isAP_Telangana = /^(50|51|52|53)/.test(pincode);
    const baseRate = isAP_Telangana ? 60 : 90;
    const days = isAP_Telangana ? '1-2 Days' : '3-4 Days';

    return {
      isLive: false,
      pickupPincode: env.SHIPROCKET_PICKUP_PINCODE,
      deliveryPincode: pincode,
      message: 'Estimated shipping rates (Live Shiprocket rates will activate once credentials are added)',
      couriers: [
        {
          courierId: 1,
          name: 'Delhivery Surface',
          rate: baseRate,
          estimatedDays: days,
          isCodAvailable: true
        },
        {
          courierId: 2,
          name: 'DTDC Express Air',
          rate: baseRate + 25,
          estimatedDays: isAP_Telangana ? 'Next Day' : '2-3 Days',
          isCodAvailable: false
        },
        {
          courierId: 3,
          name: 'BlueDart Prime',
          rate: baseRate + 45,
          estimatedDays: '1-2 Days',
          isCodAvailable: true
        }
      ]
    };
  }
}

export const shiprocketService = new ShiprocketService();
