import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import faker from 'faker';
import axios from 'axios';
import mockAdapter from 'axios-mock-adapter';
import app from '../../index';

chai.use(chaiHttp);
const mock = new mockAdapter(axios);

// let user;
// const email = 'test01@email.com';
// const password = 'password';
// before(async () => {
//   // runs before all tests in this block
//   user = await chai
//     .request(app)
//     .post('/customers/login')
//     .send({
//       email,
//       password,
//     });
// });

const createCustomer = async () => {
  const customer = await chai
    .request(app)
    .post('/customers')
    .send({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: 'password',
    });

  return customer.body;
};

describe('API Tests for Customer Controller functions', () => {
  describe('API Tests for POST </customers>', () => {
    it('should create a customer record sucessfully', async () => {
      const response = await chai
        .request(app)
        .post('/customers')
        .send({
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: 'password',
        });
      expect(response.status).to.equal(201);
      expect(response.body.customer).to.be.an('object');
      expect(response.body.accessToken);
    });

    it('should return an error if email already exists', async () => {
      const response = await chai
        .request(app)
        .post('/customers')
        .send({
          name: 'TestUser',
          email: 'testUser@email.com',
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
          email: 'Jasper.Reinger67@gmail.com',
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
        .send({
          email: 'some.user@email.com',
          password: 'password2',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal("The email doesn't exist.");
    });

    it('should return an error if the password is wrong', async () => {
      const response = await chai
        .request(app)
        .post('/customers/login')
        .send({
          email: 'new.user@email.com',
          password: 'myyypassword',
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
          email: 'testUser@email.com',
          password: '   ',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The password field is required.');
    });
  });

  describe('API Tests for POST </customers/facebook>', () => {
    it(`should return a successfully login a customer via facebook 
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
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .get('/customer')
        .set('USER_KEY', customer.accessToken);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.email).to.equal(customer.customer.email);
    });
  });

  describe('API Tests for PUT </customer>', () => {
    it('should update a customer record sucessfully', async () => {
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .put('/customer')
        .set('USER_KEY', customer.accessToken)
        .send({
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: 'password',
          day_phone: '080123212312',
          eve_phone: '080123212312',
          mob_phone: '2340987766899',
        });
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should return an error if the name field is empty', async () => {
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .put('/customer')
        .set('USER_KEY', customer.accessToken)
        .send({
          name: '   ',
          email: faker.internet.email(),
          password: 'password',
          day_phone: '080123212312',
          eve_phone: '080123212312',
          mob_phone: '2340987766899',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The name field is required.');
    });
  });

  describe('API Tests for PUT </customer/address>', () => {
    it('should update a customer address sucessfully', async () => {
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .put('/customer/address')
        .set('USER_KEY', customer.accessToken)
        .send({
          address_1: 'somethiing here',
          address_2: '',
          city: 'lagos',
          region: 'ikeja',
          postal_code: '100222',
          country: 'naija',
          shipping_region_id: 3,
        });
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should return an error when the shipping_id supplied is not a number', async () => {
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .put('/customer/address')
        .set('USER_KEY', customer.accessToken)
        .send({
          address_1: 'somethiing here',
          address_2: '',
          city: 'lagos',
          region: 'ikeja',
          postal_code: '100222',
          country: 'naija',
          shipping_region_id: 'asdff',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The shipping_region_id is not number');
    });
  });

  describe('API Tests for PUT </customer/creditCard>', () => {
    it('should update a customer record sucessfully', async () => {
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .put('/customer/creditCard')
        .set('USER_KEY', customer.accessToken)
        .send({
          credit_card: '4242 4242 4242 4242',
        });
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should update a customer record sucessfully', async () => {
      const customer = await createCustomer();
      const response = await chai
        .request(app)
        .put('/customer/creditCard')
        .set('USER_KEY', customer.accessToken)
        .send({
          credit_card: '0000 0000 0000 0000',
        });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('this is an invalid Credit Card.');
    });
  });
});
