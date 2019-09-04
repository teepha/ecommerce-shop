import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import { loginCustomer, shoppingData } from '../mockData/mockData';

chai.use(chaiHttp);

// before(async () => {
//   // runs before all tests in this block
//   cart = await generateCart();
//   console.log('here>>', cart);
// });

describe('API Tests for ShoppingCart Controller', async () => {
  let cart, cart_id, item_id, order_id;
  const generateCart = async () => {
    const response = await chai.request(app).get('/shoppingcart/generateUniqueId');
    return response;
  };
  cart = await generateCart();
  cart_id = cart.body.cart_id;

  const addItemsToCart = async cartId => {
    const response = await chai
      .request(app)
      .post('/shoppingcart/add')
      .send({ cart_id: cartId, ...shoppingData.itemsToCart });
    return response;
  };
  const newItem = await addItemsToCart(cart_id);
  item_id = newItem.body[0].item_id;

  const customer = (await loginCustomer(chai, app)).body;
  const createOrder = async () => {
    const newCartId = (await generateCart()).body.cart_id;
    await addItemsToCart(newCartId);
    const response = await chai
      .request(app)
      .post('/orders')
      .set('USER_KEY', customer.accessToken)
      .send({ cart_id: newCartId, ...shoppingData.itemsToOrder });
    return response;
  };
  const newOrder = await createOrder();
  order_id = newOrder.body[0].orderId;

  describe('API Tests for ShoppingCart functions', () => {
    it('should generate random unique id for cart identifier', async () => {
      const response = await chai.request(app).get('/shoppingcart/generateUniqueId');
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should add item to a cart with cart_id', async () => {
      expect(newItem.status).to.equal(201);
      expect(newItem.body).to.be.an('array');
    });

    it('should get shopping cart using the cart_id', async () => {
      const response = await chai.request(app).get(`/shoppingcart/${cart_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body[0].item_id).to.equal(item_id);
    });

    it('should update cart item quantity using the item_id', async () => {
      const response = await chai
        .request(app)
        .put(`/shoppingcart/update/${item_id}`)
        .send({ quantity: 3 });
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });

    it('should remove all items in a cart', async () => {
      const newCart_id = (await generateCart()).body.cart_id;
      await addItemsToCart(newCart_id);
      const response = await chai.request(app).delete(`/shoppingcart/empty/${newCart_id}`);
      expect(response.status).to.equal(200);
    });

    it('should remove single item from cart', async () => {
      const newCart_id = (await generateCart()).body.cart_id;
      const item_id = (await addItemsToCart(newCart_id)).body[0].item_id;
      const response = await chai.request(app).delete(`/shoppingcart/removeProduct/${item_id}`);
      expect(response.status).to.equal(200);
    });
  });

  describe('API Tests for Order functions', () => {
    it('should create an order from a cart', async () => {
      expect(newOrder.status).to.equal(201);
      expect(newOrder.body).to.be.an('array');
    });

    it('should get customer orders', async () => {
      const response = await chai
        .request(app)
        .get('/orders/inCustomer')
        .set('USER_KEY', customer.accessToken);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      // expect(response.body[0].order_id).to.equal(order_id);
    });

    it('should get order summary', async () => {
      const response = await chai
        .request(app)
        .get(`/orders/${order_id}`)
        .set('USER_KEY', customer.accessToken);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body[0].order_id).to.equal(order_id);
    });

    it('should get order summary', async () => {
      const response = await chai
        .request(app)
        .get(`/orders/shortDetail/${order_id}`)
        .set('USER_KEY', customer.accessToken);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.order_id).to.equal(order_id);
    });

    it('should successfully make payment for an order', async () => {
      const response = await chai
        .request(app)
        .post('/stripe/charge')
        .set('USER_KEY', customer.accessToken)
        .send({ order_id, ...shoppingData.paymentData });
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.message).to.equal('Payment successful!');
    });

    it('should return an error if payment has been made for the order', async () => {
      const response = await chai
        .request(app)
        .post('/stripe/charge')
        .set('USER_KEY', customer.accessToken)
        .send({ order_id, ...shoppingData.invalidPaymentData });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('Payment has been made for this order');
    });

    it('should return an error if an invalid stripe token is supplied', async () => {
      const order = await createOrder();
      const orderId = order.body[0].orderId;
      const response = await chai
        .request(app)
        .post('/stripe/charge')
        .set('USER_KEY', customer.accessToken)
        .send({ order_id: orderId, ...shoppingData.invalidPaymentData });
      expect(response.status).to.equal(500);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('No such token: sometoken');
    });
  });
});
