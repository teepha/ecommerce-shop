import { Router } from 'express';
import { param } from 'express-validator/check';
import ShippingController from '../../controllers/shipping.controller';
import { checkValidationResult } from '../../middlewares/validation.middleware';

const router = Router();

router.get('/shipping/regions', ShippingController.getShippingRegions);
router.get(
  '/shipping/regions/:shipping_region_id',
  param('shipping_region_id', 'is not a number.').isInt(),
  checkValidationResult,
  ShippingController.getShippingType
);

export default router;
