import { Router } from 'express';
import { param } from 'express-validator/check';
import ProductController from '../../controllers/product.controller';
import { verifyToken } from '../../middlewares/verifyToken.middleware';
import { checkValidationResult } from '../../middlewares/validation.middleware';

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.get('/products', ProductController.getAllProducts);
router.get('/products/search', ProductController.searchProducts);
router.get('/products/:product_id', ProductController.getProduct);
router.get('/products/inCategory/:category_id', ProductController.getProductsByCategory);
router.get('/products/inDepartment/:department_id', ProductController.getProductsByDepartment);
router.get('/products/:product_id/details', ProductController.getProductDetails);
router.get('/products/:product_id/locations', ProductController.getProductLocations);
router.post('/products/:product_id/reviews', verifyToken, ProductController.createProductReview);
router.get('/products/:product_id/reviews', ProductController.getProductReviews);
router.get('/departments', ProductController.getAllDepartments);
router.get(
  '/departments/:department_id',
  param('department_id', 'is not a number.').isInt(),
  checkValidationResult,
  ProductController.getDepartment
);
router.get('/categories', ProductController.getAllCategories);
router.get('/categories/:category_id', ProductController.getSingleCategory);
router.get(
  '/categories/inDepartment/:department_id',
  param('department_id', 'is not a number.').isInt(),
  checkValidationResult,
  ProductController.getDepartmentCategories
);
router.get(
  '/categories/inProduct/:product_id',
  param('product_id', 'is not a number.').isInt(),
  checkValidationResult,
  ProductController.getProductCategories
);

export default router;
