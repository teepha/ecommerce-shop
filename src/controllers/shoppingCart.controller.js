/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 *
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new product to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a product in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a product from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import uniqid from 'uniqid';
import { sequelize } from '../database/models';

/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   */
  static generateUniqueCart(req, res) {
    // implement method to generate unique cart Id
    return res.status(200).json({ cart_id: uniqid() });
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async addItemToCart(req, res, next) {
    // implement function to add item to cart
    const { cart_id, product_id, attributes } = req.body;
    try {
      await sequelize.query(
        'CALL shopping_cart_add_product(:inCartId, :inProductId, :inAttributes)',
        {
          replacements: { inCartId: cart_id, inProductId: product_id, inAttributes: attributes },
        }
      );
      const cartItems = await sequelize.query('CALL shopping_cart_get_products(:inCartId)', {
        replacements: { inCartId: cart_id },
      });
      return res.status(201).json(cartItems);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get shopping cart using the cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async getCart(req, res, next) {
    // implement method to get cart items
    const { cart_id } = req.params;
    try {
      const cartItems = await sequelize.query('CALL shopping_cart_get_products(:inCartId)', {
        replacements: { inCartId: cart_id },
      });
      return res.status(200).json(cartItems);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update cart item quantity using the item_id in the request param
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async updateCartItem(req, res, next) {
    const { item_id } = req.params; // eslint-disable-line
    const { quantity } = req.body;
    try {
      const updatedItem = await sequelize.query(
        'CALL shopping_cart_update(:inItemId, :inQuantity)',
        {
          replacements: { inItemId: item_id, inQuantity: quantity },
        }
      );
      if (!updatedItem) {
        return res.status(200).json([]);
      }
      const cartItems = await sequelize.query('CALL shopping_cart_get_products(:inCartId)', {
        replacements: { inCartId: updatedItem[0].cart_id },
      });
      return res.status(200).json(cartItems);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async emptyCart(req, res, next) {
    // implement method to empty cart
    const { cart_id } = req.params; // eslint-disable-line
    try {
      await sequelize.query('CALL shopping_cart_empty(:inCartId)', {
        replacements: { inCartId: cart_id },
      });
      return res.status(200).json([]);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   */
  static async removeItemFromCart(req, res, next) {
    const { item_id } = req.params; // eslint-disable-line
    try {
      await sequelize.query('CALL shopping_cart_remove_product(:inItemId)', {
        replacements: { inItemId: item_id },
      });
      return res.status(200).json();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrder(req, res, next) {
    // implement code for creating order here
    const { customer_id } = req;
    const { cart_id, shipping_id, tax_id } = req.body;
    try {
      const newOrder = await sequelize.query(
        'CALL shopping_cart_create_order(:inCartId, :inCustomerId, :inShippingId, :inTaxId)',
        {
          replacements: {
            inCartId: cart_id,
            inCustomerId: customer_id,
            inShippingId: shipping_id,
            inTaxId: tax_id,
          },
        }
      );
      return res.status(201).json(newOrder);
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   */
  static async getCustomerOrders(req, res, next) {
    const { customer_id } = req; // eslint-disable-line
    try {
      // implement code to get customer order
      const customerOrders = await sequelize.query(
        'CALL orders_get_by_customer_id(:inCustomerId)',
        {
          replacements: { inCustomerId: customer_id },
        }
      );
      return res.status(200).json(customerOrders);
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   */
  static async getOrderSummary(req, res, next) {
    const { order_id } = req.params; // eslint-disable-line
    const { customer_id } = req; // eslint-disable-line
    try {
      const result = await sequelize.query('CALL orders_get_order_details(:inOrderId)', {
        replacements: { inOrderId: order_id },
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    const { email, stripeToken, order_id } = req.body; // eslint-disable-line
    const { customer_id } = req;  // eslint-disable-line
    try {
      // implement code to process payment and send order confirmation email here
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
