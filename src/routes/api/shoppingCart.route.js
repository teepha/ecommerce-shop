import { Router } from 'express';
import { body, param } from 'express-validator/check';
import { checkValidationResult } from '../../middlewares/validation.middleware';
import { verifyToken } from '../../middlewares/verifyToken.middleware';
import ShoppingCartController from '../../controllers/shoppingCart.controller';

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post(
  '/shoppingcart/add',
  body(['cart_id', 'attributes'])
    .isString()
    .withMessage('is invalid.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('is required.'),
  body(['product_id'])
    .isInt()
    .withMessage('is not a number.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('is required.'),
  checkValidationResult,
  ShoppingCartController.addItemToCart
);
router.get(
  '/shoppingcart/:cart_id',
  param(['cart_id'])
    .trim()
    .not()
    .isEmpty()
    .withMessage('is required.'),
  checkValidationResult,
  ShoppingCartController.getCart
);
router.put(
  '/shoppingcart/update/:item_id',
  param(['item_id'])
    .trim()
    .not()
    .isEmpty()
    .withMessage('is required.'),
  body(['quantity'])
    .isInt()
    .withMessage('is not a number.'),
  checkValidationResult,
  ShoppingCartController.updateCartItem
);
router.delete('/shoppingcart/empty/:cart_id', ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', ShoppingCartController.removeItemFromCart);
router.post(
  '/orders',
  verifyToken,
  body(['cart_id'])
    .isString()
    .withMessage('is invalid.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('is required.'),
  body(['shipping_id', 'tax_id'])
    .isInt()
    .withMessage('is not a number.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('is required.'),
  checkValidationResult,
  ShoppingCartController.createOrder
);
router.get('/orders/inCustomer', verifyToken, ShoppingCartController.getCustomerOrders);
router.get('/orders/:order_id', verifyToken, ShoppingCartController.getOrderSummary);
router.post('/stripe/charge', verifyToken, ShoppingCartController.processStripePayment);

export default router;
