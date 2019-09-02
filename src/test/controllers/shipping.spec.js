import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('API Tests for Shipping Controller functions', () => {
  const shipping_region_id = 2;

  it('should get all shipping regions', async () => {
    const response = await chai.request(app).get('/shipping/regions');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should get shipping region shipping types if shipping_region_id is supplied', async () => {
    const response = await chai.request(app).get(`/shipping/regions/${shipping_region_id}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  });

  it('should return an error if shipping_region_id is supplied is not a number', async () => {
    const response = await chai.request(app).get(`/shipping/regions/number`);
    expect(response.status).to.equal(400);
    expect(response.body.error).to.be.an('object');
    expect(response.body.error.message).to.equal('The shipping_region_id is not a number.');
  });
});
