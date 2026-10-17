import { shiprocketService } from '../services/shiprocket.service.js';
import { ordersService } from '../services/orders.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const checkServiceability = asyncHandler(async (req, res) => {
  const { deliveryPincode, weight, cod } = req.query;
  const result = await shiprocketService.checkServiceability({
    deliveryPincode: deliveryPincode || req.params.pincode,
    weight: weight ? Number(weight) : 1,
    cod: cod === 'true' || cod === '1'
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Courier serviceability checked successfully')
  );
});

export const createShipment = asyncHandler(async (req, res) => {
  let orderData = req.body;
  const targetOrderId = req.body.orderId || req.body.id;

  if (targetOrderId && (!req.body.items || req.body.items.length === 0)) {
    try {
      const existingOrder = await ordersService.getOrderById(targetOrderId);
      if (existingOrder) {
        orderData = { ...existingOrder, ...req.body };
      }
    } catch (e) {
      console.warn('Could not retrieve full order details by ID, using payload:', e.message);
    }
  }

  const shipment = await shiprocketService.createShipment(orderData);

  // Automatically sync tracking number and marked as Shipped in database
  if (targetOrderId && shipment?.awbCode) {
    try {
      await ordersService.updateOrder(targetOrderId, {
        courier_name: shipment.courierName || orderData.courier_name || 'Delhivery Surface',
        tracking_number: shipment.awbCode,
        status: 'Shipped'
      });
    } catch (err) {
      console.warn('Failed to auto-update order status after shipment creation:', err.message);
    }
  }

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, shipment, 'Courier shipment scheduled successfully')
  );
});

export const trackShipment = asyncHandler(async (req, res) => {
  const { awbCode } = req.params;
  const tracking = await shiprocketService.trackShipment(awbCode);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, tracking, 'Tracking status fetched successfully')
  );
});
