import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('API Tests for Attribute Controller', () => {
  const attribute_id = 2;
  const product_id = 2;
  it('should get all attributes', async () => {
    const response = await chai.request(app).get('/attributes');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should get a single attribute', async () => {
    const response = await chai.request(app).get(`/attributes/${attribute_id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body.attribute_id).to.equal(attribute_id);
  });

  it('should get all attribute values for an attribute', async () => {
    const response = await chai.request(app).get(`/attributes/values/${attribute_id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should get all attribute values for a product', async () => {
    const response = await chai.request(app).get(`/attributes/inProduct/${product_id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });
});
