import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import faker from 'faker';
import axios from 'axios';
import mockAdapter from 'axios-mock-adapter';
import app from '../../index';
import { createCustomer, loginCustomer, userData } from '../mockData/mockData';

chai.use(chaiHttp);
const mock = new mockAdapter(axios);

describe('API Tests for Customer Controller functions', async () => {
  const customer = await loginCustomer(chai, app);

  describe('API Tests for POST </customers>', () => {
    it('should create a customer record sucessfully', async () => {
      const customer = await createCustomer(chai, app);
      expect(customer.status).to.equal(201);
      expect(customer.body).to.be.an('object');
      expect(customer.body.accessToken);
    });

    it('should return an error if email already exists', async () => {
      const response = await chai
        .request(app)
        .post('/customers')
        .send({
          name: 'TestUser',
          email: customer.body.customer.email,
          password: 'password',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The email already exist.');
    });

    it('should return an error if password field is empty', async () => {
      const response = await chai
        .request(app)
        .post('/customers')
        .send({
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: '   ',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The password field is required.');
    });

    it('should return an error if an invalid email is supplied', async () => {
      const response = await chai
        .request(app)
        .post('/customers')
        .send({
          name: faker.name.findName(),
          email: 'some.email',
          password: 'password',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The email is invalid.');
    });
  });

  describe('API Tests for POST </customers/login>', () => {
    it('should log in a customer sucessfully', async () => {
      const response = await chai
        .request(app)
        .post('/customers/login')
        .send({
          email: customer.body.customer.email,
          password: 'password',
        });
      expect(response.status).to.equal(200);
      expect(response.body.customer).to.be.an('object');
      expect(response.body.accessToken);
    });

    it('should return an error if email does not exist', async () => {
      const response = await chai
        .request(app)
        .post('/customers/login')
        .send(userData.invalidCustomerData);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal("The email doesn't exist.");
    });

    it('should return an error if the password is wrong', async () => {
      const response = await chai
        .request(app)
        .post('/customers/login')
        .send({
          email: customer.body.customer.email,
          password: 'somepassword',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('Email or Password is invalid.');
    });

    it('should return an error if an invalid email is supplied', async () => {
      const response = await chai
        .request(app)
        .post('/customers/login')
        .send({
          email: customer.body.customer.email,
          password: '   ',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The password field is required.');
    });
  });

  describe('API Tests for POST </customers/facebook>', () => {
    it(`should return a successfully create a customer record via facebook 
      with the accessToken provided`, async () => {
      mock
        .onGet(
          'https://graph.facebook.com/me?fields=name,gender,location,email&access_token=someoneNew'
        )
        .reply(200, {
          name: faker.name.findName(),
          email: faker.internet.email(),
        });
      const response = await chai
        .request(app)
        .post('/customers/facebook')
        .send({ access_token: 'someoneNew' });
      expect(response.status).to.equal(201);
      expect(response.body.customer).to.be.an('object');
      expect(response.body.accessToken);
    });

    it(`should return a successfully login a customer via facebook 
      with the accessToken provided`, async () => {
      mock
        .onGet(
          'https://graph.facebook.com/me?fields=name,gender,location,email&access_token=testUser'
        )
        .reply(200, {
          email: 'test.user@test.com',
          name: 'Test Test',
        });
      const response = await chai
        .request(app)
        .post('/customers/facebook')
        .send({ access_token: 'testUser' });
      expect(response.status).to.equal(200);
      expect(response.body.customer).to.be.an('object');
      expect(response.body.accessToken);
    });

    it('should return an error if the facebook access token field is empty', async () => {
      const response = await chai
        .request(app)
        .post('/customers/facebook')
        .send({
          access_token: '    ',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The access_token is required.');
    });
  });

  describe('API Tests for GET </customer>', () => {
    it('should retrieve a customer record sucessfully', async () => {
      const response = await chai
        .request(app)
        .get('/customer')
        .set('USER_KEY', customer.body.accessToken);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.email).to.equal(customer.body.customer.email);
    });
  });

  describe('API Tests for PUT </customer>', () => {
    it('should update a customer record sucessfully', async () => {
      const response = await chai
        .request(app)
        .put('/customer')
        .set('USER_KEY', customer.body.accessToken)
        .send({
          name: customer.body.customer.name,
          email: customer.body.customer.email,
          ...userData.customerProfileData,
        });
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should return an error if the name field is empty', async () => {
      const response = await chai
        .request(app)
        .put('/customer')
        .set('USER_KEY', customer.body.accessToken)
        .send({
          name: '   ',
          email: customer.body.customer.email,
          ...userData.customerProfileData,
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The name field is required.');
    });
  });

  describe('API Tests for PUT </customer/address>', () => {
    it('should update a customer address sucessfully', async () => {
      const response = await chai
        .request(app)
        .put('/customer/address')
        .set('USER_KEY', customer.body.accessToken)
        .send(userData.customerAddressData);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should return an error when the shipping_id supplied is not a number', async () => {
      const response = await chai
        .request(app)
        .put('/customer/address')
        .set('USER_KEY', customer.body.accessToken)
        .send({
          ...userData.customerAddressData,
          shipping_region_id: 'asdff',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The shipping_region_id is not number');
    });
  });

  describe('API Tests for PUT </customer/creditCard>', () => {
    it('should update a customer record sucessfully', async () => {
      const response = await chai
        .request(app)
        .put('/customer/creditCard')
        .set('USER_KEY', customer.body.accessToken)
        .send(userData.validCreditCard);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should update a customer record sucessfully', async () => {
      const response = await chai
        .request(app)
        .put('/customer/creditCard')
        .set('USER_KEY', customer.body.accessToken)
        .send(userData.invalidCreditCard);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('this is an invalid Credit Card.');
    });
  });
});
