import { Router } from 'express';
import { body } from 'express-validator/check'; //to validate request body and params
import CustomerController from '../../controllers/customer.controller';
import { verifyToken } from '../../middlewares/verifyToken.middleware';
import { checkValidationResult, validateCreditCard } from '../../middlewares/validation.middleware';

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.post(
  '/customers',
  body(['name', 'email', 'password'])
    .isString()
    .withMessage('is invalid.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('field is required.'),
  body('email', 'is invalid.').isEmail(),
  checkValidationResult,
  CustomerController.create
);
router.post(
  '/customers/login',
  body('email', 'is invalid.').isEmail(),
  body(['email', 'password'])
    .isString()
    .withMessage('is invalid.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('field is required.'),
  checkValidationResult,
  CustomerController.login
);
router.get('/customer', verifyToken, CustomerController.getCustomerProfile);
router.put(
  '/customer',
  verifyToken,
  body(['email', 'name'])
    .trim()
    .not()
    .isEmpty()
    .withMessage('field is required.'),
  body('email', 'is invalid.').isEmail(),
  body(['email', 'name', 'password', 'day_phone', 'eve_phone', 'mob_phone'])
    .isString()
    .withMessage('is invalid.'),
  checkValidationResult,
  CustomerController.updateCustomerProfile
);
router.put(
  '/customer/address',
  verifyToken,
  body(['address_1', 'city', 'region', 'country', 'postal_code'])
    .isString()
    .withMessage('is invalid.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('field is required.'),
  body('shipping_region_id', 'is not number')
    .not()
    .isEmpty()
    .withMessage('field is required.')
    .isInt(),
  checkValidationResult,
  CustomerController.updateCustomerAddress
);
router.put(
  '/customer/creditCard',
  verifyToken,
  body(['credit_card'])
    .isString()
    .withMessage('is invalid.')
    .trim()
    .not()
    .isEmpty()
    .withMessage('number field is required.'),
  checkValidationResult,
  validateCreditCard,
  CustomerController.updateCreditCard
);

export default router;
