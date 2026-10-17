import { productsService } from '../services/products.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, inStock, search } = req.query;
  const products = await productsService.getAllProducts({ category, inStock, search });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, products, 'Products fetched successfully')
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productsService.getProductById(id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, product, 'Product retrieved successfully')
  );
});

export const createProduct = asyncHandler(async (req, res) => {
  const newProduct = await productsService.createProduct(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, newProduct, 'Product created successfully')
  );
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await productsService.updateProduct(id, req.body);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, updated, 'Product updated successfully')
  );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await productsService.deleteProduct(id);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Product deleted successfully')
  );
});

export const seedProducts = asyncHandler(async (req, res) => {
  const result = await productsService.seedProducts();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Products catalog seeded successfully')
  );
});
