import { ordersService } from '../services/orders.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await ordersService.createOrder(req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, order, 'Order placed successfully')
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, limit, offset } = req.query;
  const orders = await ordersService.getAllOrders({
    status,
    search,
    limit: limit ? Number(limit) : 50,
    offset: offset ? Number(offset) : 0
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, orders, 'Orders fetched successfully')
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await ordersService.getOrderById(id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, order, 'Order retrieved successfully')
  );
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await ordersService.updateOrder(id, req.body);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, updated, 'Order updated successfully')
  );
});

export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await ordersService.getOrderStats();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, stats, 'Order analytics computed successfully')
  );
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ordersService.deleteOrder(id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, deleted, 'Order deleted successfully')
  );
});

export const clearOrders = asyncHandler(async (req, res) => {
  await ordersService.clearOrders();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'All orders cleared successfully')
  );
});
