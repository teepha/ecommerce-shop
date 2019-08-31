import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('API Tests for Product Controller', () => {
  describe('API Tests for Product functions', () => {
    const product_id = 5;
    const category_id = 3;
    const department_id = 2;
    it('should get all products', async () => {
      const response = await chai.request(app).get('/products');
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.count).to.equal(101);
      expect(response.body.rows).to.be.an('array');
    });

    it('should search all products for a word that matches the query string', async () => {
      const word = 'italy';
      const all_words = 'off';
      const response = await chai
        .request(app)
        .get(`/products/search?query_string=${word}&all_words=${all_words}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.rows).to.be.an('array');
    });

    it('should get single product details when product_id is supplied', async () => {
      const response = await chai.request(app).get(`/products/${product_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.product_id).to.equal(product_id);
    });

    it('return an error if the product_id supplied does not exist', async () => {
      const response = await chai.request(app).get(`/products/10000000`);
      expect(response.status).to.equal(404);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('Product with id 10000000 does not exist');
    });

    it('should get all products by category', async () => {
      const response = await chai.request(app).get(`/products/inCategory/${category_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.rows).to.be.an('array');
    });

    it('should get all products by department', async () => {
      const response = await chai.request(app).get(`/products/inDepartment/${department_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.rows).to.be.an('array');
    });

    it('should get product details', async () => {
      const response = await chai.request(app).get(`/products/${product_id}/details`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.product_id).to.equal(product_id);
    });

    it('should get product locations', async () => {
      const response = await chai.request(app).get(`/products/${product_id}/locations`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
    });

    it('should add a new product review', async () => {
      const user = await chai
        .request(app)
        .post('/customers/login')
        .send({
          email: 'testUser@email.com',
          password: 'password',
        });
      const response = await chai
        .request(app)
        .post(`/products/${product_id}/reviews`)
        .set('USER_KEY', user.body.accessToken)
        .send({
          review: 'great product',
          rating: 5,
        });
      expect(response.status).to.equal(201);
      expect(response.body).to.be.an('object');
      expect(response.body.name).to.equal(user.body.customer.name);
    });

    it('should return an error if the review field is empty when adding a new product review', async () => {
      const user = await chai
        .request(app)
        .post('/customers/login')
        .send({
          email: 'testUser@email.com',
          password: 'password',
        });
      const response = await chai
        .request(app)
        .post(`/products/${product_id}/reviews`)
        .set('USER_KEY', user.body.accessToken)
        .send({
          review: '  ',
          rating: 5,
        });
      expect(response.status).to.equal(400);
      expect(response.body.error.message).to.equal('The review field is required.');
    });

    it('should return an error if an invalid token is supplied when adding a new product review', async () => {
      const response = await chai
        .request(app)
        .post(`/products/${product_id}/reviews`)
        .set('USER_KEY', 'errrffdnnhhhqwerh')
        .send({
          review: 'great product',
          rating: 5,
        });
      expect(response.status).to.equal(401);
      expect(response.body.error.message).to.equal('Access Unauthorized');
    });

    it('should get product reviews', async () => {
      const response = await chai.request(app).get(`/products/${product_id}/reviews`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });

    it('return an error if the product_id supplied is not a number', async () => {
      const response = await chai.request(app).get(`/products/qwer/reviews`);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The product_id is not a number.');
    });
  });

  describe('API Tests for Department functions', () => {
    const department_id = 3;

    it('should get all departments', async () => {
      const response = await chai.request(app).get('/departments');
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });

    it('should get a single department when department_id is supplied', async () => {
      const response = await chai.request(app).get(`/departments/${department_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.department_id).to.equal(department_id);
    });

    it('return an error if the department_id supplied does not exist', async () => {
      const response = await chai.request(app).get(`/departments/111111`);
      expect(response.status).to.equal(404);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The department with this ID does not exist.');
    });

    it('should return an error if the departmend_id supplied is not a number', async () => {
      const response = await chai.request(app).get(`/departments/asd`);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The department_id is not a number.');
    });
  });

  describe('API Tests for Category functions', () => {
    const category_id = 2;
    const department_id = 1;
    const product_id = 1;

    it('should get all categories', async () => {
      const response = await chai.request(app).get('/categories');
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.rows).to.be.an('array');
    });

    it('should get a single category using the categoryId supplied', async () => {
      const response = await chai.request(app).get(`/categories/${category_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('object');
      expect(response.body.category_id).to.equal(category_id);
    });

    it('return an error if the category_id supplied does not exist', async () => {
      const response = await chai.request(app).get(`/categories/200000`);
      expect(response.status).to.equal(404);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal(`Don't exist category with this ID.`);
    });

    it('should return an error if the categoryId supplied is not a number', async () => {
      const response = await chai.request(app).get(`/categories/asd`);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The category_id is not a number.');
    });

    it('should get a list of categories in a department when department_id is supplied', async () => {
      const response = await chai.request(app).get(`/categories/inDepartment/${department_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });

    it('should return an error if the department_id supplied is not a number', async () => {
      const response = await chai.request(app).get(`/categories/inDepartment/asd`);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The department_id is not a number.');
    });

    it('should get a list of categories in a product', async () => {
      const response = await chai.request(app).get(`/categories/inProduct/${product_id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });

    it('return an error if the product_id supplied is not a number', async () => {
      const response = await chai.request(app).get(`/categories/inProduct/wqwq`);
      expect(response.status).to.equal(400);
      expect(response.body.error).to.be.an('object');
      expect(response.body.error.message).to.equal('The product_id is not a number.');
    });
  });
});
