import { shiprocketService } from '../services/shiprocket.service.js';
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
  const shipment = await shiprocketService.createShipment(req.body);

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
